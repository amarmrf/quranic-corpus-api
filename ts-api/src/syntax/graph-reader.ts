import { fromUnicode } from '../arabic/encoding/unicode/unicode-decoder.js';
import { Location } from '../orthography/location.js';
import type { Document } from '../orthography/document.js';
import { parsePartOfSpeech } from '../morphology/part-of-speech.js';
import { parsePhraseType, parseRelation } from './types.js';
import { SyntaxGraph } from './syntax-graph.js';

export class GraphReader {
  private graph = new SyntaxGraph();
  private nodeSequenceNumber = 0;
  private lineNumber = 0;

  constructor(
    private readonly document: Document,
    private readonly lines: string[]
  ) {}

  getLineNumber(): number {
    return this.lineNumber;
  }

  readGraphs(): SyntaxGraph[] {
    const graphs: SyntaxGraph[] = [];
    let index = 0;

    while (index < this.lines.length) {
      this.graph = new SyntaxGraph();
      this.nodeSequenceNumber = 0;
      let hasContent = false;

      while (index < this.lines.length) {
        const line = (this.lines[index] ?? '').trim();
        index++;
        this.lineNumber++;

        if (line.length === 0 || line.startsWith('--')) {
          continue;
        }

        hasContent = true;

        if (line === 'go') {
          graphs.push(this.graph);
          break;
        }

        if (line.includes('=')) {
          this.readNode(line);
        } else {
          this.readEdge(line);
        }
      }

      if (!hasContent) {
        break;
      }
    }

    return graphs;
  }

  private readNode(line: string): void {
    const parts = line.split(' = ');
    const names = (parts[0] ?? '').split(',');
    const nodeCount = names.length;

    for (const name of names) {
      const nodeNumber = this.parseNodeName(name.trim());
      const expectedNodeNumber = ++this.nodeSequenceNumber;
      if (nodeNumber !== expectedNodeNumber) {
        throw new Error(`Expected node ${expectedNodeNumber} not ${nodeNumber}.`);
      }
    }

    const definition = parts[1] ?? '';
    const index = definition.indexOf('(');
    if (index === -1) {
      throw new Error("Expected '('.");
    }

    const tag = definition.slice(0, index);
    const value = definition.slice(index + 1, definition.length - 1);

    if (tag === 'word') {
      this.readWord('token', value, nodeCount);
    } else if (tag === 'reference') {
      this.readWord('reference', value, nodeCount);
    } else {
      const phraseType = parsePhraseType(tag);
      if (phraseType != null) {
        this.readPhrase(phraseType, nodeCount, value);
      } else {
        this.readElidedWord(tag, nodeCount, value);
      }
    }
  }

  private readWord(type: 'token' | 'reference', value: string, nodeCount: number): void {
    this.graph.addWord(type, this.document.getTokenByLocation(Location.parseLocation(value)), null, null, nodeCount);
  }

  private readElidedWord(tag: string, nodeCount: number, value: string): void {
    if (nodeCount !== 1) {
      throw new Error('Expected a single name for elided node.');
    }

    this.graph.addWord('elided', null, value === '*' ? null : fromUnicode(value), parsePartOfSpeech(tag), 1);
  }

  private readPhrase(phraseType: ReturnType<typeof parsePhraseType>, nodeCount: number, value: string): void {
    if (phraseType == null) {
      throw new Error('Invalid phrase type.');
    }

    if (nodeCount !== 1) {
      throw new Error('Expected a single name for phrase node.');
    }

    const interval = this.readInterval(value);
    this.graph.addPhrase(phraseType, interval.start, interval.end);
  }

  private readEdge(line: string): void {
    const index = line.indexOf('(');
    if (index === -1) {
      throw new Error("Expected '('.");
    }

    const name = line.slice(0, index);
    const relation = parseRelation(name);
    const interval = this.readInterval(line.slice(index + 1, line.length - 1));
    this.graph.addEdge(interval.start, interval.end, relation);
  }

  private readInterval(value: string): { start: any; end: any } {
    const index = value.indexOf('-');
    if (index === -1) {
      throw new Error("Expected '-' for node interval.");
    }

    return {
      start: this.getNode(value.slice(0, index - 1)),
      end: this.getNode(value.slice(index + 2))
    };
  }

  private getNode(name: string) {
    return this.graph.getNodes()[this.parseNodeName(name) - 1];
  }

  private parseNodeName(name: string): number {
    if (name[0] !== 'n') {
      throw new Error(`Node name ${name} should start with n.`);
    }

    return Number.parseInt(name.slice(1), 10);
  }
}

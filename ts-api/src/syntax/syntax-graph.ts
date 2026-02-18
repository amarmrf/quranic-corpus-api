import type { Token } from '../orthography/token.js';
import type { Edge, PhraseType, Relation, SyntaxNode, Word, WordType } from './types.js';
import type { ArabicText } from '../arabic/arabic-text.js';
import type { PartOfSpeech } from '../morphology/part-of-speech.js';

export class SyntaxGraph {
  private readonly words: Word[] = [];
  private readonly nodes: SyntaxNode[] = [];
  private readonly edges: Edge[] = [];
  private segmentNodeCount = 0;

  getWords(): Word[] {
    return this.words;
  }

  addWord(
    type: WordType,
    token: Token | null,
    elidedText: ArabicText | null,
    elidedPartOfSpeech: PartOfSpeech | null,
    nodeCount: number
  ): void {
    const start = this.nodes.length;
    for (let i = 0; i < nodeCount; i++) {
      this.nodes.push({
        index: start + i,
        phraseType: null,
        start: null,
        end: null
      });
    }

    this.words.push({
      type,
      token,
      elidedText,
      elidedPartOfSpeech,
      start,
      end: start + nodeCount - 1
    });

    this.segmentNodeCount += nodeCount;
  }

  getNodes(): SyntaxNode[] {
    return this.nodes;
  }

  getPhraseCount(): number {
    return this.nodes.length - this.segmentNodeCount;
  }

  getPhrase(phraseNumber: number): SyntaxNode {
    return this.nodes[this.segmentNodeCount + phraseNumber - 1] as SyntaxNode;
  }

  addPhrase(phraseType: PhraseType, start: SyntaxNode, end: SyntaxNode): void {
    this.nodes.push({
      index: this.nodes.length,
      phraseType,
      start,
      end
    });
  }

  getEdges(): Edge[] {
    return this.edges;
  }

  addEdge(dependent: SyntaxNode, head: SyntaxNode, relation: Relation): void {
    this.edges.push({ dependent, head, relation });
  }

  getFirstToken(): Token {
    for (const word of this.words) {
      if (word.type === 'token' && word.token != null) {
        return word.token;
      }
    }

    throw new Error('Failed to find first graph token.');
  }
}

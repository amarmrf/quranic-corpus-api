import type { Document } from '../orthography/document.js';
import type { LocationService } from '../orthography/location-service.js';
import { readResourceLines } from '../utils/resource-reader.js';
import { GraphReader } from './graph-reader.js';
import type { SyntaxGraph } from './syntax-graph.js';

export class SyntaxService {
  private readonly graphs: SyntaxGraph[];
  private readonly tokenToGraph = new Map<number, number>();
  private readonly verseToGraphs = new Map<number, number[]>();

  constructor(document: Document, locationService: LocationService) {
    const reader = new GraphReader(document, readResourceLines('/data/syntax.txt'));
    const graphs = reader.readGraphs();
    this.graphs = graphs;

    for (let i = 0; i < graphs.length; i++) {
      const graph = graphs[i] as SyntaxGraph;
      const graphSequenceNumber = i + 1;
      let indexedGraphByVerse = false;
      let verseSequenceNumber = 0;

      for (const word of graph.getWords()) {
        if (word.type !== 'token' || word.token == null) {
          continue;
        }

        const tokenSequenceNumber = locationService.getTokenSequenceNumber(word.token.location);
        this.tokenToGraph.set(tokenSequenceNumber, graphSequenceNumber);

        const verse = document.getVerse(word.token.location.chapterNumber, word.token.location.verseNumber);
        verseSequenceNumber = locationService.getVerseSequenceNumber(verse.location);

        if (!indexedGraphByVerse) {
          const list = this.verseToGraphs.get(verseSequenceNumber) ?? [];
          list.push(graphSequenceNumber);
          this.verseToGraphs.set(verseSequenceNumber, list);
          indexedGraphByVerse = true;
        }
      }
    }
  }

  getGraphs(): SyntaxGraph[] {
    return this.graphs;
  }

  getGraphForToken(tokenSequenceNumber: number): number {
    return this.tokenToGraph.get(tokenSequenceNumber) ?? 0;
  }

  getGraphsForVerse(verseSequenceNumber: number): number[] | null {
    return this.verseToGraphs.get(verseSequenceNumber) ?? null;
  }
}

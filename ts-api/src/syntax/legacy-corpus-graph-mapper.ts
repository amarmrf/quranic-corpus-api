import type { SyntaxService } from './syntax-service.js';

const GAP_CHAPTER_NUMBER_START = 9;
const GAP_CHAPTER_NUMBER_END = 58;

export class LegacyCorpusGraphMapper {
  constructor(private readonly syntaxService: SyntaxService) {}

  getLegacyCorpusGraphNumber(graphSequenceNumber: number): number {
    const graph = this.syntaxService.getGraphs()[graphSequenceNumber - 1];
    if (graph == null) {
      throw new Error('Graph not found.');
    }

    const chapterNumber = graph.getFirstToken().location.chapterNumber;

    if (chapterNumber < GAP_CHAPTER_NUMBER_START) {
      return graphSequenceNumber;
    }

    if (chapterNumber > GAP_CHAPTER_NUMBER_END) {
      return graphSequenceNumber - this.getNumberOfGapGraphs(graphSequenceNumber);
    }

    return 0;
  }

  private getNumberOfGapGraphs(graphSequenceNumber: number): number {
    const graphs = this.syntaxService.getGraphs();
    let gapGraphs = 0;

    for (let i = 0; i < graphSequenceNumber; i++) {
      const graph = graphs[i];
      if (graph == null) {
        continue;
      }

      const chapterNumber = graph.getFirstToken().location.chapterNumber;
      if (chapterNumber >= GAP_CHAPTER_NUMBER_START && chapterNumber <= GAP_CHAPTER_NUMBER_END) {
        gapGraphs++;
      }
    }

    return gapGraphs;
  }
}

import type { Document } from '../orthography/document.js';
import type { LemmaService } from '../lexicography/lemma-service.js';
import { readResourceLines } from '../utils/resource-reader.js';
import { Segmenter } from './segmentation/segmenter.js';
import type { Segment } from './segment.js';
import { MorphologyGraph } from './morphology-graph.js';

export class MorphologyLoader {
  constructor(
    private readonly document: Document,
    private readonly lemmaService: LemmaService
  ) {}

  load(): MorphologyGraph {
    const segmenter = new Segmenter(this.lemmaService);
    const segmentMap = new Map<number, Segment[]>();
    const morphologyLines = readResourceLines('/data/morphology.txt');
    let lineIndex = 0;

    for (const chapter of this.document.children()) {
      for (const verse of chapter.verses) {
        for (const token of verse.tokens) {
          const morphology = morphologyLines[lineIndex] ?? '';
          lineIndex++;
          const segments = segmenter.getSegments(token, morphology);
          segmentMap.set(token.location.hashCode(), segments);
        }
      }
    }

    return new MorphologyGraph(segmentMap);
  }
}

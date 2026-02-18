import { ArabicGrammarGenerator } from '../nlg/arabic-grammar-generator.js';
import { SegmentDescriptionGenerator } from '../nlg/segment-description-generator.js';
import { SummaryGenerator } from '../nlg/summary-generator.js';
import { getStem } from './morphology.js';
import { PartOfSpeech } from './part-of-speech.js';
import type { Segment } from './segment.js';
import type { Token } from '../orthography/token.js';
import type { WordMorphology } from './word-morphology.js';

export class MorphologyGraph {
  constructor(private readonly segmentMap: Map<number, Segment[]>) {}

  query(token: Token): Segment[] {
    const segments = this.segmentMap.get(token.location.hashCode());
    if (segments == null) {
      throw new Error(`Morphology not found for token ${token.location.toString()}`);
    }

    return segments;
  }

  getWordMorphology(token: Token): WordMorphology {
    const segments = this.query(token);
    const stem = getStem(segments);

    const summary = new SummaryGenerator(token, segments).generate();

    const segmentDescriptions: string[] = [];
    for (const segment of segments) {
      if (segment.partOfSpeech !== PartOfSpeech.Determiner) {
        segmentDescriptions.push(new SegmentDescriptionGenerator(segments, stem, segment).generate());
      }
    }

    const arabicGrammar = new ArabicGrammarGenerator(token, segments).generate();

    return {
      summary,
      segmentDescriptions,
      arabicGrammar
    };
  }
}

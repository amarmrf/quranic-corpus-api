import { toUnicode } from '../arabic/encoding/unicode/unicode-encoder.js';
import { toPhonetic } from '../arabic/encoding/phonetic/phonetic-encoder.js';
import { MorphologyWriter } from './segmentation/morphology-writer.js';
import type { LocationService } from '../orthography/location-service.js';
import type { OrthographyService } from '../orthography/orthography-service.js';
import type { TranslationService } from '../translation/translation-service.js';
import type { MorphologyGraph } from './morphology-graph.js';
import type { Token } from '../orthography/token.js';
import type { TokenResponse } from '../orthography/token-response.js';

export class TokenTransformer {
  constructor(
    private readonly locationService: LocationService,
    private readonly orthographyService: OrthographyService,
    private readonly translationService: TranslationService,
    private readonly morphologyGraph: MorphologyGraph
  ) {}

  getTokenResponse(token: Token, features: boolean): TokenResponse {
    const segments = this.morphologyGraph.query(token);
    const segmentResponses = [];
    const morphologyWriter = features ? new MorphologyWriter() : null;

    for (const segment of segments) {
      const pronounType = features ? null : segment.pronounType;
      const morphology =
        features && morphologyWriter != null
          ? (morphologyWriter.write(segment) || null)
          : null;
      segmentResponses.push({
        arabic: toUnicode(segment.arabicText!),
        posTag: features ? null : segment.partOfSpeech,
        pronounType: pronounType ?? null,
        morphology
      });
    }

    const location = token.location;
    const tokenSequenceNumber = this.locationService.getTokenSequenceNumber(location);
    return {
      location: location.toArray(),
      translation: this.translationService.getTokenTranslation(tokenSequenceNumber),
      phonetic: toPhonetic(
        {
          morphologyGraph: this.morphologyGraph,
          token
        },
        token.arabicText
      ),
      segments: segmentResponses,
      pauseMark: this.orthographyService.getPauseMark(tokenSequenceNumber)
    };
  }
}

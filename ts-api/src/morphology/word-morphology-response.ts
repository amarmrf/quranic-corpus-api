import type { TokenResponse } from '../orthography/token-response.js';

export type WordMorphologyResponse = {
  token: TokenResponse;
  summary: string;
  segmentDescriptions: string[];
  arabicGrammar: string;
};

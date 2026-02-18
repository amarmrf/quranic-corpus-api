import type { TokenResponse } from './token-response.js';
import type { TranslationResponse } from '../translation/translation-metadata.js';
import type { VerseMark } from './verse-mark.js';

export type VerseResponse = {
  location: number[];
  tokens: TokenResponse[];
  translations: TranslationResponse[] | null;
  verseMark: VerseMark | null;
};

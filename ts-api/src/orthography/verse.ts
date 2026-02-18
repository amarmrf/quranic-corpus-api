import type { ArabicText } from '../arabic/arabic-text.js';
import type { Location } from './location.js';
import type { Token } from './token.js';

export type Verse = {
  location: Location;
  arabicText: ArabicText;
  tokens: Token[];
};

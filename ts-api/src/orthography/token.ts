import type { ArabicText } from '../arabic/arabic-text.js';
import type { Location } from './location.js';

export type Token = {
  location: Location;
  arabicText: ArabicText;
};

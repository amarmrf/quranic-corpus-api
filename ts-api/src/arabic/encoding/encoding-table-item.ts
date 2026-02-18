import type { CharacterType } from '../character-type.js';
import type { DiacriticType } from '../diacritic-type.js';

export type EncodingTableItem = {
  characterType: CharacterType | null;
  diacriticType: DiacriticType | null;
};

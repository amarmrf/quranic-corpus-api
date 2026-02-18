import { CharacterType } from '../character-type.js';
import { DiacriticType } from '../diacritic-type.js';
import { UnicodeType } from './unicode/unicode-type.js';
import type { EncodingTableItem } from './encoding-table-item.js';

const CHARACTER_TYPE_COUNT = Object.keys(CharacterType).length / 2;
const UNICODE_TYPE_COUNT = Object.keys(UnicodeType).length / 2;

export abstract class EncodingTableBase {
  private readonly unicodeMap = new Map<string, EncodingTableItem>();
  private readonly characterList: string[] = new Array(CHARACTER_TYPE_COUNT).fill('');
  private readonly unicodeList: string[] = new Array(UNICODE_TYPE_COUNT).fill('');

  protected constructor() {}

  getItem(unicode: string): EncodingTableItem | undefined {
    return this.unicodeMap.get(unicode);
  }

  getCharacterByCharacterType(characterType: CharacterType): string {
    return this.characterList[characterType] ?? '';
  }

  getCharacterByUnicodeType(unicodeType: UnicodeType): string {
    return this.unicodeList[unicodeType] ?? '';
  }

  protected addCharacter(unicodeType: UnicodeType | null, ch: string, characterType: CharacterType): void {
    this.addItem(unicodeType, ch, characterType, null);
  }

  protected addDiacritic(unicodeType: UnicodeType | null, ch: string, diacriticType: DiacriticType): void {
    this.addItem(unicodeType, ch, null, diacriticType);
  }

  protected addItem(
    unicodeType: UnicodeType | null,
    ch: string,
    characterType: CharacterType | null,
    diacriticType: DiacriticType | null
  ): void {
    const item: EncodingTableItem = {
      characterType,
      diacriticType
    };
    this.unicodeMap.set(ch, item);

    if (characterType != null && diacriticType == null) {
      this.characterList[characterType] = ch;
    }

    if (unicodeType != null) {
      this.unicodeList[unicodeType] = ch;
    }
  }
}

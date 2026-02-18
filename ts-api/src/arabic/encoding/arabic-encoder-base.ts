import { ArabicText } from '../arabic-text.js';
import { CharacterType } from '../character-type.js';
import { EncodingOptions } from './encoding-options.js';
import type { EncodingTableBase } from './encoding-table-base.js';
import { UnicodeType } from './unicode/unicode-type.js';

export abstract class ArabicEncoderBase {
  private isMaddah = false;
  private isHamzaAbove = false;
  private options: EncodingOptions | null = null;
  private readonly text: string[] = [];

  protected constructor(private readonly encodingTable: EncodingTableBase) {}

  encode(arabicText: ArabicText, options: EncodingOptions | null): string {
    this.text.length = 0;
    this.options = options;

    const characterCount = arabicText.getLength();
    for (let i = 0; i < characterCount; i++) {
      this.encodeCharacter(arabicText, i);
    }

    return this.text.join('');
  }

  private encodeCharacter(arabicText: ArabicText, index: number): void {
    if (arabicText.getCharacterType(index) == null) {
      this.text.push(' ');
    } else {
      this.text.push(this.getCharacter(arabicText, index));
      this.writeDiacritics(arabicText, index);
    }
  }

  private getCharacter(arabicText: ArabicText, index: number): string {
    const characterType = arabicText.getCharacterType(index);
    if (characterType == null) {
      return ' ';
    }

    let unicodeType: UnicodeType | null = null;
    this.isMaddah = arabicText.isMaddah(index);
    this.isHamzaAbove = arabicText.isHamzaAbove(index);

    if (
      this.options === EncodingOptions.CombineAlifWithMaddah &&
      characterType === CharacterType.Alif &&
      arabicText.isMaddah(index)
    ) {
      unicodeType = UnicodeType.AlifWithMaddah;
      this.isMaddah = false;
    } else if (
      characterType === CharacterType.Alif &&
      this.isHamzaAbove &&
      !arabicText.isAlifKhanjareeya(index)
    ) {
      unicodeType = UnicodeType.AlifWithHamzaAbove;
      this.isHamzaAbove = false;
    } else if (characterType === CharacterType.Waw && this.isHamzaAbove) {
      unicodeType = UnicodeType.WawWithHamzaAbove;
      this.isHamzaAbove = false;
    } else if (characterType === CharacterType.Alif && arabicText.isHamzaBelow(index)) {
      unicodeType = UnicodeType.AlifWithHamzaBelow;
    } else if (characterType === CharacterType.Ya && this.isHamzaAbove) {
      unicodeType = UnicodeType.YaWithHamzaAbove;
      this.isHamzaAbove = false;
    } else if (characterType === CharacterType.Alif && arabicText.isAlifKhanjareeya(index)) {
      unicodeType = UnicodeType.AlifKhanjareeya;
    } else if (characterType === CharacterType.Alif && arabicText.isHamzatWasl(index)) {
      unicodeType = UnicodeType.AlifWithHamzatWasl;
    }

    return unicodeType != null
      ? this.encodingTable.getCharacterByUnicodeType(unicodeType)
      : this.encodingTable.getCharacterByCharacterType(characterType);
  }

  private writeDiacritics(arabicText: ArabicText, index: number): void {
    if (this.isHamzaAbove) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.HamzaAbove));
    }

    if (arabicText.isShadda(index)) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.Shadda));
    }

    if (arabicText.isFathatan(index)) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.Fathatan));
    }

    if (arabicText.isDammatan(index)) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.Dammatan));
    }

    if (arabicText.isKasratan(index)) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.Kasratan));
    }

    if (arabicText.isFatha(index)) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.Fatha));
    }

    if (arabicText.isDamma(index)) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.Damma));
    }

    if (arabicText.isKasra(index)) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.Kasra));
    }

    if (arabicText.isSukun(index)) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.Sukun));
    }

    if (arabicText.getCharacterType(index) === CharacterType.AlifMaksura && arabicText.isAlifKhanjareeya(index)) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.AlifKhanjareeya));
    }

    if (this.isMaddah) {
      this.text.push(this.encodingTable.getCharacterByUnicodeType(UnicodeType.Maddah));
    }
  }
}

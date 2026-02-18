import { ArabicText } from '../arabic-text.js';
import { ArabicTextBuilder } from '../arabic-text-builder.js';
import { CharacterType } from '../character-type.js';
import { DiacriticType } from '../diacritic-type.js';
import type { EncodingTableBase } from './encoding-table-base.js';

export abstract class ArabicDecoderBase {
  private readonly builder = new ArabicTextBuilder();
  private lastCharacter: CharacterType | null = null;

  protected constructor(private readonly encodingTable: EncodingTableBase) {}

  decode(text: string): ArabicText {
    for (let i = 0; i < text.length; i++) {
      this.decodeCharacter(text[i] ?? '');
    }

    return this.builder.toArabicText();
  }

  private decodeCharacter(ch: string): void {
    const item = this.encodingTable.getItem(ch);
    if (item != null) {
      let characterType = item.characterType;
      const diacriticType = item.diacriticType;

      if (
        diacriticType === DiacriticType.AlifKhanjareeya &&
        this.lastCharacter !== CharacterType.AlifMaksura
      ) {
        characterType = CharacterType.Alif;
      }

      if (characterType != null) {
        this.builder.addCharacter(characterType);
        this.lastCharacter = characterType;
      }

      if (diacriticType != null) {
        this.builder.addDiacritic(diacriticType);
      }

      return;
    }

    this.builder.addWhitespace();
  }
}

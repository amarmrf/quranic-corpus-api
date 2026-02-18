import { CharacterType } from '../arabic/character-type.js';
import { DiacriticType } from '../arabic/diacritic-type.js';
import type { ArabicText } from '../arabic/arabic-text.js';
import { ArabicTextBuilder } from '../arabic/arabic-text-builder.js';
import { EncodingOptions } from '../arabic/encoding/encoding-options.js';
import { toUnicode } from '../arabic/encoding/unicode/unicode-encoder.js';

export class Text {
  private readonly text: string[] = [];

  constructor(value?: string) {
    if (value != null) {
      this.add(value);
    }
  }

  add(value: string | number | Text): void {
    if (typeof value === 'string') {
      this.text.push(value);
      return;
    }

    if (typeof value === 'number') {
      this.text.push(String(value));
      return;
    }

    this.text.push(value.toString());
  }

  addChar(ch: string): void {
    this.text.push(ch);
  }

  addArabic(arabic: string | ArabicText): void {
    const text = typeof arabic === 'string' ? arabic : toUnicode(arabic, EncodingOptions.CombineAlifWithMaddah);
    this.text.push('[');
    this.text.push(text);
    this.text.push(']');
  }

  addPhonetic(phonetic: string): void {
    this.text.push('{');
    this.text.push(phonetic);
    this.text.push('}');
  }

  isEmpty(): boolean {
    return this.text.length === 0;
  }

  toString(): string {
    return this.text.join('');
  }

  space(): void {
    if (!this.isEmpty()) {
      this.addChar(' ');
    }
  }

  endSentence(): void {
    this.addChar('.');
  }

  addArabicLetters(letters: ArabicText, isRoot: boolean): void {
    const phonetic: string[] = [];
    const size = letters.getLength();

    for (let i = 0; i < size; i++) {
      if (i > 0) {
        phonetic.push(' ');
      }

      const letter = letters.getCharacterType(i);
      if (letter != null) {
        if (isRoot && letter === CharacterType.Alif) {
          phonetic.push('hamza');
        } else {
          phonetic.push(getPhoneticDisplayName(letter));
        }
      }
    }

    this.addPhonetic(phonetic.join(''));
    this.addChar(' ');

    const builder = new ArabicTextBuilder();
    for (let i = 0; i < size; i++) {
      if (i > 0) {
        builder.addWhitespace();
      }

      const letter = letters.getCharacterType(i);
      if (letter != null) {
        builder.addCharacter(letter);
        if (isRoot && letter === CharacterType.Alif) {
          builder.addDiacritic(DiacriticType.HamzaAbove);
        }
      }
    }

    this.addArabic(builder.toArabicText());
  }

  addIndefiniteArticle(upperCase: boolean, next: Text | string): void {
    const value = typeof next === 'string' ? next : next.toString();
    let ch = value.length > 0 ? value[0] ?? '' : '';
    if (ch === ' ' && value.length > 1) {
      ch = value[1] ?? '';
    }

    if (ch === 'a' || ch === 'e' || ch === 'i') {
      this.add(upperCase ? 'An' : 'an');
    } else {
      this.add(upperCase ? 'A' : 'a');
    }
  }
}

function getPhoneticDisplayName(type: CharacterType): string {
  switch (type) {
    case CharacterType.Alif:
      return 'alif';
    case CharacterType.Ba:
      return 'bā';
    case CharacterType.Ta:
      return 'tā';
    case CharacterType.Tha:
      return 'thā';
    case CharacterType.Jeem:
      return 'jīm';
    case CharacterType.HHa:
      return 'ḥā';
    case CharacterType.Kha:
      return 'khā';
    case CharacterType.Dal:
      return 'dāl';
    case CharacterType.Thal:
      return 'dhāl';
    case CharacterType.Ra:
      return 'rā';
    case CharacterType.Zain:
      return 'zāy';
    case CharacterType.Seen:
      return 'sīn';
    case CharacterType.Sheen:
      return 'shīn';
    case CharacterType.Sad:
      return 'ṣād';
    case CharacterType.DDad:
      return 'ḍād';
    case CharacterType.TTa:
      return 'ṭā';
    case CharacterType.DTha:
      return 'ẓā';
    case CharacterType.Ain:
      return 'ʿayn';
    case CharacterType.Ghain:
      return 'ghayn';
    case CharacterType.Fa:
      return 'fā';
    case CharacterType.Qaf:
      return 'qāf';
    case CharacterType.Kaf:
      return 'kāf';
    case CharacterType.Lam:
      return 'lām';
    case CharacterType.Meem:
      return 'mīm';
    case CharacterType.Noon:
      return 'nūn';
    case CharacterType.Ha:
      return 'hā';
    case CharacterType.Waw:
      return 'wāw';
    case CharacterType.Ya:
      return 'yā';
    case CharacterType.Hamza:
      return 'hamza';
    default:
      return '';
  }
}

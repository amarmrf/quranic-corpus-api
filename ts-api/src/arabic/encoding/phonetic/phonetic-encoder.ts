import { CharacterType, getPhoneticName } from '../../character-type.js';
import { getStem } from '../../../morphology/morphology.js';
import { PartOfSpeech } from '../../../morphology/part-of-speech.js';
import { Phoneme } from './phoneme.js';
import type { ArabicText } from '../../arabic-text.js';
import type { PhoneticContext } from './phonetic-context.js';

export class PhoneticEncoder {
  private arabicText: ArabicText | null = null;
  private index = 0;
  private nextIndex = -1;
  private lastIndex = -1;
  private readonly phonetic: string[] = [];

  static toPhonetic(context: PhoneticContext, arabicText: ArabicText): string {
    return new PhoneticEncoder().encode(context, arabicText);
  }

  encode(context: PhoneticContext, arabicText: ArabicText): string {
    this.arabicText = arabicText;
    this.phonetic.length = 0;
    let isLastDeterminer = false;

    const characterCount = arabicText.getLength();
    for (this.index = 0; this.index < characterCount; this.index++) {
      if (arabicText.getCharacterType(this.index) == null) {
        this.phonetic.push(' ');
        continue;
      }

      this.nextIndex =
        this.index < characterCount - 1 && arabicText.getCharacterType(this.index + 1) != null
          ? this.index + 1
          : -1;
      this.lastIndex = this.index > 0 && arabicText.getCharacterType(this.index - 1) != null ? this.index - 1 : -1;

      const token = context.token;
      if (token != null) {
        const segments = context.morphologyGraph.query(token);
        const partOfSpeech = getStem(segments).partOfSpeech;
        const phonemes = this.encodeToken(partOfSpeech);
        if (phonemes != null) {
          this.addPhoneme(phonemes);
          continue;
        }

        if (
          arabicText.getCharacterType(this.index) === CharacterType.Alif &&
          arabicText.isHamzatWasl(this.index) &&
          arabicText.getCharacterType(this.nextIndex) === CharacterType.Lam
        ) {
          if (
            partOfSpeech !== PartOfSpeech.Demonstrative &&
            partOfSpeech !== PartOfSpeech.Relative &&
            partOfSpeech !== PartOfSpeech.Conditional
          ) {
            if (
              arabicText.getCharacterType(this.nextIndex) === CharacterType.Lam &&
              arabicText.isShadda(this.nextIndex)
            ) {
              this.addPhoneme('al-la');
            } else if (token.location.tokenNumber === 1 && this.lastIndex < 0) {
              this.addPhoneme('al-');
            } else {
              this.addPhoneme('l-');
            }

            isLastDeterminer = true;
            this.index++;
            continue;
          }
        }
      }

      let phoneme = this.encodeLetter();
      if (phoneme != null) {
        this.addPhoneme(phoneme);

        if (
          arabicText.isShadda(this.index) &&
          phoneme.length === 1 &&
          this.lastIndex >= 0 &&
          (arabicText.getCharacterType(this.lastIndex) !== arabicText.getCharacterType(this.index) ||
            arabicText.getDiacriticCount(this.lastIndex) !== 0)
        ) {
          if (!isLastDeterminer) {
            this.addPhoneme(phoneme);
          }
        }
      }

      phoneme = this.encodeDiacritics();
      if (phoneme != null) {
        this.addPhoneme(phoneme);
      }
    }

    return this.phonetic.join('');
  }

  private addPhoneme(phoneme: string): void {
    const current = this.phonetic.join('');
    const size = current.length;
    if (size === 0) {
      this.phonetic.push(phoneme);
      return;
    }

    const lastChar = current[size - 1] ?? '';
    if (this.isVowel(lastChar) && this.isVowel(phoneme[0] ?? '')) {
      this.phonetic.push('-');
    }

    this.phonetic.push(phoneme);
  }

  private isVowel(ch: string): boolean {
    return ch === 'a' || ch === 'e' || ch === 'i' || ch === 'o' || ch === 'u';
  }

  private encodeToken(partOfSpeech: PartOfSpeech): string | null {
    if (partOfSpeech !== PartOfSpeech.Initials || this.arabicText == null) {
      return null;
    }

    const length = this.arabicText.getLength();
    const tokens: string[] = [];
    for (let i = 0; i < length; i++) {
      const type = this.arabicText.getCharacterType(i);
      if (type != null) {
        tokens.push(getPhoneticName(type) ?? '');
      }
    }

    this.index = length - 1;
    return tokens.join(' ');
  }

  private encodeLetter(): string | null {
    if (this.arabicText == null) {
      return null;
    }

    const characterType = this.arabicText.getCharacterType(this.index);
    let phoneme: string | null = null;

    switch (characterType) {
      case CharacterType.Ba:
        phoneme = Phoneme.B;
        break;
      case CharacterType.Ta:
      case CharacterType.TaMarbuta:
        phoneme = Phoneme.T;
        break;
      case CharacterType.TTa:
        phoneme = Phoneme.TTa;
        break;
      case CharacterType.Tha:
        phoneme = Phoneme.TH;
        break;
      case CharacterType.Thal:
        phoneme = Phoneme.DH;
        break;
      case CharacterType.DTha:
        phoneme = Phoneme.DTha;
        break;
      case CharacterType.Jeem:
        phoneme = Phoneme.J;
        break;
      case CharacterType.HHa:
        phoneme = Phoneme.HHa;
        break;
      case CharacterType.Ha:
        phoneme = Phoneme.H;
        break;
      case CharacterType.Kha:
        phoneme = Phoneme.KH;
        break;
      case CharacterType.Dal:
        phoneme = Phoneme.D;
        break;
      case CharacterType.DDad:
        phoneme = Phoneme.DDa;
        break;
      case CharacterType.Ra:
        phoneme = Phoneme.R;
        break;
      case CharacterType.Zain:
        phoneme = Phoneme.Z;
        break;
      case CharacterType.Seen:
        phoneme = Phoneme.S;
        break;
      case CharacterType.Sad:
        phoneme = Phoneme.Sad;
        break;
      case CharacterType.Sheen:
        phoneme = Phoneme.SH;
        break;
      case CharacterType.Ain:
        phoneme = Phoneme.AA;
        break;
      case CharacterType.Ghain:
        phoneme = Phoneme.GH;
        break;
      case CharacterType.Fa:
        phoneme = Phoneme.F;
        break;
      case CharacterType.Qaf:
        phoneme = Phoneme.Q;
        break;
      case CharacterType.Kaf:
        phoneme = Phoneme.K;
        break;
      case CharacterType.Lam:
        if (this.lastIndex < 0 && this.arabicText.getCharacterType(this.nextIndex) === CharacterType.Tatweel) {
          phoneme = Phoneme.FATHA + Phoneme.L;
        } else {
          phoneme = Phoneme.L;
        }
        break;
      case CharacterType.Meem:
        phoneme = Phoneme.M;
        break;
      case CharacterType.Noon:
      case CharacterType.SmallHighNoon:
        phoneme = Phoneme.N;
        break;
      case CharacterType.SmallYa:
        if (
          (this.nextIndex >= 0 && this.arabicText.getCharacterType(this.nextIndex) === CharacterType.AlifMaksura) ||
          this.arabicText.isFatha(this.index)
        ) {
          phoneme = Phoneme.Y;
        }
        break;
      case CharacterType.EmptyCentreLowStop:
        phoneme = Phoneme.FATHA;
        break;
      case CharacterType.Alif:
        if (this.arabicText.isHamzatWasl(this.index)) {
          phoneme = this.encodeHamzatWasl();
        }
        break;
      case CharacterType.Waw:
        if (!this.arabicText.isHamzaAbove(this.index)) {
          phoneme = this.encodeWaw();
        }
        break;
      case CharacterType.Ya:
        if (
          !this.arabicText.isHamzaAbove(this.index) &&
          (this.nextIndex < 0 || this.arabicText.getCharacterType(this.nextIndex) !== CharacterType.SmallHighRoundedZero)
        ) {
          phoneme = this.encodeYa();
        }
        break;
      case CharacterType.AlifMaksura:
        phoneme = this.encodeAlifMaksura();
        break;
      case CharacterType.Hamza:
        if (
          this.arabicText.isFatha(this.index) &&
          this.lastIndex >= 0 &&
          this.arabicText.isSukun(this.lastIndex) &&
          this.nextIndex < 0
        ) {
          phoneme = Phoneme.FATHA;
        }
        break;
    }

    return phoneme;
  }

  private encodeHamzatWasl(): string {
    if (this.arabicText == null) {
      return Phoneme.KASRA;
    }

    if (this.index >= 2 && this.arabicText.isHamzatWasl(this.index - 2)) {
      return '';
    }

    if (this.nextIndex >= 0 && this.arabicText.getCharacterType(this.nextIndex) === CharacterType.Lam) {
      return Phoneme.FATHA;
    }

    if (
      this.arabicText.isDamma(this.index + 2) &&
      (this.index + 3 >= this.arabicText.getLength() || this.arabicText.getCharacterType(this.index + 3) !== CharacterType.Waw)
    ) {
      return Phoneme.DAMMA;
    }

    return Phoneme.KASRA;
  }

  private encodeWaw(): string | null {
    if (this.arabicText == null) {
      return null;
    }

    let phoneme: string | null = null;

    if (this.nextIndex >= 0 && this.arabicText.getCharacterType(this.nextIndex) === CharacterType.SmallHighRoundedZero) {
      phoneme = Phoneme.DAMMA;
    } else if (
      !this.isLongWaw(this.index) ||
      (this.lastIndex >= 0 && this.arabicText.isHamzaAbove(this.lastIndex) && this.arabicText.isFatha(this.lastIndex))
    ) {
      phoneme = Phoneme.W;
    } else if (this.lastIndex >= 0 && !this.arabicText.isFatha(this.lastIndex)) {
      phoneme = Phoneme.LONG_DAMMA;
    } else if (
      this.index < this.arabicText.getLength() - 2 &&
      this.arabicText.getCharacterType(this.nextIndex) === CharacterType.Alif &&
      this.arabicText.getCharacterType(this.index + 2) === CharacterType.SmallHighRoundedZero
    ) {
      phoneme = Phoneme.W;
    }

    return phoneme;
  }

  private encodeYa(): string {
    if (this.arabicText == null) {
      return Phoneme.Y;
    }

    return this.isLongYa(this.index) && (this.nextIndex < 0 || this.arabicText.getCharacterType(this.nextIndex) !== CharacterType.Ya)
      ? Phoneme.LONG_KASRA
      : Phoneme.Y;
  }

  private encodeAlifMaksura(): string | null {
    if (this.arabicText == null) {
      return null;
    }

    let phoneme: string | null = null;

    if (
      this.arabicText.isFatha(this.index) ||
      this.arabicText.isKasra(this.index) ||
      this.arabicText.isDamma(this.index) ||
      this.arabicText.isKasratan(this.index) ||
      this.arabicText.isDammatan(this.index) ||
      this.arabicText.isSukun(this.index)
    ) {
      phoneme = Phoneme.Y;
    } else if (
      this.lastIndex >= 0 &&
      this.arabicText.isKasra(this.lastIndex) &&
      (this.nextIndex < 0 || this.arabicText.getCharacterType(this.nextIndex) !== CharacterType.SmallHighRoundedZero)
    ) {
      phoneme = Phoneme.LONG_KASRA;
    }

    return phoneme;
  }

  private encodeDiacritics(): string | null {
    if (this.arabicText == null) {
      return null;
    }

    if (this.isLongFatha(this.lastIndex, this.index)) {
      return Phoneme.LONG_FATHA;
    }

    let phoneme: string | null = null;

    if (
      this.arabicText.isFatha(this.index) ||
      (this.arabicText.getCharacterType(this.index) === CharacterType.Alif &&
        this.nextIndex >= 0 &&
        this.arabicText.getCharacterType(this.nextIndex) === CharacterType.RoundedHighStopWithFilledCentre)
    ) {
      if (!this.isLongFatha(this.index, this.nextIndex)) {
        phoneme = Phoneme.FATHA;
      }
    } else if (this.arabicText.isDamma(this.index) && !this.isLongWaw(this.nextIndex)) {
      phoneme = this.encodeDamma();
    } else if (this.arabicText.isKasra(this.index) && !this.isLongYa(this.nextIndex)) {
      phoneme = this.encodeKasra();
    } else if (this.arabicText.isFathatan(this.index)) {
      phoneme = Phoneme.FATHATAN;
    } else if (this.arabicText.isDammatan(this.index)) {
      phoneme = this.encodeDammatan();
    } else if (this.arabicText.isKasratan(this.index)) {
      phoneme = Phoneme.KASRATAN;
    } else if (
      this.arabicText.isSukun(this.index) &&
      (this.lastIndex < 0 || !this.arabicText.isFatha(this.lastIndex)) &&
      this.nextIndex >= 0
    ) {
      phoneme = Phoneme.SUKUN;
    }

    return phoneme;
  }

  private isLongFatha(lastIndex: number, index: number): boolean {
    if (this.arabicText == null) {
      return false;
    }

    if (index < 0) {
      return false;
    }

    if (lastIndex < 0 && this.arabicText.isMaddah(index)) {
      return true;
    }

    if (lastIndex < 0 || this.arabicText.isFathatan(lastIndex)) {
      return false;
    }

    if (!this.arabicText.isFatha(lastIndex)) {
      return false;
    }

    if (
      this.arabicText.getCharacterType(index) === CharacterType.Alif ||
      this.arabicText.getCharacterType(index) === CharacterType.AlifMaksura
    ) {
      if (this.arabicText.getDiacriticCount(index) === 0 || this.arabicText.isMaddah(index)) {
        return true;
      }

      if (this.arabicText.isAlifKhanjareeya(index)) {
        return this.arabicText.getDiacriticCount(index) === 1 || this.arabicText.isMaddah(index);
      }
    }

    return false;
  }

  private encodeDamma(): string {
    if (this.arabicText == null) {
      return Phoneme.DAMMA;
    }

    if (
      this.arabicText.getCharacterType(this.index) === CharacterType.Hamza &&
      this.nextIndex >= 0 &&
      this.arabicText.getCharacterType(this.nextIndex) === CharacterType.SmallWaw
    ) {
      return Phoneme.LONG_DAMMA;
    }

    if (
      this.nextIndex >= 0 &&
      this.arabicText.getCharacterType(this.nextIndex) === CharacterType.SmallWaw &&
      this.index + 2 < this.arabicText.getLength() &&
      this.arabicText.getCharacterType(this.index + 2) === CharacterType.Tatweel
    ) {
      return Phoneme.LONG_DAMMA;
    }

    if (
      this.arabicText.getCharacterType(this.index) === CharacterType.Alif ||
      this.arabicText.getCharacterType(this.index) === CharacterType.Hamza ||
      this.arabicText.isHamzaAbove(this.index)
    ) {
      return Phoneme.DAMMA;
    }

    if (
      this.arabicText.getCharacterType(this.index) === CharacterType.Waw &&
      this.nextIndex >= 0 &&
      (this.arabicText.getCharacterType(this.nextIndex) === CharacterType.SmallWaw ||
        this.arabicText.getCharacterType(this.nextIndex) === CharacterType.Alif)
    ) {
      return Phoneme.LONG_DAMMA;
    }

    return Phoneme.DAMMA;
  }

  private encodeKasra(): string {
    if (this.arabicText == null) {
      return Phoneme.KASRA;
    }

    if (
      this.arabicText.isHamzaBelow(this.index) &&
      this.nextIndex >= 0 &&
      this.arabicText.getCharacterType(this.nextIndex) === CharacterType.SmallYa
    ) {
      return Phoneme.LONG_KASRA;
    }

    if (
      this.nextIndex >= 0 &&
      this.index + 3 < this.arabicText.getLength() &&
      this.arabicText.getCharacterType(this.index + 2) === CharacterType.SmallHighRoundedZero &&
      this.arabicText.getCharacterType(this.index + 3) === CharacterType.AlifMaksura
    ) {
      return Phoneme.LONG_KASRA;
    }

    if (
      this.arabicText.getCharacterType(this.index) === CharacterType.AlifMaksura &&
      this.arabicText.getCharacterType(this.lastIndex) === CharacterType.HHa &&
      this.arabicText.isSukun(this.lastIndex) &&
      !this.arabicText.isFatha(this.index - 2)
    ) {
      return Phoneme.LONG_KASRA;
    }

    if (
      this.nextIndex >= 0 &&
      this.arabicText.getCharacterType(this.nextIndex) === CharacterType.SmallYa &&
      (this.arabicText.getCharacterType(this.index) === CharacterType.Ya ||
        this.arabicText.getCharacterType(this.index) === CharacterType.AlifMaksura ||
        (this.arabicText.getCharacterType(this.index) === CharacterType.Ha &&
          this.index + 2 < this.arabicText.getLength() &&
          this.arabicText.getCharacterType(this.index + 2) === CharacterType.Meem))
    ) {
      return Phoneme.LONG_KASRA;
    }

    return Phoneme.KASRA;
  }

  private encodeDammatan(): string {
    if (this.arabicText == null) {
      return Phoneme.DAMMATAN;
    }

    if (
      this.arabicText.getCharacterType(this.index) === CharacterType.Hamza ||
      this.arabicText.isHamzaAbove(this.index)
    ) {
      return Phoneme.SHORT_DAMMATAN;
    }

    return Phoneme.DAMMATAN;
  }

  private isLongYa(index: number): boolean {
    if (this.arabicText == null) {
      return false;
    }

    return (
      index >= 0 &&
      (this.arabicText.getCharacterType(index) === CharacterType.Ya ||
        this.arabicText.getCharacterType(index) === CharacterType.AlifMaksura) &&
      (this.arabicText.getDiacriticCount(index) === 0 || this.arabicText.isMaddah(index)) &&
      !(
        this.index + 2 < this.arabicText.getLength() &&
        this.arabicText.getCharacterType(this.index + 2) === CharacterType.SmallHighRoundedZero
      )
    );
  }

  private isLongWaw(index: number): boolean {
    if (this.arabicText == null) {
      return false;
    }

    return (
      index >= 0 &&
      this.arabicText.getCharacterType(index) === CharacterType.Waw &&
      (this.arabicText.getDiacriticCount(index) === 0 || this.arabicText.isMaddah(index))
    );
  }
}

export function toPhonetic(context: PhoneticContext, arabicText: ArabicText): string {
  return PhoneticEncoder.toPhonetic(context, arabicText);
}

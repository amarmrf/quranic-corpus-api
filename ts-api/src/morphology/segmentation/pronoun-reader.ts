import { CharacterType } from '../../arabic/character-type.js';
import { toBuckwalter } from '../../arabic/encoding/buckwalter/buckwalter-encoder.js';
import { AspectType, GenderType, MoodType, NumberType, PersonType } from '../types.js';
import { PartOfSpeech } from '../part-of-speech.js';
import type { Segment } from '../segment.js';
import type { Token } from '../../orthography/token.js';
import type { ArabicText } from '../../arabic/arabic-text.js';

export class PronounReader {
  private token: Token | null = null;
  private arabicText: ArabicText | null = null;

  readObjectPronoun(
    token: Token,
    stem: Segment,
    segment: Segment,
    suffixIndex: number,
    isFirstObject: boolean,
    isEmphaticSuffix: boolean
  ): number {
    this.token = token;
    this.arabicText = token.arabicText;

    const person = segment.person;
    const gender = segment.gender;
    const number = segment.number;

    if (person === PersonType.First && number === NumberType.Singular) {
      if (stem.partOfSpeech === PartOfSpeech.Verb) {
        if (
          isFirstObject &&
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Noon &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Ya
        ) {
          return 2;
        }

        if (
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Noon &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.AlifMaksura
        ) {
          return isEmphaticSuffix ? 1 : 2;
        }

        if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon) {
          return 1;
        }

        this.fail('PRON:1S');
      } else {
        if (
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.AlifMaksura &&
          !this.arabicText.isShadda(suffixIndex - 1)
        ) {
          if (
            stem.partOfSpeech === PartOfSpeech.Accusative &&
            this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Noon &&
            !this.arabicText.isShadda(suffixIndex - 2)
          ) {
            return 2;
          }

          return 1;
        }

        if (this.arabicText.isKasra(suffixIndex - 1)) {
          return 0;
        }

        if (
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.AlifMaksura &&
          this.arabicText.isShadda(suffixIndex - 1)
        ) {
          return 0;
        }

        if (token.location.equals(20, 94, 2) || token.location.equals(7, 150, 25)) {
          return 0;
        }

        if (
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Ya &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Ha
        ) {
          return 2;
        }

        this.fail('PRON:1S');
      }
    }

    if (person === PersonType.First && number === NumberType.Plural) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Noon &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        if (this.arabicText.isShadda(suffixIndex - 2)) {
          return 1;
        }

        return 2;
      }

      this.fail('PRON:1P');
    }

    if (person === PersonType.Second && number === NumberType.Dual) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 3) === CharacterType.Kaf &&
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Meem &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        return 3;
      }

      this.fail('PRON:2D');
    }

    if (person === PersonType.Second && gender === GenderType.Masculine && number === NumberType.Plural) {
      if (
        isFirstObject &&
        this.arabicText.getCharacterType(suffixIndex - 3) === CharacterType.Kaf &&
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Meem &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Waw
      ) {
        return 3;
      }

      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Kaf &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Meem
      ) {
        return 2;
      }

      this.fail('PRON:2MP');
    }

    if (person === PersonType.Second && gender === GenderType.Masculine && number === NumberType.Singular) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Kaf) {
        return 1;
      }

      this.fail('PRON:2MS');
    }

    if (person === PersonType.Second && gender === GenderType.Feminine && number === NumberType.Singular) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Kaf) {
        return 1;
      }

      this.fail('PRON:2FS');
    }

    if (person === PersonType.Second && gender === GenderType.Feminine && number === NumberType.Plural) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Kaf &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon
      ) {
        return 2;
      }

      this.fail('PRON:2FP');
    }

    if (person === PersonType.Third && number === NumberType.Dual) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 3) === CharacterType.Ha &&
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Meem &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        return 3;
      }

      this.fail('PRON:3D');
    }

    if (person === PersonType.Third && gender === GenderType.Masculine && number === NumberType.Singular) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Ha) {
        return 1;
      }

      this.fail('PRON:3MS');
    }

    if (person === PersonType.Third && gender === GenderType.Masculine && number === NumberType.Plural) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Ha &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Meem
      ) {
        return 2;
      }

      this.fail('PRON:3MP');
    }

    if (person === PersonType.Third && gender === GenderType.Feminine && number === NumberType.Singular) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Ha &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        return 2;
      }

      if (
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Ha &&
        this.arabicText.isFatha(suffixIndex - 1)
      ) {
        return 1;
      }

      this.fail('PRON:3FS');
    }

    if (person === PersonType.Third && gender === GenderType.Feminine && number === NumberType.Plural) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Ha &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon
      ) {
        return 2;
      }

      this.fail('PRON:3FP');
    }

    this.fail('PRON');
    return 0;
  }

  readSubjectPronoun(token: Token, stem: Segment, suffixIndex: number, isObjectAttached: boolean): number {
    if (stem.partOfSpeech !== PartOfSpeech.Verb) {
      return 0;
    }

    const aspect = stem.aspect;
    if (aspect === AspectType.Perfect) {
      return this.readPerfectVerbSubject(token, stem, suffixIndex, isObjectAttached);
    }

    if (aspect === AspectType.Imperfect) {
      return this.readImperfectVerbSubject(token, stem, suffixIndex, isObjectAttached);
    }

    if (aspect === AspectType.Imperative) {
      return this.readImperativeVerbSubject(token, stem, suffixIndex, isObjectAttached);
    }

    return 0;
  }

  private readPerfectVerbSubject(token: Token, stem: Segment, suffixIndex: number, isObjectAttached: boolean): number {
    this.token = token;
    this.arabicText = token.arabicText;

    const person = stem.person;
    const gender = stem.gender;
    const number = stem.number;

    if (person === PersonType.First && number === NumberType.Singular) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Ta &&
        this.arabicText.isDamma(suffixIndex - 1)
      ) {
        return 1;
      }

      this.fail('1S');
    }

    if (person === PersonType.First && number === NumberType.Plural) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Noon &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        return 2;
      }

      this.fail('1P');
    }

    if (person === PersonType.Second && gender === GenderType.Masculine && number === NumberType.Singular) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Ta &&
        this.arabicText.isFatha(suffixIndex - 1)
      ) {
        return 1;
      }

      this.fail('2MS');
    }

    if (person === PersonType.Second && gender === GenderType.Feminine && number === NumberType.Singular) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Ta &&
        this.arabicText.isKasra(suffixIndex - 1)
      ) {
        return 1;
      }

      this.fail('2FS');
    }

    if (person === PersonType.Second && number === NumberType.Dual) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 3) === CharacterType.Ta &&
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Meem &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        return 3;
      }

      this.fail('2D');
    }

    if (person === PersonType.Second && gender === GenderType.Masculine && number === NumberType.Plural) {
      if (isObjectAttached) {
        if (
          this.arabicText.getCharacterType(suffixIndex - 3) === CharacterType.Ta &&
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Meem &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Waw
        ) {
          return 3;
        }

        this.fail('2MP');
      } else {
        if (
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Ta &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Meem
        ) {
          return 2;
        }

        this.fail('2MP');
      }
    }

    if (person === PersonType.Second && gender === GenderType.Feminine && number === NumberType.Plural) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Ta &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon
      ) {
        return 2;
      }

      this.fail('2FP');
    }

    if (person === PersonType.Third && gender === GenderType.Masculine && number === NumberType.Dual) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif) {
        return 1;
      }

      this.fail('3MD');
    }

    if (person === PersonType.Third && gender === GenderType.Feminine && number === NumberType.Dual) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Ta &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        return 2;
      }

      this.fail('3FD');
    }

    if (person === PersonType.Third && gender === GenderType.Masculine && number === NumberType.Plural) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Waw &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        return 2;
      }

      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Waw) {
        return 1;
      }

      this.fail('3MP');
    }

    if (person === PersonType.Third && gender === GenderType.Feminine && number === NumberType.Plural) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon) {
        return 1;
      }

      this.fail('3FP');
    }

    return 0;
  }

  private readImperfectVerbSubject(token: Token, stem: Segment, suffixIndex: number, isObjectAttached: boolean): number {
    this.token = token;
    this.arabicText = token.arabicText;

    const person = stem.person;
    const gender = stem.gender;
    const number = stem.number;

    const mood = stem.mood;

    if ((person === PersonType.Second || person === PersonType.Third) && number === NumberType.Dual) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif) {
        return 1;
      }

      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Alif &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon
      ) {
        return 2;
      }

      this.fail(person === PersonType.Second ? '2D' : '3D');
    }

    if (
      (person === PersonType.Second || person === PersonType.Third) &&
      gender === GenderType.Masculine &&
      number === NumberType.Plural
    ) {
      if (mood == null || mood === MoodType.Indicative) {
        if (
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Waw &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon
        ) {
          return 2;
        }

        if (
          this.arabicText.getCharacterType(suffixIndex - 3) === CharacterType.Waw &&
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.SmallWaw &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon
        ) {
          return 3;
        }

        if (isObjectAttached && this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Waw) {
          return 1;
        }

        this.fail(person === PersonType.Second ? '2MP' : '3MP');
      }

      if (mood === MoodType.Subjunctive) {
        if (
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Waw &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
        ) {
          return 2;
        }

        if (
          this.arabicText.getCharacterType(suffixIndex - 3) === CharacterType.Waw &&
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.SmallWaw &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
        ) {
          return 2;
        }

        if (isObjectAttached && this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Waw) {
          return 1;
        }

        this.fail(person === PersonType.Second ? '2MP' : '3MP');
      }

      if (mood === MoodType.Jussive) {
        if (
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Waw &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon
        ) {
          return 2;
        }

        if (
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Waw &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
        ) {
          return 2;
        }

        if (
          this.arabicText.getCharacterType(suffixIndex - 3) === CharacterType.Waw &&
          this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.SmallWaw &&
          this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
        ) {
          return 2;
        }

        if (isObjectAttached && this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Waw) {
          return 1;
        }

        this.fail(person === PersonType.Second ? '2MP' : '3MP');
      }
    }

    if (person === PersonType.Third && gender === GenderType.Feminine && number === NumberType.Plural) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon) {
        return 1;
      }

      this.fail('3FP');
    }

    if (person === PersonType.Second && gender === GenderType.Feminine && number === NumberType.Plural) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon) {
        return 1;
      }

      this.fail('2FP');
    }

    return 0;
  }

  private readImperativeVerbSubject(token: Token, stem: Segment, suffixIndex: number, isObjectAttached: boolean): number {
    this.token = token;
    this.arabicText = token.arabicText;

    const person = stem.person;
    const gender = stem.gender;
    const number = stem.number;

    if (person === PersonType.Second && number === NumberType.Dual) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif) {
        return 1;
      }

      this.fail('2D');
    }

    if (person === PersonType.Second && gender === GenderType.Feminine && number === NumberType.Singular) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.AlifMaksura ||
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Ya
      ) {
        return 1;
      }

      this.fail('2FS');
    }

    if (person === PersonType.Second && gender === GenderType.Masculine && number === NumberType.Plural) {
      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Waw &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        return 2;
      }

      if (isObjectAttached && this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Waw) {
        return 1;
      }

      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.SmallWaw &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Alif
      ) {
        return 2;
      }

      if (
        this.arabicText.getCharacterType(suffixIndex - 2) === CharacterType.Hamza &&
        this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Waw
      ) {
        return 2;
      }

      if (toBuckwalter(token.arabicText) === 'halum~a') {
        return 0;
      }

      this.fail('2MP');
    }

    if (person === PersonType.Second && gender === GenderType.Feminine && number === NumberType.Plural) {
      if (this.arabicText.getCharacterType(suffixIndex - 1) === CharacterType.Noon) {
        return 1;
      }

      this.fail('3FP');
    }

    return 0;
  }

  private fail(feature: string): never {
    const token = this.token;
    if (token == null) {
      throw new Error(`Failed to produce segments for token: feature: ${feature}`);
    }

    throw new Error(
      `Failed to produce segments for token: ${token.location.toString()} ${toBuckwalter(token.arabicText)}, feature: ${feature}`
    );
  }
}

import type { ArabicText } from '../arabic/arabic-text.js';
import type { Lemma } from '../lexicography/lemma.js';
import {
  type AspectType,
  type CaseType,
  type DerivationType,
  type FormType,
  type GenderType,
  type MoodType,
  type NumberType,
  type PartOfSpeechCategory,
  type PersonType,
  type PronounType,
  SegmentType,
  type SpecialType,
  type StateType,
  type VoiceType
} from './types.js';
import { PartOfSpeech } from './part-of-speech.js';
import { PartOfSpeechCategory as POSCategory } from './types.js';

export class Segment {
  arabicText: ArabicText | null = null;
  segmentNumber = 0;
  startIndex = 0;
  endIndex = 0;

  root: ArabicText | null = null;
  lemma: Lemma | null = null;

  person: PersonType | null = null;
  gender: GenderType | null = null;
  number: NumberType | null = null;

  aspect: AspectType | null = null;
  mood: MoodType | null = null;
  voice: VoiceType | null = null;
  form: FormType | null = null;

  derivation: DerivationType | null = null;
  state: StateType | null = null;
  caseType: CaseType | null = null;
  pronounType: PronounType | null = null;
  special: SpecialType | null = null;

  constructor(
    public readonly type: SegmentType,
    public readonly partOfSpeech: PartOfSpeech
  ) {}

  getPartOfSpeechCategory(): PartOfSpeechCategory {
    if (this.partOfSpeech === PartOfSpeech.Verb) {
      return POSCategory.Verb;
    }

    if (
      this.partOfSpeech === PartOfSpeech.Noun ||
      this.partOfSpeech === PartOfSpeech.ProperNoun ||
      this.partOfSpeech === PartOfSpeech.Adjective ||
      this.partOfSpeech === PartOfSpeech.Time ||
      this.partOfSpeech === PartOfSpeech.Location ||
      this.partOfSpeech === PartOfSpeech.Pronoun ||
      this.partOfSpeech === PartOfSpeech.Relative ||
      this.partOfSpeech === PartOfSpeech.Demonstrative
    ) {
      return POSCategory.Nominal;
    }

    const lemma = this.lemma?.key;
    if (lemma === '<i*aA') {
      return POSCategory.Nominal;
    }

    if (
      this.partOfSpeech === PartOfSpeech.Conditional ||
      this.partOfSpeech === PartOfSpeech.Interrogative
    ) {
      if (
        lemma != null &&
        [
          'man',
          'maA',
          '>aY~',
          '>ay~',
          'kayof',
          'kam',
          '>an~aY`',
          'maA*aA',
          'mataY`',
          '>ayon',
          '>ay~aAn',
          '{l~a*iY',
          'Hayov'
        ].includes(lemma)
      ) {
        return POSCategory.Nominal;
      }
    }

    return POSCategory.Particle;
  }
}

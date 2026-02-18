import { AspectType, GenderType, NumberType, PersonType, PronounType } from '../morphology/types.js';
import { PartOfSpeech } from '../morphology/part-of-speech.js';
import {
  PRONOUN_TYPE_ALIF,
  PRONOUN_TYPE_HA,
  PRONOUN_TYPE_HAA,
  PRONOUN_TYPE_HM,
  PRONOUN_TYPE_HN,
  PRONOUN_TYPE_KAF,
  PRONOUN_TYPE_NA,
  PRONOUN_TYPE_NOON,
  PRONOUN_TYPE_TA,
  PRONOUN_TYPE_WAW,
  PRONOUN_TYPE_YA
} from './arabic-grammar.js';
import type { Segment } from '../morphology/segment.js';

export type PronounDescription = {
  description: string;
  quote: boolean;
};

function value(description: string, quote = false): PronounDescription {
  return { description, quote };
}

export function getPronounDescription(stem: Segment, pronoun: Segment): PronounDescription | null {
  const aspect = stem.aspect;
  const person = pronoun.person;
  const gender = pronoun.gender;
  const number = pronoun.number;
  const pronounType = pronoun.pronounType;

  if (person === PersonType.First && number === NumberType.Singular) {
    if (pronounType === PronounType.Object) {
      return value(PRONOUN_TYPE_YA);
    }

    return value(PRONOUN_TYPE_TA);
  }

  if (person === PersonType.First && number === NumberType.Plural) {
    return value(PRONOUN_TYPE_NA, true);
  }

  if (person === PersonType.Second && number === NumberType.Dual) {
    if (pronounType === PronounType.Subject) {
      if (aspect === AspectType.Imperfect || aspect === AspectType.Imperative) {
        return value(PRONOUN_TYPE_ALIF);
      }

      return value(PRONOUN_TYPE_TA);
    }

    return value(PRONOUN_TYPE_KAF);
  }

  if (person === PersonType.Second && gender === GenderType.Feminine && number === NumberType.Singular) {
    if (pronounType === PronounType.Object) {
      return value(PRONOUN_TYPE_KAF);
    }

    if (stem.partOfSpeech === PartOfSpeech.Verb && stem.aspect === AspectType.Perfect) {
      return value(PRONOUN_TYPE_TA);
    }

    return value(PRONOUN_TYPE_YA);
  }

  if (person === PersonType.Second && gender === GenderType.Feminine && number === NumberType.Plural) {
    if (pronounType === PronounType.Subject) {
      return value(PRONOUN_TYPE_TA);
    }

    return value(PRONOUN_TYPE_KAF);
  }

  if (
    person === PersonType.Second &&
    gender === GenderType.Masculine &&
    (number === NumberType.Singular || number === NumberType.Plural)
  ) {
    if (pronounType === PronounType.Subject) {
      if (aspect === AspectType.Perfect) {
        return value(PRONOUN_TYPE_TA);
      }

      return value(PRONOUN_TYPE_WAW);
    }

    return value(PRONOUN_TYPE_KAF);
  }

  if (person === PersonType.Third && gender === GenderType.Masculine && number === NumberType.Singular) {
    return value(PRONOUN_TYPE_HA);
  }

  if (person === PersonType.Third && gender === GenderType.Feminine && number === NumberType.Singular) {
    return value(PRONOUN_TYPE_HAA, true);
  }

  if (person === PersonType.Third && number === NumberType.Dual) {
    if (pronounType === PronounType.Subject) {
      return value(PRONOUN_TYPE_ALIF);
    }

    return value(PRONOUN_TYPE_HA);
  }

  if (person === PersonType.Third && gender === GenderType.Feminine && number === NumberType.Plural) {
    if (pronounType === PronounType.Subject) {
      return value(PRONOUN_TYPE_NOON);
    }

    return value(PRONOUN_TYPE_HN, true);
  }

  if (person === PersonType.Third && gender === GenderType.Masculine && number === NumberType.Plural) {
    if (pronounType === PronounType.Subject) {
      return value(PRONOUN_TYPE_WAW);
    }

    return value(PRONOUN_TYPE_HM, true);
  }

  return null;
}

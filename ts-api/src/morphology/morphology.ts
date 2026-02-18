import { CharacterType } from '../arabic/character-type.js';
import type { Token } from '../orthography/token.js';
import { PartOfSpeech } from './part-of-speech.js';
import { NumberType, PersonType, PronounType, SegmentType } from './types.js';
import type { Segment } from './segment.js';

export function getStem(segments: Segment[]): Segment {
  for (const segment of segments) {
    if (segment.type === SegmentType.Stem) {
      return segment;
    }
  }

  throw new Error('A unique stem could not be found for the token.');
}

export function isDeterminerAl(segments: Segment[]): boolean {
  return isPrefix(segments, PartOfSpeech.Determiner);
}

export function isInterrogativeAlif(segments: Segment[]): boolean {
  return isPrefix(segments, PartOfSpeech.Interrogative);
}

export function isEmphasisNoonWithTanween(segment: Segment): boolean {
  return (
    segment.type === SegmentType.Suffix &&
    segment.partOfSpeech === PartOfSpeech.Emphatic &&
    segment.arabicText?.getCharacterType((segment.arabicText?.getLength() ?? 1) - 1) === CharacterType.Alif
  );
}

export function isSuffixElision(token: Token, suffix: Segment): boolean {
  if (
    suffix.pronounType !== PronounType.Object ||
    suffix.person !== PersonType.First ||
    suffix.number !== NumberType.Singular
  ) {
    return false;
  }

  const suffixArabic = suffix.arabicText;
  if (suffixArabic == null) {
    return false;
  }

  if (suffixArabic.getLength() === 0) {
    return token.arabicText.getCharacterType(suffix.startIndex - 1) !== CharacterType.AlifMaksura;
  }

  if (suffixArabic.getLength() === 2) {
    return false;
  }

  const characterType = suffixArabic.getCharacterType(suffixArabic.getLength() - 1);
  return characterType !== CharacterType.AlifMaksura && characterType !== CharacterType.Ya;
}

function isPrefix(segments: Segment[], partOfSpeech: PartOfSpeech): boolean {
  for (const segment of segments) {
    if (segment.type !== SegmentType.Prefix) {
      return false;
    }

    if (segment.partOfSpeech === partOfSpeech) {
      return true;
    }
  }

  return false;
}

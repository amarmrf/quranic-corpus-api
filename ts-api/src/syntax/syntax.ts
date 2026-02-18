import { fromBuckwalter } from '../arabic/encoding/buckwalter/buckwalter-decoder.js';
import { toBuckwalter } from '../arabic/encoding/buckwalter/buckwalter-encoder.js';
import { toUnicode } from '../arabic/encoding/unicode/unicode-encoder.js';
import { AspectType, GenderType, NumberType, PersonType, SegmentType } from '../morphology/types.js';
import { isInterrogativeAlif } from '../morphology/morphology.js';
import { PartOfSpeech } from '../morphology/part-of-speech.js';
import type { Segment } from '../morphology/segment.js';

export function isPrepositionPhrase(segments: Segment[]): boolean;
export function isPrepositionPhrase(segments: Segment[], index: number): boolean;
export function isPrepositionPhrase(segments: Segment[], index?: number): boolean {
  if (index == null) {
    for (let i = 0; i < segments.length; i++) {
      if (isPrepositionPhrase(segments, i)) {
        return true;
      }
    }

    return false;
  }

  const segment = segments[index];
  if (segment == null || segment.partOfSpeech !== PartOfSpeech.Preposition) {
    return false;
  }

  const next = index < segments.length - 1 ? segments[index + 1] : null;
  if (segment.type === SegmentType.Prefix) {
    if (next == null) {
      return true;
    }

    const partOfSpeech = next.partOfSpeech;
    return partOfSpeech !== PartOfSpeech.Accusative && partOfSpeech !== PartOfSpeech.Supplemental;
  }

  return segment.type === SegmentType.Stem && next != null && next.partOfSpeech === PartOfSpeech.Pronoun;
}

export function isPreventivePhrase(segments: Segment[]): boolean;
export function isPreventivePhrase(segments: Segment[], index: number): boolean;
export function isPreventivePhrase(segments: Segment[], index?: number): boolean {
  if (index == null) {
    for (let i = 0; i < segments.length; i++) {
      if (isPreventivePhrase(segments, i)) {
        return true;
      }
    }

    return false;
  }

  const segment = segments[index];
  if (segment == null || segment.partOfSpeech !== PartOfSpeech.Accusative) {
    return false;
  }

  const next = index < segments.length - 1 ? segments[index + 1] : null;
  return next?.partOfSpeech === PartOfSpeech.Preventive;
}

export function getHeadName(segments: Segment[], segment: Segment): string {
  const partOfSpeech = segment.partOfSpeech;
  const aspect = segment.aspect;
  const person = segment.person;
  const gender = segment.gender;
  const number = segment.number;

  const root = segment.root != null ? toBuckwalter(segment.root) : null;
  const lemma = segment.lemma;

  if (
    partOfSpeech === PartOfSpeech.Verb &&
    aspect === AspectType.Imperfect &&
    root === 'kwn' &&
    person === PersonType.Second
  ) {
    return toUnicode(fromBuckwalter('kAn'));
  }

  if (
    partOfSpeech === PartOfSpeech.Verb &&
    aspect === AspectType.Perfect &&
    root === 'kwn' &&
    (person === PersonType.First || person === PersonType.Second)
  ) {
    return toUnicode(fromBuckwalter('kAn'));
  }

  if (
    partOfSpeech === PartOfSpeech.Verb &&
    aspect === AspectType.Perfect &&
    root === 'lys' &&
    (person === PersonType.Second ||
      (person === PersonType.Third && gender === GenderType.Feminine && number === NumberType.Singular))
  ) {
    return toUnicode(fromBuckwalter('lys'));
  }

  if (
    partOfSpeech === PartOfSpeech.Verb &&
    aspect === AspectType.Perfect &&
    root === 'dwm' &&
    person === PersonType.Second &&
    gender === GenderType.Masculine &&
    number === NumberType.Singular
  ) {
    return toUnicode(fromBuckwalter('dAm'));
  }

  if (isInterrogativeAlif(segments) && lemma?.key === '<in~') {
    return toUnicode(fromBuckwalter('An'));
  }

  if (lemma?.key === 'ka>an~') {
    return toUnicode(fromBuckwalter('k>n'));
  }

  if ((segment.arabicText?.getLength() ?? 0) === 0 && segment.partOfSpeech === PartOfSpeech.Accusative) {
    return toUnicode(fromBuckwalter('An'));
  }

  if (segment.arabicText == null) {
    return '';
  }

  return toUnicode(segment.arabicText.removeDiacritics());
}

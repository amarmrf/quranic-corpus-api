import type { Segment } from '../morphology/segment.js';
import { PartOfSpeech } from '../morphology/part-of-speech.js';
import { PartOfSpeechCategory, PronounType, SegmentType } from '../morphology/types.js';

export function getSegmentName(segments: Segment[], stem: Segment, segment: Segment): string {
  const derivation = segment.derivation;
  if (derivation != null) {
    switch (derivation) {
      case 'ACT PCPL':
        return 'active participle';
      case 'PASS PCPL':
        return 'passive participle';
      case 'VN':
        return 'verbal noun';
    }
  }

  switch (segment.partOfSpeech) {
    case PartOfSpeech.Noun:
      return 'noun';
    case PartOfSpeech.ProperNoun:
      return 'proper noun';
    case PartOfSpeech.Pronoun:
      if (segment.type === SegmentType.Suffix) {
        const stemPartOfSpeech = stem.partOfSpeech;
        if (
          stemPartOfSpeech === PartOfSpeech.Noun ||
          stemPartOfSpeech === PartOfSpeech.Time ||
          stemPartOfSpeech === PartOfSpeech.Location
        ) {
          return 'possessive pronoun';
        }

        switch (segment.pronounType) {
          case PronounType.Subject:
            return 'subject pronoun';
          case PronounType.Object:
            return segments[segments.length - 1]?.pronounType === PronounType.SecondObject
              ? 'first object pronoun'
              : 'object pronoun';
          case PronounType.SecondObject:
            return 'second object pronoun';
        }
      }

      return 'personal pronoun';
    case PartOfSpeech.Demonstrative:
      return 'demonstrative pronoun';
    case PartOfSpeech.Relative:
      return 'relative pronoun';
    case PartOfSpeech.Adjective:
      return 'adjective';
    case PartOfSpeech.Verb:
      return 'verb';
    case PartOfSpeech.Preposition:
      return 'preposition';
    case PartOfSpeech.Accusative:
      return 'accusative particle';
    case PartOfSpeech.Conditional:
      return segment.getPartOfSpeechCategory() === PartOfSpeechCategory.Nominal
        ? 'conditional noun'
        : 'conditional particle';
    case PartOfSpeech.SubordinatingConjunction:
      return 'subordinating conjunction';
    case PartOfSpeech.Restriction:
      return 'restriction particle';
    case PartOfSpeech.Exceptive:
      return 'exceptive particle';
    case PartOfSpeech.Aversion:
      return 'aversion particle';
    case PartOfSpeech.Certainty:
      return 'particle of certainty';
    case PartOfSpeech.Retraction:
      return 'retraction particle';
    case PartOfSpeech.Preventive:
      return 'preventive particle';
    case PartOfSpeech.Answer:
      return 'answer particle';
    case PartOfSpeech.Inceptive:
      return 'inceptive particle';
    case PartOfSpeech.Surprise:
      return 'surprise particle';
    case PartOfSpeech.Supplemental:
      return 'supplemental particle';
    case PartOfSpeech.Exhortation:
      return 'exhortation particle';
    case PartOfSpeech.Result:
      return 'result particle';
    case PartOfSpeech.ImperativeVerbalNoun:
      return 'imperative verbal noun';
    case PartOfSpeech.Interrogative:
      if (segment.type !== SegmentType.Prefix) {
        return segment.getPartOfSpeechCategory() === PartOfSpeechCategory.Nominal
          ? 'interrogative noun'
          : 'interrogative particle';
      }

      return 'interrogative {alif}';
    case PartOfSpeech.Vocative:
      return segment.type === SegmentType.Suffix ? 'vocative suffix' : 'vocative particle';
    case PartOfSpeech.Negative:
      return 'negative particle';
    case PartOfSpeech.Emphatic:
      return segment.type === SegmentType.Suffix ? 'emphatic suffix' : 'emphatic prefix';
    case PartOfSpeech.Purpose:
      return 'particle of purpose';
    case PartOfSpeech.Imperative:
      return 'imperative particle';
    case PartOfSpeech.Future:
      return 'future particle';
    case PartOfSpeech.Conjunction:
      return segment.type === SegmentType.Prefix ? 'conjunction' : 'coordinating conjunction';
    case PartOfSpeech.Initials:
      return 'Quranic initials';
    case PartOfSpeech.Time:
      return 'time adverb';
    case PartOfSpeech.Location:
      return 'location adverb';
    case PartOfSpeech.Explanation:
      return 'explanation particle';
    case PartOfSpeech.Equalization:
      return 'equalization particle';
    case PartOfSpeech.Resumption:
      return 'resumption particle';
    case PartOfSpeech.Circumstantial:
      return 'circumstantial particle';
    case PartOfSpeech.Cause:
      return 'particle of cause';
    case PartOfSpeech.Amendment:
      return 'amendment particle';
    case PartOfSpeech.Prohibition:
      return 'prohibition particle';
    case PartOfSpeech.Interpretation:
      return 'particle of interpretation';
    case PartOfSpeech.Comitative:
      return 'comitative particle';
    default:
      throw new Error('Unsupported segment type.');
  }
}

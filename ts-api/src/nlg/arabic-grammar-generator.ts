import { CharacterType } from '../arabic/character-type.js';
import { fromBuckwalter } from '../arabic/encoding/buckwalter/buckwalter-decoder.js';
import { toUnicode } from '../arabic/encoding/unicode/unicode-encoder.js';
import { isDiptoteWithGenitiveFatha } from '../morphology/diptote.js';
import { isEmphasisNoonWithTanween, isSuffixElision } from '../morphology/morphology.js';
import { PartOfSpeech } from '../morphology/part-of-speech.js';
import { PartOfSpeechCategory, PronounType, SegmentType, VoiceType } from '../morphology/types.js';
import type { Segment } from '../morphology/segment.js';
import type { Token } from '../orthography/token.js';
import {
  ADJECTIVE,
  ACCUSATIVE,
  ACCUSATIVE_FEMININE,
  ACCUSATIVE_PARTICLE,
  ALLAH,
  AMENDMENT_PARTICLE,
  ANSWER_PARTICLE,
  AVERSION_PARTICLE,
  CAUSE_FA,
  CERTAINTY_PARTICLE,
  CIRCUMSTANTIAL_WAW,
  COMITATIVE_PARTICLE,
  COMITATIVE_WAW,
  CONDITIONAL_NOUN,
  CONDITIONAL_PARTICLE,
  CONJUNCTION,
  CONJUNCTION_FA,
  CONJUNCTION_WAW,
  DEMONSTRATIVE,
  DIPTOTE,
  EMPHASIS_LAM,
  EMPHASIS_NOON,
  EMPHASIS_NOON_TANWEEN,
  EQUALIZATION_ALIF,
  EXCEPTIVE_PARTICLE,
  EXHORTATION_PARTICLE,
  EXPLANATION_PARTICLE,
  FUTURE_PARTICLE,
  GENITIVE,
  GENITIVE_FATHA_REASON,
  GENITIVE_FEMININE,
  GROUP_MEMBER,
  IMPERATIVE,
  IMPERATIVE_LAM,
  IMPERATIVE_VERBAL_NOUN,
  INCEPTIVE_PARTICLE,
  INITIALS,
  INNA_GROUP,
  INNA_PRONOUN,
  INTERPRETATION_PARTICLE,
  INTERROGATIVE_ALIF,
  INTERROGATIVE_NOUN,
  INTERROGATIVE_PARTICLE,
  JUSSIVE,
  KAADA_GROUP,
  KAANA_GROUP,
  KAANA_PRONOUN,
  LOCATION,
  NEGATIVE,
  NEGATIVE_ROLE,
  NEGATIVE_TYPE,
  NOMINATIVE,
  NOMINATIVE_FEMININE,
  NOUN,
  OBJECT_PRONOUN,
  PARTICLE_ANNA,
  PARTICLE_INNA,
  PARTICLE_LAYSA,
  PASSIVE,
  PASSIVE_SUBJECT_PRONOUN,
  POSSESSIVE_PRONOUN,
  PREPOSITION,
  PREPOSITION_PHRASE,
  PREVENTIVE_PHRASE,
  PERFECT,
  PROHIBITION,
  PROPER_NOUN,
  PRONOUN,
  PRONOUN_ROLE,
  PURPOSE_LAM,
  RELATIVE,
  RESUMPTION_FA,
  RESUMPTION_WAW,
  RESTRICTION_PARTICLE,
  RESULT_FA,
  RETRACTION_PARTICLE,
  SECOND,
  SUBJECT_PRONOUN,
  SUBORDINATING_CONJUNCTION,
  SUPPLEMENTAL_FA,
  SUPPLEMENTAL_PARTICLE,
  SUPPLEMENTAL_WAW,
  SURPRISE_PARTICLE,
  TIME,
  VERB,
  VERB_KAANA,
  VOCATIVE_PREFIX,
  WAW,
  FIRST,
  IMPERFECT
} from './arabic-grammar.js';
import { getPronounDescription } from './pronoun-description.js';
import { getHeadName, isPrepositionPhrase, isPreventivePhrase } from '../syntax/syntax.js';

export class ArabicGrammarGenerator {
  private readonly text: string[] = [];

  constructor(
    private readonly token: Token,
    private readonly segments: Segment[]
  ) {}

  generate(): string {
    let stem: Segment | null = null;
    const segmentCount = this.segments.length;

    for (let i = 0; i < segmentCount; i++) {
      const segment = this.segments[i] as Segment;

      if (isPrepositionPhrase(this.segments, i)) {
        this.writeSection(PREPOSITION_PHRASE);
        while ((stem = this.segments[i] as Segment).type !== SegmentType.Stem) {
          i++;
        }
        continue;
      }

      if (isPreventivePhrase(this.segments, i)) {
        this.writeSection(PREVENTIVE_PHRASE);
        while ((stem = this.segments[i] as Segment).type !== SegmentType.Stem) {
          i++;
        }
        continue;
      }

      switch (segment.type) {
        case SegmentType.Prefix:
          this.writePrefix(segment);
          break;
        case SegmentType.Stem:
          this.writeStem((stem = segment));
          break;
        case SegmentType.Suffix:
          if (stem != null) {
            this.writeSuffix(this.token, stem, segment);
          }
          break;
      }
    }

    return this.text.join('');
  }

  private writePrefix(prefix: Segment): void {
    switch (prefix.partOfSpeech) {
      case PartOfSpeech.Conjunction:
        switch (prefix.lemma?.arabicText.getCharacterType(0)) {
          case CharacterType.Waw:
            this.writeSection(CONJUNCTION_WAW);
            break;
          case CharacterType.Fa:
            this.writeSection(CONJUNCTION_FA);
            break;
        }
        break;
      case PartOfSpeech.Comitative:
        this.writeSection(COMITATIVE_WAW);
        break;
      case PartOfSpeech.Resumption:
        switch (prefix.lemma?.arabicText.getCharacterType(0)) {
          case CharacterType.Waw:
            this.writeSection(RESUMPTION_WAW);
            break;
          case CharacterType.Fa:
            this.writeSection(RESUMPTION_FA);
            break;
        }
        break;
      case PartOfSpeech.Circumstantial:
        this.writeSection(CIRCUMSTANTIAL_WAW);
        break;
      case PartOfSpeech.Result:
        this.writeSection(RESULT_FA);
        break;
      case PartOfSpeech.Cause:
        this.writeSection(CAUSE_FA);
        break;
      case PartOfSpeech.Supplemental:
        switch (prefix.lemma?.arabicText.getCharacterType(0)) {
          case CharacterType.Waw:
            this.writeSection(SUPPLEMENTAL_WAW);
            break;
          case CharacterType.Fa:
            this.writeSection(SUPPLEMENTAL_FA);
            break;
        }
        break;
      case PartOfSpeech.Emphatic:
        this.writeSection(EMPHASIS_LAM);
        break;
      case PartOfSpeech.Imperative:
        this.writeSection(IMPERATIVE_LAM);
        break;
      case PartOfSpeech.Purpose:
        this.writeSection(PURPOSE_LAM);
        break;
      case PartOfSpeech.Future:
        this.writeSection(FUTURE_PARTICLE);
        break;
      case PartOfSpeech.Interrogative:
        this.writeSection(INTERROGATIVE_ALIF);
        break;
      case PartOfSpeech.Equalization:
        this.writeSection(EQUALIZATION_ALIF);
        break;
      case PartOfSpeech.Vocative:
        this.writeSection(VOCATIVE_PREFIX);
        break;
      case PartOfSpeech.Preposition:
        this.writeSection(PREPOSITION);
        break;
    }
  }

  private writeStem(stem: Segment): void {
    const partOfSpeech = stem.partOfSpeech;
    const special = stem.special;

    switch (partOfSpeech) {
      case PartOfSpeech.Noun:
        this.writeSection(NOUN);
        break;
      case PartOfSpeech.ProperNoun:
        if (stem.lemma?.key === '{ll~ah' || stem.lemma?.key === '{ll~ahum~a') {
          this.writeSection(ALLAH);
        } else {
          this.writeSection(PROPER_NOUN);
        }
        break;
      case PartOfSpeech.Pronoun:
        this.writeSection(PRONOUN);
        break;
      case PartOfSpeech.Demonstrative:
        this.writeSection(DEMONSTRATIVE);
        break;
      case PartOfSpeech.Relative:
        this.writeSection(RELATIVE);
        break;
      case PartOfSpeech.Adjective:
        this.writeSection(ADJECTIVE);
        break;
      case PartOfSpeech.Verb:
        this.writeVerb(stem);
        break;
      case PartOfSpeech.Preposition:
        this.writeSection(PREPOSITION);
        break;
      case PartOfSpeech.Interrogative:
        this.writeSection(stem.getPartOfSpeechCategory() === PartOfSpeechCategory.Nominal ? INTERROGATIVE_NOUN : INTERROGATIVE_PARTICLE);
        break;
      case PartOfSpeech.Negative:
        if (special === 'kaAn') {
          this.writeSection(NEGATIVE_TYPE);
          this.text.push(' «');
          this.text.push(PARTICLE_LAYSA);
          this.text.push('»');
          break;
        }

        if (special === '<in~') {
          this.writeSection(NEGATIVE_ROLE);
          this.text.push(' «');
          this.text.push(PARTICLE_ANNA);
          this.text.push('»');
          break;
        }

        this.writeSection(NEGATIVE);
        break;
      case PartOfSpeech.Prohibition:
        this.writeSection(PROHIBITION);
        break;
      case PartOfSpeech.Future:
        this.writeSection(FUTURE_PARTICLE);
        break;
      case PartOfSpeech.Conjunction:
        this.writeSection(CONJUNCTION);
        break;
      case PartOfSpeech.Initials:
        this.writeSection(INITIALS);
        break;
      case PartOfSpeech.Time:
        this.writeSection(TIME);
        break;
      case PartOfSpeech.Location:
        this.writeSection(LOCATION);
        break;
      case PartOfSpeech.Accusative:
        this.writeSection(ACCUSATIVE_PARTICLE);
        if (!stem.lemma?.arabicText.isHamzaBelow(0)) {
          this.write(GROUP_MEMBER);
          this.text.push(' «');
          this.text.push(PARTICLE_INNA);
          this.text.push('»');
        }
        break;
      case PartOfSpeech.Conditional:
        this.writeSection(stem.getPartOfSpeechCategory() === PartOfSpeechCategory.Nominal ? CONDITIONAL_NOUN : CONDITIONAL_PARTICLE);
        break;
      case PartOfSpeech.SubordinatingConjunction:
        this.writeSection(SUBORDINATING_CONJUNCTION);
        break;
      case PartOfSpeech.Restriction:
        this.writeSection(RESTRICTION_PARTICLE);
        break;
      case PartOfSpeech.Exceptive:
        this.writeSection(EXCEPTIVE_PARTICLE);
        break;
      case PartOfSpeech.Aversion:
        this.writeSection(AVERSION_PARTICLE);
        break;
      case PartOfSpeech.Certainty:
        this.writeSection(CERTAINTY_PARTICLE);
        break;
      case PartOfSpeech.Retraction:
        this.writeSection(RETRACTION_PARTICLE);
        break;
      case PartOfSpeech.Answer:
        this.writeSection(ANSWER_PARTICLE);
        break;
      case PartOfSpeech.Inceptive:
        this.writeSection(INCEPTIVE_PARTICLE);
        break;
      case PartOfSpeech.Surprise:
        this.writeSection(SURPRISE_PARTICLE);
        break;
      case PartOfSpeech.Supplemental:
        this.writeSection(SUPPLEMENTAL_PARTICLE);
        break;
      case PartOfSpeech.Exhortation:
        this.writeSection(EXHORTATION_PARTICLE);
        break;
      case PartOfSpeech.ImperativeVerbalNoun:
        this.writeSection(IMPERATIVE_VERBAL_NOUN);
        break;
      case PartOfSpeech.Explanation:
        this.writeSection(EXPLANATION_PARTICLE);
        break;
      case PartOfSpeech.Amendment:
        this.writeSection(AMENDMENT_PARTICLE);
        break;
      case PartOfSpeech.Interpretation:
        this.writeSection(INTERPRETATION_PARTICLE);
        break;
    }

    const isMasculinePartOfSpeechName = partOfSpeech !== PartOfSpeech.Adjective;
    if (stem.caseType != null) {
      switch (stem.caseType) {
        case 'NOM':
          this.write(isMasculinePartOfSpeechName ? NOMINATIVE : NOMINATIVE_FEMININE);
          break;
        case 'GEN':
          this.write(isMasculinePartOfSpeechName ? GENITIVE : GENITIVE_FEMININE);
          break;
        case 'ACC':
          this.write(isMasculinePartOfSpeechName ? ACCUSATIVE : ACCUSATIVE_FEMININE);
          break;
      }
    }

    if (isDiptoteWithGenitiveFatha(stem)) {
      this.write(GENITIVE_FATHA_REASON);
      this.write(DIPTOTE);
    }
  }

  private writeVerb(stem: Segment): void {
    this.writeSection(VERB);

    if (stem.aspect != null) {
      switch (stem.aspect) {
        case 'PERF':
          this.write(PERFECT);
          break;
        case 'IMPF':
          this.write(IMPERFECT);
          break;
        case 'IMPV':
          this.write(IMPERATIVE);
          break;
      }
    }

    if (stem.special === 'kaAn' && stem.root?.getCharacterType(0) !== CharacterType.Kaf) {
      this.write(GROUP_MEMBER);
      this.text.push(' «');
      this.text.push(VERB_KAANA);
      this.text.push('»');
    }

    if (stem.voice === VoiceType.Passive) {
      this.write(PASSIVE);
    }

    if (stem.mood != null) {
      switch (stem.mood) {
        case 'SUBJ':
          this.write(ACCUSATIVE);
          break;
        case 'JUS':
          this.write(JUSSIVE);
          break;
      }
    }
  }

  private writeSuffix(token: Token, stem: Segment, suffix: Segment): void {
    if (suffix.partOfSpeech === PartOfSpeech.Vocative) {
      return;
    }

    if (suffix.partOfSpeech === PartOfSpeech.Emphatic) {
      this.write(WAW);
      if (isEmphasisNoonWithTanween(suffix)) {
        this.text.push(EMPHASIS_NOON_TANWEEN);
      } else {
        this.text.push(EMPHASIS_NOON);
      }
      return;
    }

    if (stem.partOfSpeech === PartOfSpeech.Preposition) {
      return;
    }

    this.write(WAW);
    const description = getPronounDescription(stem, suffix);
    if (description != null) {
      if (description.quote) {
        this.text.push('«');
      }
      this.text.push(description.description);
      if (description.quote) {
        this.text.push('»');
      }
    }

    if (isSuffixElision(token, suffix)) {
      this.write(toUnicode(fromBuckwalter('AlmH*wfp')));
    }

    this.write(PRONOUN_ROLE);

    const special = stem.special;
    if (suffix.pronounType === PronounType.Subject) {
      if (special === 'kaAn' || special === 'kaAd') {
        this.write(KAANA_PRONOUN);
        this.text.push(' «');
        this.text.push(getHeadName(this.segments, stem));
        this.text.push('»');
      } else if (stem.voice === VoiceType.Passive) {
        this.write(PASSIVE_SUBJECT_PRONOUN);
      } else {
        this.write(SUBJECT_PRONOUN);
      }
      return;
    }

    if (special === '<in~') {
      this.write(INNA_PRONOUN);
      this.text.push(' «');
      this.text.push(getHeadName(this.segments, stem));
      this.text.push('»');
      return;
    }

    if (stem.partOfSpeech === PartOfSpeech.Verb) {
      this.write(OBJECT_PRONOUN);
      if (this.segments[this.segments.length - 1]?.pronounType === PronounType.SecondObject) {
        this.write(suffix.pronounType === PronounType.Object ? FIRST : SECOND);
      }
      return;
    }

    this.write(POSSESSIVE_PRONOUN);
  }

  private writeSection(text: string): void {
    if (this.text.length > 0) {
      this.text.push('\n');
    }
    this.text.push(text);
  }

  private write(text: string): void {
    if (this.text.length > 0) {
      this.text.push(' ');
    }
    this.text.push(text);
  }
}

import { CharacterType } from '../arabic/character-type.js';
import { fromBuckwalter } from '../arabic/encoding/buckwalter/buckwalter-decoder.js';
import { AspectType, MoodType, PronounType, StateType, VoiceType } from '../morphology/types.js';
import {
  getStem,
  isDeterminerAl,
  isEmphasisNoonWithTanween,
  isSuffixElision
} from '../morphology/morphology.js';
import { PartOfSpeech } from '../morphology/part-of-speech.js';
import { isDiptoteWithGenitiveFatha } from '../morphology/diptote.js';
import type { Segment } from '../morphology/segment.js';
import type { Token } from '../orthography/token.js';
import {
  ACCUSATIVE,
  COMITATIVE_PARTICLE,
  DIPTOTE,
  IMPERATIVE,
  IMPERFECT,
  INNA_GROUP,
  INITIALS,
  JUSSIVE,
  KAADA_GROUP,
  KAANA_GROUP,
  NOMINATIVE,
  PERFECT,
  PREPOSITION_PHRASE,
  PROHIBITION,
  VERB
} from './arabic-grammar.js';
import { getLongName } from './ordinal.js';
import { getPronounDescription } from './pronoun-description.js';
import { getSegmentName } from './segment-name.js';
import { Text } from './text.js';
import { getHeadName, isPrepositionPhrase, isPreventivePhrase } from '../syntax/syntax.js';
import { aspectName, genderName, numberName, personName, caseName, moodName } from '../morphology/enum-labels.js';

export class SummaryGenerator {
  private readonly text = new Text();
  private readonly stem: Segment;
  private singleSegment = false;

  constructor(
    private readonly token: Token,
    private readonly segments: Segment[]
  ) {
    this.stem = getStem(segments);
  }

  generate(): string {
    this.writeLeadingText();

    const segmentCount = isDeterminerAl(this.segments) ? this.segments.length - 1 : this.segments.length;
    this.singleSegment = segmentCount === 1;

    if (!this.singleSegment) {
      this.text.add('divided into ');
      this.text.add(segmentCount);
      this.text.add(' morphological segments');
      this.text.endSentence();
      this.writeSegmentNames();
    }

    this.writeSegmentDescriptions();
    this.writeSummary();
    return this.text.toString();
  }

  private writeSummary(): void {
    if (isPrepositionPhrase(this.segments)) {
      this.text.space();
      this.text.add('Together the segments form a preposition phrase known as ');
      this.text.addPhonetic('jār wa majrūr');
      this.text.addChar(' ');
      this.text.addArabic(PREPOSITION_PHRASE);
      this.text.endSentence();
      return;
    }

    if (isPreventivePhrase(this.segments)) {
      this.text.space();
      this.text.add('Together the segments are known as ');
      this.text.addPhonetic('kāfa wa makfūfa');
      this.text.addChar(' ');
      this.text.addArabic('كافة ومكفوفة');
      this.text.endSentence();
    }
  }

  private writeLeadingText(): void {
    const location = this.token.location;
    if (this.stem.partOfSpeech === PartOfSpeech.Initials) {
      this.text.add('Verse ');
      this.text.add(location.verseNumber);
      this.text.add(' of chapter ');
      this.text.add(location.chapterNumber);
      this.text.add(' begins with ');
      return;
    }

    this.text.add('The ');
    this.text.add(getLongName(location.tokenNumber));
    this.text.add(' word of verse (');
    this.text.add(location.chapterNumber);
    this.text.addChar(':');
    this.text.add(location.verseNumber);
    this.text.add(') is ');
  }

  private writeSegmentNames(): void {
    const items: string[] = [];
    const segmentCount = this.segments.length;

    for (let i = 0; i < segmentCount; i++) {
      const segment = this.segments[i] as Segment;
      if (segment.partOfSpeech === PartOfSpeech.Determiner) {
        continue;
      }

      if (
        i === this.segments.length - 2 &&
        segment.pronounType === PronounType.Object &&
        this.segments[i + 1]?.pronounType === PronounType.SecondObject
      ) {
        items.push('two object pronouns');
        break;
      }

      items.push(getSegmentName(this.segments, this.stem, segment));
    }

    this.text.space();

    const itemCount = items.length;
    for (let i = 0; i < itemCount; i++) {
      const item = items[i] ?? '';
      if (i === 0) {
        this.text.addIndefiniteArticle(true, item);
        this.text.addChar(' ');
      } else if (i === itemCount - 1) {
        this.text.add(' and ');
      } else {
        this.text.add(', ');
      }

      this.text.add(item);
    }

    this.text.endSentence();
  }

  private writeSegmentDescriptions(): void {
    for (const segment of this.segments) {
      switch (segment.type) {
        case 'Prefix':
          this.writePrefixDescription(segment);
          break;
        case 'Stem':
          this.writeStemDescription(segment);
          break;
        case 'Suffix':
          this.writeSuffixDescription(segment);
          break;
      }
    }
  }

  private writePrefixDescription(prefix: Segment): void {
    const partOfSpeech = prefix.partOfSpeech;

    if (partOfSpeech === PartOfSpeech.Interrogative) {
      this.text.space();
      this.text.add('The prefixed ');
      this.text.addPhonetic('alif');
      this.text.add(' is an interrogative particle used to form a question and is usually translated as "is", "are", or "do"');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Equalization) {
      this.text.space();
      this.text.add('The prefixed ');
      this.text.addPhonetic('alif');
      this.text.add(' indicates equality and is usually translated as "whether"');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Purpose) {
      this.text.space();
      this.text.add('The prefixed particle ');
      this.text.addPhonetic('lām');
      this.text.add(' is used to indicate the purpose of an action and makes the following verb subjunctive');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Emphatic) {
      this.text.space();
      this.text.add('The prefixed particle ');
      this.text.addPhonetic('lām');
      this.text.add(' is usually translated as "surely" or "indeed" and is used to add emphasis');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Imperative) {
      this.text.space();
      this.text.add('The prefixed particle ');
      this.text.addPhonetic('lām');
      this.text.add(' is usually translated as "let" and is used to form an imperative construction');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Conjunction) {
      const isWa = prefix.lemma?.arabicText.getCharacterType(0) === CharacterType.Waw;
      this.text.space();
      this.text.add('The prefixed conjunction ');
      this.text.addPhonetic(isWa ? 'wa' : 'fa');
      this.text.add(' is usually translated as "and"');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Resumption) {
      const isWa = prefix.lemma?.arabicText.getCharacterType(0) === CharacterType.Waw;
      this.text.space();
      this.text.add('The connective particle ');
      this.text.addPhonetic(isWa ? 'wa' : 'fa');
      this.text.add(' is usually translated as "then" or "so" and is used to indicate a sequence of events');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Supplemental) {
      const isWa = prefix.lemma?.arabicText.getCharacterType(0) === CharacterType.Waw;
      this.text.space();
      this.text.add('The supplemental particle ');
      this.text.addPhonetic(isWa ? 'wa' : 'fa');
      this.text.add(' is usually translated as "then" or "so"');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Result) {
      this.text.space();
      this.text.add('The result particle ');
      this.text.addPhonetic('fa');
      this.text.add(' is usually translated as "then" or "so" and is used to indicate the result of a condition');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Circumstantial) {
      this.text.space();
      this.text.add('The connective particle ');
      this.text.addPhonetic('wa');
      this.text.add(' is usually translated as "while" and is used to indicate the circumstance of events');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Comitative) {
      this.text.space();
      this.text.add('The comitative usage of ');
      this.text.addPhonetic('wāw');
      this.text.addChar(' ');
      this.text.addArabic(COMITATIVE_PARTICLE);
      this.text.add(' precedes a comitative object ');
      this.text.addArabic(fromBuckwalter('mfEwl mEh'));
      this.text.add(', and is considered to be equivalent to "with" ');
      this.text.addArabic(fromBuckwalter('mE'));
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Cause) {
      this.text.space();
      this.text.add('The prefixed particle ');
      this.text.addPhonetic('fa');
      this.text.add(' is usually translated as "then" or "so"');
      this.text.endSentence();
      this.text.space();
      this.text.add('The particle is used to indicate cause and makes the following verb subjunctive');
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Preposition) {
      let phonetic: string | null = null;
      let translation: string | null = null;
      let isOath = false;

      switch (prefix.lemma?.arabicText.getCharacterType(0)) {
        case CharacterType.Ba:
          phonetic = 'bi';
          translation = '"with" or "by"';
          break;
        case CharacterType.Kaf:
          phonetic = 'ka';
          translation = '"like" or "as"';
          break;
        case CharacterType.Ta:
          phonetic = 'ta';
          translation = '"by"';
          isOath = true;
          break;
        case CharacterType.Waw:
          phonetic = 'wa';
          translation = '"by"';
          isOath = true;
          break;
        case CharacterType.Lam:
          phonetic = 'lām';
          translation = '"for"';
          break;
      }

      this.text.space();
      this.text.add('The prefixed preposition ');
      this.text.addPhonetic(phonetic ?? '');
      this.text.add(' is usually translated as ');
      this.text.add(translation ?? '');
      if (isOath) {
        this.text.add(' and is used to form an oath');
      }
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Future) {
      this.text.space();
      this.text.add('The prefixed future particle ');
      this.text.addPhonetic('sa');
      this.text.add(' is used in combination with the imperfect (present tense) verb to form the future tense');
      this.text.endSentence();
    }
  }

  private writeStemDescription(stem: Segment): void {
    const partOfSpeech = stem.partOfSpeech;

    if (partOfSpeech === PartOfSpeech.Prohibition) {
      if (this.singleSegment) {
        this.text.add('a prohibition particle ');
        this.text.addArabic(PROHIBITION);
        this.text.add(' that');
      } else {
        this.text.space();
        this.text.add('The prohibition particle ');
        this.text.addArabic(PROHIBITION);
      }

      this.text.add(' is used to form a negative imperative and places the following verb into the jussive mood ');
      this.text.addArabic(JUSSIVE);
      this.text.endSentence();
      return;
    }

    const special = stem.special;
    if (partOfSpeech === PartOfSpeech.Negative && special === 'kaAn') {
      if (this.singleSegment) {
        this.text.add('a negative particle that acts');
      } else {
        this.text.space();
        this.text.add('The negative particle acts');
      }

      this.text.add(' like the verb ');
      this.text.addPhonetic('laysa');
      this.text.addChar(' ');
      this.text.addArabic(fromBuckwalter('lys'));
      this.text.add('. This verb belongs to a special group of words known as ');
      this.text.addPhonetic('kāna');
      this.text.add(' and her sisters ');
      this.text.addArabic(KAANA_GROUP);
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Negative && special === '<in~') {
      if (this.singleSegment) {
        this.text.add('a negative particle that acts');
      } else {
        this.text.space();
        this.text.add('The negative particle acts');
      }

      this.text.add(' like the particle ');
      this.text.addPhonetic('anna');
      this.text.addChar(' ');
      this.text.addArabic(fromBuckwalter('>n'));
      this.text.add('. This particle belongs to a special group of words known as ');
      this.text.addPhonetic('inna');
      this.text.add(' and her sisters ');
      this.text.addArabic(INNA_GROUP);
      this.text.endSentence();
      return;
    }

    if (special === '<in~') {
      if (this.singleSegment) {
        this.text.add('an accusative particle which ');
      } else {
        this.text.space();
        this.text.add('The accusative particle ');
      }

      this.text.add('belongs to a special group of words known as ');
      this.text.addPhonetic('inna');
      this.text.add(' and her sisters ');
      this.text.addArabic(INNA_GROUP);
      this.text.endSentence();
      return;
    }

    if (partOfSpeech === PartOfSpeech.Initials) {
      this.writeInitials();
      return;
    }

    if (isPreventivePhrase(this.segments)) {
      this.text.space();
      this.text.add('The preventive particle ');
      this.text.addPhonetic('mā');
      this.text.add(' stops ');
      this.text.addPhonetic('inna');
      this.text.add(' from taking its normal role in the sentence');
      this.text.endSentence();
    }

    let mood = stem.mood;
    if (partOfSpeech === PartOfSpeech.Verb && stem.aspect === AspectType.Imperfect && mood == null) {
      mood = MoodType.Indicative;
    }

    const isFeatureGroup2 = this.isFeatureGroup2(stem);
    const caseType = stem.caseType;

    if (!this.singleSegment && !isFeatureGroup2 && mood == null && caseType == null) {
      return;
    }

    const featureGroup1 = this.getFeatureGroup1(stem);
    const isFeatureGroup1 = !featureGroup1.isEmpty();

    if (this.singleSegment) {
      if (isFeatureGroup1 || isFeatureGroup2) {
        this.text.addIndefiniteArticle(false, featureGroup1);
        this.text.add(featureGroup1);
      }

      if (partOfSpeech === PartOfSpeech.Verb) {
        this.text.endSentence();
        this.text.space();
        this.text.add('The verb is ');
        this.writeFeatureGroup2(stem);
      } else {
        if (isFeatureGroup2) {
          this.text.addChar(' ');
          this.writeFeatureGroup2(stem);
        }

        const segmentName = getSegmentName(this.segments, stem, stem);
        if (!isFeatureGroup1 && !isFeatureGroup2) {
          this.text.addIndefiniteArticle(false, segmentName);
        }

        this.text.addChar(' ');
        this.text.add(segmentName);
      }
    } else {
      this.text.space();
      this.text.add('The');
      this.text.add(featureGroup1);
      if (partOfSpeech !== PartOfSpeech.Verb) {
        this.text.addChar(' ');
        this.text.add(getSegmentName(this.segments, stem, stem));
      }

      if (isFeatureGroup2) {
        this.text.add(' is ');
        this.writeFeatureGroup2(stem);
      }
    }

    if (caseType != null || mood != null) {
      if (isFeatureGroup2) {
        this.text.add(' and');
      }

      this.text.add(this.singleSegment && !isFeatureGroup2 ? ' in the ' : ' is in the ');

      if (caseType != null) {
        this.text.add(caseName(caseType));
        this.text.add(' case ');
        switch (caseType) {
          case 'NOM':
            this.text.addArabic(NOMINATIVE);
            break;
          case 'GEN':
            this.text.addArabic('مجرور');
            break;
          case 'ACC':
            this.text.addArabic(ACCUSATIVE);
            break;
        }
      } else if (mood != null) {
        this.text.add(moodName(mood));
        this.text.add(' mood ');
        switch (mood) {
          case 'IND':
            this.text.addArabic(NOMINATIVE);
            break;
          case 'SUBJ':
            this.text.addArabic(ACCUSATIVE);
            break;
          case 'JUS':
            this.text.addArabic(JUSSIVE);
            break;
        }
      }
    }

    this.text.endSentence();

    if (isDiptoteWithGenitiveFatha(stem)) {
      this.text.space();
      this.text.add('The case marker is a ');
      this.text.addPhonetic('fatḥah');
      this.text.add(' instead of a ');
      this.text.addPhonetic('kasrah');
      this.text.add(' because the ');
      this.text.add(getSegmentName(this.segments, stem, stem));
      this.text.add(' is a diptote ');
      this.text.addArabic(DIPTOTE);
      this.text.endSentence();
    }

    if (stem.root != null) {
      this.writeRoot(stem);
    }

    if (partOfSpeech === PartOfSpeech.Verb && special != null) {
      this.text.space();
      this.text.add('The verb ');
      this.text.addArabic(getHeadName(this.segments, stem));
      this.text.add(' belongs to a special group of words known as ');

      if (special === 'kaAn') {
        this.text.addPhonetic('kāna');
        this.text.add(' and her sisters ');
        this.text.addArabic(KAANA_GROUP);
      } else {
        this.text.addPhonetic('kāda');
        this.text.add(' and her sisters ');
        this.text.addArabic(KAADA_GROUP);
      }

      this.text.endSentence();
    }
  }

  private writeInitials(): void {
    this.text.add('the Quranic initials ');
    this.text.addArabicLetters(this.token.arabicText, false);
    this.text.endSentence();

    this.text.space();
    this.text.add('These are sequences of letters that occur at the start of certain chapters in the Quran');
    this.text.endSentence();

    this.text.space();
    this.text.add('In Arabic these are known as the disconnected or shortened letters ');
    this.text.addArabic(INITIALS);
    this.text.endSentence();
  }

  private getFeatureGroup1(stem: Segment): Text {
    const text = new Text();

    if (stem.state === StateType.Indefinite) {
      text.add(' indefinite');
    }

    if (stem.voice === VoiceType.Passive) {
      text.add(' passive');
    }

    if (stem.form != null) {
      text.add(' form ');
      text.add(stem.form);
    }

    if (stem.aspect != null) {
      text.addChar(' ');
      text.add(aspectName(stem.aspect));
      text.add(' verb ');
      switch (stem.aspect) {
        case 'PERF':
          text.addArabic(`${VERB} ${PERFECT}`);
          break;
        case 'IMPF':
          text.addArabic(`${VERB} ${IMPERFECT}`);
          break;
        case 'IMPV':
          text.addArabic(`${VERB} ${IMPERATIVE}`);
          break;
      }
    }

    return text;
  }

  private writeFeatureGroup2(stem: Segment): void {
    this.writePersonGenderNumber(stem);
  }

  private isFeatureGroup2(stem: Segment): boolean {
    return stem.person != null || stem.gender != null || stem.number != null;
  }

  private writeRoot(stem: Segment): void {
    const root = stem.root;
    if (root == null) {
      return;
    }

    this.text.space();
    this.text.add('The ');
    this.text.add(getSegmentName(this.segments, stem, stem));
    this.text.add("'s ");
    this.text.add(root.getLength() === 3 ? 'triliteral ' : 'quadriliteral ');
    this.text.add('root is ');
    this.text.addArabicLetters(root, true);
    this.text.endSentence();
  }

  private writeSuffixDescription(suffix: Segment): void {
    if (suffix.partOfSpeech === PartOfSpeech.Emphatic) {
      this.text.space();
      this.text.add('The suffixed emphatic particle is known as the ');
      this.text.addPhonetic('nūn');
      this.text.add(' of emphasis ');
      this.text.addArabic(fromBuckwalter('nwn Altwkyd'));
      if (isEmphasisNoonWithTanween(suffix)) {
        this.text.add(', and is indicated by ');
        this.text.addPhonetic('tanwīn');
      }
      this.text.endSentence();
    }

    const pronounType = suffix.pronounType;
    if (pronounType === PronounType.Subject) {
      this.text.space();
      this.text.add('The suffix ');
      this.text.addArabic(getPronounDescription(this.stem, suffix)?.description ?? '');
      this.text.add(' is an attached subject pronoun');
      this.text.endSentence();
    } else if (pronounType === PronounType.Object || pronounType === PronounType.SecondObject) {
      if (isSuffixElision(this.token, suffix)) {
        this.writeOmittedPronounSuffix(suffix);
        return;
      }

      this.text.space();
      this.text.add('The attached ');
      this.text.add(getSegmentName(this.segments, this.stem, suffix));
      this.text.add(' is ');
      this.writePersonGenderNumber(suffix);
      this.text.endSentence();
    }
  }

  private writeOmittedPronounSuffix(suffix: Segment): void {
    this.text.space();
    this.text.add('The ');
    this.text.addPhonetic('yā');
    this.text.add(' of the ');
    this.writePersonGenderNumber(suffix);
    this.text.addChar(' ');
    this.text.add(getSegmentName(this.segments, this.stem, suffix));
    this.text.add(' has been omitted due to elision ');
    this.text.addArabic(fromBuckwalter('AlyA\' mH*wfp'));
    if (this.token.arabicText.isKasra(this.token.arabicText.getLength() - 1)) {
      this.text.add(', and is indicated by the ');
      this.text.addPhonetic('kasrah');
    }
    this.text.endSentence();
  }

  private writePersonGenderNumber(segment: Segment): void {
    const person = segment.person;
    const gender = segment.gender;
    const number = segment.number;

    if (person != null) {
      this.text.add(personName(person));
      this.text.add(' person');
    }

    if (gender != null) {
      if (person != null) {
        this.text.addChar(' ');
      }
      this.text.add(genderName(gender));
    }

    if (number != null) {
      if (person != null || gender != null) {
        this.text.addChar(' ');
      }
      this.text.add(numberName(number));
    }
  }
}

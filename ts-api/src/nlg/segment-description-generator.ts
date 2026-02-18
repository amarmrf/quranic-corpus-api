import { CharacterType } from '../arabic/character-type.js';
import { PartOfSpeech } from '../morphology/part-of-speech.js';
import { caseName, genderName, numberName, moodName, stateName, voiceName } from '../morphology/enum-labels.js';
import type { Segment } from '../morphology/segment.js';
import { getSegmentName } from './segment-name.js';
import { Text } from './text.js';

export class SegmentDescriptionGenerator {
  private readonly text = new Text();

  constructor(
    private readonly segments: Segment[],
    private readonly stem: Segment,
    private readonly segment: Segment
  ) {}

  generate(): string {
    switch (this.segment.type) {
      case 'Prefix':
        this.writePrefixDescription();
        break;
      case 'Stem':
        this.writeStemDescription();
        break;
      case 'Suffix':
        this.writeSuffixDescription();
        break;
    }

    return this.text.toString();
  }

  private writePrefixDescription(): void {
    let phonetic: string | null = null;
    let translation: string | null = null;

    switch (this.segment.partOfSpeech) {
      case PartOfSpeech.Conjunction: {
        const type = this.segment.lemma?.arabicText.getCharacterType(0);
        switch (type) {
          case CharacterType.Waw:
            phonetic = 'wa';
            translation = 'and';
            break;
          case CharacterType.Fa:
            phonetic = 'fa';
            translation = 'and';
            break;
        }
        break;
      }
      case PartOfSpeech.Preposition: {
        const type = this.segment.lemma?.arabicText.getCharacterType(0);
        switch (type) {
          case CharacterType.Ba:
            phonetic = 'bi';
            break;
          case CharacterType.Kaf:
            phonetic = 'ka';
            break;
          case CharacterType.Ta:
            phonetic = 'ta';
            translation = 'oath';
            break;
          case CharacterType.Waw:
            phonetic = 'wa';
            translation = 'oath';
            break;
          case CharacterType.Lam:
            phonetic = 'lām';
            break;
        }
        break;
      }
      case PartOfSpeech.Emphatic:
      case PartOfSpeech.Purpose:
      case PartOfSpeech.Imperative:
        phonetic = 'lām';
        break;
      case PartOfSpeech.Future:
        phonetic = 'sa';
        break;
      case PartOfSpeech.Vocative: {
        const type = this.segment.lemma?.arabicText.getCharacterType(0);
        switch (type) {
          case CharacterType.Ha:
            phonetic = 'ha';
            break;
          case CharacterType.Ya:
            phonetic = 'ya';
            break;
          default:
            phonetic = null;
        }
        break;
      }
    }

    if (this.segment.partOfSpeech === PartOfSpeech.Emphatic) {
      this.text.add('emphatic prefix');
    } else {
      this.text.add('prefixed ');
      this.text.add(getSegmentName(this.segments, this.stem, this.segment));
    }

    if (phonetic != null) {
      this.text.space();
      this.text.addPhonetic(phonetic);
    }

    if (translation != null) {
      this.text.add(' (');
      this.text.add(translation);
      this.text.addChar(')');
    }
  }

  private writeStemDescription(): void {
    if (this.segment.caseType != null) {
      this.text.space();
      this.text.add(caseName(this.segment.caseType));
    }

    this.writePersonGenderNumber();

    if (this.segment.state != null) {
      this.text.space();
      this.text.add(stateName(this.segment.state));
    }

    if (this.segment.form != null) {
      this.text.add(' (form ');
      this.text.add(this.segment.form);
      this.text.addChar(')');
    }

    if (this.segment.voice != null) {
      this.text.space();
      this.text.add(voiceName(this.segment.voice));
    }

    if (this.segment.aspect != null) {
      this.text.space();
      this.text.add(
        this.segment.aspect === 'PERF'
          ? 'perfect'
          : this.segment.aspect === 'IMPF'
            ? 'imperfect'
            : 'imperative'
      );
    }

    this.text.space();
    this.text.add(getSegmentName(this.segments, this.segment, this.segment));

    if (this.segment.partOfSpeech === PartOfSpeech.Preventive) {
      this.text.space();
      this.text.addPhonetic('mā');
    }

    if (this.segment.mood != null) {
      this.text.add(', ');
      this.text.add(moodName(this.segment.mood));
      this.text.add(' mood');
    }
  }

  private writeSuffixDescription(): void {
    if (this.segment.pronounType !== 'subj') {
      this.writePersonGenderNumber();
    }

    this.text.space();
    this.text.add(getSegmentName(this.segments, this.stem, this.segment));
    if (this.segment.partOfSpeech === PartOfSpeech.Emphatic) {
      this.text.space();
      this.text.addPhonetic('nūn');
    }
  }

  private writePersonGenderNumber(): void {
    const person = this.segment.person;
    const gender = this.segment.gender;
    const number = this.segment.number;

    if (person != null) {
      this.text.space();
      switch (person) {
        case '1':
          this.text.add('1st');
          break;
        case '2':
          this.text.add('2nd');
          break;
        case '3':
          this.text.add('3rd');
          break;
      }

      this.text.add(' person');
    }

    if (gender != null) {
      this.text.space();
      this.text.add(genderName(gender));
    }

    if (number != null) {
      this.text.space();
      this.text.add(numberName(number));
    }
  }
}

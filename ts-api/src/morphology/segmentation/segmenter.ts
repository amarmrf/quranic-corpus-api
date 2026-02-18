import { CharacterType } from '../../arabic/character-type.js';
import { fromBuckwalter } from '../../arabic/encoding/buckwalter/buckwalter-decoder.js';
import { toBuckwalter } from '../../arabic/encoding/buckwalter/buckwalter-encoder.js';
import type { LemmaService } from '../../lexicography/lemma-service.js';
import type { Token } from '../../orthography/token.js';
import { PartOfSpeech, parsePartOfSpeech } from '../part-of-speech.js';
import type { Segment } from '../segment.js';
import {
  AspectType,
  CaseType,
  DerivationType,
  FormType,
  GenderType,
  MoodType,
  NumberType,
  PersonType,
  PronounType,
  SegmentType,
  SpecialType,
  StateType,
  VoiceType
} from '../types.js';
import { Segment as SegmentModel } from '../segment.js';
import { PronounReader } from './pronoun-reader.js';

export class Segmenter {
  private readonly pronounReader = new PronounReader();
  private readonly segments: Segment[] = [];
  private segment: Segment | null = null;
  private stem: Segment | null = null;
  private emphaticSuffix: Segment | null = null;
  private token: Token | null = null;
  private morphology = '';
  private prefixIndex = 0;
  private suffixIndex = 0;

  private readonly prefixWa;
  private readonly prefixFa;
  private readonly prefixBi;
  private readonly prefixKa;
  private readonly prefixTa;
  private readonly prefixLa;
  private readonly prefixSa;
  private readonly prefixYa;
  private readonly prefixHa;
  private readonly suffixNoon;
  private readonly vocativeSuffix;

  constructor(private readonly lemmaService: LemmaService) {
    this.prefixWa = lemmaService.getLemma('w');
    this.prefixFa = lemmaService.getLemma('f');
    this.prefixBi = lemmaService.getLemma('b');
    this.prefixKa = lemmaService.getLemma('k');
    this.prefixTa = lemmaService.getLemma('t');
    this.prefixLa = lemmaService.getLemma('l');
    this.prefixSa = lemmaService.getLemma('s');
    this.prefixYa = lemmaService.getLemma('yaA');
    this.prefixHa = lemmaService.getLemma('haA');
    this.suffixNoon = lemmaService.getLemma('n');
    this.vocativeSuffix = lemmaService.getLemma('hum~a');
  }

  getSegments(token: Token, morphology: string): Segment[] {
    this.segments.length = 0;
    this.segment = null;
    this.stem = null;
    this.token = token;
    this.morphology = morphology;
    this.prefixIndex = 0;

    this.suffixIndex = token.arabicText.getLength();
    if (!token.arabicText.isLetter(this.suffixIndex - 1)) {
      this.suffixIndex--;
    }

    this.readItems(morphology.split(' '));
    this.readSubjectPronoun();
    this.splitStems();

    const segments = [...this.segments];
    let position = 0;

    for (const segment of segments) {
      const length = segment.endIndex - segment.startIndex;
      segment.arabicText = token.arabicText.substring(position, position + length);
      position += length;
    }

    return segments;
  }

  private readItems(items: string[]): void {
    const size = items.length;
    this.emphaticSuffix = null;

    for (let i = 0; i < size; i++) {
      const item = items[i] ?? '';

      if (i < size - 1) {
        const next = items[i + 1] ?? '';
        if (item === 'ACT' && next === 'PCPL') {
          if (this.segment == null) {
            throw new Error('Invalid morphology sequence.');
          }
          this.segment.derivation = DerivationType.ActiveParticiple;
          i++;
          continue;
        }

        if (item === 'PASS' && next === 'PCPL') {
          if (this.segment == null) {
            throw new Error('Invalid morphology sequence.');
          }
          this.segment.derivation = DerivationType.PassiveParticiple;
          i++;
          continue;
        }

        if (item.startsWith('PRON:') && next.startsWith('PRON:')) {
          this.readObjectPronouns(item, next);
          i++;
          continue;
        }
      }

      if (this.readPrefix(item)) {
        continue;
      }

      if (item.startsWith('POS:')) {
        this.addStem(parsePartOfSpeech(item.slice(4)));
        continue;
      }

      if (this.readFeatures(item)) {
        continue;
      }

      if (item === '+VOC') {
        this.readVocativeSuffix();
        continue;
      }

      if (item.startsWith('PRON:')) {
        this.readObjectPronouns(item, null);
        continue;
      }

      if (item === '+n:EMPH') {
        this.addSuffix(PartOfSpeech.Emphatic);
        this.emphaticSuffix = this.segment;
        continue;
      }

      throw new Error(`Invalid morphological feature: ${item}`);
    }

    if (this.emphaticSuffix != null) {
      this.readEmphaticSuffix();
    }
  }

  private readPrefix(item: string): boolean {
    const token = this.token;
    if (token == null) {
      return false;
    }

    const arabicText = token.arabicText;

    if (item === 'A:INTG+') {
      if (
        arabicText.getCharacterType(this.prefixIndex) === CharacterType.Hamza ||
        arabicText.getCharacterType(this.prefixIndex) === CharacterType.Alif
      ) {
        this.addPrefix(PartOfSpeech.Interrogative, 1);
        return true;
      }

      this.fail('A:INTG+');
    }

    if (item === 'A:EQ+') {
      if (
        arabicText.getCharacterType(this.prefixIndex) === CharacterType.Hamza ||
        arabicText.getCharacterType(this.prefixIndex) === CharacterType.Alif
      ) {
        this.addPrefix(PartOfSpeech.Equalization, 1);
        return true;
      }

      this.fail('A:EQ+');
    }

    if (item === 'f:CONJ+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Fa) {
        this.addPrefix(PartOfSpeech.Conjunction, 1);
        this.segment!.lemma = this.prefixFa;
        return true;
      }

      this.fail('f:CONJ+');
    }

    if (item === 'f:REM+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Fa) {
        this.addPrefix(PartOfSpeech.Resumption, 1);
        this.segment!.lemma = this.prefixFa;
        return true;
      }

      this.fail('f:REM+');
    }

    if (item === 'f:RSLT+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Fa) {
        this.addPrefix(PartOfSpeech.Result, 1);
        this.segment!.lemma = this.prefixFa;
        return true;
      }

      this.fail('f:RSLT+');
    }

    if (item === 'f:CAUS+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Fa) {
        this.addPrefix(PartOfSpeech.Cause, 1);
        this.segment!.lemma = this.prefixFa;
        return true;
      }

      this.fail('f:CAUS+');
    }

    if (item === 'f:SUP+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Fa) {
        this.addPrefix(PartOfSpeech.Supplemental, 1);
        this.segment!.lemma = this.prefixFa;
        return true;
      }

      this.fail('f:SUP+');
    }

    if (item === 'w:SUP+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Waw) {
        this.addPrefix(PartOfSpeech.Supplemental, 1);
        this.segment!.lemma = this.prefixWa;
        return true;
      }

      this.fail('w:SUP+');
    }

    if (item === 'w:CONJ+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Waw) {
        this.addPrefix(PartOfSpeech.Conjunction, 1);
        this.segment!.lemma = this.prefixWa;
        return true;
      }

      this.fail('w:CONJ+');
    }

    if (item === 'w:COM+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Waw) {
        this.addPrefix(PartOfSpeech.Comitative, 1);
        this.segment!.lemma = this.prefixWa;
        return true;
      }

      this.fail('w:COM+');
    }

    if (item === 'w:REM+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Waw) {
        this.addPrefix(PartOfSpeech.Resumption, 1);
        this.segment!.lemma = this.prefixWa;
        return true;
      }

      this.fail('w:REM+');
    }

    if (item === 'w:CIRC+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Waw) {
        this.addPrefix(PartOfSpeech.Circumstantial, 1);
        this.segment!.lemma = this.prefixWa;
        return true;
      }

      this.fail('w:CIRC+');
    }

    if (item === 'w:P+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Waw) {
        this.addPrefix(PartOfSpeech.Preposition, 1);
        this.segment!.lemma = this.prefixWa;
        return true;
      }

      this.fail('w:P+');
    }

    if (item === 'ka+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Kaf) {
        this.addPrefix(PartOfSpeech.Preposition, 1);
        this.segment!.lemma = this.prefixKa;
        return true;
      }

      this.fail('ka+');
    }

    if (item === 'l:EMPH+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Lam) {
        this.addPrefix(PartOfSpeech.Emphatic, 1);
        return true;
      }

      this.fail('l:EMPH+');
    }

    if (item === 'bi+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Ba) {
        this.addPrefix(PartOfSpeech.Preposition, 1);
        this.segment!.lemma = this.prefixBi;
        return true;
      }

      this.fail('bi+');
    }

    if (item === 'ta+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Ta) {
        this.addPrefix(PartOfSpeech.Preposition, 1);
        this.segment!.lemma = this.prefixTa;
        return true;
      }

      this.fail('ta+');
    }

    if (item === 'l:P+') {
      if (this.stem != null && arabicText.getCharacterType(this.suffixIndex - 1) === CharacterType.Lam) {
        this.addSuffix(PartOfSpeech.Preposition);
        this.setSuffixLength(1);
        this.segment!.lemma = this.prefixLa;
        return true;
      }

      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Lam) {
        this.addPrefix(PartOfSpeech.Preposition, 1);
        this.segment!.lemma = this.prefixLa;
        return true;
      }

      this.fail('l:P+');
    }

    if (item === 'l:IMPV+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Lam) {
        this.addPrefix(PartOfSpeech.Imperative, 1);
        return true;
      }

      this.fail('l:IMPV+');
    }

    if (item === 'l:PRP+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Lam) {
        this.addPrefix(PartOfSpeech.Purpose, 1);
        return true;
      }

      this.fail('l:PRP+');
    }

    if (item === 'sa+') {
      if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Seen) {
        this.addPrefix(PartOfSpeech.Future, 1);
        this.segment!.lemma = this.prefixSa;
        return true;
      }

      this.fail('sa+');
    }

    if (item === 'ya+') {
      if (token.location.equals(20, 94, 2) && arabicText.getCharacterType(this.prefixIndex) === CharacterType.Ya) {
        this.addPrefix(PartOfSpeech.Vocative, 1);
        this.segment!.lemma = this.prefixYa;
        return true;
      }

      if (
        arabicText.getCharacterType(this.prefixIndex) === CharacterType.Ya &&
        arabicText.getCharacterType(this.prefixIndex + 1) === CharacterType.Alif
      ) {
        this.addPrefix(PartOfSpeech.Vocative, 2);
        this.segment!.lemma = this.prefixYa;
        return true;
      }

      this.fail('ya+');
    }

    if (item === 'ha+') {
      if (token.location.equals(6, 150, 2) || token.location.equals(33, 18, 8)) {
        this.addPrefix(PartOfSpeech.Vocative, 1);
        this.segment!.lemma = this.prefixHa;
        return true;
      }

      if (
        arabicText.getCharacterType(this.prefixIndex) === CharacterType.Ha &&
        arabicText.getCharacterType(this.prefixIndex + 1) === CharacterType.Alif
      ) {
        this.addPrefix(PartOfSpeech.Vocative, 2);
        this.segment!.lemma = this.prefixHa;
        return true;
      }

      this.fail('ha+');
    }

    if (item === 'Al+') {
      if (this.prefixIndex > 0 && arabicText.getCharacterType(this.prefixIndex - 1) === CharacterType.Lam) {
        if (arabicText.getCharacterType(this.prefixIndex) === CharacterType.Lam) {
          this.addPrefix(PartOfSpeech.Determiner, 1);
          return true;
        }

        this.fail('Al+');
      } else {
        if (
          arabicText.getCharacterType(this.prefixIndex) === CharacterType.Alif &&
          arabicText.getCharacterType(this.prefixIndex + 1) === CharacterType.Lam
        ) {
          this.addPrefix(PartOfSpeech.Determiner, 2);
          return true;
        }

        if (
          arabicText.getCharacterType(this.prefixIndex) === CharacterType.Lam &&
          arabicText.isSukun(this.prefixIndex)
        ) {
          this.addPrefix(PartOfSpeech.Determiner, 1);
          return true;
        }

        this.fail('Al+');
      }
    }

    return false;
  }

  private readFeatures(item: string): boolean {
    const segment = this.segment;
    if (segment == null) {
      return false;
    }

    const size = item.length;

    if (item.startsWith('ROOT:')) {
      segment.root = fromBuckwalter(item.slice(5));
      return true;
    }

    if (item.startsWith('LEM:')) {
      segment.lemma = this.lemmaService.getLemma(item.slice(4));
      return true;
    }

    if (item.startsWith('SP:')) {
      this.readSpecial(item);
      return true;
    }

    if (item.startsWith('MOOD:')) {
      this.readMood(item);
      return true;
    }

    if (item === '(I)') {
      segment.form = FormType.First;
      return true;
    }
    if (item === '(II)') {
      segment.form = FormType.Second;
      return true;
    }
    if (item === '(III)') {
      segment.form = FormType.Third;
      return true;
    }
    if (item === '(IV)') {
      segment.form = FormType.Fourth;
      return true;
    }
    if (item === '(V)') {
      segment.form = FormType.Fifth;
      return true;
    }
    if (item === '(VI)') {
      segment.form = FormType.Sixth;
      return true;
    }
    if (item === '(VII)') {
      segment.form = FormType.Seventh;
      return true;
    }
    if (item === '(VIII)') {
      segment.form = FormType.Eighth;
      return true;
    }
    if (item === '(IX)') {
      segment.form = FormType.Ninth;
      return true;
    }
    if (item === '(X)') {
      segment.form = FormType.Tenth;
      return true;
    }
    if (item === '(XI)') {
      segment.form = FormType.Eleventh;
      return true;
    }
    if (item === '(XII)') {
      segment.form = FormType.Twelfth;
      return true;
    }

    if (item === 'ACT') {
      segment.voice = VoiceType.Active;
      return true;
    }
    if (item === 'PASS') {
      segment.voice = VoiceType.Passive;
      return true;
    }

    if (item === 'PERF') {
      segment.aspect = AspectType.Perfect;
      return true;
    }
    if (item === 'IMPF') {
      segment.aspect = AspectType.Imperfect;
      return true;
    }
    if (item === 'IMPV') {
      segment.aspect = AspectType.Imperative;
      return true;
    }

    if (item === 'NOM') {
      segment.caseType = CaseType.Nominative;
      return true;
    }
    if (item === 'GEN') {
      segment.caseType = CaseType.Genitive;
      return true;
    }
    if (item === 'ACC') {
      segment.caseType = CaseType.Accusative;
      return true;
    }

    if (item === 'DEF') {
      segment.state = StateType.Definite;
      return true;
    }
    if (item === 'INDEF') {
      segment.state = StateType.Indefinite;
      return true;
    }

    if (item === 'VN') {
      segment.derivation = DerivationType.VerbalNoun;
      return true;
    }

    if (size >= 1 && size <= 3) {
      this.readPersonGenderNumber(item);
      return true;
    }

    return false;
  }

  private readSpecial(item: string): void {
    if (item === 'SP:kaAn') {
      this.segment!.special = SpecialType.Kaana;
      return;
    }

    if (item === 'SP:kaAd') {
      this.segment!.special = SpecialType.Kaada;
      return;
    }

    if (item === 'SP:<in~') {
      this.segment!.special = SpecialType.Inna;
    }
  }

  private readMood(item: string): void {
    if (item === 'MOOD:IND') {
      this.segment!.mood = MoodType.Indicative;
      return;
    }

    if (item === 'MOOD:SUBJ') {
      this.segment!.mood = MoodType.Subjunctive;
      return;
    }

    if (item === 'MOOD:JUS') {
      this.segment!.mood = MoodType.Jussive;
    }
  }

  private readVocativeSuffix(): void {
    const token = this.token;
    if (token == null) {
      return;
    }

    if (token.arabicText.getCharacterType(this.suffixIndex - 1) !== CharacterType.Meem) {
      this.fail('+VOC');
    }

    this.addSuffix(PartOfSpeech.Vocative);
    this.setSuffixLength(1);
    this.segment!.lemma = this.vocativeSuffix;
  }

  private readEmphaticSuffix(): void {
    const token = this.token;
    if (token == null) {
      return;
    }

    switch (token.arabicText.getCharacterType(this.suffixIndex - 1)) {
      case CharacterType.Alif:
      case CharacterType.Noon:
        break;
      default:
        this.fail('+n:EMPH');
    }

    this.segment = this.emphaticSuffix;
    this.setSuffixLength(1);
    this.segment!.lemma = this.suffixNoon;
  }

  private readObjectPronouns(item1: string, item2: string | null): void {
    this.addSuffix(PartOfSpeech.Pronoun);
    const pronoun1 = this.segment as Segment;
    let pronoun2: Segment | null = null;

    if (item2 != null) {
      this.addSuffix(PartOfSpeech.Pronoun);
      pronoun2 = this.segment;
    }

    if (pronoun2 != null) {
      pronoun2.pronounType = PronounType.SecondObject;
      this.segment = pronoun2;
      this.readPersonGenderNumber(item2!.slice(5));
      this.setSuffixLength(
        this.pronounReader.readObjectPronoun(
          this.token!,
          this.stem!,
          pronoun2,
          this.suffixIndex,
          false,
          this.emphaticSuffix != null
        )
      );
    }

    pronoun1.pronounType = PronounType.Object;
    this.segment = pronoun1;
    this.readPersonGenderNumber(item1.slice(5));
    this.setSuffixLength(
      this.pronounReader.readObjectPronoun(
        this.token!,
        this.stem!,
        pronoun1,
        this.suffixIndex,
        pronoun2 != null,
        this.emphaticSuffix != null
      )
    );
  }

  private readSubjectPronoun(): void {
    const segmentCount = this.segments.length;
    if (segmentCount === 0 || this.stem == null || this.token == null) {
      return;
    }

    const isObjectAttached = this.segments[segmentCount - 1]?.partOfSpeech === PartOfSpeech.Pronoun;

    for (const value of this.segments) {
      if (value.partOfSpeech === PartOfSpeech.Emphatic && value.type === SegmentType.Suffix) {
        return;
      }
    }

    const length = this.pronounReader.readSubjectPronoun(this.token, this.stem, this.suffixIndex, isObjectAttached);
    if (length === 0) {
      return;
    }

    const pronoun = new SegmentModel(SegmentType.Suffix, PartOfSpeech.Pronoun);
    pronoun.pronounType = PronounType.Subject;

    pronoun.startIndex = this.suffixIndex - length;
    pronoun.endIndex = this.stem.endIndex;
    this.stem.endIndex = pronoun.startIndex;

    pronoun.person = this.stem.person;
    pronoun.gender = this.stem.gender;
    pronoun.number = this.stem.number;

    const stemNumber = this.stem.segmentNumber;
    this.segments.splice(stemNumber, 0, pronoun);

    for (let i = stemNumber; i <= segmentCount; i++) {
      const segment = this.segments[i];
      if (segment != null) {
        segment.segmentNumber = i + 1;
      }
    }
  }

  private addPrefix(partOfSpeech: PartOfSpeech, length: number): void {
    this.addSegment(SegmentType.Prefix, partOfSpeech);
    this.segment!.startIndex = this.prefixIndex;
    this.prefixIndex += length;
    this.segment!.endIndex = this.prefixIndex;
  }

  private addStem(partOfSpeech: PartOfSpeech): void {
    this.addSegment(SegmentType.Stem, partOfSpeech);
    this.segment!.startIndex = this.prefixIndex;
    this.segment!.endIndex = this.token!.arabicText.getLength();
    this.stem = this.segment;
  }

  private addSuffix(partOfSpeech: PartOfSpeech): void {
    this.addSegment(SegmentType.Suffix, partOfSpeech);
    this.segment!.endIndex = this.token!.arabicText.getLength();
  }

  private addSegment(type: SegmentType, partOfSpeech: PartOfSpeech): void {
    this.segment = new SegmentModel(type, partOfSpeech);
    this.segment.segmentNumber = this.segments.length + 1;
    this.segments.push(this.segment);
  }

  private setSuffixLength(length: number): void {
    this.suffixIndex -= length;
    this.segment!.startIndex = this.suffixIndex;
    const previous = this.segments[this.segment!.segmentNumber - 2];
    if (previous != null) {
      previous.endIndex = this.suffixIndex;
    }
  }

  private readPersonGenderNumber(item: string): void {
    for (const ch of item) {
      switch (ch) {
        case '1':
          this.segment!.person = PersonType.First;
          break;
        case '2':
          this.segment!.person = PersonType.Second;
          break;
        case '3':
          this.segment!.person = PersonType.Third;
          break;
        case 'M':
          this.segment!.gender = GenderType.Masculine;
          break;
        case 'F':
          this.segment!.gender = GenderType.Feminine;
          break;
        case 'S':
          this.segment!.number = NumberType.Singular;
          break;
        case 'D':
          this.segment!.number = NumberType.Dual;
          break;
        case 'P':
          this.segment!.number = NumberType.Plural;
          break;
        default:
          throw new Error(`Invalid morphological feature: ${item}`);
      }
    }
  }

  private splitStems(): void {
    let stem1: Segment | null = null;
    let stem2: Segment | null = null;

    for (const segment of this.segments) {
      if (segment.type === SegmentType.Stem) {
        if (stem1 == null) {
          stem1 = segment;
        } else {
          stem2 = segment;
        }
      }
    }

    if (stem1 == null || stem2 == null) {
      return;
    }

    const stemLength = this.readSecondStem(stem2);
    this.suffixIndex -= stemLength;

    stem1.endIndex = this.suffixIndex;
    stem2.startIndex = this.suffixIndex;
  }

  private readSecondStem(stem2: Segment): number {
    const token = this.token;
    if (token == null || stem2.lemma == null) {
      this.fail('second stem');
    }

    const lemma = stem2.lemma.key;
    const arabicText = token.arabicText;

    if (lemma === 'maA') {
      if (
        arabicText.getCharacterType(this.suffixIndex - 2) === CharacterType.Meem &&
        arabicText.getCharacterType(this.suffixIndex - 1) === CharacterType.Alif
      ) {
        return 2;
      }

      if (arabicText.getCharacterType(this.suffixIndex - 1) === CharacterType.Meem) {
        return 1;
      }
    }

    if (lemma === 'man') {
      if (
        arabicText.getCharacterType(this.suffixIndex - 2) === CharacterType.Meem &&
        arabicText.getCharacterType(this.suffixIndex - 1) === CharacterType.Noon
      ) {
        return 2;
      }
    }

    if (lemma === 'laA') {
      if (
        arabicText.getCharacterType(this.suffixIndex - 2) === CharacterType.Lam &&
        arabicText.getCharacterType(this.suffixIndex - 1) === CharacterType.Alif
      ) {
        return 2;
      }
    }

    if (lemma === 'lan') {
      if (
        arabicText.getCharacterType(this.suffixIndex - 2) === CharacterType.Lam &&
        arabicText.getCharacterType(this.suffixIndex - 1) === CharacterType.Noon
      ) {
        return 2;
      }
    }

    if (lemma === 'law') {
      if (
        arabicText.getCharacterType(this.suffixIndex - 2) === CharacterType.Lam &&
        arabicText.getCharacterType(this.suffixIndex - 1) === CharacterType.Waw
      ) {
        return 2;
      }
    }

    if (lemma === '>um~') {
      if (
        arabicText.getCharacterType(this.suffixIndex - 2) === CharacterType.Waw &&
        arabicText.getCharacterType(this.suffixIndex - 1) === CharacterType.Meem
      ) {
        return 2;
      }
    }

    this.fail(`second stem, LEM:${lemma}`);
  }

  private fail(feature: string): never {
    const token = this.token;
    if (token == null) {
      throw new Error(`Failed to produce segments, feature: ${feature}`);
    }

    throw new Error(
      `Failed to produce segments for token: ${token.location.toString()} ${toBuckwalter(token.arabicText)}, morphology: ${this.morphology}, feature: ${feature}`
    );
  }
}

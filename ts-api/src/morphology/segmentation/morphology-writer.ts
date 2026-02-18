import { CharacterType } from '../../arabic/character-type.js';
import { toBuckwalter } from '../../arabic/encoding/buckwalter/buckwalter-encoder.js';
import { PartOfSpeech } from '../part-of-speech.js';
import { PronounType, SpecialType } from '../types.js';
import type { Segment } from '../segment.js';

export class MorphologyWriter {
  private readonly text: string[] = [];

  write(...segments: Segment[]): string {
    this.text.length = 0;
    for (const segment of segments) {
      this.writeSegment(segment);
    }

    return this.text.join('');
  }

  private writeSegment(segment: Segment): void {
    switch (segment.type) {
      case 'Prefix':
        this.writePrefix(segment);
        break;
      case 'Stem':
        this.writeStem(segment);
        break;
      case 'Suffix':
        this.writeSuffix(segment);
        break;
    }
  }

  private writePrefix(segment: Segment): void {
    switch (segment.partOfSpeech) {
      case PartOfSpeech.Interrogative:
        this.writeValue('A:INTG+');
        break;
      case PartOfSpeech.Equalization:
        this.writeValue('A:EQ+');
        break;
      case PartOfSpeech.Comitative:
        this.writeValue('w:COM+');
        break;
      case PartOfSpeech.Conjunction:
        switch (segment.lemma?.arabicText.getCharacterType(0)) {
          case CharacterType.Waw:
            this.writeValue('w:CONJ+');
            break;
          case CharacterType.Fa:
            this.writeValue('f:CONJ+');
            break;
        }
        break;
      case PartOfSpeech.Resumption:
        switch (segment.lemma?.arabicText.getCharacterType(0)) {
          case CharacterType.Waw:
            this.writeValue('w:REM+');
            break;
          case CharacterType.Fa:
            this.writeValue('f:REM+');
            break;
        }
        break;
      case PartOfSpeech.Supplemental:
        switch (segment.lemma?.arabicText.getCharacterType(0)) {
          case CharacterType.Waw:
            this.writeValue('w:SUP+');
            break;
          case CharacterType.Fa:
            this.writeValue('f:SUP+');
            break;
        }
        break;
      case PartOfSpeech.Result:
        this.writeValue('f:RSLT+');
        break;
      case PartOfSpeech.Circumstantial:
        this.writeValue('w:CIRC+');
        break;
      case PartOfSpeech.Cause:
        this.writeValue('f:CAUS+');
        break;
      case PartOfSpeech.Preposition:
        switch (segment.lemma?.arabicText.getCharacterType(0)) {
          case CharacterType.Ba:
            this.writeValue('bi+');
            break;
          case CharacterType.Kaf:
            this.writeValue('ka+');
            break;
          case CharacterType.Ta:
            this.writeValue('ta+');
            break;
          case CharacterType.Waw:
            this.writeValue('w:P+');
            break;
          case CharacterType.Lam:
            this.writeValue('l:P+');
            break;
        }
        break;
      case PartOfSpeech.Determiner:
        this.writeValue('Al+');
        break;
      case PartOfSpeech.Emphatic:
        this.writeValue('l:EMPH+');
        break;
      case PartOfSpeech.Purpose:
        this.writeValue('l:PRP+');
        break;
      case PartOfSpeech.Imperative:
        this.writeValue('l:IMPV+');
        break;
      case PartOfSpeech.Future:
        this.writeValue('sa+');
        break;
      case PartOfSpeech.Vocative:
        switch (segment.lemma?.arabicText.getCharacterType(0)) {
          case CharacterType.Ha:
            this.writeValue('ha+');
            break;
          case CharacterType.Ya:
            this.writeValue('ya+');
            break;
        }
        break;
    }
  }

  private writeStem(segment: Segment): void {
    this.writePartOfSpeech(segment);
    this.writeDerivationType(segment);
    this.writeAspect(segment);
    this.writeVoice(segment);
    this.writeForm(segment);
    this.writeLemma(segment);
    this.writeRoot(segment);
    this.writeSpecial(segment);

    if (segment.person != null || segment.gender != null || segment.number != null) {
      this.writeSpace();
      this.writePersonGenderNumber(segment);
    }

    this.writeMood(segment);
    this.writeState(segment);
    this.writeCase(segment);
  }

  private writePartOfSpeech(segment: Segment): void {
    if (segment.partOfSpeech != null) {
      this.writeSpace();
      this.text.push('POS:');
      this.text.push(segment.partOfSpeech);
    }
  }

  private writeDerivationType(segment: Segment): void {
    if (segment.derivation != null) {
      this.writeSpace();
      this.text.push(segment.derivation);
    }
  }

  private writeLemma(segment: Segment): void {
    if (segment.lemma != null) {
      this.writeSpace();
      this.text.push('LEM:');
      this.text.push(segment.lemma.key);
    }
  }

  private writeRoot(segment: Segment): void {
    if (segment.root != null) {
      this.writeSpace();
      this.text.push('ROOT:');
      this.text.push(toBuckwalter(segment.root));
    }
  }

  private writeSpecial(segment: Segment): void {
    if (segment.special != null) {
      this.writeSpace();
      switch (segment.special) {
        case SpecialType.Kaana:
          this.text.push('SP:kaAn');
          break;
        case SpecialType.Kaada:
          this.text.push('SP:kaAd');
          break;
        case SpecialType.Inna:
          this.text.push('SP:<in~');
          break;
      }
    }
  }

  private writeForm(segment: Segment): void {
    if (segment.form != null) {
      this.writeSpace();
      this.text.push('(');
      this.text.push(segment.form);
      this.text.push(')');
    }
  }

  private writeVoice(segment: Segment): void {
    if (segment.voice != null) {
      this.writeValue(segment.voice);
    }
  }

  private writeAspect(segment: Segment): void {
    if (segment.aspect != null) {
      this.writeValue(segment.aspect);
    }
  }

  private writeMood(segment: Segment): void {
    if (segment.mood != null) {
      this.writeSpace();
      this.text.push('MOOD:');
      this.text.push(segment.mood);
    }
  }

  private writeState(segment: Segment): void {
    if (segment.state != null) {
      this.writeValue(segment.state);
    }
  }

  private writeCase(segment: Segment): void {
    if (segment.caseType != null) {
      this.writeValue(segment.caseType);
    }
  }

  private writeSuffix(segment: Segment): void {
    const partOfSpeech = segment.partOfSpeech;
    if (partOfSpeech === PartOfSpeech.Vocative) {
      this.writeValue('+VOC');
      return;
    }

    if (partOfSpeech === PartOfSpeech.Emphatic) {
      this.writeValue('+n:EMPH');
      return;
    }

    if (partOfSpeech === PartOfSpeech.Preposition) {
      this.writePrefix(segment);
      return;
    }

    if (partOfSpeech === PartOfSpeech.Pronoun && segment.pronounType !== PronounType.Subject) {
      this.writeSpace();
      this.text.push('PRON:');
      this.writePersonGenderNumber(segment);
    }
  }

  private writePersonGenderNumber(segment: Segment): void {
    if (segment.person != null) {
      this.text.push(segment.person);
    }

    if (segment.gender != null) {
      this.text.push(segment.gender);
    }

    if (segment.number != null) {
      this.text.push(segment.number);
    }
  }

  private writeSpace(): void {
    if (this.text.length > 0) {
      this.text.push(' ');
    }
  }

  private writeValue(value: string): void {
    this.writeSpace();
    this.text.push(value);
  }
}

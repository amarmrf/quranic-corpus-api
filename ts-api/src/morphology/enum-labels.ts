import {
  AspectType,
  CaseType,
  GenderType,
  MoodType,
  NumberType,
  PersonType,
  StateType,
  VoiceType
} from './types.js';

export function personName(value: PersonType): string {
  switch (value) {
    case PersonType.First:
      return 'first';
    case PersonType.Second:
      return 'second';
    case PersonType.Third:
      return 'third';
  }
}

export function genderName(value: GenderType): string {
  switch (value) {
    case GenderType.Masculine:
      return 'masculine';
    case GenderType.Feminine:
      return 'feminine';
  }
}

export function numberName(value: NumberType): string {
  switch (value) {
    case NumberType.Singular:
      return 'singular';
    case NumberType.Dual:
      return 'dual';
    case NumberType.Plural:
      return 'plural';
  }
}

export function moodName(value: MoodType): string {
  switch (value) {
    case MoodType.Indicative:
      return 'indicative';
    case MoodType.Subjunctive:
      return 'subjunctive';
    case MoodType.Jussive:
      return 'jussive';
  }
}

export function aspectName(value: AspectType): string {
  switch (value) {
    case AspectType.Perfect:
      return 'perfect';
    case AspectType.Imperfect:
      return 'imperfect';
    case AspectType.Imperative:
      return 'imperative';
  }
}

export function caseName(value: CaseType): string {
  switch (value) {
    case CaseType.Nominative:
      return 'nominative';
    case CaseType.Genitive:
      return 'genitive';
    case CaseType.Accusative:
      return 'accusative';
  }
}

export function stateName(value: StateType): string {
  switch (value) {
    case StateType.Definite:
      return 'definite';
    case StateType.Indefinite:
      return 'indefinite';
  }
}

export function voiceName(value: VoiceType): string {
  switch (value) {
    case VoiceType.Active:
      return 'active';
    case VoiceType.Passive:
      return 'passive';
  }
}

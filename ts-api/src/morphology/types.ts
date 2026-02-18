export enum AspectType {
  Perfect = 'PERF',
  Imperfect = 'IMPF',
  Imperative = 'IMPV'
}

export enum CaseType {
  Nominative = 'NOM',
  Genitive = 'GEN',
  Accusative = 'ACC'
}

export enum DerivationType {
  ActiveParticiple = 'ACT PCPL',
  PassiveParticiple = 'PASS PCPL',
  VerbalNoun = 'VN'
}

export enum FormType {
  First = 'I',
  Second = 'II',
  Third = 'III',
  Fourth = 'IV',
  Fifth = 'V',
  Sixth = 'VI',
  Seventh = 'VII',
  Eighth = 'VIII',
  Ninth = 'IX',
  Tenth = 'X',
  Eleventh = 'XI',
  Twelfth = 'XII'
}

export enum GenderType {
  Masculine = 'M',
  Feminine = 'F'
}

export enum MoodType {
  Indicative = 'IND',
  Subjunctive = 'SUBJ',
  Jussive = 'JUS'
}

export function parseMoodType(tag: string): MoodType | null {
  return (Object.values(MoodType) as string[]).includes(tag) ? (tag as MoodType) : null;
}

export enum NumberType {
  Singular = 'S',
  Dual = 'D',
  Plural = 'P'
}

export enum PersonType {
  First = '1',
  Second = '2',
  Third = '3'
}

export enum PronounType {
  Object = 'obj',
  SecondObject = 'obj2',
  Subject = 'subj'
}

export function parsePronounType(tag: string): PronounType | null {
  return (Object.values(PronounType) as string[]).includes(tag) ? (tag as PronounType) : null;
}

export enum SegmentType {
  Prefix = 'Prefix',
  Stem = 'Stem',
  Suffix = 'Suffix'
}

export enum SpecialType {
  Kaana = 'kaAn',
  Kaada = 'kaAd',
  Inna = '<in~'
}

export function parseSpecialType(tag: string): SpecialType | null {
  return (Object.values(SpecialType) as string[]).includes(tag) ? (tag as SpecialType) : null;
}

export enum StateType {
  Definite = 'DEF',
  Indefinite = 'INDEF'
}

export enum VoiceType {
  Active = 'ACT',
  Passive = 'PASS'
}

export enum PartOfSpeechCategory {
  Nominal = 'Nominal',
  Verb = 'Verb',
  Particle = 'Particle'
}

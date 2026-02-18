import { parsePartOfSpeech, type PartOfSpeech } from '../morphology/part-of-speech.js';
import type { ArabicText } from '../arabic/arabic-text.js';
import type { Token } from '../orthography/token.js';

export type WordType = 'token' | 'reference' | 'elided';

export type SyntaxNode = {
  index: number;
  phraseType: PhraseType | null;
  start: SyntaxNode | null;
  end: SyntaxNode | null;
};

export type Word = {
  type: WordType;
  token: Token | null;
  elidedText: ArabicText | null;
  elidedPartOfSpeech: PartOfSpeech | null;
  start: number;
  end: number;
};

export type Edge = {
  dependent: SyntaxNode;
  head: SyntaxNode;
  relation: Relation;
};

export enum PhraseType {
  Sentence = 'S',
  NominalSentence = 'NS',
  VerbalSentence = 'VS',
  ConditionalSentence = 'CS',
  PrepositionPhrase = 'PP',
  SubordinateClause = 'SC'
}

export function parsePhraseType(tag: string): PhraseType | null {
  return (Object.values(PhraseType) as string[]).includes(tag) ? (tag as PhraseType) : null;
}

export enum Relation {
  Possessive = 'poss',
  Object = 'obj',
  Subject = 'subj',
  Conjunction = 'conj',
  Link = 'link',
  Predicate = 'pred',
  Genitive = 'gen',
  Apposition = 'app',
  Subordinate = 'sub',
  Adjective = 'adj',
  PassiveSubject = 'pass',
  SpecialSubject = 'subjx',
  SpecialPredicate = 'predx',
  Circumstantial = 'circ',
  Vocative = 'voc',
  Exceptive = 'exp',
  CognateAccusative = 'cog',
  Specification = 'spec',
  Purpose = 'prp',
  Future = 'fut',
  Interrogative = 'intg',
  Emphasis = 'emph',
  Negation = 'neg',
  Prohibition = 'pro',
  Compound = 'cpnd',
  Condition = 'cond',
  Result = 'rslt',
  ImperativeResult = 'imrs',
  Imperative = 'impv',
  Certainty = 'cert',
  Answer = 'ans',
  Restriction = 'res',
  Surprise = 'sur',
  Retraction = 'ret',
  Explanation = 'exl',
  Preventive = 'prev',
  Aversion = 'avr',
  Inceptive = 'inc',
  Exhortation = 'exh',
  Equalization = 'eq',
  Cause = 'caus',
  Amendment = 'amd',
  Supplemental = 'sup',
  Interpretation = 'int',
  Comitative = 'com'
}

export function parseRelation(tag: string): Relation {
  if (!(Object.values(Relation) as string[]).includes(tag)) {
    throw new Error(`Relation tag ${tag} not recognized.`);
  }

  return tag as Relation;
}

export function parseElidedPartOfSpeech(tag: string): PartOfSpeech {
  return parsePartOfSpeech(tag);
}

export enum PartOfSpeech {
  Noun = 'N',
  ProperNoun = 'PN',
  Pronoun = 'PRON',
  Demonstrative = 'DEM',
  Relative = 'REL',
  Adjective = 'ADJ',
  Verb = 'V',
  Preposition = 'P',
  Interrogative = 'INTG',
  Vocative = 'VOC',
  Negative = 'NEG',
  Emphatic = 'EMPH',
  Purpose = 'PRP',
  Imperative = 'IMPV',
  Future = 'FUT',
  Conjunction = 'CONJ',
  Determiner = 'DET',
  Initials = 'INL',
  Time = 'T',
  Location = 'LOC',
  Accusative = 'ACC',
  Conditional = 'COND',
  SubordinatingConjunction = 'SUB',
  Restriction = 'RES',
  Exceptive = 'EXP',
  Aversion = 'AVR',
  Certainty = 'CERT',
  Retraction = 'RET',
  Preventive = 'PREV',
  Answer = 'ANS',
  Inceptive = 'INC',
  Surprise = 'SUR',
  Supplemental = 'SUP',
  Exhortation = 'EXH',
  ImperativeVerbalNoun = 'IMPN',
  Explanation = 'EXL',
  Equalization = 'EQ',
  Resumption = 'REM',
  Cause = 'CAUS',
  Amendment = 'AMD',
  Prohibition = 'PRO',
  Circumstantial = 'CIRC',
  Result = 'RSLT',
  Interpretation = 'INT',
  Comitative = 'COM'
}

export function parsePartOfSpeech(tag: string): PartOfSpeech {
  const values = Object.values(PartOfSpeech) as string[];
  if (!values.includes(tag)) {
    throw new Error(`Part of speech tag ${tag} not recognized.`);
  }

  return tag as PartOfSpeech;
}

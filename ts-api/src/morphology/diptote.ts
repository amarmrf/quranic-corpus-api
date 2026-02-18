import { CaseType, NumberType } from './types.js';
import type { Segment } from './segment.js';

const LEMMAS = new Set([
  'jahan~am',
  '<isoraA}iyl',
  '<iboraAhiym',
  'firoEawon',
  '<isoHaAq',
  'sulayoma`n',
  'vamuwd',
  'yuwsuf',
  'yaEoquwb',
  'maroyam',
  'daAwud',
  'madoyan',
  'A^dam',
  'ha`ruwn',
  '<isomaAEiyl',
  'qa`ruwn',
  '>ay~uwb',
  'yuwnus',
  'Eimora`n',
  'jiboriyl',
  'saqar',
  'jaAluwt',
  'miSor',
  'ma`ruwt',
  '>aHosan',
  'A^zar',
  '<iram',
  '<iloyaAs',
  'bak~ap',
  '<idoriys',
  '>aqorab',
  'sayonaA^\'',
  '>a$ad~',
  'mak~ap',
  'baAbil',
  'siyniyn',
  'ramaDaAn',
  '>asofal',
  'miykaY`l',
  'luqoma`n',
  'ha`ruwt'
]);

export function isDiptoteWithGenitiveFatha(segment: Segment): boolean {
  const arabic = segment.arabicText;
  return (
    segment.caseType === CaseType.Genitive &&
    arabic != null &&
    arabic.isFatha(arabic.getLength() - 1) &&
    segment.number !== NumberType.Plural &&
    segment.lemma != null &&
    LEMMAS.has(segment.lemma.key)
  );
}

import type { TokenResponse } from '../orthography/token-response.js';
import type { WordType } from './types.js';

export type GraphLocationResponse = {
  location: number[];
  graphNumber: number;
};

export type WordResponse = {
  type: WordType;
  token: TokenResponse | null;
  elidedText: string | null;
  elidedPosTag: string | null;
  startNode: number;
  endNode: number;
};

export type EdgeResponse = {
  startNode: number;
  endNode: number;
  dependencyTag: string;
};

export type PhraseNodeResponse = {
  startNode: number;
  endNode: number;
  phraseTag: string;
};

export type GraphResponse = {
  graphNumber: number;
  graphCount: number;
  legacyCorpusGraphNumber: number;
  prev: GraphLocationResponse | null;
  next: GraphLocationResponse | null;
  words: WordResponse[];
  edges: EdgeResponse[];
  phraseNodes: PhraseNodeResponse[] | null;
};

import type { MorphologyGraph } from '../../../morphology/morphology-graph.js';
import type { Token } from '../../../orthography/token.js';

export type PhoneticContext = {
  morphologyGraph: MorphologyGraph;
  token: Token;
};

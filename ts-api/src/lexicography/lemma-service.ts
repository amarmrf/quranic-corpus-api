import { fromBuckwalter } from '../arabic/encoding/buckwalter/buckwalter-decoder.js';
import type { Lemma } from './lemma.js';

export class LemmaService {
  private readonly lemmas = new Map<string, Lemma>();

  getLemma(key: string): Lemma {
    let lemma = this.lemmas.get(key);
    if (lemma == null) {
      lemma = this.newLemma(key);
      this.lemmas.set(key, lemma);
    }

    return lemma;
  }

  private newLemma(key: string): Lemma {
    let arabic = key;
    const ch = key[key.length - 1] ?? '';
    if (ch >= '0' && ch <= '9') {
      arabic = key.slice(0, -1);
    }

    return {
      arabicText: fromBuckwalter(arabic),
      key
    };
  }
}

import { ArabicEncoderBase } from '../arabic-encoder-base.js';
import { BuckwalterTable } from './buckwalter-table.js';
import type { ArabicText } from '../../arabic-text.js';

export class BuckwalterEncoder extends ArabicEncoderBase {
  constructor() {
    super(BuckwalterTable.BUCKWALTER_TABLE);
  }
}

export function toBuckwalter(arabicText: ArabicText): string {
  return new BuckwalterEncoder().encode(arabicText, null);
}

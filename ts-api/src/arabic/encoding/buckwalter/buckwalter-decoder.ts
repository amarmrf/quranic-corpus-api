import { ArabicDecoderBase } from '../arabic-decoder-base.js';
import { BuckwalterTable } from './buckwalter-table.js';

export class BuckwalterDecoder extends ArabicDecoderBase {
  constructor() {
    super(BuckwalterTable.BUCKWALTER_TABLE);
  }
}

export function fromBuckwalter(text: string) {
  return new BuckwalterDecoder().decode(text);
}

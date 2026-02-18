import { ArabicDecoderBase } from '../arabic-decoder-base.js';
import { UnicodeTable } from './unicode-table.js';

export class UnicodeDecoder extends ArabicDecoderBase {
  constructor() {
    super(UnicodeTable.UNICODE_TABLE);
  }
}

export function fromUnicode(text: string) {
  return new UnicodeDecoder().decode(text);
}

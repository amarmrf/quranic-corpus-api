import { ArabicEncoderBase } from '../arabic-encoder-base.js';
import { EncodingOptions } from '../encoding-options.js';
import { UnicodeTable } from './unicode-table.js';
import type { ArabicText } from '../../arabic-text.js';

export class UnicodeEncoder extends ArabicEncoderBase {
  constructor() {
    super(UnicodeTable.UNICODE_TABLE);
  }
}

export function toUnicode(arabicText: ArabicText, options: EncodingOptions | null = null): string {
  return new UnicodeEncoder().encode(arabicText, options);
}

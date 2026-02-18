import { CharacterType } from './character-type.js';

export class ArabicText {
  static readonly DIACRITIC_OFFSETS = [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2] as const;
  static readonly DIACRITIC_MASKS = [1, 2, 4, 8, 16, 32, 64, 128, 1, 2, 4, 8, 16] as const;
  static readonly CHARACTER_WIDTH = 3;
  static readonly WHITESPACE = -1;

  constructor(
    private readonly buffer: number[],
    private readonly offset = 0,
    private readonly characterCount = Math.floor(buffer.length / ArabicText.CHARACTER_WIDTH)
  ) {}

  getLength(): number {
    return this.characterCount;
  }

  getCharacterType(index: number): CharacterType | null {
    const value = this.byte(this.getOffset(index));
    return value !== ArabicText.WHITESPACE ? (value as CharacterType) : null;
  }

  isFatha(index: number): boolean {
    return (this.byte(this.getOffset(index) + 1) & 1) !== 0;
  }

  isDamma(index: number): boolean {
    return (this.byte(this.getOffset(index) + 1) & 2) !== 0;
  }

  isKasra(index: number): boolean {
    return (this.byte(this.getOffset(index) + 1) & 4) !== 0;
  }

  isFathatan(index: number): boolean {
    return (this.byte(this.getOffset(index) + 1) & 8) !== 0;
  }

  isDammatan(index: number): boolean {
    return (this.byte(this.getOffset(index) + 1) & 16) !== 0;
  }

  isKasratan(index: number): boolean {
    return (this.byte(this.getOffset(index) + 1) & 32) !== 0;
  }

  isShadda(index: number): boolean {
    return (this.byte(this.getOffset(index) + 1) & 64) !== 0;
  }

  isSukun(index: number): boolean {
    return (this.byte(this.getOffset(index) + 1) & 128) !== 0;
  }

  isMaddah(index: number): boolean {
    return (this.byte(this.getOffset(index) + 2) & 1) !== 0;
  }

  isHamzaAbove(index: number): boolean {
    return (this.byte(this.getOffset(index) + 2) & 2) !== 0;
  }

  isHamzaBelow(index: number): boolean {
    return (this.byte(this.getOffset(index) + 2) & 4) !== 0;
  }

  isHamzatWasl(index: number): boolean {
    return (this.byte(this.getOffset(index) + 2) & 8) !== 0;
  }

  isAlifKhanjareeya(index: number): boolean {
    return (this.byte(this.getOffset(index) + 2) & 16) !== 0;
  }

  getDiacriticCount(index: number): number {
    let count = 0;
    for (let i = 0; i < 13; i++) {
      const diacriticOffset = ArabicText.DIACRITIC_OFFSETS[i] ?? 0;
      const diacriticMask = ArabicText.DIACRITIC_MASKS[i] ?? 0;
      if ((this.byte(this.getOffset(index) + diacriticOffset) & diacriticMask) !== 0) {
        count++;
      }
    }

    return count;
  }

  isLetter(index: number): boolean {
    return this.byte(this.getOffset(index)) <= CharacterType.Tatweel;
  }

  substring(start: number, end: number): ArabicText {
    return new ArabicText(this.buffer, this.offset + start * ArabicText.CHARACTER_WIDTH, end - start);
  }

  removeDiacritics(): ArabicText {
    const buffer = new Array<number>(this.characterCount * ArabicText.CHARACTER_WIDTH).fill(0);
    let offset1 = 0;
    let offset2 = this.offset;

    for (let i = 0; i < this.characterCount; i++) {
      buffer[offset1] = this.byte(offset2);
      offset1 += ArabicText.CHARACTER_WIDTH;
      offset2 += ArabicText.CHARACTER_WIDTH;
    }

    return new ArabicText(buffer, 0, this.characterCount);
  }

  toBuffer(): number[] {
    const byteCount = this.characterCount * ArabicText.CHARACTER_WIDTH;
    return this.buffer.slice(this.offset, this.offset + byteCount);
  }

  private getOffset(index: number): number {
    if (index < 0 || index >= this.characterCount) {
      throw new Error(`Arabic text index out of bounds: index=${index}, size=${this.characterCount}`);
    }

    return this.offset + index * ArabicText.CHARACTER_WIDTH;
  }

  private byte(index: number): number {
    return this.buffer[index] ?? 0;
  }
}

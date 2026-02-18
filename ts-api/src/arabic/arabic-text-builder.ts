import { ArabicText } from './arabic-text.js';
import { CharacterType } from './character-type.js';
import { DiacriticType } from './diacritic-type.js';

const INITIAL_CAPACITY = 4;

export class ArabicTextBuilder {
  private buffer: number[];
  private characterCount = 0;
  private characterCapacity: number;

  constructor(characterCapacity = INITIAL_CAPACITY) {
    this.characterCapacity = characterCapacity;
    this.buffer = new Array<number>(characterCapacity * ArabicText.CHARACTER_WIDTH).fill(0);
  }

  addCharacter(characterType: CharacterType | null): void {
    this.insert(this.characterCount, characterType);
  }

  addDiacritic(diacriticType: DiacriticType): void {
    this.setDiacritic(this.characterCount - 1, diacriticType);
  }

  addWhitespace(): void {
    this.addCharacter(null);
  }

  setDiacritic(index: number, diacriticType: DiacriticType): void {
    const offset = index * ArabicText.CHARACTER_WIDTH;
    const value = diacriticType;
    this.buffer[offset + ArabicText.DIACRITIC_OFFSETS[value]] =
      (this.buffer[offset + ArabicText.DIACRITIC_OFFSETS[value]] ?? 0) | ArabicText.DIACRITIC_MASKS[value];
  }

  insert(index: number, characterType: CharacterType | null): void {
    this.checkCapacity(1);

    const offset = index * ArabicText.CHARACTER_WIDTH;
    if (index < this.characterCount - 1) {
      this.buffer.copyWithin(offset + ArabicText.CHARACTER_WIDTH, offset, offset + ArabicText.CHARACTER_WIDTH);
    }

    this.buffer[offset] = characterType != null ? characterType : ArabicText.WHITESPACE;
    this.buffer[offset + 1] = 0;
    this.buffer[offset + 2] = 0;

    this.characterCount++;
  }

  toArabicText(): ArabicText {
    return new ArabicText(this.toByteArray());
  }

  private toByteArray(): number[] {
    const byteCount = this.characterCount * ArabicText.CHARACTER_WIDTH;
    if (byteCount !== this.buffer.length) {
      return this.buffer.slice(0, byteCount);
    }

    return [...this.buffer];
  }

  private checkCapacity(addCharacterCount: number): void {
    const expectedCapacity = this.characterCount + addCharacterCount;
    if (expectedCapacity > this.characterCapacity) {
      const newCapacity = Math.max(expectedCapacity, this.characterCapacity * 2);
      const newBuffer = new Array<number>(newCapacity * ArabicText.CHARACTER_WIDTH).fill(0);
      for (let i = 0; i < this.characterCapacity * ArabicText.CHARACTER_WIDTH; i++) {
        newBuffer[i] = this.buffer[i] ?? 0;
      }

      this.buffer = newBuffer;
      this.characterCapacity = newCapacity;
    }
  }
}

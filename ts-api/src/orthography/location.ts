import { hashLocation } from '../utils/math.js';

export class Location {
  constructor(
    public readonly chapterNumber: number,
    public readonly verseNumber: number,
    public readonly tokenNumber = 0
  ) {}

  toArray(): number[] {
    if (this.tokenNumber > 0) {
      return [this.chapterNumber, this.verseNumber, this.tokenNumber];
    }

    return [this.chapterNumber, this.verseNumber];
  }

  toString(): string {
    if (this.tokenNumber > 0) {
      return `${this.chapterNumber}:${this.verseNumber}:${this.tokenNumber}`;
    }

    return `${this.chapterNumber}:${this.verseNumber}`;
  }

  equals(chapterNumber: number, verseNumber: number, tokenNumber: number): boolean {
    return (
      this.chapterNumber === chapterNumber &&
      this.verseNumber === verseNumber &&
      this.tokenNumber === tokenNumber
    );
  }

  hashCode(): number {
    return hashLocation(this.chapterNumber, this.verseNumber, this.tokenNumber);
  }

  static parseLocation(text: string): Location {
    const parts = text.split(':');
    if (parts.length < 2 || parts.length > 3) {
      throw new Error('Invalid location format.');
    }

    const chapterNumber = Number.parseInt(parts[0] ?? '', 10);
    const verseNumber = Number.parseInt(parts[1] ?? '', 10);
    const tokenNumber = parts[2] != null ? Number.parseInt(parts[2], 10) : 0;

    if (
      Number.isNaN(chapterNumber) ||
      Number.isNaN(verseNumber) ||
      Number.isNaN(tokenNumber)
    ) {
      throw new Error('Invalid location format.');
    }

    return new Location(chapterNumber, verseNumber, tokenNumber);
  }
}

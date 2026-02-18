import type { ArabicText } from '../arabic/arabic-text.js';
import { Location } from './location.js';
import type { Token } from './token.js';

export class Tokenizer {
  constructor(
    private readonly chapterNumber: number,
    private readonly verseNumber: number,
    private readonly arabicText: ArabicText
  ) {}

  getTokens(): Token[] {
    const tokens: Token[] = [];
    const characterCount = this.arabicText.getLength();
    let startPosition = 0;

    for (let i = 0; i < characterCount; i++) {
      if (this.isTokenSeparator(i)) {
        tokens.push({
          location: new Location(this.chapterNumber, this.verseNumber, tokens.length + 1),
          arabicText: this.arabicText.substring(startPosition, i)
        });
        startPosition = i + 1;
      }
    }

    tokens.push({
      location: new Location(this.chapterNumber, this.verseNumber, tokens.length + 1),
      arabicText: this.arabicText.substring(startPosition, characterCount)
    });

    return tokens;
  }

  private isTokenSeparator(index: number): boolean {
    if (this.chapterNumber === 37 && this.verseNumber === 130 && index === 11) {
      return false;
    }

    return this.arabicText.getCharacterType(index) == null;
  }
}

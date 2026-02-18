import type { Chapter } from './chapter.js';
import type { Location } from './location.js';
import type { Token } from './token.js';
import type { Verse } from './verse.js';

export class Document {
  readonly verseCount: number;
  readonly tokenCount: number;

  constructor(private readonly chapters: Chapter[]) {
    let verseCount = 0;
    let tokenCount = 0;

    for (const chapter of chapters) {
      for (const verse of chapter.verses) {
        verseCount++;
        tokenCount += verse.tokens.length;
      }
    }

    this.verseCount = verseCount;
    this.tokenCount = tokenCount;
  }

  getChild(chapterNumber: number): Chapter {
    return this.chapters[chapterNumber - 1] as Chapter;
  }

  children(): Chapter[] {
    return this.chapters;
  }

  getVerse(chapterNumber: number, verseNumber: number): Verse {
    return this.getChild(chapterNumber).verses[verseNumber - 1] as Verse;
  }

  getToken(chapterNumber: number, verseNumber: number, tokenNumber: number): Token {
    return this.getVerse(chapterNumber, verseNumber).tokens[tokenNumber - 1] as Token;
  }

  getTokenByLocation(location: Location): Token {
    return this.getToken(location.chapterNumber, location.verseNumber, location.tokenNumber);
  }

  getNextToken(token: Token): Token | null {
    const location = token.location;
    const chapterNumber = location.chapterNumber;
    const verseNumber = location.verseNumber;
    const tokenNumber = location.tokenNumber;

    const chapter = this.getChild(chapterNumber);
    const verse = chapter.verses[verseNumber - 1] as Verse;

    if (tokenNumber < verse.tokens.length) {
      return verse.tokens[tokenNumber] ?? null;
    }

    if (verseNumber < chapter.verses.length) {
      return chapter.verses[verseNumber]?.tokens[0] ?? null;
    }

    if (chapterNumber < this.chapters.length) {
      return this.getToken(chapterNumber + 1, 1, 1);
    }

    return null;
  }
}

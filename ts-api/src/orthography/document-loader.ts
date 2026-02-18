import { fromUnicode } from '../arabic/encoding/unicode/unicode-decoder.js';
import { Document } from './document.js';
import { Location } from './location.js';
import { TanzilReader } from './tanzil/tanzil-reader.js';
import { Tokenizer } from './tokenizer.js';
import type { Chapter } from './chapter.js';
import type { Verse } from './verse.js';

export class DocumentLoader {
  load(): Document {
    const reader = new TanzilReader();
    const tanzilChapters = reader.readChapters();
    const chapters: Chapter[] = [];

    for (let i = 0; i < tanzilChapters.length; i++) {
      const chapterNumber = i + 1;
      const tanzilChapter = tanzilChapters[i];
      if (tanzilChapter == null) {
        continue;
      }

      chapters.push(this.buildChapter(chapterNumber, tanzilChapter.verses));
    }

    return new Document(chapters);
  }

  private buildChapter(chapterNumber: number, tanzilVerses: string[]): Chapter {
    const verses: Verse[] = [];

    for (let i = 0; i < tanzilVerses.length; i++) {
      const verseNumber = i + 1;
      const location = new Location(chapterNumber, verseNumber);
      const arabicText = fromUnicode(tanzilVerses[i] ?? '');
      const tokens = new Tokenizer(chapterNumber, verseNumber, arabicText).getTokens();
      verses.push({
        location,
        arabicText,
        tokens
      });
    }

    return {
      chapterNumber,
      verses
    };
  }
}

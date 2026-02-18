import { readResourceText } from '../utils/resource-reader.js';
import type { Document } from './document.js';
import type { LocationService } from './location-service.js';
import { Location } from './location.js';
import type { ChapterInfo, ChapterMetadata } from './chapter-metadata.js';
import type { VerseInfo, VerseMark } from './verse-mark.js';
import { type PauseMark, PAUSE_MARKS } from './pause-mark.js';

export class OrthographyService {
  private readonly chapters: ChapterMetadata[];
  private readonly verseMarks = new Map<number, VerseMark>();
  private readonly pauseMarks = new Map<number, PauseMark>();

  constructor(locationService: LocationService, document: Document) {
    this.chapters = this.readChapters(document);
    this.readVerseMarks(locationService);
    this.readPauseMarks();
  }

  getChapters(): ChapterMetadata[] {
    return this.chapters;
  }

  getVerseMark(verseSequenceNumber: number): VerseMark | null {
    return this.verseMarks.get(verseSequenceNumber) ?? null;
  }

  getPauseMark(tokenSequenceNumber: number): PauseMark | null {
    return this.pauseMarks.get(tokenSequenceNumber) ?? null;
  }

  private readChapters(document: Document): ChapterMetadata[] {
    const chapterInfo = JSON.parse(readResourceText('/data/chapters.json')) as ChapterInfo[];

    return chapterInfo.map((info) => ({
      chapterNumber: info.chapterNumber,
      verseCount: document.getChild(info.chapterNumber).verses.length,
      phonetic: info.phonetic,
      translation: info.translation,
      city: info.city
    }));
  }

  private readVerseMarks(locationService: LocationService): void {
    const verses = JSON.parse(readResourceText('/data/verses.json')) as VerseInfo[];
    for (const verse of verses) {
      const verseSequenceNumber = locationService.getVerseSequenceNumber(
        new Location(verse.chapterNumber, verse.verseNumber)
      );
      this.verseMarks.set(verseSequenceNumber, verse.verseMark);
    }
  }

  private readPauseMarks(): void {
    const text = readResourceText('/data/pause-marks.tsv');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;

      const [tokenSeqStr, pauseMarkIndexStr] = trimmed.split('\t');
      const tokenSequenceNumber = parseInt(tokenSeqStr!, 10);
      const pauseMarkIndex = parseInt(pauseMarkIndexStr!, 10);
      const pauseMark = PAUSE_MARKS[pauseMarkIndex - 1];

      if (pauseMark != null) {
        this.pauseMarks.set(tokenSequenceNumber, pauseMark);
      }
    }
  }
}

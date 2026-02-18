import type { Document } from './document.js';
import type { Location } from './location.js';

export class LocationService {
  private readonly verseSequenceNumbers = new Map<number, number>();
  private readonly tokenSequenceNumbers = new Map<number, number>();

  constructor(document: Document) {
    let verseSeq = 0;
    let tokenSeq = 0;

    for (const chapter of document.children()) {
      for (const verse of chapter.verses) {
        verseSeq++;
        this.verseSequenceNumbers.set(verse.location.hashCode(), verseSeq);

        for (const token of verse.tokens) {
          tokenSeq++;
          this.tokenSequenceNumbers.set(token.location.hashCode(), tokenSeq);
        }
      }
    }
  }

  getVerseSequenceNumber(location: Location): number {
    const sequenceNumber = this.verseSequenceNumbers.get(location.hashCode()) ?? 0;
    if (sequenceNumber === 0) {
      throw new Error(`Verse ${location.toString()} not found.`);
    }

    return sequenceNumber;
  }

  getTokenSequenceNumber(location: Location): number {
    const sequenceNumber = this.tokenSequenceNumbers.get(location.hashCode()) ?? 0;
    if (sequenceNumber === 0) {
      throw new Error(`Token ${location.toString()} not found.`);
    }

    return sequenceNumber;
  }
}

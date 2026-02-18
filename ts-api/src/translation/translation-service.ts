import { readResourceLines, readResourceText } from '../utils/resource-reader.js';
import type { Document } from '../orthography/document.js';
import type { Translation } from './translation.js';
import type { TranslationMetadata, TranslationInfo } from './translation-metadata.js';

export class TranslationService {
  private readonly tokenTranslation: string[];
  private readonly verseTranslations = new Map<string, Translation>();
  private readonly metadata: TranslationMetadata[];

  constructor(document: Document) {
    this.tokenTranslation = this.readTokenTranslation(document);

    const translationInfo = JSON.parse(readResourceText('/data/translation/index.json')) as TranslationInfo[];

    this.metadata = translationInfo.map((entry) => ({
      key: entry.name.toLowerCase().replace(/ /g, '-'),
      name: entry.name
    }));

    for (const translation of this.metadata) {
      this.verseTranslations.set(
        translation.key,
        this.readVerseTranslation(document, translation)
      );
    }
  }

  getMetadata(): TranslationMetadata[] {
    return this.metadata;
  }

  getTokenTranslation(tokenSequenceNumber: number): string {
    return this.tokenTranslation[tokenSequenceNumber - 1] ?? '';
  }

  getTranslation(key: string): Translation {
    const translation = this.verseTranslations.get(key);
    if (translation == null) {
      throw new Error(`Translation ${key} not found.`);
    }

    return translation;
  }

  private readTokenTranslation(document: Document): string[] {
    const lines = readResourceLines('/data/translation/word-by-word.txt');
    return lines.slice(0, document.tokenCount);
  }

  private readVerseTranslation(document: Document, translation: TranslationMetadata): Translation {
    const verses = readResourceLines(`/data/translation/${translation.key}.txt`).slice(0, document.verseCount);

    return {
      key: translation.key,
      name: translation.name,
      verses
    };
  }
}

import type { ChapterMetadata } from '../orthography/chapter-metadata.js';
import type { TranslationMetadata } from '../translation/translation-metadata.js';

export type MetadataResponse = {
  chapters: ChapterMetadata[];
  translations: TranslationMetadata[];
};

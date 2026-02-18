import { XMLParser } from 'fast-xml-parser';
import { readResourceText } from '../../utils/resource-reader.js';
import type { TanzilChapter } from './tanzil-chapter.js';

type AyaNode = {
  text: string;
};

type SuraNode = {
  aya: AyaNode[] | AyaNode;
};

type QuranNode = {
  quran: {
    sura: SuraNode[] | SuraNode;
  };
};

function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export class TanzilReader {
  readChapters(): TanzilChapter[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: ''
    });

    const xml = readResourceText('/data/quran-uthmani.xml');
    const parsed = parser.parse(xml) as QuranNode;
    const sura = asArray(parsed.quran.sura);

    return sura.map((chapter) => {
      const verses = asArray(chapter.aya).map((aya) => aya.text);
      return { verses };
    });
  }
}

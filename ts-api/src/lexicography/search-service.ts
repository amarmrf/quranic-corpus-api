import { toBuckwalter } from '../arabic/encoding/buckwalter/buckwalter-encoder.js';
import { toPhonetic } from '../arabic/encoding/phonetic/phonetic-encoder.js';
import { toUnicode } from '../arabic/encoding/unicode/unicode-encoder.js';
import type { MorphologyGraph } from '../morphology/morphology-graph.js';
import { MorphologyWriter } from '../morphology/segmentation/morphology-writer.js';
import type { Segment } from '../morphology/segment.js';
import type { LocationService } from '../orthography/location-service.js';
import type { Document } from '../orthography/document.js';
import { Location } from '../orthography/location.js';
import type { Token } from '../orthography/token.js';
import type { TranslationService } from '../translation/translation-service.js';
import { getVerse } from '../translation/translation.js';

export type SearchMode = 'surface' | 'lemma' | 'root' | 'translation';
export type SearchSort = 'relevance' | 'location';
export type SearchGroupBy = 'none' | 'lemma' | 'root';

export type LexemeRef = {
  key: string;
  arabic: string;
};

export type SearchResult = {
  location: [number, number, number];
  verseLocation: [number, number];
  tokenArabic: string;
  verseArabicTokens: string[];
  matchedTokenIndex: number;
  phonetic: string;
  gloss: string;
  lemmas: LexemeRef[];
  roots: LexemeRef[];
  posTags: string[];
  morphology: string[];
  verseTranslation: string | null;
  matchField: string;
};

export type SearchQuery = {
  q: string;
  mode: SearchMode;
  translation: string;
  chapter: number | null;
  from: string | null;
  to: string | null;
  exact: boolean;
  diacritics: boolean;
  limit: number;
  offset: number;
  sort: SearchSort;
  groupBy: SearchGroupBy;
};

export type SearchResponse = {
  query: SearchQuery;
  total: number;
  tookMs: number;
  results: SearchResult[];
};

export type DictionaryEntry = {
  key: string;
  arabic: string;
  type: 'lemma' | 'root';
  occurrences: number;
  formsCount: number;
  glosses: string[];
  sample: SearchResult[];
};

export type DictionaryResponse = {
  query: SearchQuery;
  totalEntries: number;
  tookMs: number;
  entries: DictionaryEntry[];
};

export type ConcordanceGroup = {
  key: string;
  arabic: string;
  type: 'lemma' | 'root';
  count: number;
  glosses: string[];
  occurrences: SearchResult[];
  occurrencesTruncated: boolean;
};

export type ConcordanceResponse = {
  query: SearchQuery;
  totalGroups: number;
  totalOccurrences: number;
  tookMs: number;
  groups: ConcordanceGroup[];
  results: SearchResult[];
};

export type DictionaryIndexType = 'lemma' | 'root';

export type DictionaryIndexEntry = {
  key: string;
  arabic: string;
  type: DictionaryIndexType;
  count: number;
};

export type DictionaryIndexResponse = {
  type: DictionaryIndexType;
  startsWith: string | null;
  contains: string | null;
  total: number;
  tookMs: number;
  entries: DictionaryIndexEntry[];
};

export type SearchParams = {
  q: string;
  mode?: SearchMode | undefined;
  translation?: string | undefined;
  chapter?: number | undefined;
  from?: string | undefined;
  to?: string | undefined;
  exact?: boolean | undefined;
  diacritics?: boolean | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  sort?: SearchSort | undefined;
  groupBy?: SearchGroupBy | undefined;
  occurrenceLimit?: number | undefined;
};

export type DictionaryIndexParams = {
  type: DictionaryIndexType;
  startsWith?: string | undefined;
  contains?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
};

type IndexedToken = {
  tokenSequenceNumber: number;
  chapterNumber: number;
  verseNumber: number;
  tokenNumber: number;
  verseSequenceNumber: number;
  tokenArabic: string;
  tokenArabicNoDiacritics: string;
  phonetic: string;
  phoneticLower: string;
  gloss: string;
  glossLower: string;
  lemmas: LexemeRef[];
  roots: LexemeRef[];
  posTags: string[];
  morphology: string[];
};

type SearchCandidate = {
  token: IndexedToken;
  matchField: string;
  score: number;
};

type GroupAccumulator = {
  key: string;
  arabic: string;
  type: 'lemma' | 'root';
  count: number;
  occurrences: SearchCandidate[];
  glosses: Set<string>;
  forms: Set<string>;
};

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 200;
const DEFAULT_OCCURRENCE_LIMIT = 50;
const MAX_OCCURRENCE_LIMIT = 500;

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

function stripArabicDiacritics(value: string): string {
  return value.replace(ARABIC_DIACRITICS, '');
}

function normalizeText(value: string, keepDiacritics: boolean): string {
  const trimmed = value.trim().toLowerCase();
  return keepDiacritics ? trimmed : stripArabicDiacritics(trimmed);
}

function uniqueLexemes(values: LexemeRef[]): LexemeRef[] {
  const map = new Map<string, LexemeRef>();
  for (const value of values) {
    if (!map.has(value.key)) {
      map.set(value.key, value);
    }
  }

  return Array.from(map.values());
}

export class SearchService {
  private readonly indexedTokens: IndexedToken[];
  private readonly translationKeys = new Set<string>();

  constructor(
    private readonly document: Document,
    private readonly locationService: LocationService,
    private readonly morphologyGraph: MorphologyGraph,
    private readonly translationService: TranslationService
  ) {
    for (const metadata of translationService.getMetadata()) {
      this.translationKeys.add(metadata.key);
    }

    this.indexedTokens = this.buildIndex();
  }

  search(rawParams: SearchParams): SearchResponse {
    const started = Date.now();
    const query = this.normalizeQuery(rawParams);
    const candidates = this.queryCandidates(query);

    const paged = candidates.slice(query.offset, query.offset + query.limit);
    const results = paged.map((candidate) => this.toResult(candidate, query.translation));

    return {
      query,
      total: candidates.length,
      tookMs: Date.now() - started,
      results
    };
  }

  dictionary(rawParams: SearchParams): DictionaryResponse {
    const started = Date.now();
    const query = this.normalizeQuery(rawParams);
    const candidates = this.queryCandidates(query);
    const entryType: 'lemma' | 'root' = query.mode === 'root' ? 'root' : 'lemma';

    const entriesByKey = new Map<string, GroupAccumulator>();
    for (const candidate of candidates) {
      const lexemes = entryType === 'lemma' ? candidate.token.lemmas : candidate.token.roots;
      for (const lexeme of lexemes) {
        const key = `${entryType}:${lexeme.key}`;
        const existing = entriesByKey.get(key);
        if (existing == null) {
          entriesByKey.set(key, {
            key: lexeme.key,
            arabic: lexeme.arabic,
            type: entryType,
            count: 1,
            occurrences: [candidate],
            glosses: new Set([candidate.token.gloss]),
            forms: new Set([candidate.token.tokenArabic])
          });
          continue;
        }

        existing.count++;
        existing.occurrences.push(candidate);
        existing.glosses.add(candidate.token.gloss);
        existing.forms.add(candidate.token.tokenArabic);
      }
    }

    const entries = Array.from(entriesByKey.values())
      .sort((left, right) => right.count - left.count || left.key.localeCompare(right.key))
      .slice(query.offset, query.offset + query.limit)
      .map((entry) => ({
        key: entry.key,
        arabic: entry.arabic,
        type: entry.type,
        occurrences: entry.count,
        formsCount: entry.forms.size,
        glosses: Array.from(entry.glosses).slice(0, 12),
        sample: entry.occurrences.slice(0, 5).map((occurrence) => this.toResult(occurrence, query.translation))
      }));

    return {
      query,
      totalEntries: entriesByKey.size,
      tookMs: Date.now() - started,
      entries
    };
  }

  concordance(rawParams: SearchParams): ConcordanceResponse {
    const started = Date.now();
    const query = this.normalizeQuery(rawParams);
    const occurrenceLimit = this.normalizeOccurrenceLimit(rawParams.occurrenceLimit);
    const candidates = this.queryCandidates(query);

    if (query.groupBy === 'none') {
      const paged = candidates.slice(query.offset, query.offset + query.limit);
      return {
        query,
        totalGroups: 0,
        totalOccurrences: candidates.length,
        tookMs: Date.now() - started,
        groups: [],
        results: paged.map((candidate) => this.toResult(candidate, query.translation))
      };
    }

    const entryType: 'lemma' | 'root' = query.groupBy === 'root' ? 'root' : 'lemma';
    const groupsByKey = new Map<string, GroupAccumulator>();

    for (const candidate of candidates) {
      const lexemes = entryType === 'lemma' ? candidate.token.lemmas : candidate.token.roots;
      for (const lexeme of lexemes) {
        const mapKey = `${entryType}:${lexeme.key}`;
        const existing = groupsByKey.get(mapKey);
        if (existing == null) {
          groupsByKey.set(mapKey, {
            key: lexeme.key,
            arabic: lexeme.arabic,
            type: entryType,
            count: 1,
            occurrences: [candidate],
            glosses: new Set([candidate.token.gloss]),
            forms: new Set([candidate.token.tokenArabic])
          });
          continue;
        }

        existing.count++;
        existing.occurrences.push(candidate);
        existing.glosses.add(candidate.token.gloss);
        existing.forms.add(candidate.token.tokenArabic);
      }
    }

    const sortedGroups = Array.from(groupsByKey.values()).sort(
      (left, right) => right.count - left.count || left.key.localeCompare(right.key)
    );

    const pagedGroups = sortedGroups.slice(query.offset, query.offset + query.limit);
    const groups: ConcordanceGroup[] = pagedGroups.map((group) => ({
      key: group.key,
      arabic: group.arabic,
      type: group.type,
      count: group.count,
      glosses: Array.from(group.glosses).slice(0, 12),
      occurrences: group.occurrences
        .slice(0, occurrenceLimit)
        .map((occurrence) => this.toResult(occurrence, query.translation)),
      occurrencesTruncated: group.occurrences.length > occurrenceLimit
    }));

    return {
      query,
      totalGroups: groupsByKey.size,
      totalOccurrences: candidates.length,
      tookMs: Date.now() - started,
      groups,
      results: []
    };
  }

  dictionaryIndex(rawParams: DictionaryIndexParams): DictionaryIndexResponse {
    const started = Date.now();
    const type = rawParams.type;
    const startsWith = rawParams.startsWith?.trim() || null;
    const contains = rawParams.contains?.trim() || null;
    const limit = Math.max(1, Math.min(rawParams.limit ?? 200, MAX_LIMIT));
    const offset = Math.max(0, rawParams.offset ?? 0);

    if (!['lemma', 'root'].includes(type)) {
      throw new Error('Invalid dictionary index type.');
    }

    const counts = new Map<string, DictionaryIndexEntry>();
    for (const token of this.indexedTokens) {
      const lexemes = type === 'lemma' ? token.lemmas : token.roots;
      for (const lexeme of lexemes) {
        const mapKey = `${type}:${lexeme.key}`;
        const existing = counts.get(mapKey);
        if (existing == null) {
          counts.set(mapKey, {
            key: lexeme.key,
            arabic: lexeme.arabic,
            type,
            count: 1
          });
        } else {
          existing.count++;
        }
      }
    }

    const filtered = Array.from(counts.values()).filter((entry) => {
      const normalizedKey = entry.key.toLowerCase();
      const normalizedArabic = entry.arabic.toLowerCase();
      if (startsWith != null) {
        const lowerStartsWith = startsWith.toLowerCase();
        if (!normalizedKey.startsWith(lowerStartsWith) && !normalizedArabic.startsWith(lowerStartsWith)) {
          return false;
        }
      }
      if (contains != null) {
        const lowerContains = contains.toLowerCase();
        if (!normalizedKey.includes(lowerContains) && !normalizedArabic.includes(lowerContains)) {
          return false;
        }
      }

      return true;
    });

    filtered.sort((left, right) => right.count - left.count || left.key.localeCompare(right.key));

    return {
      type,
      startsWith,
      contains,
      total: filtered.length,
      tookMs: Date.now() - started,
      entries: filtered.slice(offset, offset + limit)
    };
  }

  private normalizeQuery(params: SearchParams): SearchQuery {
    const mode = params.mode ?? 'surface';
    if (!['surface', 'lemma', 'root', 'translation'].includes(mode)) {
      throw new Error('Invalid mode.');
    }

    const q = params.q?.trim() ?? '';
    if (q.length === 0) {
      throw new Error('Query parameter q is required.');
    }

    const translation = params.translation ?? 'sahih-international';
    if (!this.translationKeys.has(translation)) {
      throw new Error(`Translation ${translation} not found.`);
    }

    const chapter = params.chapter ?? null;
    if (chapter != null && (!Number.isInteger(chapter) || chapter < 1 || chapter > 114)) {
      throw new Error('Chapter must be an integer between 1 and 114.');
    }

    const limit = Math.max(1, Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT));
    const offset = Math.max(0, params.offset ?? 0);
    const sort = params.sort ?? 'relevance';
    const groupBy = params.groupBy ?? 'none';

    if (!['relevance', 'location'].includes(sort)) {
      throw new Error('Invalid sort value.');
    }
    if (!['none', 'lemma', 'root'].includes(groupBy)) {
      throw new Error('Invalid groupBy value.');
    }

    return {
      q,
      mode,
      translation,
      chapter,
      from: params.from ?? null,
      to: params.to ?? null,
      exact: params.exact ?? false,
      diacritics: params.diacritics ?? false,
      limit,
      offset,
      sort,
      groupBy
    };
  }

  private queryCandidates(query: SearchQuery): SearchCandidate[] {
    const normalizedQuery = normalizeText(query.q, query.diacritics);
    const [fromSequenceNumber, toSequenceNumber] = this.getSequenceRange(query.from, query.to);

    const candidates: SearchCandidate[] = [];
    for (const token of this.indexedTokens) {
      if (query.chapter != null && token.chapterNumber !== query.chapter) {
        continue;
      }
      if (token.tokenSequenceNumber < fromSequenceNumber || token.tokenSequenceNumber > toSequenceNumber) {
        continue;
      }

      const match = this.matchToken(token, query.mode, normalizedQuery, query.exact, query.diacritics, query.translation);
      if (match == null) {
        continue;
      }

      candidates.push({
        token,
        matchField: match.matchField,
        score: match.score
      });
    }

    candidates.sort((left, right) => {
      if (query.sort === 'location') {
        return left.token.tokenSequenceNumber - right.token.tokenSequenceNumber;
      }

      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.token.tokenSequenceNumber - right.token.tokenSequenceNumber;
    });

    return candidates;
  }

  private getSequenceRange(from: string | null, to: string | null): [number, number] {
    const firstToken = this.indexedTokens[0]?.tokenSequenceNumber ?? 1;
    const lastToken = this.indexedTokens[this.indexedTokens.length - 1]?.tokenSequenceNumber ?? 1;

    const fromSequenceNumber = from != null ? this.resolveBoundary(from, 'from') : firstToken;
    const toSequenceNumber = to != null ? this.resolveBoundary(to, 'to') : lastToken;

    if (fromSequenceNumber > toSequenceNumber) {
      throw new Error('Parameter from must be before parameter to.');
    }

    return [fromSequenceNumber, toSequenceNumber];
  }

  private resolveBoundary(locationText: string, boundary: 'from' | 'to'): number {
    let location: Location;
    try {
      location = Location.parseLocation(locationText);
    } catch (_error) {
      throw new Error(`Invalid ${boundary} location.`);
    }

    if (location.tokenNumber > 0) {
      return this.locationService.getTokenSequenceNumber(location);
    }

    const verse = this.document.getVerse(location.chapterNumber, location.verseNumber);
    if (boundary === 'from') {
      return this.locationService.getTokenSequenceNumber(verse.tokens[0]!.location);
    }

    return this.locationService.getTokenSequenceNumber(verse.tokens[verse.tokens.length - 1]!.location);
  }

  private normalizeOccurrenceLimit(rawOccurrenceLimit?: number): number {
    if (rawOccurrenceLimit == null) {
      return DEFAULT_OCCURRENCE_LIMIT;
    }

    if (!Number.isInteger(rawOccurrenceLimit) || rawOccurrenceLimit < 1) {
      throw new Error('occurrenceLimit must be a positive integer.');
    }

    return Math.min(rawOccurrenceLimit, MAX_OCCURRENCE_LIMIT);
  }

  private matchToken(
    token: IndexedToken,
    mode: SearchMode,
    normalizedQuery: string,
    exact: boolean,
    diacritics: boolean,
    translationKey: string
  ): { matchField: string; score: number } | null {
    const fields: { name: string; value: string }[] = [];

    if (mode === 'surface') {
      fields.push(
        { name: 'gloss', value: token.glossLower },
        { name: 'phonetic', value: token.phoneticLower },
        {
          name: 'tokenArabic',
          value: normalizeText(diacritics ? token.tokenArabic : token.tokenArabicNoDiacritics, true)
        }
      );
    } else if (mode === 'lemma') {
      for (const lemma of token.lemmas) {
        fields.push(
          { name: 'lemmaKey', value: normalizeText(lemma.key, true) },
          { name: 'lemmaArabic', value: normalizeText(lemma.arabic, diacritics) }
        );
      }
    } else if (mode === 'root') {
      for (const root of token.roots) {
        fields.push(
          { name: 'rootKey', value: normalizeText(root.key, true) },
          { name: 'rootArabic', value: normalizeText(root.arabic, diacritics) }
        );
      }
    } else {
      const verseTranslation = this.getVerseTranslation(translationKey, token.verseSequenceNumber) ?? '';
      fields.push({ name: 'verseTranslation', value: normalizeText(verseTranslation, true) });
    }

    let bestMatch: { matchField: string; score: number } | null = null;

    for (const field of fields) {
      if (field.value.length === 0) {
        continue;
      }

      if (exact) {
        if (field.value !== normalizedQuery) {
          continue;
        }

        bestMatch = { matchField: field.name, score: 3 };
        break;
      }

      const contains = field.value.includes(normalizedQuery);
      if (!contains) {
        continue;
      }

      const startsWith = field.value.startsWith(normalizedQuery);
      const score = startsWith ? 2 : 1;
      if (bestMatch == null || score > bestMatch.score) {
        bestMatch = { matchField: field.name, score };
      }
    }

    return bestMatch;
  }

  private toResult(candidate: SearchCandidate, translationKey: string): SearchResult {
    const token = candidate.token;
    const verse = this.document.getVerse(token.chapterNumber, token.verseNumber);
    const verseArabicTokens = verse.tokens.map((verseToken) => toUnicode(verseToken.arabicText));
    const matchedTokenIndex = Math.max(
      0,
      verse.tokens.findIndex((verseToken) => verseToken.location.tokenNumber === token.tokenNumber)
    );

    return {
      location: [token.chapterNumber, token.verseNumber, token.tokenNumber],
      verseLocation: [token.chapterNumber, token.verseNumber],
      tokenArabic: token.tokenArabic,
      verseArabicTokens,
      matchedTokenIndex,
      phonetic: token.phonetic,
      gloss: token.gloss,
      lemmas: token.lemmas,
      roots: token.roots,
      posTags: token.posTags,
      morphology: token.morphology,
      verseTranslation: this.getVerseTranslation(translationKey, token.verseSequenceNumber),
      matchField: candidate.matchField
    };
  }

  private getVerseTranslation(translationKey: string, verseSequenceNumber: number): string | null {
    const translation = this.translationService.getTranslation(translationKey);
    return getVerse(translation, verseSequenceNumber);
  }

  private buildIndex(): IndexedToken[] {
    const indexed: IndexedToken[] = [];

    for (const chapter of this.document.children()) {
      for (const verse of chapter.verses) {
        const verseSequenceNumber = this.locationService.getVerseSequenceNumber(verse.location);
        for (const token of verse.tokens) {
          const tokenSequenceNumber = this.locationService.getTokenSequenceNumber(token.location);
          const segments = this.morphologyGraph.query(token);
          const lemmas = this.extractLemmas(segments);
          const roots = this.extractRoots(segments);
          const gloss = this.translationService.getTokenTranslation(tokenSequenceNumber);
          const phonetic = this.toPhonetic(token);
          const tokenArabic = toUnicode(token.arabicText);
          const posTags = Array.from(
            new Set(
              segments
                .map((segment) => segment.partOfSpeech)
                .filter((value): value is NonNullable<typeof value> => value != null && value.length > 0)
            )
          );
          const morphologyWriter = new MorphologyWriter();
          const morphology = segments
            .map((segment) => morphologyWriter.write(segment))
            .filter((value): value is string => value != null && value.length > 0);

          indexed.push({
            tokenSequenceNumber,
            chapterNumber: token.location.chapterNumber,
            verseNumber: token.location.verseNumber,
            tokenNumber: token.location.tokenNumber,
            verseSequenceNumber,
            tokenArabic,
            tokenArabicNoDiacritics: stripArabicDiacritics(tokenArabic),
            phonetic,
            phoneticLower: normalizeText(phonetic, true),
            gloss,
            glossLower: normalizeText(gloss, true),
            lemmas,
            roots,
            posTags,
            morphology
          });
        }
      }
    }

    return indexed;
  }

  private toPhonetic(token: Token): string {
    return toPhonetic(
      {
        morphologyGraph: this.morphologyGraph,
        token
      },
      token.arabicText
    );
  }

  private extractLemmas(segments: Segment[]): LexemeRef[] {
    const lemmas: LexemeRef[] = [];
    for (const segment of segments) {
      if (segment.lemma == null) {
        continue;
      }
      lemmas.push({
        key: segment.lemma.key,
        arabic: toUnicode(segment.lemma.arabicText)
      });
    }

    return uniqueLexemes(lemmas);
  }

  private extractRoots(segments: Segment[]): LexemeRef[] {
    const roots: LexemeRef[] = [];
    for (const segment of segments) {
      if (segment.root == null) {
        continue;
      }
      roots.push({
        key: toBuckwalter(segment.root),
        arabic: toUnicode(segment.root)
      });
    }

    return uniqueLexemes(roots);
  }
}

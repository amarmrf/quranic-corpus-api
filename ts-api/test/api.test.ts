import { beforeAll, afterAll, describe, expect, test } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../src/app/server.js';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildServer();
});

afterAll(async () => {
  await app.close();
});

describe('Quranic Corpus API (TS)', () => {
  test('GET /health', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  test('GET /ready', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/ready'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ready' });
  });

  test('GET /metadata', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/metadata'
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.chapters).toHaveLength(114);
    expect(body.translations).toHaveLength(7);
    expect(body.chapters[32]).toMatchObject({
      chapterNumber: 33,
      verseCount: 73,
      phonetic: 'Al-Aḥzāb',
      translation: 'The Combined Forces',
      city: 'Madinah'
    });
  });

  test('GET /morphology', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/morphology',
      query: {
        location: '4:79',
        n: '2',
        translation: 'sahih-international'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveLength(2);

    expect(body[0].location).toEqual([4, 79]);
    expect(body[0].tokens).toHaveLength(18);
    expect(body[0].translations[0].translation).toContain('What comes to you of good is from Allah');

    const token = body[0].tokens[12];
    expect(token.location).toEqual([4, 79, 13]);
    expect(token.translation).toBe('And We have sent you');
    expect(token.phonetic).toBe('wa-arsalnāka');

    expect(token.segments).toHaveLength(4);
    expect(token.segments[1]).toMatchObject({ arabic: 'أَرْسَلْ', posTag: 'V' });
    expect(token.segments[2]).toMatchObject({ arabic: 'نَٰ', posTag: 'PRON', pronounType: 'subj' });
    expect(token.segments[3]).toMatchObject({ arabic: 'كَ', posTag: 'PRON', pronounType: 'obj' });
  });

  test('GET /syntax', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/syntax',
      query: {
        location: '4:79',
        graph: '3'
      }
    });

    expect(response.statusCode).toBe(200);
    const graph = response.json();
    expect(graph.graphNumber).toBe(3);
    expect(graph.graphCount).toBe(4);
    expect(graph.legacyCorpusGraphNumber).toBe(2553);

    expect(graph.words).toHaveLength(3);
    expect(graph.words[0].type).toBe('token');
    expect(graph.words[0].token.location).toEqual([4, 79, 13]);
    expect(graph.edges[0]).toMatchObject({ startNode: 2, endNode: 1, dependencyTag: 'subj' });

    expect(graph.prev).toEqual({ location: [4, 79], graphNumber: 2 });
    expect(graph.next).toEqual({ location: [4, 79], graphNumber: 4 });
  });

  test('GET /morphology should include pause marks', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/morphology',
      query: {
        location: '5:64',
        n: '1'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveLength(1);

    // Token 10 of verse 5:64 has a compulsory pause mark
    const tokenWithPause = body[0].tokens[9];
    expect(tokenWithPause.location).toEqual([5, 64, 10]);
    expect(tokenWithPause.pauseMark).toBe('compulsory');

    // Token 1 should not have a pause mark
    expect(body[0].tokens[0].pauseMark).toBeNull();
  });

  test('GET /irab', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/irab',
      query: {
        from: '2:43:1',
        to: '2:43:7'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveLength(3);
    expect(body[0]).toContain('وَأَقِيمُوا الصَّلاةَ');
  });

  test('GET /irab should reject long range', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/irab',
      query: {
        from: '1:1:1',
        to: '2:3:1'
      }
    });

    expect(response.statusCode).toBe(400);
  });

  test('GET /search supports surface mode', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/search',
      query: {
        q: 'house',
        mode: 'surface',
        limit: '10'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.query.mode).toBe('surface');
    expect(body.total).toBeGreaterThan(0);
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0].location).toHaveLength(3);
    expect(body.results[0]).toMatchObject({
      matchField: expect.any(String),
      tokenArabic: expect.any(String),
      verseArabicTokens: expect.any(Array),
      matchedTokenIndex: expect.any(Number),
      gloss: expect.any(String)
    });
  });

  test('GET /dictionary supports lemma lookup', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dictionary',
      query: {
        q: 'house',
        mode: 'surface',
        limit: '10'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.totalEntries).toBeGreaterThan(0);
    expect(body.entries.length).toBeGreaterThan(0);
    expect(body.entries[0]).toMatchObject({
      key: expect.any(String),
      arabic: expect.any(String),
      occurrences: expect.any(Number),
      formsCount: expect.any(Number)
    });
    expect(body.entries[0].sample.length).toBeGreaterThan(0);
  });

  test('GET /concordance supports grouped root lookup', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/concordance',
      query: {
        q: 'qds',
        mode: 'root',
        groupBy: 'root',
        occurrenceLimit: '5'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.totalGroups).toBeGreaterThan(0);
    expect(body.totalOccurrences).toBeGreaterThan(0);
    expect(body.groups.length).toBeGreaterThan(0);
    expect(body.groups[0]).toMatchObject({
      key: expect.any(String),
      count: expect.any(Number),
      occurrencesTruncated: expect.any(Boolean)
    });
    expect(body.groups[0].occurrences.length).toBeGreaterThan(0);
    expect(body.groups[0].occurrences[0].posTags).toBeDefined();
    expect(body.groups[0].occurrences[0].morphology).toBeDefined();
  });

  test('GET /dictionary/index supports root picker data', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dictionary/index',
      query: {
        type: 'root',
        startsWith: 'q',
        limit: '20'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.type).toBe('root');
    expect(body.total).toBeGreaterThan(0);
    expect(body.entries.length).toBeGreaterThan(0);
    expect(body.entries[0]).toMatchObject({
      key: expect.any(String),
      arabic: expect.any(String),
      count: expect.any(Number)
    });
  });

  test('GET /search supports morpheme mode', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/search',
      query: {
        q: 'POS:V',
        mode: 'morpheme',
        segmentType: 'stem',
        limit: '10'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.query.mode).toBe('morpheme');
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0]).toMatchObject({
      matchField: expect.any(String),
      matchedSegmentType: 'stem',
      matchedMorphemeTag: expect.any(String)
    });
  });

  test('GET /search supports morpheme filters without q', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/search',
      query: {
        mode: 'morpheme',
        feature: 'POS:V',
        segmentType: 'stem',
        limit: '10'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.query.mode).toBe('morpheme');
    expect(body.query.q).toBe('');
    expect(body.results.length).toBeGreaterThan(0);
  });

  test('GET /concordance rejects grouped morpheme mode', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/concordance',
      query: {
        q: 'POS:V',
        mode: 'morpheme',
        groupBy: 'root'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toContain('groupBy=none');
  });

  test('GET /dictionary rejects morpheme mode', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/dictionary',
      query: {
        q: 'POS:V',
        mode: 'morpheme'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toContain('does not support morpheme mode');
  });

  test('GET /search validates required query', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/search'
    });

    expect(response.statusCode).toBe(400);
  });

  test('GET /search validates from/to ordering', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/search',
      query: {
        q: 'house',
        from: '2:10',
        to: '2:1'
      }
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.message).toContain('from');
  });
});

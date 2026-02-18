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

describe('API parity extras', () => {
  test('GET /morphology with features', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/morphology',
      query: {
        location: '65:2',
        n: '1',
        features: 'true'
      }
    });

    expect(response.statusCode).toBe(200);
    const verse = response.json()[0];
    expect(verse.location).toEqual([65, 2]);
    expect(verse.tokens).toHaveLength(30);
    expect(verse.translations).toBeNull();

    const token = verse.tokens[3];
    expect(token.location).toEqual([65, 2, 4]);
    expect(token.translation).toBe('then retain them');
    expect(token.phonetic).toBe('fa-amsikūhunna');
    expect(token.segments).toHaveLength(4);

    expect(token.segments[0]).toEqual({
      arabic: 'فَ',
      posTag: null,
      pronounType: null,
      morphology: 'f:RSLT+'
    });

    expect(token.segments[1]).toEqual({
      arabic: 'أَمْسِكُ',
      posTag: null,
      pronounType: null,
      morphology: 'POS:V IMPV (IV) LEM:>amosaka ROOT:msk 2MP'
    });

    expect(token.segments[2]).toEqual({
      arabic: 'و',
      posTag: null,
      pronounType: null,
      morphology: null
    });

    expect(token.segments[3]).toEqual({
      arabic: 'هُنَّ',
      posTag: null,
      pronounType: null,
      morphology: 'PRON:3FP'
    });
  });

  test('GET /morphology/word exact output', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/morphology/word',
      query: {
        location: '104:4:2'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body.token.location).toEqual([104, 4, 2]);
    expect(body.token.translation).toBe('Surely he will be thrown');
    expect(body.token.phonetic).toBe('layunbadhanna');
    expect(body.token.segments).toHaveLength(3);

    expect(body.token.segments[0]).toMatchObject({ arabic: 'لَ', posTag: 'EMPH' });
    expect(body.token.segments[1]).toMatchObject({ arabic: 'يُنۢبَذَ', posTag: 'V' });
    expect(body.token.segments[2]).toMatchObject({ arabic: 'نَّ', posTag: 'EMPH' });

    expect(body.summary).toBe(
      'The second word of verse (104:4) is divided into 3 morphological segments. An emphatic prefix, verb and emphatic suffix. The prefixed particle {lām} is usually translated as "surely" or "indeed" and is used to add emphasis. The passive imperfect verb [فعل مضارع] is third person masculine singular and is in the indicative mood [مرفوع]. The verb\'s triliteral root is {nūn bā dhāl} [ن ب ذ]. The suffixed emphatic particle is known as the {nūn} of emphasis [نون التوكيد].'
    );

    expect(body.segmentDescriptions).toEqual([
      'emphatic prefix {lām}',
      '3rd person masculine singular passive imperfect verb',
      'emphatic suffix {nūn}'
    ]);

    expect(body.arabicGrammar).toBe('اللام لام التوكيد\nفعل مضارع مبني للمجهول والنون للتوكيد');
  });

  test('GET /syntax graph with elided word', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/syntax',
      query: {
        location: '70:5',
        graph: '1'
      }
    });

    expect(response.statusCode).toBe(200);
    const graph = response.json();

    expect(graph.words).toHaveLength(4);
    expect(graph.words[1].type).toBe('elided');
    expect(graph.words[1].elidedText).toBe('أَنتَ');
    expect(graph.words[1].elidedPosTag).toBe('PRON');
    expect(graph.edges).toHaveLength(4);
    expect(graph.phraseNodes).toBeNull();
    expect(graph.prev).toEqual({ location: [70, 4], graphNumber: 2 });
    expect(graph.next).toEqual({ location: [70, 6], graphNumber: 1 });
  });

  test('GET /syntax missing graph returns null', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/syntax',
      query: {
        location: '58:1',
        graph: '1'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toBeNull();
  });
});

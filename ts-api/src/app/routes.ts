import { z } from 'zod';
import { toUnicode } from '../arabic/encoding/unicode/unicode-encoder.js';
import { Location } from '../orthography/location.js';
import type { SearchGroupBy, SearchMode, SearchSort } from '../lexicography/search-service.js';
import type { AppContext } from './context.js';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Translation } from '../translation/translation.js';
import { getVerse } from '../translation/translation.js';

const morphologyQuerySchema = z.object({
  location: z.string(),
  n: z.coerce.number().int().min(1).max(10),
  translation: z.string().optional(),
  features: z
    .union([z.boolean(), z.string().transform((value) => value === 'true')])
    .optional()
});

const locationQuerySchema = z.object({
  location: z.string()
});

const syntaxQuerySchema = z.object({
  location: z.string(),
  graph: z.coerce.number().int().min(1)
});

const irabQuerySchema = z.object({
  from: z.string(),
  to: z.string()
});

const booleanLikeSchema = z
  .union([z.boolean(), z.string().transform((value) => value === 'true')])
  .optional();

const searchQuerySchema = z.object({
  q: z.string().min(1),
  mode: z.enum(['surface', 'lemma', 'root', 'translation']).optional(),
  translation: z.string().optional(),
  chapter: z.coerce.number().int().min(1).max(114).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  exact: booleanLikeSchema,
  diacritics: booleanLikeSchema,
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['relevance', 'location']).optional(),
  groupBy: z.enum(['none', 'lemma', 'root']).optional(),
  occurrenceLimit: z.coerce.number().int().min(1).max(500).optional()
});

const dictionaryIndexQuerySchema = z.object({
  type: z.enum(['lemma', 'root']),
  startsWith: z.string().optional(),
  contains: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional()
});

export async function registerRoutes(app: FastifyInstance, context: AppContext): Promise<void> {
  app.get('/health', async () => {
    return {
      status: 'ok'
    };
  });

  app.get('/ready', async () => {
    return {
      status: 'ready'
    };
  });

  app.get('/metadata', async () => {
    return {
      chapters: context.orthographyService.getChapters(),
      translations: context.translationService.getMetadata()
    };
  });

  app.get('/morphology', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = morphologyQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return {
        message: parsed.error.issues[0]?.message ?? 'Invalid request.'
      };
    }

    const { location, n: count, translation: translationQuery, features } = parsed.data;

    const _location = Location.parseLocation(location);
    const translations = getTranslations(context, translationQuery);
    const _features = features ?? false;

    const verses = context.document.children()[_location.chapterNumber - 1]?.verses ?? [];
    let verseNumber = _location.verseNumber;
    const verseCount = Math.min(count, Math.max(0, verses.length - verseNumber + 1));
    const verseResponses = [];

    for (let i = 0; i < verseCount; i++) {
      const verse = verses[verseNumber - 1];
      if (verse == null) {
        break;
      }
      verseResponses.push(getVerseResponse(context, verse, translations, _features));
      verseNumber++;
    }

    return verseResponses;
  });

  app.get('/morphology/word', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = locationQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return {
        message: parsed.error.issues[0]?.message ?? 'Invalid request.'
      };
    }

    const token = context.document.getTokenByLocation(Location.parseLocation(parsed.data.location));
    const wordMorphology = context.morphologyGraph.getWordMorphology(token);

    return {
      token: context.tokenTransformer.getTokenResponse(token, false),
      summary: wordMorphology.summary,
      segmentDescriptions: wordMorphology.segmentDescriptions,
      arabicGrammar: wordMorphology.arabicGrammar
    };
  });

  app.get('/syntax', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = syntaxQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return {
        message: parsed.error.issues[0]?.message ?? 'Invalid request.'
      };
    }

    const { location, graph: graphNumber } = parsed.data;

    const _location = Location.parseLocation(location);
    const verseSequenceNumber = context.locationService.getVerseSequenceNumber(_location);
    const graphSequenceNumbers = context.syntaxService.getGraphsForVerse(verseSequenceNumber);
    if (graphSequenceNumbers == null) {
      return null;
    }

    const graphCount = graphSequenceNumbers.length;
    const graphSequenceNumber = graphSequenceNumbers[graphNumber - 1];
    if (graphSequenceNumber == null) {
      reply.status(400);
      return {
        message: 'Graph not found.'
      };
    }

    const graph = context.syntaxService.getGraphs()[graphSequenceNumber - 1];
    if (graph == null) {
      reply.status(400);
      return {
        message: 'Graph not found.'
      };
    }

    return {
      graphNumber,
      graphCount,
      legacyCorpusGraphNumber: context.legacyCorpusGraphMapper.getLegacyCorpusGraphNumber(graphSequenceNumber),
      prev: getGraphLocationResponse(context, graphSequenceNumber - 1),
      next: getGraphLocationResponse(context, graphSequenceNumber + 1),
      words: graph.getWords().map((word) => ({
        type: word.type,
        token: word.token != null ? context.tokenTransformer.getTokenResponse(word.token, false) : null,
        elidedText: word.elidedText != null ? toUnicode(word.elidedText) : null,
        elidedPosTag: word.elidedPartOfSpeech ?? null,
        startNode: word.start,
        endNode: word.end
      })),
      edges: graph.getEdges().map((edge) => ({
        startNode: edge.dependent.index,
        endNode: edge.head.index,
        dependencyTag: edge.relation
      })),
      phraseNodes:
        graph.getPhraseCount() > 0
          ? Array.from({ length: graph.getPhraseCount() }).map((_, index) => {
              const phraseNode = graph.getPhrase(index + 1);
              return {
                startNode: phraseNode.start?.index ?? 0,
                endNode: phraseNode.end?.index ?? 0,
                phraseTag: phraseNode.phraseType ?? ''
              };
            })
          : null
    };
  });

  app.get('/irab', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = irabQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return {
        message: parsed.error.issues[0]?.message ?? 'Invalid request.'
      };
    }

    const from = context.locationService.getTokenSequenceNumber(Location.parseLocation(parsed.data.from));
    const to = context.locationService.getTokenSequenceNumber(Location.parseLocation(parsed.data.to));

    const response = context.irabGraph.query(from, to);
    if (response.length > 20) {
      reply.status(400);
      return {
        message: 'Request too long.'
      };
    }

    return response;
  });

  app.get('/search', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = searchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return {
        message: parsed.error.issues[0]?.message ?? 'Invalid request.'
      };
    }

    try {
      return context.searchService.search({
        q: parsed.data.q,
        mode: parsed.data.mode as SearchMode | undefined,
        translation: parsed.data.translation,
        chapter: parsed.data.chapter,
        from: parsed.data.from,
        to: parsed.data.to,
        exact: parsed.data.exact,
        diacritics: parsed.data.diacritics,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
        sort: parsed.data.sort as SearchSort | undefined,
        groupBy: parsed.data.groupBy as SearchGroupBy | undefined
      });
    } catch (error) {
      reply.status(400);
      return {
        message: error instanceof Error ? error.message : 'Invalid request.'
      };
    }
  });

  app.get('/dictionary', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = searchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return {
        message: parsed.error.issues[0]?.message ?? 'Invalid request.'
      };
    }

    try {
      return context.searchService.dictionary({
        q: parsed.data.q,
        mode: parsed.data.mode as SearchMode | undefined,
        translation: parsed.data.translation,
        chapter: parsed.data.chapter,
        from: parsed.data.from,
        to: parsed.data.to,
        exact: parsed.data.exact,
        diacritics: parsed.data.diacritics,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
        sort: parsed.data.sort as SearchSort | undefined,
        groupBy: parsed.data.groupBy as SearchGroupBy | undefined
      });
    } catch (error) {
      reply.status(400);
      return {
        message: error instanceof Error ? error.message : 'Invalid request.'
      };
    }
  });

  app.get('/concordance', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = searchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return {
        message: parsed.error.issues[0]?.message ?? 'Invalid request.'
      };
    }

    try {
      return context.searchService.concordance({
        q: parsed.data.q,
        mode: parsed.data.mode as SearchMode | undefined,
        translation: parsed.data.translation,
        chapter: parsed.data.chapter,
        from: parsed.data.from,
        to: parsed.data.to,
        exact: parsed.data.exact,
        diacritics: parsed.data.diacritics,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
        sort: parsed.data.sort as SearchSort | undefined,
        groupBy: parsed.data.groupBy as SearchGroupBy | undefined,
        occurrenceLimit: parsed.data.occurrenceLimit
      });
    } catch (error) {
      reply.status(400);
      return {
        message: error instanceof Error ? error.message : 'Invalid request.'
      };
    }
  });

  app.get('/dictionary/index', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = dictionaryIndexQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return {
        message: parsed.error.issues[0]?.message ?? 'Invalid request.'
      };
    }

    try {
      return context.searchService.dictionaryIndex({
        type: parsed.data.type,
        startsWith: parsed.data.startsWith,
        contains: parsed.data.contains,
        limit: parsed.data.limit,
        offset: parsed.data.offset
      });
    } catch (error) {
      reply.status(400);
      return {
        message: error instanceof Error ? error.message : 'Invalid request.'
      };
    }
  });
}

function getTranslations(context: AppContext, translationQuery?: string): Translation[] | null {
  if (translationQuery == null || translationQuery.length === 0) {
    return null;
  }

  return translationQuery.split(',').map((value) => context.translationService.getTranslation(value));
}

function getVerseResponse(
  context: AppContext,
  verse: { location: Location; tokens: any[] },
  translations: Translation[] | null,
  features: boolean
) {
  const tokenResponses = verse.tokens.map((token) => context.tokenTransformer.getTokenResponse(token, features));
  const verseSequenceNumber = context.locationService.getVerseSequenceNumber(verse.location);

  return {
    location: verse.location.toArray(),
    tokens: tokenResponses,
    translations:
      translations != null
        ? translations.map((translation) => ({
            name: translation.name,
            translation: getVerse(translation, verseSequenceNumber)
          }))
        : null,
    verseMark: context.orthographyService.getVerseMark(verseSequenceNumber)
  };
}

function getGraphLocationResponse(context: AppContext, graphSequenceNumber: number) {
  const graphs = context.syntaxService.getGraphs();
  if (graphSequenceNumber < 1 || graphSequenceNumber > graphs.length) {
    return null;
  }

  const tokenLocation = graphs[graphSequenceNumber - 1]?.getFirstToken().location;
  if (tokenLocation == null) {
    return null;
  }

  const verse = context.document.getVerse(tokenLocation.chapterNumber, tokenLocation.verseNumber);
  const location = verse.location;
  const verseSequenceNumber = context.locationService.getVerseSequenceNumber(location);
  const graphSequenceNumbers = context.syntaxService.getGraphsForVerse(verseSequenceNumber);
  if (graphSequenceNumbers == null || graphSequenceNumbers.length === 0) {
    return null;
  }

  const firstGraphSequenceNumber = graphSequenceNumbers[0];
  if (firstGraphSequenceNumber == null) {
    return null;
  }

  const graphNumber = graphSequenceNumber - firstGraphSequenceNumber + 1;
  return {
    location: location.toArray(),
    graphNumber
  };
}

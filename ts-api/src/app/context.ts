import { DocumentLoader } from '../orthography/document-loader.js';
import { LocationService } from '../orthography/location-service.js';
import { OrthographyService } from '../orthography/orthography-service.js';
import { TranslationService } from '../translation/translation-service.js';
import { LemmaService } from '../lexicography/lemma-service.js';
import { SearchService } from '../lexicography/search-service.js';
import { MorphologyLoader } from '../morphology/morphology-loader.js';
import { TokenTransformer } from '../morphology/token-transformer.js';
import { SyntaxService } from '../syntax/syntax-service.js';
import { LegacyCorpusGraphMapper } from '../syntax/legacy-corpus-graph-mapper.js';
import { IrabLoader } from '../irab/irab-loader.js';

export type AppContext = ReturnType<typeof buildContext>;

export function buildContext() {
  const document = new DocumentLoader().load();
  const locationService = new LocationService(document);
  const orthographyService = new OrthographyService(locationService, document);
  const translationService = new TranslationService(document);

  const lemmaService = new LemmaService();
  const morphologyGraph = new MorphologyLoader(document, lemmaService).load();
  const tokenTransformer = new TokenTransformer(locationService, orthographyService, translationService, morphologyGraph);
  const searchService = new SearchService(document, locationService, morphologyGraph, translationService);

  const syntaxService = new SyntaxService(document, locationService);
  const legacyCorpusGraphMapper = new LegacyCorpusGraphMapper(syntaxService);

  const irabGraph = new IrabLoader().load();

  return {
    document,
    locationService,
    orthographyService,
    translationService,
    morphologyGraph,
    tokenTransformer,
    searchService,
    syntaxService,
    legacyCorpusGraphMapper,
    irabGraph
  };
}

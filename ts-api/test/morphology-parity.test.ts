import { describe, expect, test } from 'vitest';
import { buildContext } from '../src/app/context.js';
import { MorphologyWriter } from '../src/morphology/segmentation/morphology-writer.js';
import { readResourceLines } from '../src/utils/resource-reader.js';
import { getStem, isEmphasisNoonWithTanween, isSuffixElision } from '../src/morphology/morphology.js';
import { isDiptoteWithGenitiveFatha } from '../src/morphology/diptote.js';
import { Location } from '../src/orthography/location.js';

const context = buildContext();

describe('Morphology parity', () => {
  test('should round trip morphology from morphology.txt', () => {
    const lines = readResourceLines('/data/morphology.txt').filter((line) => line.length > 0);
    const writer = new MorphologyWriter();

    let index = 0;
    for (const chapter of context.document.children()) {
      for (const verse of chapter.verses) {
        for (const token of verse.tokens) {
          const segments = context.morphologyGraph.query(token);
          expect(writer.write(...segments)).toBe(lines[index]);
          index++;
        }
      }
    }
  });

  test('should match diptote, emphatic noon, and suffix elision counts', () => {
    let diptoteCount = 0;
    let emphaticNoonCount = 0;
    let suffixElisionCount = 0;

    for (const chapter of context.document.children()) {
      for (const verse of chapter.verses) {
        for (const token of verse.tokens) {
          const segments = context.morphologyGraph.query(token);
          if (isDiptoteWithGenitiveFatha(getStem(segments))) {
            diptoteCount++;
          }

          for (const segment of segments) {
            if (isEmphasisNoonWithTanween(segment)) {
              emphaticNoonCount++;
            }
            if (isSuffixElision(token, segment)) {
              suffixElisionCount++;
            }
          }
        }
      }
    }

    expect(diptoteCount).toBe(330);
    expect(emphaticNoonCount).toBe(2);
    expect(suffixElisionCount).toBe(225);
  });

  test('token translation parity sample', () => {
    const tokenLocation = new Location(82, 7, 3);
    const tokenSequenceNumber = context.locationService.getTokenSequenceNumber(tokenLocation);
    expect(context.translationService.getTokenTranslation(tokenSequenceNumber)).toBe('then fashioned you');
  });
});

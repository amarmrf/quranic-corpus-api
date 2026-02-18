import { readResourceLines } from '../utils/resource-reader.js';
import { IrabGraph } from './irab-graph.js';

export class IrabLoader {
  load(): IrabGraph {
    const lines = readResourceLines('/data/irab.tsv').filter((line) => line.length > 0);
    const irab: string[] = [];
    const tokenToAnalysis: number[] = [];

    let analysisSequenceNumber = 0;

    for (const line of lines) {
      const parts = line.split('\t');
      const tokenCount = Number.parseInt(parts[0] ?? '0', 10);
      const analysisText = (parts[1] ?? '').replace(/\\n/g, '\n');

      irab[analysisSequenceNumber] = analysisText;
      analysisSequenceNumber++;

      for (let i = 0; i < tokenCount; i++) {
        tokenToAnalysis.push(analysisSequenceNumber);
      }
    }

    return new IrabGraph(irab, tokenToAnalysis);
  }
}

export class IrabGraph {
  constructor(
    private readonly irab: string[],
    private readonly tokenToAnalysis: number[]
  ) {}

  query(tokenMin: number, tokenMax: number): string[] {
    const minAnalysis = this.tokenToAnalysis[tokenMin - 1];
    const maxAnalysis = this.tokenToAnalysis[tokenMax - 1];

    if (minAnalysis == null || maxAnalysis == null) {
      throw new Error('Analysis not found.');
    }

    return this.irab.slice(minAnalysis - 1, maxAnalysis);
  }
}

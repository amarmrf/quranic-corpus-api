export function hashLocation(chapterNumber: number, verseNumber: number, tokenNumber = 0): number {
  return chapterNumber * 1000000 + verseNumber * 1000 + tokenNumber;
}

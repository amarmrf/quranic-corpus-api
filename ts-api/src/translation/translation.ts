export type Translation = {
  key: string;
  name: string;
  verses: string[];
};

export function getVerse(translation: Translation, verseSequenceNumber: number): string {
  return translation.verses[verseSequenceNumber - 1] ?? '';
}

export type PauseMark =
  | 'compulsory'
  | 'not-permissible'
  | 'continuation-preferred'
  | 'pause-preferred'
  | 'permissible'
  | 'interchangeable';

export const PAUSE_MARKS: PauseMark[] = [
  'compulsory',
  'not-permissible',
  'continuation-preferred',
  'pause-preferred',
  'permissible',
  'interchangeable'
];

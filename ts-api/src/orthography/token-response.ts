import type { SegmentResponse } from '../morphology/segment-response.js';
import type { PauseMark } from './pause-mark.js';

export type TokenResponse = {
  location: number[];
  translation: string;
  phonetic: string;
  segments: SegmentResponse[];
  pauseMark: PauseMark | null;
};

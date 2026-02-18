import fs from 'node:fs';
import { resolveResourcePath } from './resource-path.js';

export function readResourceText(relativePath: string): string {
  return fs.readFileSync(resolveResourcePath(relativePath), 'utf8');
}

export function readResourceLines(relativePath: string): string[] {
  return readResourceText(relativePath).replace(/\r/g, '').split('\n');
}

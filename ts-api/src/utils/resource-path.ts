import fs from 'node:fs';
import path from 'node:path';

function getResourceRootCandidates(): string[] {
  const candidates: string[] = [];

  if (process.env.CORPUS_RESOURCE_ROOT != null && process.env.CORPUS_RESOURCE_ROOT.length > 0) {
    candidates.push(path.resolve(process.env.CORPUS_RESOURCE_ROOT));
  }

  candidates.push(path.resolve(process.cwd(), 'resources'));
  candidates.push(path.resolve(process.cwd(), 'dist/resources'));

  // Development fallbacks when running from ts-api workspace.
  candidates.push(path.resolve(process.cwd(), '../src/main/resources'));
  candidates.push(path.resolve(process.cwd(), 'src/main/resources'));
  candidates.push(path.resolve(process.cwd(), '../../src/main/resources'));

  return candidates;
}

export function resolveResourcePath(relativePath: string): string {
  const normalizedRelativePath = relativePath.replace(/^\//, '');

  for (const root of getResourceRootCandidates()) {
    const candidate = path.resolve(root, normalizedRelativePath);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Resource not found: ${relativePath}`);
}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/* Guards the Node 20 -> 24 migration (THE-99). Vercel disables Node 20 builds
 * on 2026-10-01; these assertions read the real files so a reintroduced Node
 * 20 pin fails CI instead of shipping silently. This repo has no Firebase
 * Functions runtime to check, so there is no third pin to keep in sync — just
 * the workflow and the root package.json. */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

describe('Node version pins', () => {
  it('no workflow pins Node 20', () => {
    const workflowsDir = path.join(repoRoot, '.github/workflows');
    const workflowFiles = fs.readdirSync(workflowsDir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
    expect(workflowFiles.length).toBeGreaterThan(0);

    for (const file of workflowFiles) {
      const contents = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
      const pins = contents.match(/node-version:\s*['"]?(\d+)['"]?/g) ?? [];
      for (const pin of pins) {
        expect(pin, `${file} pins an unexpected Node version: ${pin}`).not.toMatch(/\b20\b/);
      }
    }
  });

  it('the root package.json declares an engines.node of 24', () => {
    const pkg = readJson('package.json');
    expect(pkg.engines?.node).toBe('24.x');
  });

  it('no .nvmrc or .node-version reintroduces an older pin', () => {
    for (const file of ['.nvmrc', '.node-version']) {
      const fullPath = path.join(repoRoot, file);
      if (!fs.existsSync(fullPath)) continue;
      const version = parseInt(fs.readFileSync(fullPath, 'utf8').trim().replace(/^v/, ''), 10);
      expect(version, `${file} pins Node ${version}, older than the required 24`).toBeGreaterThanOrEqual(24);
    }
  });
});

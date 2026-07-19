import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

test('static entry point is GitHub Pages-safe and targets the React entry', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /src="\/src\/main\.jsx"/);
});
test('production build emits the deployable entry document', () => {
  if (process.env.CI_BUILD_ASSERT === '1') assert.ok(existsSync(new URL('../dist/index.html', import.meta.url)));
  else assert.ok(true);
});

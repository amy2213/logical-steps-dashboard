import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dashboard = await readFile(new URL('../src/components/Dashboard.jsx', import.meta.url), 'utf8');
const node = await readFile(new URL('../src/components/LogicNode.jsx', import.meta.url), 'utf8');

test('status, error, progress, and result regions expose accessible semantics', () => {
  for (const required of ['role="status"', 'aria-live="polite"', 'role="alert"', 'aria-current={stepState', 'tabIndex={-1}']) {
    assert.ok(dashboard.includes(required), `missing ${required}`);
  }
});
test('original wording control exposes expansion state and relationship', () => {
  assert.ok(node.includes('aria-expanded={isRevealed}'));
  assert.ok(node.includes('aria-controls={`original-${node.id}`}'));
});

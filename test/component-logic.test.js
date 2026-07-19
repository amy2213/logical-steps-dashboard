import test from 'node:test';
import assert from 'node:assert/strict';
import { collectDependencyClosure } from '../src/services/dependencyGraph.js';

test('focus mode includes the full transitive support chain', () => {
  const nodes = [
    { id: 'a', dependsOn: [] }, { id: 'b', dependsOn: ['a'] },
    { id: 'c', dependsOn: ['b'] }, { id: 'd', dependsOn: [] },
  ];
  assert.deepEqual([...collectDependencyClosure(nodes, 'c')].sort(), ['a', 'b', 'c']);
});
test('dependency traversal terminates safely on cycles', () => {
  const nodes = [{ id: 'a', dependsOn: ['b'] }, { id: 'b', dependsOn: ['a'] }];
  assert.deepEqual([...collectDependencyClosure(nodes, 'a')].sort(), ['a', 'b']);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, pipelineReducer, STATUS } from '../src/state/pipelineReducer.js';
const analysis = { nodes: [{ id: 'n1' }] };

test('stale request actions are ignored', () => {
  const working = pipelineReducer(initialState, { type: 'SUBMIT', text: 'x', requestId: 'new' });
  assert.equal(pipelineReducer(working, { type: 'RESOLVE', requestId: 'old', analysis }), working);
});
test('view state is guarded and focus mode is reducer-owned', () => {
  assert.equal(pipelineReducer(initialState, { type: 'SET_FOCUS_MODE', enabled: true }), initialState);
  const working = pipelineReducer(initialState, { type: 'SUBMIT', text: 'x', requestId: 'r' });
  const ready = pipelineReducer(working, { type: 'RESOLVE', requestId: 'r', analysis });
  assert.equal(ready.status, STATUS.READY);
  assert.equal(pipelineReducer(ready, { type: 'SET_FOCUS_MODE', enabled: true }).focusMode, true);
});

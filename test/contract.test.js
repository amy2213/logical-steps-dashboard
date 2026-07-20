import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES, validateAnalysis, AnalysisValidationError } from '../src/services/analysisContract.js';

const valid = { id: 'a', sourceText: 'Source', gist: 'The author argues that the policy should be adopted because it improves retention.', meta: { model: 'test' }, nodes: [
  { id: 'n1', role: ROLES.PREMISE, plain: 'Retention improved after the policy began.', original: 'Retention improved.', dependsOn: [] },
  { id: 'n2', role: ROLES.CONCLUSION, conclusionType: 'primary', plain: 'The policy should be adopted.', original: 'Adopt the policy.', dependsOn: ['n1'], connective: 'therefore' },
] };

test('runtime contract accepts valid analysis', () => assert.equal(validateAnalysis(valid), valid));
test('runtime contract rejects duplicate and dangling IDs', () => {
  const invalid = { ...valid, nodes: [valid.nodes[0], { ...valid.nodes[1], id: 'n1', dependsOn: ['missing'] }] };
  assert.throws(() => validateAnalysis(invalid), AnalysisValidationError);
});
test('runtime contract rejects unknown roles and confidence outside 0..1', () => {
  assert.throws(() => validateAnalysis({ ...valid, nodes: [{ ...valid.nodes[0], role: 'mystery', confidence: 2 }] }), /unknown/);
});

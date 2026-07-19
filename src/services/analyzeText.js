/**
 * analyzeText.js
 * --------------
 * Backend seam for the multi-stage analysis pipeline.
 * Every asynchronous wait is abort-aware, including cancellation during the
 * final stage, so a stopped request can never resolve successfully afterward.
 */

import { ROLES, validateAnalysis } from './analysisContract.js';

export const STAGES = [
  { id: 'normalize', label: 'Breaking the text apart' },
  { id: 'translate', label: 'Rewriting it conversationally' },
  { id: 'map', label: 'Finding the logic' },
];

function abortError() {
  return new DOMException('Cancelled', 'AbortError');
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw signal.reason ?? abortError();
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    throwIfAborted(signal);

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(signal.reason ?? abortError());
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * @param {string} sourceText
 * @param {Object} options
 * @param {(stageId: string) => void} [options.onStage]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<import('./analysisContract.js').Analysis>}
 */
export async function analyzeText(sourceText, { onStage, signal } = {}) {
  const started = Date.now();

  for (const stage of STAGES) {
    throwIfAborted(signal);
    onStage?.(stage.id);
    await wait(600, signal);
  }

  // Protect the boundary immediately before producing the result as well.
  throwIfAborted(signal);

  const result = {
    id: crypto.randomUUID(),
    sourceText,
    gist: 'The author says the new policy will work, but only if people actually read the emails about it.',
    nodes: [
      {
        id: 'n1',
        role: ROLES.CONTEXT,
        plain: 'The company changed how time off gets approved.',
        original: sourceText.slice(0, 90),
        dependsOn: [],
      },
      {
        id: 'n2',
        role: ROLES.PREMISE,
        plain: 'Every request now goes through one manager instead of three.',
        original: sourceText.slice(0, 60),
        connective: 'because',
        dependsOn: ['n1'],
      },
      {
        id: 'n3',
        role: ROLES.PREMISE,
        plain: 'Fewer approvals means fewer places a request can get stuck.',
        original: sourceText.slice(0, 60),
        connective: 'because',
        dependsOn: ['n1'],
      },
      {
        id: 'n4',
        role: ROLES.CONCLUSION,
        plain: 'So requests will be approved faster than before.',
        original: sourceText.slice(0, 60),
        connective: 'therefore',
        dependsOn: ['n2', 'n3'],
      },
      {
        id: 'n5',
        role: ROLES.ASSUMPTION,
        plain: 'That one manager can handle triple the workload without slowing down.',
        original: '',
        connective: 'unless',
        dependsOn: ['n4'],
        confidence: 0.82,
      },
    ],
    meta: { model: 'mock-0', elapsedMs: Date.now() - started, stageTimings: {} },
  };

  return validateAnalysis(result);
}

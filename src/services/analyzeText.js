/**
 * Backend seam for the multi-stage analysis pipeline.
 * The browser calls the Cloudflare Worker only. The OpenRouter key never enters
 * this bundle or any browser-visible environment variable.
 */

import { validateAnalysis } from './analysisContract.js';

export const STAGES = [
  { id: 'normalize', label: 'Breaking the text apart' },
  { id: 'translate', label: 'Rewriting it conversationally' },
  { id: 'map', label: 'Finding the logic' },
];

const DEFAULT_API_BASE_URL =
  'https://logical-steps-api.logicalstepsdash.workers.dev';

function abortError() {
  return new DOMException('Cancelled', 'AbortError');
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw signal.reason ?? abortError();
}

function apiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return (configured || DEFAULT_API_BASE_URL).replace(/\/$/, '');
}

function scheduleStage(onStage, stageId, delay, signal) {
  const timer = setTimeout(() => {
    if (!signal?.aborted) onStage?.(stageId);
  }, delay);

  signal?.addEventListener('abort', () => clearTimeout(timer), { once: true });
  return timer;
}

/**
 * @param {string} sourceText
 * @param {Object} options
 * @param {(stageId: string) => void} [options.onStage]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<import('./analysisContract.js').Analysis>}
 */
export async function analyzeText(sourceText, { onStage, signal } = {}) {
  throwIfAborted(signal);
  onStage?.('normalize');

  const stageTimers = [
    scheduleStage(onStage, 'translate', 350, signal),
    scheduleStage(onStage, 'map', 900, signal),
  ];

  try {
    const response = await fetch(`${apiBaseUrl()}/v1/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sourceText }),
      signal,
    });

    throwIfAborted(signal);

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error('The analysis service returned unreadable data.');
    }

    if (!response.ok) {
      const message = payload?.error?.message;
      throw new Error(
        typeof message === 'string' && message.trim()
          ? message
          : 'The analysis service could not complete this request.',
      );
    }

    onStage?.('map');
    return validateAnalysis(payload);
  } finally {
    stageTimers.forEach(clearTimeout);
  }
}

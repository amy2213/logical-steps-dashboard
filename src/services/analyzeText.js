/** Browser seam for the Cloudflare Worker. */
import { validateAnalysis } from './analysisContract.js';

export const STAGES = [{ id: 'analyze', label: 'Mapping the argument' }];
const DEFAULT_API_BASE_URL = 'https://logical-steps-api.logicalstepsdash.workers.dev';

function apiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return (configured || DEFAULT_API_BASE_URL).replace(/\/$/, '');
}

export class AnalysisServiceError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'AnalysisServiceError';
    this.code = code;
    this.status = status;
  }
}

export async function analyzeText(sourceText, { onStage, signal } = {}) {
  if (signal?.aborted) throw signal.reason ?? new DOMException('Cancelled', 'AbortError');
  onStage?.('analyze');
  let response;
  try {
    response = await fetch(`${apiBaseUrl()}/v1/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sourceText }),
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new AnalysisServiceError('Logical Steps could not reach the analysis service. Check your connection and try again.', 'NETWORK_ERROR', 0);
  }

  let payload;
  try { payload = await response.json(); }
  catch { throw new AnalysisServiceError('The analysis service returned unreadable data.', 'INVALID_RESPONSE', response.status); }

  if (!response.ok) {
    throw new AnalysisServiceError(
      typeof payload?.error?.message === 'string' && payload.error.message.trim()
        ? payload.error.message
        : 'The analysis service could not complete this request.',
      payload?.error?.code || 'REQUEST_FAILED',
      response.status,
    );
  }
  return validateAnalysis(payload);
}

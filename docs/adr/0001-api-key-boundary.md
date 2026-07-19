# ADR 0001: Keep model-provider credentials behind a server-side gateway

- **Status:** Accepted
- **Date:** July 19, 2026

## Context

The frontend is deployed as a static React application on GitHub Pages. Static browser applications cannot keep provider API credentials confidential. Logical Steps Dashboard needs to call OpenRouter without exposing the project credential or allowing the browser to control provider-level parameters.

## Decision

Use GitHub Pages for the frontend and a Cloudflare Worker for the Logical Steps API. Store `OPENROUTER_API_KEY` as a Worker secret. The browser calls the Worker, and only the Worker calls OpenRouter.

## Consequences

### Positive

- The provider credential is never shipped to the browser.
- Provider and model changes do not require UI changes.
- The Worker can enforce input validation, quotas, rate limits, privacy controls, error mapping, and cost limits.
- The public API can preserve the versioned analysis contract.

### Negative

- The project gains a second deployment target.
- CORS, monitoring, abuse prevention, and backend testing become required operational responsibilities.
- A public unauthenticated endpoint can still be abused and therefore requires rate and cost controls.

## Rejected alternatives

- Direct OpenRouter calls from React.
- Build-time injection through GitHub Actions secrets.
- Obfuscating or encrypting a browser key.
- Treating the Worker URL or CORS as authentication.

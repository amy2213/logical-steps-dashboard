# Logical Steps Dashboard: API and Secret-Management Architecture

**Status:** Approved and locked  
**Version:** 1.0  
**Effective date:** July 19, 2026  
**Applies to:** GitHub Pages frontend, analysis API, OpenRouter integration

## Decision

Logical Steps Dashboard will use a split deployment:

```text
Browser
  |
  | HTTPS, no provider credential
  v
GitHub Pages static React application
  |
  | POST /v1/analyze
  v
Cloudflare Worker API gateway
  |
  | Authorization: Bearer <server-side secret>
  v
OpenRouter API
```

The React application will never call OpenRouter directly and will never contain an OpenRouter API key.

The initial backend deployment target is **Cloudflare Workers**. The frontend remains on GitHub Pages. The frontend may know the Worker URL because an API base URL is configuration, not a secret.

## Immediate security action

An OpenRouter key was supplied in a project document in plain text. That key must be treated as compromised.

Required response:

1. Revoke or delete the exposed key in OpenRouter.
2. Create a replacement key with a descriptive project-specific name.
3. Apply the lowest practical credit or usage limit.
4. Store the replacement only as a Cloudflare Worker secret.
5. Search the repository and Git history before publishing.
6. Never copy the replacement into chat, source files, screenshots, tickets, or documentation.

Rotating the key is mandatory even if the document was never committed. Once a credential has been copied into an uncontrolled artifact, its confidentiality cannot be proven.

## Why GitHub Pages cannot hide a key

GitHub Pages serves static files to the browser. Every JavaScript bundle, source map, environment value injected during build, request header, and network call is observable by the person using the browser.

These approaches are prohibited:

- Hardcoding the key in JavaScript.
- Putting the key in `VITE_*`, `REACT_APP_*`, or other frontend environment variables.
- Injecting the key with GitHub Actions during the frontend build.
- Storing the key in `localStorage`, IndexedDB, cookies, or browser extensions.
- Encoding, encrypting, splitting, or obfuscating the key in the bundle.
- Relying on CORS, minification, or a hidden repository to protect a browser-delivered key.

A GitHub Actions secret protects a value while the workflow runs. It does not protect a value that the workflow writes into a public static bundle.

## Secret storage

### Production

Store the OpenRouter key as a Cloudflare Worker secret named:

```text
OPENROUTER_API_KEY
```

Set it using the Cloudflare dashboard or Wrangler:

```bash
npx wrangler secret put OPENROUTER_API_KEY
```

The value must not appear in `wrangler.jsonc`, source control, CI logs, or deployment output.

### Local backend development

Use an ignored `.dev.vars` file inside the Worker project:

```text
OPENROUTER_API_KEY=replace-with-a-local-development-key
```

Commit only `.dev.vars.example`, containing the variable name and no credential.

### Frontend configuration

The frontend may use:

```text
VITE_API_BASE_URL=https://api.example.workers.dev
```

This value is public by design. It is the address of the API gateway, not an authorization secret.

## API boundary

The frontend communicates only with the Logical Steps API. OpenRouter request formats, model names, routing preferences, and credentials remain backend concerns.

### Initial endpoint

```http
POST /v1/analyze
Content-Type: application/json
```

### Request

```json
{
  "schemaVersion": "1.0",
  "requestId": "client-generated-uuid",
  "sourceText": "Text to analyze",
  "options": {
    "detailLevel": "standard"
  }
}
```

### Successful response

```json
{
  "schemaVersion": "1.0",
  "requestId": "client-generated-uuid",
  "analysisId": "server-generated-id",
  "sourceHash": "sha256-value",
  "sourceText": "Text to analyze",
  "nodes": [],
  "relationships": [],
  "summary": {},
  "warnings": []
}
```

The response must pass the versioned runtime contract before the frontend renders it.

### Error response

```json
{
  "error": {
    "code": "UPSTREAM_RATE_LIMITED",
    "message": "Analysis is temporarily unavailable.",
    "retryable": true,
    "requestId": "client-generated-uuid"
  }
}
```

The frontend must not receive raw provider errors, provider request IDs containing sensitive metadata, stack traces, prompts, or credentials.

## OpenRouter integration

The Worker will call:

```text
https://openrouter.ai/api/v1/chat/completions
```

Required server-side header:

```http
Authorization: Bearer <OPENROUTER_API_KEY>
```

Approved attribution headers:

```http
HTTP-Referer: <public Logical Steps Dashboard URL>
X-OpenRouter-Title: Logical Steps Dashboard
```

The provider model identifier is backend configuration. It must not be hardcoded into UI components or treated as part of the public analysis contract.

## Minimum Worker controls

The first production Worker must implement:

- Exact CORS allowlist for the production GitHub Pages origin and approved local development origins.
- `OPTIONS` preflight handling.
- `POST`-only analysis route.
- Maximum request body size.
- Maximum source-text length.
- JSON content-type enforcement.
- Runtime request validation.
- Request timeout and upstream cancellation.
- Rate limiting by a privacy-conscious abuse key.
- Daily and per-request cost controls.
- Generic client-facing errors.
- Structured logs that omit source text and credentials by default.
- Upstream retry handling limited to safe, retryable conditions.
- Request ID propagation.

CORS is not authentication. It reduces accidental cross-origin use but does not prevent direct calls to the public Worker endpoint.

## Abuse and cost strategy

The first public version is an unauthenticated service and must assume hostile automation.

Required controls:

1. OpenRouter key-level spending limit.
2. Worker-side rate limit.
3. Maximum input length and maximum generated tokens.
4. Model allowlist controlled by the Worker.
5. No arbitrary model selection from the browser.
6. No arbitrary system prompt or provider parameters from the browser.
7. Failure-closed behavior when validation or cost controls fail.
8. Usage monitoring and a kill switch.

Before broad public access, add one of:

- Application authentication with per-user quotas.
- A limited-access beta allowlist.
- A proof-of-human or challenge mechanism combined with server-side limits.

A hidden API URL is not a security control.

## Privacy rules

User text may contain workplace, academic, legal-style, medical, or personal information.

Until a formal retention policy is approved:

- Do not persist source text on the Worker.
- Do not include source text in application logs.
- Do not include full source text in error monitoring.
- Do not cache analysis requests or responses at the gateway.
- Document that text is sent to an external model provider for processing.
- Do not claim zero retention or provider privacy guarantees without verifying the active provider configuration and terms.

## Repository controls

Required ignored files and patterns:

```text
.env
.env.*
!.env.example
.dev.vars
.dev.vars.*
!.dev.vars.example
*.pem
*.key
```

Before every release:

```bash
git grep -n -I -E 'sk-or-v1-|OPENROUTER_API_KEY\s*=|Authorization:\s*Bearer'
```

Review all matches. Placeholder documentation is permitted; real credentials are not.

Enable GitHub secret scanning where available. If a real key is ever committed, deleting it in the latest commit is insufficient. Revoke it immediately and remove it from history as a separate incident-response task.

## Delivery sequence

API implementation is inserted between Phase 1 and Phase 2 as a required enabling workstream:

1. Rotate the exposed key.
2. Scaffold `services/analyzer` as a Cloudflare Worker.
3. Add request and response schemas.
4. Add secret bindings and local secret examples.
5. Implement CORS, input limits, timeouts, error mapping, and rate limiting.
6. Add a mocked upstream adapter.
7. Add Worker integration tests.
8. Connect the GitHub Pages frontend to the Worker URL.
9. Replace the mocked adapter with OpenRouter.
10. Run benchmark and cost tests before public release.

## Non-decisions

The following remain deliberately open until benchmark evidence exists:

- Final model or model sequence.
- Prompt design.
- Streaming versus non-streaming responses.
- Authentication provider.
- Persistent storage provider.
- Paid versus free Worker plan.

These choices must not change the frontend contract or weaken the secret boundary.

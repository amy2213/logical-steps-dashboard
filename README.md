# Logical Steps

Logical Steps turns dense writing into a clear map of what the text says and how its ideas connect.

Paste an argument, policy paragraph, technical explanation, email, or other difficult text. Logical Steps rewrites the main ideas in plain language and separates them into cards for background, stated reasons, counterpoints, conclusions, and unstated assumptions.

**Live app:** https://amy2213.github.io/logical-steps-dashboard/

## What it does

- Produces a one-sentence plain-language overview.
- Distinguishes arguments from explanations and reports.
- Maps background, stated reasons, counterpoints, conclusions, and intermediate conclusions.
- Identifies necessary unstated assumptions when an argument contains a logical gap.
- Preserves access to the original wording behind each rewritten card.
- Provides a focus mode that dims everything outside the selected support chain.

Logical Steps does not force every passage into an argument. Explanatory text can be mapped as facts, requirements, outcomes, and constraints without inventing a main conclusion.

## Why it exists

Dense writing often hides its structure inside long sentences, technical vocabulary, qualifications, and implied reasoning. Logical Steps makes that structure visible one idea at a time.

The interface is designed to reduce reading and working-memory load. Role labels are written as text rather than communicated by colour alone, source wording stays collapsed until requested, motion is limited, and keyboard and screen-reader behavior are treated as product requirements rather than decorative compliance.

## How the analysis works

The API first creates a structured map of the source text. For argumentative passages that contain no detected assumption, a second targeted pass looks only for necessary unstated bridges between the stated reasons and conclusions.

The second pass may return no assumptions when the reasoning is already explicit. Accepted assumptions must be high-confidence, must not repeat existing nodes, and never claim to be quoted source wording.

Model output is normalized and validated before it reaches the interface. Recoverable metadata errors are corrected, while malformed structures such as duplicate IDs and missing dependency references are rejected.

## Technology

- React and Vite frontend
- Cloudflare Worker API
- OpenRouter model access
- Cloudflare Durable Object rate limiting
- GitHub Pages deployment
- Runtime response validation
- Node test suite and GitHub Actions checks

The model-provider API key is stored only as a Worker secret. It is never included in the browser bundle.

## Run locally

```bash
npm ci
npm run dev
```

The development server runs at `http://localhost:5173`.

Create a production build and run the automated checks with:

```bash
npm run check
```

The frontend uses the live Logical Steps API by default. To use another API deployment, provide `VITE_API_BASE_URL` when building or running the app.

## Project structure

```text
src/
├── App.jsx
├── components/
├── services/
│   ├── analysisContract.js
│   └── analyzeText.js
├── state/
└── styles/

test/
└── contract and interface regression tests
```

The Cloudflare Worker is maintained in the separate `logical-steps-api` repository.

## Current limitations

Logical Steps uses a language model, so results can be incomplete or mistaken. Users should compare important interpretations with the original text. Inferred assumptions are analytical suggestions, not statements made by the source author.

The current product does not provide accounts, saved analyses, collaborative workspaces, or exports. It is not a substitute for professional legal, medical, financial, or academic advice.

## Product principles

- One card represents one idea.
- Plain language appears before source wording.
- Logical roles are communicated with labels, position, and visual treatment.
- Users can inspect the support chain without losing the rest of the map.
- Explanations are not forced into persuasive structures.
- Recoverable model quirks should not discard an otherwise useful map.

## Status

Logical Steps is an early public prototype under active testing. Feedback from people who regularly struggle with dense documents, especially ADHD, autistic, dyslexic, and other neurodivergent readers, is particularly valuable.

## Documentation

Product decisions and acceptance criteria are recorded in [`docs/PRODUCT_SOURCE_OF_TRUTH.md`](docs/PRODUCT_SOURCE_OF_TRUTH.md).

API deployment and secret-handling rules are documented in [`docs/API_SECURITY_ARCHITECTURE.md`](docs/API_SECURITY_ARCHITECTURE.md).

## License

No open-source license has been selected yet. Unless a license is added, all rights remain reserved.
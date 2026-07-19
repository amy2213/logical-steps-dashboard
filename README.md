# Loophole — scaffold

A reading prosthetic. Paste dense text, get its argument broken into one-idea
cards: background → other side → given reasons → the point → unstated leaps.

## Product source of truth

Product direction, scope, canonical data-model decisions, roadmap, acceptance
criteria, and change-control rules are governed by
[`docs/PRODUCT_SOURCE_OF_TRUTH.md`](docs/PRODUCT_SOURCE_OF_TRUTH.md).

When another project artifact or conversation conflicts with that document, the
source-of-truth document governs until it is deliberately amended.


API deployment and secret handling are governed by
[`docs/API_SECURITY_ARCHITECTURE.md`](docs/API_SECURITY_ARCHITECTURE.md). The
frontend must never contain a model-provider API key. GitHub Pages calls the
Logical Steps API gateway; the gateway alone calls OpenRouter.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run deploy   # gh-pages -d dist
```

`vite.config.js` sets `base: './'`, so the build works from a GitHub Pages
project subpath (`user.github.io/repo/`) with no path rewriting. For a user or
org page, nothing changes. For CI, use `actions/deploy-pages` against `dist/`.

## Architecture

```
src/
├── App.jsx                     state owner; nothing else
├── main.jsx
├── state/
│   └── pipelineReducer.js      5 states, explicit transitions
├── services/
│   ├── analysisContract.js     THE data shape + role vocabulary
│   └── analyzeText.js          backend seam (mock today, fetch tomorrow)
├── components/
│   ├── Dashboard.jsx           layout shell, stage rail, error + gist
│   ├── TextIntake.jsx          autofocused field, one button
│   ├── LogicMap.jsx            grouping, ordering, focus mode
│   └── LogicNode.jsx           one card = one idea
└── styles/
    ├── tokens.css              every colour/size/duration
    └── app.css                 layout; reads tokens only
```

## Swapping in the real backend

Replace the body of `analyzeText()` with fetch calls. Keep the signature and the
`onStage` callback. Return an object matching `Analysis` in
`analysisContract.js`. No component changes are needed — that is the point of
the contract file.

Planned stages (already reflected in `STAGES`):

1. `normalize` — strip formatting, split into clauses (small model)
2. `translate` — rewrite each clause conversationally (mid model)
3. `map` — label roles, infer unstated assumptions (large model)

If the real pipeline gains or loses a stage, edit `STAGES` and the progress rail
follows automatically.

## Design constraints, and why

- **Fixed layout across states.** The intake never moves. Nothing reflows under
  the cursor between idle, working and ready.
- **Fixed card order, always.** Role order is identical for every text, so
  "where am I" is never held in working memory.
- **Rewrite first, original hidden.** Two versions of the same sentence side by
  side doubles the reading load. Original is one click away, closed by default.
- **Role signalled three ways** — colour, written label, position. Never colour
  alone.
- **Named stages, not a spinner.** Waiting is tolerable when you can see what
  is happening.
- **A visible way out at every step.** Stop while working, start over when done.
- **Motion only on user action**, ≤120ms, and zero under
  `prefers-reduced-motion`.

## Where the boldness went

One signature element: the **connective spine**. A hairline rail runs down the
left of the map with the logical joints — `because`, `therefore`, `unless` —
pinned to it in mono. Reading only those words top to bottom gives you the
argument's skeleton without reading a single card. Everything else stays quiet
so the spine is the thing you remember.

Palette is deliberately cool paper rather than warm cream, with five
low-saturation role inks and no pure black or white — glare is a stimulation
problem, not an accessibility win. Body text holds ≥7:1 contrast.

## Not built yet

- Persistence (`localStorage` draft recovery)
- Node-level "explain this differently" re-prompt
- Export to plain text / print stylesheet
- Streaming partial nodes as the map stage returns them

## Quality gates

- `npm ci` installs the committed dependency graph reproducibly.
- `npm run check` creates a production build, then runs contract, reducer, dependency-graph, accessibility-markup, and static deployment smoke tests.
- `.github/workflows/ci.yml` runs the same checks for pushes and pull requests.
- Analysis JSON is validated at runtime before UI rendering.
- Completion and error states move keyboard focus to their headings and expose live status updates to assistive technology.

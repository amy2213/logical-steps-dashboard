# Logical Steps Dashboard: Product Source of Truth

**Status:** Approved direction  
**Version:** 1.1  
**Effective date:** July 19, 2026  
**Owner:** Logical Steps Dashboard project  

## Authority and change control

This document is the canonical source for product direction, scope, architecture priorities, sequencing, and decision criteria for Logical Steps Dashboard.

When another project artifact, backlog item, prompt, mockup, or conversation conflicts with this document, this document governs unless it is deliberately amended. Chat history is supporting context, not an authoritative specification.

Changes to this source of truth must:

1. State the proposed decision and the problem it solves.
2. Identify affected product, schema, evaluation, UX, and technical assumptions.
3. Record meaningful risks and rejected alternatives.
4. Update the version and effective date.
5. Update dependent requirements, tests, and roadmap items in the same change.

## Product definition

Logical Steps Dashboard is a cognitive parsing tool that converts dense reasoning into a stable, inspectable logical structure.

It helps users understand what a passage is claiming, how its claims fit together, what is explicit, what is inferred, and where uncertainty remains. Plain-language translation supports that job but is not the product by itself.

### Primary job to be done

> Help me understand what this text is actually claiming and how the claims fit together.

### Initial target users

The first target users are professionals and students who regularly process dense argumentative text and benefit from reduced working-memory demands, predictable presentation, and inspectable reasoning.

The product is designed to support neurodivergent users, particularly people with ADHD and autistic users, without treating either group as a single fixed interaction profile.

### Initial use cases

- Dense workplace communication
- Academic and argumentative passages
- Policies and procedural documents
- Opinion and analysis writing
- Technical or product documentation
- Material that contains qualifications, objections, exceptions, or implied assumptions

Medical diagnosis, legal advice, factual verification, and authoritative decision-making are not initial product claims.

## Product principles

### 1. Structure before simplification

The system must identify claims and relationships before rewriting them. A fluent simplification with incorrect logic is a product failure.

### 2. Inspectability before confidence

Users must be able to trace each extracted idea to the source text, see why it received its role, and distinguish explicit content from inference.

### 3. Stable presentation before visual novelty

The interface must remain predictable, low-stimulation, and resistant to layout shifts. New capabilities should appear through progressive disclosure rather than dashboard accumulation.

### 4. Calibrated uncertainty before false authority

The product must expose ambiguity and uncertainty rather than presenting one model interpretation as objective truth.

### 5. User correction before behavioral personalization

The system should first allow users to correct structure and meaning. Personalization should be based on observable preferences such as density, detail, language, and presentation, not broad diagnostic stereotypes.

### 6. Evaluation before expansion

No analytical feature is complete until it has benchmark examples, measurable acceptance criteria, failure categories, automated validation, and an accessible user experience.

## Product boundaries

The product must not imply that:

- Its analysis is objectively correct.
- An inferred assumption appeared explicitly in the source.
- Simplified text is a complete substitute for the source.
- Valid logical form proves factual truth.
- Model confidence establishes external factual accuracy.
- The tool is providing medical, legal, financial, or other professional advice.

Logic analysis and fact verification are separate capabilities. They may eventually be connected, but they must never be blended invisibly.

## Canonical analysis model

The analysis contract is the load-bearing boundary between the user interface and any analysis implementation.

### Required top-level structure

```js
{
  schemaVersion: "1.0",
  analysisId: "analysis-...",
  sourceHash: "...",
  sourceText: "...",
  nodes: [],
  relationships: [],
  summary: {},
  warnings: []
}
```

### Canonical node shape

```js
{
  id: "node-7",
  type: "claim",
  subtype: "main_conclusion",
  text: "...",
  simplifiedText: "...",
  sourceSpan: {
    start: 144,
    end: 221
  },
  confidence: 0.91,
  inferred: false,
  explanation: "This is the primary claim supported by the passage."
}
```

### Initial node classifications

- Background context
- Definition
- Explicit premise
- Intermediate conclusion
- Main conclusion
- Objection or competing position
- Qualification
- Exception
- Recommendation
- Unstated assumption
- Uncertainty or unresolved ambiguity

The vocabulary may evolve, but all changes require schema versioning, migration planning, validation updates, benchmark updates, and user-interface review.

### Canonical relationship shape

Relationships must be represented as explicit edges rather than being buried only in node fields.

```js
{
  id: "edge-4",
  from: "node-2",
  to: "node-6",
  type: "supports",
  confidence: 0.88,
  inferred: true
}
```

### Initial relationship types

- `supports`
- `contradicts`
- `qualifies`
- `defines`
- `causes`
- `exemplifies`
- `depends_on`
- `responds_to`

Each node and relationship must identify whether it is explicit or inferred and must carry calibrated confidence where a model generated the judgment.

## Analysis pipeline

The production pipeline should be staged, narrow, observable, and independently testable.

```text
Raw text
  ↓
Normalization and segmentation
  ↓
Atomic claim extraction
  ↓
Role classification
  ↓
Relationship mapping
  ↓
Assumption inference
  ↓
Plain-language translation
  ↓
Validation and confidence scoring
  ↓
User interface response
```

### Pipeline requirements

- Each stage must have a defined input and output contract.
- Failures must be attributable to a specific stage.
- Inferred content must never be presented as source text.
- The final response must pass runtime schema validation.
- Cancellation, retries, timeouts, and stale-response protection are required.
- The frontend must remain independent of the model or models used.

A single giant prompt is not the preferred production architecture because it obscures failure origin, weakens evaluation, and makes correction expensive.

## User experience direction

### Default view

The default experience should show only the information needed to establish orientation:

- Main conclusion or primary point
- Supporting reasons
- Important assumptions
- Plain-language gist

### Expanded view

Progressive disclosure may reveal:

- Full logical map
- Source-text highlighting
- Confidence indicators
- Objections and qualifications
- Missing information
- Alternative interpretations

### Advanced view

Advanced controls may include:

- Relationship editing
- Claim split and merge actions
- Model diagnostics
- Export options
- Comparison between interpretations

### Bidirectional traceability

Selecting a node should:

- Highlight its source span.
- Explain its assigned role.
- Show what supports it.
- Show what it supports.
- Mark it as explicit or inferred.

Selecting source text should:

- Reveal related nodes.
- Allow users to flag a misinterpretation.
- Allow claim splitting or merging.
- Allow role and relationship correction.

### Correction workflow

Users should be able to state that:

- A node is not the conclusion.
- Two nodes represent one idea.
- One node contains multiple ideas.
- An assumption is unsupported.
- A sentence is background rather than evidence.
- An exception, qualification, or contradiction was missed.

Corrections should be captured in a structured form suitable for evaluation and future model improvement, subject to privacy and consent requirements.

### Preference-based personalization

Initial preference controls may include:

- Concise or detailed explanations
- Visual or text-first presentation
- Formal or conversational language
- Amount of original text shown
- Whether assumptions appear by default
- Whether connective labels are shown
- Visual density
- Motion reduction
- Example-based explanations

Diagnostic labels must not be used as simplistic UI presets.

## Evaluation strategy

Evaluation is a first-class product workstream, not a final QA step.

### Benchmark corpus

The initial benchmark should contain human-reviewed examples from:

- News and opinion writing
- Workplace email
- Policy documents
- Academic passages
- Legal-style reasoning without providing legal advice
- Medical instructions without providing medical advice
- Product and technical documentation
- Ambiguous arguments
- Poorly written text
- Contradictory text
- Text containing no meaningful argument

### Required evaluation dimensions

- Atomic claim extraction accuracy
- Main conclusion accuracy
- Premise classification accuracy
- Relationship accuracy
- Assumption quality
- Source-span accuracy
- Simplification faithfulness
- Hallucination rate
- Qualification preservation
- Confidence calibration

### Required failure categories

- Invented explicit claim
- Lost qualification
- Incorrect conclusion
- Reversed support relationship
- Overstated certainty
- Meaning changed by simplification
- Missed contradiction
- Invalid source span
- Unsupported assumption
- Argument inferred where none exists

### Initial acceptance targets

These are directional targets and must be revised from benchmark evidence rather than treated as decorative numerology:

- Zero fabricated explicit claims in accepted output
- At least 95% valid source spans
- At least 90% main conclusion accuracy on the approved benchmark
- At least 85% correct premise and relationship classification
- All inferred content visibly labeled
- No simplification may remove a material qualifier

A release may tighten these thresholds. It may not silently weaken them.

## Technical direction

### Repository structure

The project should evolve toward clear separation between application, analysis service, shared contract, and evaluation assets.

```text
apps/
  web/
services/
  analyzer/
packages/
  analysis-contract/
  evaluation/
  shared-types/
```

This may remain one repository. The important boundary is architectural, not ceremonial folder multiplication.

### Required technical controls

- Versioned schemas
- Runtime contract validation
- Stable frontend service boundary
- Request IDs and stale-response rejection
- True cancellation
- Reproducible dependency installation
- Automated build and test gates
- Accessibility checks
- Evaluation regression tests
- Structured logging without storing sensitive source text by default

### Persistence sequence

Persistence should be introduced in this order:

1. Local draft recovery
2. Local saved analyses
3. Export to Markdown, JSON, and print-friendly formats
4. Optional account-backed history
5. Shareable read-only analyses with explicit privacy controls

Accounts are not an early prerequisite.


## Locked deployment and API boundary

The five roadmap phases are approved and may be changed only through the change-control process in this document. Phase names, order, and exit conditions are the governing delivery sequence.

The frontend remains a static React application hosted on GitHub Pages. All model-provider calls must cross a server-side Logical Steps API gateway. The approved initial gateway is a Cloudflare Worker. No model-provider credential may be delivered to the browser, injected into the frontend build, or stored in client-side persistence.

The complete API, secret-management, abuse-control, and privacy decision is governed by [`API_SECURITY_ARCHITECTURE.md`](API_SECURITY_ARCHITECTURE.md) and ADR 0001. API gateway implementation is a required enabling workstream before the real backend pipeline in Phase 2.

## Roadmap

### Phase 1: Analytical foundation

Build:

- Expanded, versioned schema
- Source-span mapping
- Explicit relationship objects
- Runtime validation
- Benchmark dataset
- Evaluation harness
- Updated mock analysis responses

Exit condition:

> The system can analyze 50 to 100 curated passages with measurable, reviewable accuracy.

### Phase 2: Real backend pipeline

Build:

- Text segmentation
- Claim extraction
- Role classification
- Relationship mapping
- Assumption detection
- Plain-language translation
- Confidence calibration
- Retry and fallback handling

Exit condition:

> Analysis errors can be traced to a specific stage, and output meets approved benchmark thresholds.

### Phase 3: Inspectable user experience

Build:

- Source-to-node highlighting
- Node-to-source highlighting
- Full dependency-chain navigation
- Explicit versus inferred labels
- Confidence and ambiguity display
- User correction controls

Exit condition:

> A user can verify and correct an analysis without reading raw JSON or restarting the workflow.

### Phase 4: Persistence and workflow

Build:

- Draft recovery
- Saved analyses
- History
- Export
- Shareable read-only links
- Optional accounts

Exit condition:

> Users can resume work and use the product as part of a recurring process.

### Phase 5: Personalization and task modes

Build preference-based controls and task-specific modes such as:

- Understand this
- Evaluate this argument
- Find what is missing
- Turn this into actions
- Compare two positions
- Prepare a response

Exit condition:

> Personalization improves comprehension without changing the underlying factual or logical structure.

## Immediate next sprint

### Objective

Create the first production-grade analysis contract and evaluation foundation.

### Deliverables

- `analysisContractV2`
- Explicit node and relationship schemas
- Source-span support
- Schema versioning
- Runtime validation and validation tests
- Twenty-five hand-labeled benchmark passages
- Evaluation result format
- Updated mock responses
- UI support for explicit versus inferred nodes
- Source-highlighting prototype

### Sprint exit criteria

- Every mock and benchmark response passes the versioned contract.
- Invalid source spans, roles, edges, or confidence values fail validation.
- At least 25 benchmark passages have reviewed expected structures.
- The UI can distinguish explicit from inferred content.
- Selecting a node can identify and highlight its source span.
- Build, tests, accessibility gates, and static deployment checks pass.

## Standard delivery process

Every new analytical capability must follow this sequence:

```text
1. Define the user problem
2. Define the expected output
3. Extend or confirm the schema
4. Add benchmark examples
5. Implement the analysis stage
6. Add runtime validation
7. Build the user interface
8. Add automated tests
9. Run accessibility review
10. Measure user outcomes
```

No feature begins with adding a button. Interface controls are consequences of validated user and system requirements.

## Decision log

| Version | Date | Decision |
|---|---|---|
| 1.1 | July 19, 2026 | Locked the five-phase roadmap and approved GitHub Pages plus Cloudflare Worker as the deployment boundary; prohibited browser-exposed provider keys and adopted the API security architecture. |
| 1.0 | July 19, 2026 | Established the product as an inspectable cognitive parsing tool; adopted staged analysis, source provenance, explicit uncertainty, evaluation-first delivery, and the five-phase roadmap. |

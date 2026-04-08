# Workflow Docs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add follow-up technical documentation under `docs/` so the README can stay onboarding-focused while workflow config and schedule details live in dedicated reference docs.

**Architecture:** Keep `README.md` as the entry point for internal engineering onboarding, then split deeper technical content into focused documents under `docs/`. Create one document for workflow config concepts and one document for schedule and slot semantics, then link them back from the README.

**Tech Stack:** Markdown documentation, Next.js repository conventions, Prisma/SQLite local setup, workflow config model from Zustand and validation helpers

---

### Task 1: Define the workflow-docs file set

**Files:**
- Modify: `README.md`
- Create: `docs/workflow-config.md`
- Create: `docs/schedule-model.md`

**Step 1: Confirm the source material**

Read:

- `README.md`
- `docs/plans/2026-04-08-readme-onboarding-design.md`
- `stores/execution-schedule-store.ts`
- `lib/schedule-import-validation.ts`

Expected result:

- Clear mapping of which concepts belong in README vs `docs/`
- Confirmed schedule frequencies and slot constraints from implementation

**Step 2: Define documentation boundaries**

Write down the split before drafting files:

- `README.md` remains onboarding-focused
- `docs/workflow-config.md` explains module/workflow/edge/config responsibilities
- `docs/schedule-model.md` explains schedule, frequency, and slot semantics

Expected result:

- No duplication-heavy plan to maintain
- Each document has a clear responsibility

**Step 3: Commit the boundary decision**

```bash
git add docs/plans/2026-04-08-workflow-docs-implementation.md
git commit -m "docs: add workflow docs implementation plan"
```

### Task 2: Create workflow config reference doc

**Files:**
- Create: `docs/workflow-config.md`
- Reference: `README.md`

**Step 1: Draft the document structure**

The document should contain these sections:

- Overview
- Why workflow config exists
- Module vs workflow
- Edges as workflow-level relationships
- Frontend and backend responsibilities
- Recommended config reading order
- Links to schedule documentation

**Step 2: Add concrete examples**

Include:

- a minimal module-shaped example
- a minimal workflow-shaped example
- a short explanation of which fields are editor-only vs execution-relevant

Expected result:

- A new engineer can read this doc and understand the role of `id`, `type`, `position`, `data`, `edges`, and `schedule` at a conceptual level

**Step 3: Verify for scope discipline**

Checklist:

- Do not fully document every node `data` payload shape
- Do not introduce speculative fields not present in the repo model
- Keep schedule details high-level and point to `docs/schedule-model.md`

**Step 4: Commit**

```bash
git add docs/workflow-config.md
git commit -m "docs: add workflow config reference"
```

### Task 3: Create schedule and slot reference doc

**Files:**
- Create: `docs/schedule-model.md`
- Reference: `stores/execution-schedule-store.ts`
- Reference: `lib/schedule-import-validation.ts`

**Step 1: Draft the document structure**

The document should contain these sections:

- Overview
- Schedule object shape
- Supported frequencies
- Slot union model
- Validation rules
- Runtime meaning of next-run calculation
- JSON examples

**Step 2: Keep the document implementation-aligned**

Use the current implementation as the source of truth for:

- supported frequency values
- `slot.frequency === schedule.frequency` requirement
- daily / weekly / monthly / yearly slot-specific fields
- `enabled` semantics

Expected result:

- The doc does not claim unsupported frequencies or behaviors
- The doc does not overstate `enabled = false` as one-time execution unless code proves it

**Step 3: Add examples**

Include:

- one `daily` example
- one multi-slot example
- one example showing why mismatched slot frequency is invalid

**Step 4: Commit**

```bash
git add docs/schedule-model.md
git commit -m "docs: add schedule model reference"
```

### Task 4: Link docs from README

**Files:**
- Modify: `README.md`

**Step 1: Update Further Reading**

Replace generic bullet points with explicit links:

- `docs/workflow-config.md`
- `docs/schedule-model.md`
- `docs/plans/`

**Step 2: Verify README remains onboarding-focused**

Checklist:

- README still starts with setup and orientation
- README does not absorb detailed validation rules
- README links outward instead of duplicating deep documentation

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: link workflow reference docs from readme"
```

### Task 5: Run documentation verification

**Files:**
- Verify: `README.md`
- Verify: `docs/workflow-config.md`
- Verify: `docs/schedule-model.md`

**Step 1: Read all three documents end-to-end**

Checklist:

- Section order makes sense
- Terminology is consistent across files
- README, workflow config doc, and schedule doc do not contradict each other

**Step 2: Cross-check against implementation**

Read and verify against:

- `stores/execution-schedule-store.ts`
- `lib/schedule-import-validation.ts`

Expected result:

- Docs only describe behaviors the implementation actually supports

**Step 3: Check git diff**

Run:

```bash
git diff -- README.md docs/workflow-config.md docs/schedule-model.md docs/plans/2026-04-08-readme-onboarding-design.md docs/plans/2026-04-08-workflow-docs-implementation.md
```

Expected result:

- Only intended documentation changes are present

**Step 4: Final commit**

```bash
git add README.md docs/workflow-config.md docs/schedule-model.md
git commit -m "docs: add workflow and schedule reference docs"
```

# README Onboarding Design

**Date:** 2026-04-08  
**Status:** Approved

---

## Summary

Redesign the repository `README.md` for internal engineering onboarding.

The new README should help a newly joined frontend engineer do two things quickly:

- get the project running locally
- build the correct mental model for how workflow config is shared between the canvas editor and backend execution logic

Detailed schema rules and data-model specifics should be delegated to `docs/` instead of expanding the README into a full specification document.

## Goals

- Make `README.md` useful as the first document an internal engineer reads.
- Prioritize local setup and successful onboarding over marketing-style presentation.
- Explain the core workflow data model at a conceptual level.
- Clarify that workflow config is a shared contract between frontend and backend.
- Keep the README short enough to scan, while linking follow-up technical detail into `docs/`.

## Non-Goals

- Turning the README into a complete workflow-config specification.
- Documenting every module subtype or every `data` payload shape in the README.
- Replacing detailed technical docs under `docs/`.
- Writing a public-facing open source style landing page.

## Audience

Primary audience:

- newly joined internal engineers, especially frontend engineers

Secondary audience:

- engineers touching workflow config, scheduling, or editor behavior

The README is not optimized first for:

- external open source visitors
- non-technical product users

## Current State

Before this change, the repository README was minimal and focused mostly on:

- a short Chinese-language product description
- a small tool list
- a basic local development sequence

This was enough to bootstrap an existing contributor, but not enough to help a new engineer understand:

- what this repository owns
- how workflow config is modeled
- how frontend and backend responsibilities meet in the same JSON structure

## Chosen Approach

Adopt a hybrid onboarding README:

1. start with a short repository description
2. provide a practical Quick Start section early
3. explain the workflow-config mental model in a concise conceptual section
4. split frontend and backend concerns explicitly
5. end with project structure, common commands, and pointers to further docs

This approach balances onboarding speed with architectural clarity.

## Alternatives Considered

### Full concept-first README

Lead with `Module`, `Workflow`, `Edge`, and `Schedule`, then explain local development later.

Pros:

- strongest conceptual grounding up front

Cons:

- slows down onboarding
- increases the chance that a new engineer reads a lot before getting the project running

### Setup-only README

Treat the README mostly as an install and command reference.

Pros:

- very fast to scan
- easy to maintain

Cons:

- does not explain why the config shape matters
- allows engineers to start changing code without understanding the shared data contract

### Full schema in README

Put detailed schedule, slot, module, and workflow field rules directly in the README.

Pros:

- keeps all information in one place

Cons:

- makes the README too long
- duplicates information that should live in `docs/`
- raises maintenance burden when config evolves

## Information Architecture

The README should use this section order:

1. repository description
2. Quick Start
3. workflow-config mental model
4. frontend/backend responsibility split
5. common development commands
6. project structure
7. further reading

This order is intentional:

- Quick Start appears early so a new engineer can get the app running quickly.
- The mental model follows immediately after setup so the engineer can understand what they are editing.
- Lower-frequency reference content stays later in the document.

## Quick Start Requirements

The Quick Start section must explicitly cover:

- dependency installation with `pnpm install`
- environment setup via `.env`
- local Prisma migration flow
- seeding local sample data
- starting development with `pnpm dev`
- common validation commands such as `pnpm lint` and `pnpm build`

Because frontend engineers are likely to ask about local database setup, Quick Start should also state clearly:

- the project uses a local SQLite file for development
- a separate database server is not required
- the default database file path is `./data/workflow.db`

Optional but useful guidance:

- mention GraphQL code generation runs in watch mode during `pnpm dev`
- remind readers not to edit generated GraphQL artifacts directly

## Workflow Config Scope In README

The README should describe workflow config at the mental-model level, not the full schema level.

It should cover:

- `Module` as the smallest unit
- `Workflow` as a composed structure built from modules
- `Edge` as workflow-level linkage between modules
- `Schedule` as the trigger model for automatic execution
- workflow config as a shared contract between editor and execution concerns

It may include:

- a small representative JSON example

It should not include:

- every validation rule
- every frequency-specific slot shape
- every node `data` schema
- implementation-level API details unless needed for onboarding

## Frontend / Backend Contract

The README should explicitly document that workflow config serves both frontend and backend use cases.

Frontend concerns include:

- reading workflow JSON
- rendering nodes and edges on the canvas
- editing module state
- serializing config back to JSON

Backend concerns include:

- reading execution-relevant configuration
- understanding module relationships
- using schedule metadata to determine run timing

This section is important because it frames config changes as contract changes rather than isolated UI changes.

## Docs Split

Detailed technical references should move under `docs/`, while the README only summarizes and links out.

Suggested follow-up docs:

- workflow config specification
- module vs workflow schema notes
- schedule and slot data model reference

The README should point readers to `docs/` rather than duplicating those deeper definitions.

## Testing / Verification

This documentation change should be verified by:

- reading the README top to bottom as if onboarding a new frontend engineer
- checking that every command mentioned actually exists in `package.json`
- checking that local setup instructions match the current Prisma and SQLite workflow
- confirming that README statements about schedule frequencies match current implementation

## Success Criteria

- A new internal engineer can follow the README and get the project running locally.
- The README explains what this repository owns without requiring source-code spelunking.
- The README introduces the workflow-config mental model without becoming a full spec.
- The README clearly states that workflow config is shared between frontend and backend concerns.
- Detailed schema documentation is kept out of the README and delegated to `docs/`.

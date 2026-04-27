# readr-nodemation

`readr-nodemation` is the workflow editor and workflow-config workspace for NDX.

This repository sits between two concerns: the frontend canvas for building workflows and the shared workflow configuration consumed by backend execution logic. If you are new to the project, use this README to get the app running locally, then use the mental model below to understand how workflow data is structured.

## Quick Start

### Prerequisites

- Node.js
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Environment Setup

```bash
cp .env.example .env
```

Update `.env` with the values required for your local setup.

### Database Setup

This project uses a local SQLite database file for development. You do not need to install or start a separate database server.

Apply local migrations:

```bash
pnpm prisma migrate dev
```

Seed sample data for local development:

```bash
pnpm prisma db seed
```

By default, the SQLite database file is stored at `./data/workflow.db` as configured in `.env`.

If you are setting up the project for the first time, a typical local database flow is:

1. Copy `.env.example` to `.env`
2. Run `pnpm prisma migrate dev`
3. Run `pnpm prisma db seed`
4. Confirm that the SQLite file exists at `./data/workflow.db`
5. Start the app with `pnpm dev`

If you change the Prisma schema, regenerate the Prisma client:

```bash
pnpm prisma generate
```

### Start Development

```bash
pnpm dev
```

This starts the Next.js development server and GraphQL code generation in watch mode.

### Common Checks

```bash
pnpm lint
pnpm build
pnpm test
pnpm format
```

### Common Gotchas

- `pnpm dev` runs `next dev --webpack` and `graphql-codegen -w` together.
- Do not edit files under `graphql/__generated__/` directly. Update the source GraphQL documents or `codegen.ts`, then regenerate.
- If local workflow data looks wrong, verify your Prisma migration and seed state before debugging the canvas UI.
- Treat generated files as outputs, not sources of truth.

## Workflow Config Mental Model

The most important concept in this repository is the **workflow config**.

Workflow config needs to satisfy both:

- the frontend editor, which renders and edits workflows on a canvas
- the backend execution layer, which needs enough information to understand what a workflow does and when it should run

At a high level:

```text
Module -> Workflow -> Scheduled execution
```

### Module

A module is the smallest unit in NDX.

In practice, a module corresponds to a node in the editor. A module contains the information needed to identify what it is, where it appears on the canvas, and what configuration payload it carries.

Typical module-level fields include:

- `id`
- `type`
- `position`
- `data`

These fields do not all serve the same purpose:

- `position` is primarily a frontend concern for canvas layout
- `data` contains module-specific payload and may also be consumed by execution logic, depending on module type

### Workflow

A workflow is a composed result built from multiple modules.

A workflow-level config includes:

- a set of modules
- the edges between modules
- schedule information, if the workflow should run automatically

This distinction matters because a standalone module is not yet an executable workflow. Once modules are connected and optionally scheduled, the config becomes a workflow definition.

### Edge

An edge represents a directed connection between two modules.

At the data-model level, an edge describes how one module leads to another. In most cases, an edge references:

- its own `id`
- a `source` module id
- a `target` module id

Edges are workflow-level information, not module-level information.

### Schedule

A schedule describes whether a workflow should run automatically and, if so, how often.

The current schedule model supports:

- `daily`
- `weekly`
- `monthly`
- `yearly`

A schedule contains:

- `enabled`
- `frequency`
- `slots`
- `lastUpdated` (optional)

Each `slot` is a concrete trigger rule used by the scheduler to compute the next run time.

Example:

```json
{
  "enabled": true,
  "frequency": "daily",
  "slots": [
    {
      "id": "26f92647-cb9d-4b5d-a551-71155eb4dc80",
      "time": "09:00",
      "frequency": "daily"
    }
  ]
}
```

This means the workflow is scheduled to run every day at `09:00`.

This README only covers the mental model. Detailed slot validation rules and frequency-specific schema live under `docs/`.

## What Frontend And Backend Each Care About

One of the main design constraints in this repository is that workflow config is a shared contract between multiple parts of the system.

### Frontend

The frontend is responsible for:

- reading JSON workflow config
- visualizing that config on the canvas
- allowing users to edit workflow data
- serializing the updated result back into JSON
- copying or persisting workflow config when needed

Because of this, the config includes editor-facing fields such as node positioning and module UI state.

### Backend

The backend is responsible for:

- reading workflow-level execution information
- understanding module relationships
- interpreting execution-related configuration
- triggering workflows according to schedule

Because of this, the same config must preserve execution semantics, not just rendering details.

### Shared Contract

Workflow config should be treated as a shared contract between:

- the canvas editor
- the persistence layer
- the execution layer

Changes to the config shape are contract changes, not just local UI changes.

## Common Development Commands

### Start local development

```bash
pnpm dev
```

### Lint

```bash
pnpm lint
```

### Build

```bash
pnpm build
```

### Run tests

```bash
pnpm test
```

### Format

```bash
pnpm format
```

## Project Structure

```text
app/                    Next.js app routes
components/flow/        Flow-editor-specific UI
components/ui/          Shared UI primitives
stores/                 Zustand stores
providers/              React context providers
lib/                    Domain helpers and utilities
utils/                  Smaller shared utilities
graphql/__generated__/  Generated GraphQL artifacts
docs/                   Project docs and design notes
prisma/                 Prisma schema and database-related files
tests/                  Test files and test-specific docs
```

## Further Reading

Use this README for onboarding and high-level orientation. Detailed technical specifications live under `docs/`.

Suggested follow-up documents:

- [Workflow Config](./docs/workflow-config.md)
- [Schedule Model](./docs/schedule-model.md)
- implementation and design notes under [`docs/plans/`](./docs/plans/)

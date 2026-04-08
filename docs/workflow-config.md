# Workflow Config

## Overview

In this repository, workflow config is the shared data contract between the workflow editor and the execution layer.

The same config needs to support two different use cases:

- the frontend must be able to read it, render it on the canvas, and write it back out as JSON
- the backend must be able to read execution-relevant information from the same structure

As a result, workflow config contains both editor-facing fields and execution-facing fields.

## Why Workflow Config Exists

The frontend editor in NDX is built around a visual canvas. Users arrange modules, connect them, and configure each module through form state in the UI.

That visual state must be serializable so it can be:

- copied as JSON
- saved to SQLite
- loaded back into the editor
- interpreted by backend execution logic

Workflow config is the format that makes those operations possible.

## Module vs Workflow

### Module

A module is the smallest unit in NDX.

You can think of a module as a single node in the workflow editor. A module is not a complete workflow by itself. It only represents one building block in a larger flow.

Typical module-level fields include:

- `id`
- `type`
- `position`
- `data`

Example:

```json
{
  "id": "module-fetch-1",
  "type": "fetch-article",
  "position": { "x": 240, "y": 120 },
  "data": {
    "source": "cms",
    "articleId": "article-123"
  }
}
```

At a conceptual level:

- `id` identifies the module within a workflow
- `type` tells the system what kind of module it is
- `position` is mainly for frontend canvas layout
- `data` stores module-specific configuration payload

### Workflow

A workflow is a composed structure built from modules.

A workflow-level config is what makes the graph meaningful and executable. In practice, workflow-level data includes:

- the modules themselves
- the edges between modules
- schedule metadata, when automatic execution is enabled

Example:

```json
{
  "modules": [
    {
      "id": "module-fetch-1",
      "type": "fetch-article",
      "position": { "x": 240, "y": 120 },
      "data": {
        "source": "cms",
        "articleId": "article-123"
      }
    },
    {
      "id": "module-ai-1",
      "type": "ai-transform",
      "position": { "x": 520, "y": 120 },
      "data": {
        "promptTemplate": "Summarize the article in three bullet points."
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "module-fetch-1",
      "target": "module-ai-1"
    }
  ],
  "schedule": {
    "enabled": true,
    "frequency": "daily",
    "slots": [
      {
        "id": "slot-1",
        "time": "09:00",
        "frequency": "daily"
      }
    ]
  }
}
```

The exact persisted shape may differ across API or storage boundaries, but this example shows the conceptual split:

- modules define building blocks
- edges define relationships
- schedule defines when the workflow should run

## Edges Are Workflow-Level Relationships

An edge represents a directed connection between two modules.

Edges are not part of the module itself. They describe how modules relate to each other inside a workflow.

In most cases, an edge contains:

- `id`
- `source`
- `target`

Where:

- `source` is the upstream module id
- `target` is the downstream module id

This is one of the clearest distinctions between module-level data and workflow-level data:

- module config describes one node
- edge config describes graph structure

## Frontend and Backend Responsibilities

Workflow config exists because both the editor and the execution layer need to understand the same workflow from different perspectives.

### Frontend Responsibilities

The frontend uses workflow config to:

- read serialized workflow JSON
- render nodes and edges on the canvas
- preserve editor state such as position and module configuration
- let users modify modules and graph structure
- write the updated result back into JSON

From the frontend perspective, fields such as `position` are essential because the editor cannot reconstruct the visual layout without them.

### Backend Responsibilities

The backend uses workflow config to:

- understand which modules exist in the workflow
- understand how modules connect to each other
- read execution-relevant module payloads
- determine whether the workflow should run automatically
- interpret schedule information

From the backend perspective, fields such as `position` are usually not part of execution semantics, but fields such as `type`, `data`, `edges`, and `schedule` often are.

## Recommended Reading Order

If you are new to the project, use this order:

1. Read `README.md` for local setup and a high-level mental model.
2. Read this document to understand module vs workflow responsibilities.
3. Read [`schedule-model.md`](./schedule-model.md) for schedule and slot details.
4. Check implementation files only after the conceptual model is clear.

## What This Document Does Not Cover

This document intentionally does not define:

- every module `data` payload shape
- every API response shape
- every persistence detail
- every schedule validation rule

Those details belong in dedicated technical references or implementation files.

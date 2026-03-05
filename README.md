# readr-nodemation

「readr-nodemation」是一個視覺化的工作流建構工具，旨在讓新聞編輯與開發者能透過拖曳方式，串連不同的 AI 模組與 CMS 系統，自動化新聞處理流程。

## Tool

1. use [Biome](https://biomejs.dev/guides/getting-started/)
2. ShadCN for UI components

## Local Development

1. Install dependencies:
   `pnpm install`
2. Set up environment:
   `cp .env.example .env`
3. Apply migrations:
   `pnpm prisma migrate dev`
4. Seed sample data (modules, templates, workflows):
   `pnpm prisma db seed`
5. Start dev server:
   `pnpm dev`

Notes:
- SQLite DB file defaults to `./data/workflow.db` (see `.env`).
- If you change Prisma schema, re-run `pnpm prisma migrate dev` and `pnpm prisma generate`.

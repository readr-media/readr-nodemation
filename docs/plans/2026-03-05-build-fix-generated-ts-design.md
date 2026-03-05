# Build Fix For Generated GraphQL TypeScript Check

**Date:** 2026-03-05  
**Status:** Approved

---

## Goal

Allow `pnpm build` to pass even when no GraphQL document files are present, by disabling strict TypeScript checking on generated GraphQL output.

## Scope

- Adjust TypeScript compile scope in `tsconfig.json`.
- Keep `codegen.ts` unchanged.
- Keep runtime behavior unchanged.

## Chosen Approach

Use approach B: exclude generated GraphQL files from strict TypeScript checking, starting with the narrowest path (`graphql/__generated__/gql.ts`), and expand only if required.

## Why This Approach

- Fastest path to unblock build.
- Does not require codegen pipeline customization.
- Avoids touching application logic.

## Risks

- Generated type issues may be hidden from TypeScript checks.
- Future generator regressions in excluded files will not fail `tsc`.

## Mitigation

- Keep exclusion scope minimal.
- Continue lint and build verification.
- Revisit with a stronger long-term fix if generated typing quality becomes important.

## Verification Plan

1. Run `pnpm exec tsc --noEmit` and ensure generated `gql.ts` no longer blocks checks.
2. Run `pnpm build` and verify success.
3. Run `pnpm lint` and verify no config/style regressions.

## Non-Goals

- Reworking GraphQL code generation behavior.
- Enforcing stricter generated file typing.

# Module Management Return-To Back Button Design

**Date:** 2026-04-10

## Summary

Replace the `document.referrer`-based back-button behavior in `/module-management` with an explicit `returnTo` route parameter. The header back button should navigate to the provided in-site path when it is valid, and otherwise fall back to `/`.

## Goals

- Make the module management header back button deterministic in App Router client-side navigation.
- Avoid navigating users back to external websites.
- Preserve a meaningful "return" target for in-site entry points.
- Keep the scope smaller than adding global route-history tracking.

## Non-Goals

- Building a shared app-wide navigation history system.
- Supporting arbitrary external URLs as return destinations.
- Redesigning the module management page layout or header visuals.

## Current State

- [`app/module-management/_components/header.tsx`](/Users/hemalin/work/readr-nodemation/.worktrees/fix-ui-bug/app/module-management/_components/header.tsx) currently has a newly added client-side handler that depends on `document.referrer`.
- In Next.js App Router, client-side navigation does not reliably update `document.referrer` to represent the previous in-app route, so this behavior is not dependable for SPA transitions.

## Chosen Approach

Use an explicit `returnTo` query parameter as the source of truth for the back-button destination.

- Module-management entry points inside the app should link to `/module-management?returnTo=<current-path>`.
- The module-management header should read the current `returnTo` value from the URL.
- If `returnTo` is a safe in-site relative path, the back button should `router.push(returnTo)`.
- If `returnTo` is missing, malformed, or not an in-site relative path, the back button should `router.push("/")`.

This approach is deterministic, easy to test, and does not depend on browser referrer behavior.

## Alternatives Considered

### Keep `document.referrer`

Pros:
- No changes needed in links entering `/module-management`.

Cons:
- Not reliable for App Router client-side transitions.
- Can misidentify the intended previous in-app page.

### Build a global route-history tracker

Pros:
- Could support a more generic app-wide back-navigation pattern.

Cons:
- Larger architectural change than needed for one page.
- Requires shared state and route-listening infrastructure.

## UX Notes

- Users entering `/module-management` from a supported in-app page should return to that page.
- Users opening `/module-management` directly should still get a valid fallback destination at `/`.
- Invalid or tampered `returnTo` values should not break navigation or send users outside the app.

## Error Handling

- Missing `returnTo` should fall back to `/`.
- Absolute URLs, protocol-relative URLs, or non-path values in `returnTo` should fall back to `/`.
- Relative in-site paths should be accepted only when they start with `/`.

## Testing Strategy

- Verify the destination helper accepts valid in-site relative paths such as `/dashboard`.
- Verify it rejects empty values, external URLs, and malformed input.
- Verify the header pushes the validated `returnTo` path when present.
- Verify the header pushes `/` when `returnTo` is absent or unsafe.


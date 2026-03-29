# Autoresearch: Code Quality Sweep

## Objective
Eliminate all `as any` casts and strict TS errors from fred-cli.

## Current State
Cycle 0/10 | Baseline: 57 as_any + 3 strict_errors = 60 total

## Strategy
Two root causes account for all 60 issues:
1. **formatOutput(data as any, format)** — ~30 casts. `formatOutput` takes `Record<string, unknown>` but receives typed API responses. Fix: widen the formatter's input type.
2. **String-to-union casts** — ~17 casts like `tagOpts.tagGroupId as any`. Fix: accept `string | undefined` in API params and validate at runtime, or use proper type narrowing.
3. **Unused variables** — 3 strict errors: unused `positionals` in release.ts/tags.ts, unused `SOURCES_HELP` in source.ts.

## What Worked
(empty)

## Dead Ends
(empty)

## Next Experiments
1. Fix formatOutput signature to accept typed API responses
2. Fix string-to-union casts in command handlers
3. Fix unused variables

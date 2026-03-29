---
metric: quality
measurement_command: "bash .autoresearch/autoresearch.sh"
scope: src/
mode: solo
cycles: 10
round: 1
target: "zero as-any casts and zero strict TS errors"
backpressure:
  - "npx tsc --noEmit"
  - "npx tsx --test src/tests/client.test.ts src/tests/cli.test.ts"
direction: minimize
checks_timeout_seconds: 120
created: 2026-03-29T19:30:00Z
prior_findings: []
---

# Autoresearch Configuration

Metric: Code quality (minimize `as any` casts + strict TS errors)
Scope: src/ (all non-test source files + test files)

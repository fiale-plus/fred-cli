#!/bin/bash
set -euo pipefail

echo "=== Type checking ==="
npx tsc --noEmit

echo "=== Unit tests ==="
npx tsx --test src/tests/client.test.ts src/tests/cli.test.ts

echo "=== Checks passed ==="

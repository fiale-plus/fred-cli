#!/bin/bash
set -euo pipefail

# Count 'as any' casts across all .ts files
as_any=$(grep -r 'as any' src/ --include='*.ts' -c 2>/dev/null | awk -F: '{s+=$NF} END{print s+0}') || as_any=0
echo "METRIC as_any=$as_any"

# Count strict TS errors (unused locals/params)
strict_errors=$(npx tsc --noEmit --noUnusedLocals --noUnusedParameters 2>&1 | grep -c "error TS" || true)
echo "METRIC strict_errors=$strict_errors"

# Total quality issues
total=$((as_any + strict_errors))
echo "METRIC total_issues=$total"

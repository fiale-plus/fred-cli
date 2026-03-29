# fred-cli

Unofficial CLI + TypeScript client for the FRED API v2 (Federal Reserve Economic Data).

## Build & Test

```bash
npm run build        # tsc -> dist/
npm test             # unit tests (mocked HTTP)
npm run test:integration  # live API tests (needs FRED_API_KEY)
npm run dev -- <args>     # run CLI directly via tsx
```

## Architecture

- `src/api/client.ts` — `FredClient` class, one method per API endpoint, uses native `fetch`
- `src/api/types.ts` — all TypeScript types for FRED API requests/responses
- `src/cli.ts` — CLI entry point, routes commands to handlers
- `src/commands/` — one file per command group (series, category, release, source, tags)
- `src/cli/` — parseArgs configs, formatters (json/csv/table), help text
- `src/tests/` — node:test runner, fixtures in `tests/fixtures/`

## Conventions

- Zero runtime dependencies (Node 18+ native fetch, parseArgs, test runner)
- ESM (`"type": "module"`) with `.js` import extensions
- All API params use snake_case (matching FRED API), CLI flags use kebab-case
- JSON output includes `_truncated` and `_next_offset` when results are paginated
- Tests mock `global.fetch` — no external mock libraries

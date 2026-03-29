# fred-cli

[![npm version](https://img.shields.io/npm/v/fred-cli.svg)](https://www.npmjs.com/package/fred-cli)
[![npm downloads](https://img.shields.io/npm/dm/fred-cli.svg)](https://www.npmjs.com/package/fred-cli)
[![Test](https://github.com/fiale-plus/fred-cli/actions/workflows/test.yml/badge.svg)](https://github.com/fiale-plus/fred-cli/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Unofficial** CLI and TypeScript client for the [FRED API](https://fred.stlouisfed.org/docs/api/fred/) (Federal Reserve Economic Data) — designed for AI agents.

## Features

- **31 FRED API endpoints** mapped 1:1 to CLI commands
- **Zero runtime dependencies** — Node 18+ native `fetch` and `parseArgs`
- **JSON output by default** — structured, agent-friendly, pipe to `jq`
- **CSV and table formats** — `--format csv` or `--format table` for human workflows
- **Truncation detection** — auto-adds `_truncated` and `_next_offset` to JSON when results are paginated
- **TypeScript library** — import `FredClient` for programmatic use with full type safety
- **All FRED features** — realtime periods, vintage dates, data transformations, frequency aggregation

## Quick Start

```bash
npm install -g fred-cli
export FRED_API_KEY=your-key-here

fred series search "consumer price index" --limit 5
fred series observations CPIAUCSL --units pch --limit 12
fred series GDP
```

Get a free API key at: https://fred.stlouisfed.org/docs/api/api_key.html

## Installation

```bash
# Global (CLI usage)
npm install -g fred-cli

# Local (library usage)
npm install fred-cli
```

Requires Node.js >= 18.0.0.

## CLI Usage

### Series Commands

```bash
fred series <series_id>                        # Get series metadata
fred series observations <series_id>           # Get data observations
fred series search <search_text>               # Search for series
fred series categories <series_id>             # Get series categories
fred series release <series_id>                # Get series release
fred series tags <series_id>                   # Get series tags
fred series updates                            # Recently updated series
fred series vintagedates <series_id>           # Get vintage dates
fred series search-tags <search_text>          # Tags for a search
fred series search-related-tags <search_text>  # Related tags for a search
```

#### Observation Options

| Flag | Values | Description |
|------|--------|-------------|
| `--units` | `lin` `chg` `ch1` `pch` `pc1` `pca` `cch` `cca` `log` | Data value transformation |
| `--frequency` | `d` `w` `bw` `m` `q` `sa` `a` | Aggregation frequency |
| `--aggregation-method` | `avg` `sum` `eop` | How to aggregate |
| `--output-type` | `1` `2` `3` `4` | Observation output type |
| `--observation-start` | `YYYY-MM-DD` | Start date filter |
| `--observation-end` | `YYYY-MM-DD` | End date filter |
| `--vintage-dates` | `YYYY-MM-DD,...` | Comma-separated vintage dates |

### Category Commands

```bash
fred category [category_id]                    # Get category (default: root)
fred category children [category_id]           # Get child categories
fred category related <category_id>            # Get related categories
fred category series <category_id>             # Get series in category
fred category tags <category_id>               # Get category tags
fred category related-tags <category_id>       # Get related tags
```

### Release Commands

```bash
fred releases                                  # Get all releases
fred releases dates                            # Get all release dates
fred release <release_id>                      # Get release metadata
fred release dates <release_id>                # Get release dates
fred release series <release_id>               # Get series on release
fred release sources <release_id>              # Get release sources
fred release tags <release_id>                 # Get release tags
fred release related-tags <release_id>         # Get related tags
fred release tables <release_id>               # Get release tables
```

### Source Commands

```bash
fred sources                                   # Get all sources
fred source <source_id>                        # Get source metadata
fred source releases <source_id>               # Get releases for source
```

### Tag Commands

```bash
fred tags                                      # Get all/search tags
fred tags series                               # Get series matching tags
fred related-tags                              # Get related tags
```

Tag options: `--tag-names`, `--tag-group-id`, `--search-text`, `--exclude-tag-names`

### Common Options

| Flag | Description |
|------|-------------|
| `--api-key <key>` | API key (or set `FRED_API_KEY` env var) |
| `-f, --format <json\|csv\|table>` | Output format (default: `json`) |
| `--realtime-start <YYYY-MM-DD>` | Realtime period start |
| `--realtime-end <YYYY-MM-DD>` | Realtime period end |
| `--limit <n>` | Max results (API defaults vary by endpoint) |
| `--offset <n>` | Result offset for pagination |
| `--sort-order <asc\|desc>` | Sort order |
| `--order-by <field>` | Sort field (varies by endpoint) |

### Pagination and Truncation

The CLI respects FRED API defaults per endpoint. When results are paginated:

- **JSON**: Adds `_truncated: true` and `_next_offset` fields
- **Table**: Shows footer: `Showing N of M results. Use --limit and --offset to paginate.`
- **CSV**: Adds comment header with count info

### Default Limits by Endpoint

| Endpoint | Default Limit |
|----------|--------------|
| `series/observations` | 100,000 |
| `series/search` | 1,000 |
| `series/updates` | 100 |
| `releases`, `sources`, `tags` | 1,000 |
| `series/vintagedates` | 10,000 |

## Library Usage

```typescript
import { FredClient } from "fred-cli";

const fred = new FredClient(process.env.FRED_API_KEY!);

// Get GDP observations as percent change
const obs = await fred.getObservations("GDP", {
  units: "pch",
  frequency: "a",
  limit: 10,
});
console.log(obs.observations);

// Search for series
const results = await fred.searchSeries("unemployment rate", { limit: 5 });
console.log(results.seriess);

// Browse categories
const children = await fred.getCategoryChildren(0);
console.log(children.categories);
```

All 31 endpoints are available as typed methods on `FredClient`.

## API Key

Get a free API key at: https://fred.stlouisfed.org/docs/api/api_key.html

Set it as an environment variable:

```bash
export FRED_API_KEY=your-key-here
```

Or pass it per-command:

```bash
fred series GDP --api-key your-key-here
```

## Development

```bash
git clone https://github.com/fiale-plus/fred-cli.git
cd fred-cli
npm install
npm run build
npm test

# Dev mode (runs TypeScript directly)
npm run dev -- series GDP
npm run dev -- series observations CPIAUCSL --units pch --limit 5

# Integration tests (requires FRED_API_KEY)
FRED_API_KEY=your-key npm run test:integration
```

## Disclaimer

This is an **unofficial**, **community-maintained** tool. It is **not affiliated with, endorsed by, or connected to the Federal Reserve Bank of St. Louis**, the Federal Reserve System, or any government entity.

This tool accesses the publicly available [FRED API](https://fred.stlouisfed.org/docs/api/fred/). FRED is a registered trademark of the Federal Reserve Bank of St. Louis.

Data retrieved through this tool is sourced from FRED and is provided for informational purposes only. It should not be used as the sole basis for financial decisions. Always verify data against official sources.

This software is provided "AS IS" under the MIT License, without warranty of any kind.

## Links

- [FRED API Documentation](https://fred.stlouisfed.org/docs/api/fred/)
- [API Key Registration](https://fred.stlouisfed.org/docs/api/api_key.html)
- [GitHub Repository](https://github.com/fiale-plus/fred-cli)
- [npm Package](https://www.npmjs.com/package/fred-cli)

## License

[MIT](LICENSE)

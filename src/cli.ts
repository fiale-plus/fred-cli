#!/usr/bin/env node

import { FredClient, FredApiError } from "./api/client.js";
import {
  parseGlobal,
  parseSeriesObs,
  parseSeriesSearch,
  parseTagCommand,
  extractGlobalOpts,
  extractObsOpts,
  extractSearchOpts,
  extractTagOpts,
} from "./cli/parseArgs.js";
import { MAIN_HELP } from "./cli/help.js";
import type { OutputFormat } from "./cli/formatters.js";
import { resolveApiKey } from "./utils/validation.js";

import { handleSeries } from "./commands/series.js";
import { handleCategory } from "./commands/category.js";
import { handleRelease, handleReleases } from "./commands/release.js";
import { handleSource, handleSources } from "./commands/source.js";
import { handleTags, handleRelatedTags } from "./commands/tags.js";

const VERSION = "0.0.0-dev";

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  // Quick check for --help and --version before full parse
  if (argv.length === 0 || argv.includes("--help") && !argv[0]) {
    process.stdout.write(MAIN_HELP);
    return;
  }

  const command = argv[0];

  if (command === "--help" || command === "-h") {
    process.stdout.write(MAIN_HELP);
    return;
  }

  if (command === "--version" || command === "-v") {
    process.stdout.write(VERSION + "\n");
    return;
  }

  // Parse args based on command context
  const parsed =
    command === "series" && argv[1] === "observations"
      ? parseSeriesObs(argv)
      : command === "series" && argv[1] === "search"
        ? parseSeriesSearch(argv)
        : ["tags", "related-tags"].includes(command) ||
            (["series", "category", "release"].includes(command) &&
              ["tags", "related-tags", "search-tags", "search-related-tags"].includes(argv[1]))
          ? parseTagCommand(argv)
          : parseGlobal(argv);

  const global = extractGlobalOpts(parsed.values as Record<string, unknown>);
  const obsOpts = extractObsOpts(parsed.values as Record<string, unknown>);
  const searchOpts = extractSearchOpts(parsed.values as Record<string, unknown>);
  const tagOpts = extractTagOpts(parsed.values as Record<string, unknown>);
  const format = global.format as OutputFormat;

  if (global.help) {
    process.stdout.write(MAIN_HELP);
    return;
  }

  if (global.version) {
    process.stdout.write(VERSION + "\n");
    return;
  }

  // Commands that don't need an API key
  const positionals = parsed.positionals as string[];
  const group = positionals[0];
  const action = positionals[1];
  const restArgs = positionals.slice(2);

  // Resolve API key
  const apiKey = resolveApiKey(global.apiKey);
  const client = new FredClient(apiKey);

  switch (group) {
    case "series":
      await handleSeries(action, restArgs, global, obsOpts, searchOpts, tagOpts, client, format);
      return;

    case "category":
      await handleCategory(action, restArgs, global, tagOpts, client, format);
      return;

    case "releases":
      await handleReleases(action, restArgs, global, client, format);
      return;

    case "release":
      await handleRelease(action, restArgs, global, tagOpts, client, format);
      return;

    case "sources":
      await handleSources(global, client, format);
      return;

    case "source":
      await handleSource(action, restArgs, global, client, format);
      return;

    case "tags":
      await handleTags(action, restArgs, global, tagOpts, client, format);
      return;

    case "related-tags":
      await handleRelatedTags(global, tagOpts, client, format);
      return;

    default:
      process.stderr.write(`Unknown command: ${group}\n\n`);
      process.stdout.write(MAIN_HELP);
      process.exitCode = 1;
      return;
  }
}

main().catch((err) => {
  if (err instanceof FredApiError) {
    process.stderr.write(`Error: ${err.message}\n`);
  } else if (err instanceof Error) {
    process.stderr.write(`Error: ${err.message}\n`);
  } else {
    process.stderr.write(`Error: ${String(err)}\n`);
  }
  process.exitCode = 1;
});

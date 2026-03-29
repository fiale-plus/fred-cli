import type { FredClient } from "../api/client.js";
import type { OutputFormat } from "../cli/formatters.js";
import { formatOutput } from "../cli/formatters.js";
import { type GlobalOptions, buildCommonParams } from "../cli/parseArgs.js";
import { SOURCE_HELP, SOURCES_HELP } from "../cli/help.js";

export async function handleSources(
  global: GlobalOptions,
  client: FredClient,
  format: OutputFormat,
): Promise<void> {
  const common = buildCommonParams(global);
  const data = await client.getSources(common);
  process.stdout.write(formatOutput(data, format) + "\n");
}

export async function handleSource(
  action: string | undefined,
  positionals: string[],
  global: GlobalOptions,
  client: FredClient,
  format: OutputFormat,
): Promise<void> {
  const common = buildCommonParams(global);

  if (!action) {
    process.stdout.write(SOURCE_HELP);
    return;
  }

  if (action === "releases") {
    const id = positionals[0];
    if (!id) throw new Error("Usage: fred source releases <source_id>");
    const data = await client.getSourceReleases(Number(id), common);
    process.stdout.write(formatOutput(data, format) + "\n");
    return;
  }

  // Treat action as source_id: fred source 1
  const sourceId = Number(action);
  if (isNaN(sourceId)) {
    process.stdout.write(SOURCE_HELP);
    return;
  }
  const data = await client.getSource(sourceId, common);
  process.stdout.write(formatOutput(data, format) + "\n");
}

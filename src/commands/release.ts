import type { FredClient } from "../api/client.js";
import type { OutputFormat } from "../cli/formatters.js";
import { formatOutput } from "../cli/formatters.js";
import {
  type GlobalOptions,
  type TagOptions,
  buildCommonParams,
} from "../cli/parseArgs.js";
import { RELEASE_HELP, RELEASES_HELP } from "../cli/help.js";

export async function handleReleases(
  action: string | undefined,
  positionals: string[],
  global: GlobalOptions,
  client: FredClient,
  format: OutputFormat,
): Promise<void> {
  const common = buildCommonParams(global);

  if (!action || action === "dates") {
    if (action === "dates") {
      const data = await client.getReleasesDates(common);
      process.stdout.write(formatOutput(data as any, format) + "\n");
    } else {
      const data = await client.getReleases(common);
      process.stdout.write(formatOutput(data as any, format) + "\n");
    }
    return;
  }

  process.stdout.write(RELEASES_HELP);
}

export async function handleRelease(
  action: string | undefined,
  positionals: string[],
  global: GlobalOptions,
  tagOpts: TagOptions,
  client: FredClient,
  format: OutputFormat,
): Promise<void> {
  const common = buildCommonParams(global);

  if (!action) {
    process.stdout.write(RELEASE_HELP);
    return;
  }

  // Check if action is a subcommand or a release_id
  const subcommands = ["dates", "series", "sources", "tags", "related-tags", "tables"];
  if (subcommands.includes(action)) {
    const id = positionals[0];
    if (!id) throw new Error(`Usage: fred release ${action} <release_id>`);
    const releaseId = Number(id);

    switch (action) {
      case "dates": {
        const data = await client.getReleaseDates(releaseId, common);
        process.stdout.write(formatOutput(data as any, format) + "\n");
        return;
      }
      case "series": {
        const data = await client.getReleaseSeries(releaseId, common);
        process.stdout.write(formatOutput(data as any, format) + "\n");
        return;
      }
      case "sources": {
        const data = await client.getReleaseSources(releaseId, common);
        process.stdout.write(formatOutput(data as any, format) + "\n");
        return;
      }
      case "tags": {
        const data = await client.getReleaseTags(releaseId, {
          ...common,
          tag_names: tagOpts.tagNames,
          tag_group_id: tagOpts.tagGroupId as any,
          search_text: tagOpts.searchText,
        });
        process.stdout.write(formatOutput(data as any, format) + "\n");
        return;
      }
      case "related-tags": {
        if (!tagOpts.tagNames)
          throw new Error("--tag-names is required for related-tags");
        const data = await client.getReleaseRelatedTags(releaseId, {
          ...common,
          tag_names: tagOpts.tagNames,
          tag_group_id: tagOpts.tagGroupId as any,
          search_text: tagOpts.searchText,
        });
        process.stdout.write(formatOutput(data as any, format) + "\n");
        return;
      }
      case "tables": {
        const data = await client.getReleaseTables(releaseId, common);
        process.stdout.write(formatOutput(data as any, format) + "\n");
        return;
      }
    }
    return;
  }

  // Treat action as release_id: fred release 53
  const releaseId = Number(action);
  if (isNaN(releaseId)) {
    process.stdout.write(RELEASE_HELP);
    return;
  }
  const data = await client.getRelease(releaseId, common);
  process.stdout.write(formatOutput(data as any, format) + "\n");
}

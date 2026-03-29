import type { FredClient } from "../api/client.js";
import type { OutputFormat } from "../cli/formatters.js";
import { formatOutput } from "../cli/formatters.js";
import {
  type GlobalOptions,
  type TagOptions,
  buildCommonParams,
} from "../cli/parseArgs.js";
import { TAGS_HELP, RELATED_TAGS_HELP } from "../cli/help.js";

export async function handleTags(
  action: string | undefined,
  positionals: string[],
  global: GlobalOptions,
  tagOpts: TagOptions,
  client: FredClient,
  format: OutputFormat,
): Promise<void> {
  const common = buildCommonParams(global);

  if (action === "series") {
    if (!tagOpts.tagNames)
      throw new Error("--tag-names is required for tags series");
    const data = await client.getTagsSeries(tagOpts.tagNames, {
      ...common,
      exclude_tag_names: tagOpts.excludeTagNames,
    });
    process.stdout.write(formatOutput(data, format) + "\n");
    return;
  }

  if (action && action !== "series") {
    process.stdout.write(TAGS_HELP);
    return;
  }

  // fred tags (list/search all tags)
  const data = await client.getTags({
    ...common,
    tag_names: tagOpts.tagNames,
    tag_group_id: tagOpts.tagGroupId,
    search_text: tagOpts.searchText,
  });
  process.stdout.write(formatOutput(data, format) + "\n");
}

export async function handleRelatedTags(
  global: GlobalOptions,
  tagOpts: TagOptions,
  client: FredClient,
  format: OutputFormat,
): Promise<void> {
  const common = buildCommonParams(global);

  if (!tagOpts.tagNames) {
    process.stdout.write(RELATED_TAGS_HELP);
    return;
  }

  const data = await client.getRelatedTags({
    ...common,
    tag_names: tagOpts.tagNames,
    tag_group_id: tagOpts.tagGroupId,
    search_text: tagOpts.searchText,
    exclude_tag_names: tagOpts.excludeTagNames,
  });
  process.stdout.write(formatOutput(data, format) + "\n");
}

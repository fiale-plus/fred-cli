import type { FredClient } from "../api/client.js";
import type { OutputFormat } from "../cli/formatters.js";
import { formatOutput } from "../cli/formatters.js";
import {
  type GlobalOptions,
  type TagOptions,
  buildCommonParams,
} from "../cli/parseArgs.js";
import { CATEGORY_HELP } from "../cli/help.js";

export async function handleCategory(
  action: string | undefined,
  positionals: string[],
  global: GlobalOptions,
  tagOpts: TagOptions,
  client: FredClient,
  format: OutputFormat,
): Promise<void> {
  const common = buildCommonParams(global);

  if (!action) {
    // fred category -> root category (id=0)
    const data = await client.getCategory(0);
    process.stdout.write(formatOutput(data, format) + "\n");
    return;
  }

  switch (action) {
    case "children": {
      const id = positionals[0] ? Number(positionals[0]) : 0;
      const data = await client.getCategoryChildren(id, common);
      process.stdout.write(formatOutput(data, format) + "\n");
      return;
    }

    case "related": {
      const id = positionals[0];
      if (!id) throw new Error("Usage: fred category related <category_id>");
      const data = await client.getCategoryRelated(Number(id), common);
      process.stdout.write(formatOutput(data, format) + "\n");
      return;
    }

    case "series": {
      const id = positionals[0];
      if (!id) throw new Error("Usage: fred category series <category_id>");
      const data = await client.getCategorySeries(Number(id), common);
      process.stdout.write(formatOutput(data, format) + "\n");
      return;
    }

    case "tags": {
      const id = positionals[0];
      if (!id) throw new Error("Usage: fred category tags <category_id>");
      const data = await client.getCategoryTags(Number(id), {
        ...common,
        tag_names: tagOpts.tagNames,
        tag_group_id: tagOpts.tagGroupId as any,
        search_text: tagOpts.searchText,
      });
      process.stdout.write(formatOutput(data, format) + "\n");
      return;
    }

    case "related-tags": {
      const id = positionals[0];
      if (!id) throw new Error("Usage: fred category related-tags <category_id>");
      if (!tagOpts.tagNames)
        throw new Error("--tag-names is required for related-tags");
      const data = await client.getCategoryRelatedTags(Number(id), {
        ...common,
        tag_names: tagOpts.tagNames,
        tag_group_id: tagOpts.tagGroupId as any,
        search_text: tagOpts.searchText,
      });
      process.stdout.write(formatOutput(data, format) + "\n");
      return;
    }

    default: {
      // fred category 32991 -> get specific category
      const id = Number(action);
      if (isNaN(id)) {
        process.stdout.write(CATEGORY_HELP);
        return;
      }
      const data = await client.getCategory(id);
      process.stdout.write(formatOutput(data, format) + "\n");
      return;
    }
  }
}

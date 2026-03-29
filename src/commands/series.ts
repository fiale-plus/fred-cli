import type { FredClient } from "../api/client.js";
import type { OutputFormat } from "../cli/formatters.js";
import { formatOutput } from "../cli/formatters.js";
import {
  type GlobalOptions,
  type SeriesObsOptions,
  type SearchOptions,
  type TagOptions,
  buildCommonParams,
} from "../cli/parseArgs.js";
import { SERIES_HELP } from "../cli/help.js";

export async function handleSeries(
  action: string | undefined,
  positionals: string[],
  global: GlobalOptions,
  obsOpts: SeriesObsOptions,
  searchOpts: SearchOptions,
  tagOpts: TagOptions,
  client: FredClient,
  format: OutputFormat,
): Promise<void> {
  const common = buildCommonParams(global);

  // fred series (no action, no args) -> help
  if (!action) {
    process.stdout.write(SERIES_HELP);
    return;
  }

  switch (action) {
    case "observations": {
      const id = positionals[0];
      if (!id) throw new Error("Usage: fred series observations <series_id>");
      const data = await client.getObservations(id, {
        ...common,
        units: obsOpts.units as any,
        frequency: obsOpts.frequency,
        aggregation_method: obsOpts.aggregationMethod as any,
        output_type: obsOpts.outputType ? (Number(obsOpts.outputType) as any) : undefined,
        observation_start: obsOpts.observationStart,
        observation_end: obsOpts.observationEnd,
        vintage_dates: obsOpts.vintageDates,
      });
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }

    case "search": {
      const text = positionals[0];
      if (!text) throw new Error("Usage: fred series search <search_text>");
      const data = await client.searchSeries(text, {
        ...common,
        search_type: searchOpts.searchType as any,
        tag_names: searchOpts.tagNames,
        exclude_tag_names: searchOpts.excludeTagNames,
      });
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }

    case "categories": {
      const id = positionals[0];
      if (!id) throw new Error("Usage: fred series categories <series_id>");
      const data = await client.getSeriesCategories(id, common);
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }

    case "release": {
      const id = positionals[0];
      if (!id) throw new Error("Usage: fred series release <series_id>");
      const data = await client.getSeriesRelease(id, common);
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }

    case "tags": {
      const id = positionals[0];
      if (!id) throw new Error("Usage: fred series tags <series_id>");
      const data = await client.getSeriesTags(id, common);
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }

    case "updates": {
      const data = await client.getSeriesUpdates(common);
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }

    case "vintagedates": {
      const id = positionals[0];
      if (!id) throw new Error("Usage: fred series vintagedates <series_id>");
      const data = await client.getSeriesVintageDates(id, common);
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }

    case "search-tags": {
      const text = positionals[0];
      if (!text) throw new Error("Usage: fred series search-tags <search_text>");
      const data = await client.getSeriesSearchTags(text, {
        ...common,
        tag_names: tagOpts.tagNames,
        tag_group_id: tagOpts.tagGroupId as any,
        search_text: tagOpts.searchText,
      });
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }

    case "search-related-tags": {
      const text = positionals[0];
      if (!text) throw new Error("Usage: fred series search-related-tags <search_text>");
      if (!tagOpts.tagNames)
        throw new Error("--tag-names is required for search-related-tags");
      const data = await client.getSeriesSearchRelatedTags(text, {
        ...common,
        tag_names: tagOpts.tagNames,
        tag_group_id: tagOpts.tagGroupId as any,
        search_text: tagOpts.searchText,
      });
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }

    default: {
      // Treat action as a series_id: fred series GDP
      const data = await client.getSeries(action, common);
      process.stdout.write(formatOutput(data as any, format) + "\n");
      return;
    }
  }
}

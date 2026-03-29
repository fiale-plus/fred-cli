import { parseArgs } from "node:util";

export interface GlobalOptions {
  apiKey?: string;
  format: "json" | "csv" | "table";
  realtimeStart?: string;
  realtimeEnd?: string;
  limit?: string;
  offset?: string;
  sortOrder?: string;
  orderBy?: string;
  help: boolean;
  version: boolean;
}

export interface SeriesObsOptions {
  units?: string;
  frequency?: string;
  aggregationMethod?: string;
  outputType?: string;
  observationStart?: string;
  observationEnd?: string;
  vintageDates?: string;
}

export interface SearchOptions {
  searchType?: string;
  tagNames?: string;
  excludeTagNames?: string;
}

export interface TagOptions {
  tagNames?: string;
  tagGroupId?: string;
  searchText?: string;
  excludeTagNames?: string;
}

const GLOBAL_OPTIONS = {
  "api-key": { type: "string" as const },
  format: { type: "string" as const, short: "f", default: "json" },
  "realtime-start": { type: "string" as const },
  "realtime-end": { type: "string" as const },
  limit: { type: "string" as const },
  offset: { type: "string" as const },
  "sort-order": { type: "string" as const },
  "order-by": { type: "string" as const },
  help: { type: "boolean" as const, default: false },
  version: { type: "boolean" as const, default: false },
};

const OBSERVATION_OPTIONS = {
  units: { type: "string" as const },
  frequency: { type: "string" as const },
  "aggregation-method": { type: "string" as const },
  "output-type": { type: "string" as const },
  "observation-start": { type: "string" as const },
  "observation-end": { type: "string" as const },
  "vintage-dates": { type: "string" as const },
};

const SEARCH_OPTIONS = {
  "search-type": { type: "string" as const },
  "tag-names": { type: "string" as const },
  "exclude-tag-names": { type: "string" as const },
};

const TAG_OPTIONS = {
  "tag-names": { type: "string" as const },
  "tag-group-id": { type: "string" as const },
  "search-text": { type: "string" as const },
  "exclude-tag-names": { type: "string" as const },
};

export function parseGlobal(argv: string[]) {
  return parseArgs({
    args: argv,
    options: GLOBAL_OPTIONS,
    strict: false,
    allowPositionals: true,
  });
}

export function parseSeriesObs(argv: string[]) {
  return parseArgs({
    args: argv,
    options: { ...GLOBAL_OPTIONS, ...OBSERVATION_OPTIONS },
    strict: false,
    allowPositionals: true,
  });
}

export function parseSeriesSearch(argv: string[]) {
  return parseArgs({
    args: argv,
    options: { ...GLOBAL_OPTIONS, ...SEARCH_OPTIONS },
    strict: false,
    allowPositionals: true,
  });
}

export function parseTagCommand(argv: string[]) {
  return parseArgs({
    args: argv,
    options: { ...GLOBAL_OPTIONS, ...TAG_OPTIONS },
    strict: false,
    allowPositionals: true,
  });
}

export function extractGlobalOpts(
  values: Record<string, unknown>,
): GlobalOptions {
  return {
    apiKey: values["api-key"] as string | undefined,
    format: (values.format as "json" | "csv" | "table") || "json",
    realtimeStart: values["realtime-start"] as string | undefined,
    realtimeEnd: values["realtime-end"] as string | undefined,
    limit: values.limit as string | undefined,
    offset: values.offset as string | undefined,
    sortOrder: values["sort-order"] as string | undefined,
    orderBy: values["order-by"] as string | undefined,
    help: (values.help as boolean) || false,
    version: (values.version as boolean) || false,
  };
}

export function extractObsOpts(
  values: Record<string, unknown>,
): SeriesObsOptions {
  return {
    units: values.units as string | undefined,
    frequency: values.frequency as string | undefined,
    aggregationMethod: values["aggregation-method"] as string | undefined,
    outputType: values["output-type"] as string | undefined,
    observationStart: values["observation-start"] as string | undefined,
    observationEnd: values["observation-end"] as string | undefined,
    vintageDates: values["vintage-dates"] as string | undefined,
  };
}

export function extractSearchOpts(
  values: Record<string, unknown>,
): SearchOptions {
  return {
    searchType: values["search-type"] as string | undefined,
    tagNames: values["tag-names"] as string | undefined,
    excludeTagNames: values["exclude-tag-names"] as string | undefined,
  };
}

export function extractTagOpts(
  values: Record<string, unknown>,
): TagOptions {
  return {
    tagNames: values["tag-names"] as string | undefined,
    tagGroupId: values["tag-group-id"] as string | undefined,
    searchText: values["search-text"] as string | undefined,
    excludeTagNames: values["exclude-tag-names"] as string | undefined,
  };
}

/** Build API params from global options (realtime, pagination, sort) */
export function buildCommonParams(opts: GlobalOptions): Record<string, string | number | undefined> {
  return {
    realtime_start: opts.realtimeStart,
    realtime_end: opts.realtimeEnd,
    limit: opts.limit ? Number(opts.limit) : undefined,
    offset: opts.offset ? Number(opts.offset) : undefined,
    sort_order: opts.sortOrder as "asc" | "desc" | undefined,
    order_by: opts.orderBy,
  };
}

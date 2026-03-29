export type OutputFormat = "json" | "csv" | "table";

interface PaginatedData {
  count?: number;
  limit?: number;
  offset?: number;
}

// Known array fields in FRED API responses
const ARRAY_FIELDS = [
  "seriess",
  "observations",
  "categories",
  "releases",
  "release_dates",
  "sources",
  "tags",
  "vintage_dates",
  "elements",
] as const;

function extractItems(data: Record<string, unknown>): unknown[] {
  for (const field of ARRAY_FIELDS) {
    if (Array.isArray(data[field])) {
      return data[field] as unknown[];
    }
  }
  return [data];
}

function addTruncationMeta(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const count = data.count as number | undefined;
  const limit = data.limit as number | undefined;
  const offset = (data.offset as number | undefined) ?? 0;

  if (count !== undefined && limit !== undefined && count > offset + limit) {
    return { ...data, _truncated: true, _next_offset: offset + limit };
  }
  return data;
}

export function formatOutput(
  data: Record<string, unknown>,
  format: OutputFormat,
): string {
  switch (format) {
    case "json":
      return JSON.stringify(addTruncationMeta(data), null, 2);
    case "csv":
      return formatCSV(data);
    case "table":
      return formatTable(data);
  }
}

function formatCSV(data: Record<string, unknown>): string {
  const items = extractItems(data);
  if (items.length === 0) return "";

  const pag = data as PaginatedData;
  const lines: string[] = [];

  if (
    pag.count !== undefined &&
    pag.limit !== undefined &&
    pag.count > (pag.offset ?? 0) + pag.limit
  ) {
    lines.push(
      `# Showing ${pag.limit} of ${pag.count}. Use --limit/--offset for more.`,
    );
  }

  if (typeof items[0] === "string") {
    // vintage_dates are plain strings
    lines.push("value");
    for (const item of items) {
      lines.push(String(item));
    }
    return lines.join("\n");
  }

  const first = items[0] as Record<string, unknown>;
  const headers = Object.keys(first);
  lines.push(headers.join(","));

  for (const item of items) {
    const row = item as Record<string, unknown>;
    lines.push(
      headers
        .map((h) => {
          const val = String(row[h] ?? "");
          return val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(","),
    );
  }

  return lines.join("\n");
}

function formatTable(data: Record<string, unknown>): string {
  const items = extractItems(data);
  if (items.length === 0) return "(no results)";

  if (typeof items[0] === "string") {
    return items.join("\n");
  }

  const rows = items as Record<string, unknown>[];
  const headers = Object.keys(rows[0]);

  // Compute column widths
  const widths = headers.map((h) =>
    Math.max(
      h.length,
      ...rows.map((r) => String(r[h] ?? "").length),
    ),
  );

  // Cap column widths at 50 to keep table readable
  const maxWidth = 50;
  const cappedWidths = widths.map((w) => Math.min(w, maxWidth));

  const pad = (val: string, width: number) =>
    val.length > width ? val.slice(0, width - 1) + "\u2026" : val.padEnd(width);

  const lines: string[] = [];
  lines.push(headers.map((h, i) => pad(h, cappedWidths[i])).join("  "));
  lines.push(cappedWidths.map((w) => "\u2500".repeat(w)).join("  "));

  for (const row of rows) {
    lines.push(
      headers
        .map((h, i) => pad(String(row[h] ?? ""), cappedWidths[i]))
        .join("  "),
    );
  }

  const pag = data as PaginatedData;
  if (
    pag.count !== undefined &&
    pag.limit !== undefined &&
    pag.count > (pag.offset ?? 0) + pag.limit
  ) {
    lines.push(
      `\nShowing ${pag.limit} of ${pag.count} results. Use --limit and --offset to paginate.`,
    );
  }

  return lines.join("\n");
}

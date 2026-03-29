export type OutputFormat = "json" | "csv" | "table";

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
] as const;

type DataRecord = Record<string, unknown>;

function extractItems(data: DataRecord): unknown[] {
  for (const field of ARRAY_FIELDS) {
    if (Array.isArray(data[field])) {
      return data[field] as unknown[];
    }
  }
  return [data];
}

function hasPagination(data: DataRecord): {
  count: number;
  limit: number;
  offset: number;
} | null {
  const count = data.count;
  const limit = data.limit;
  const offset = data.offset ?? 0;
  if (typeof count === "number" && typeof limit === "number" && typeof offset === "number") {
    if (count > offset + limit) {
      return { count, limit, offset };
    }
  }
  return null;
}

function addTruncationMeta(data: DataRecord): DataRecord {
  const pag = hasPagination(data);
  if (pag) {
    return { ...data, _truncated: true, _next_offset: pag.offset + pag.limit };
  }
  return data;
}

export function formatOutput(data: object, format: OutputFormat): string {
  const d = data as DataRecord;
  switch (format) {
    case "json":
      return JSON.stringify(addTruncationMeta(d), null, 2);
    case "csv":
      return formatCSV(d);
    case "table":
      return formatTable(d);
  }
}

function formatCSV(data: DataRecord): string {
  const items = extractItems(data);
  if (items.length === 0) return "";

  const lines: string[] = [];
  const pag = hasPagination(data);

  if (pag) {
    lines.push(
      `# Showing ${pag.limit} of ${pag.count}. Use --limit/--offset for more.`,
    );
  }

  if (typeof items[0] === "string") {
    lines.push("value");
    for (const item of items) {
      lines.push(String(item));
    }
    return lines.join("\n");
  }

  const first = items[0] as DataRecord;
  const headers = Object.keys(first);
  lines.push(headers.join(","));

  for (const item of items) {
    const row = item as DataRecord;
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

function formatTable(data: DataRecord): string {
  const items = extractItems(data);
  if (items.length === 0) return "(no results)";

  if (typeof items[0] === "string") {
    return items.join("\n");
  }

  const rows = items as DataRecord[];
  const headers = Object.keys(rows[0]);

  const widths = headers.map((h) =>
    Math.max(
      h.length,
      ...rows.map((r) => String(r[h] ?? "").length),
    ),
  );

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

  const pag = hasPagination(data);
  if (pag) {
    lines.push(
      `\nShowing ${pag.limit} of ${pag.count} results. Use --limit and --offset to paginate.`,
    );
  }

  return lines.join("\n");
}

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatOutput } from "../cli/formatters.js";
import { resolveApiKey, validateDate, validatePositiveInt } from "../utils/validation.js";

describe("formatters", () => {
  const sampleData = {
    realtime_start: "2024-01-01",
    realtime_end: "2024-01-01",
    count: 100,
    offset: 0,
    limit: 2,
    seriess: [
      { id: "GDP", title: "Gross Domestic Product", frequency: "Quarterly" },
      { id: "UNRATE", title: "Unemployment Rate", frequency: "Monthly" },
    ],
  };

  describe("json format", () => {
    it("outputs valid JSON", () => {
      const output = formatOutput(sampleData as any, "json");
      const parsed = JSON.parse(output);
      assert.equal(parsed.seriess.length, 2);
    });

    it("adds _truncated when count > offset + limit", () => {
      const output = formatOutput(sampleData as any, "json");
      const parsed = JSON.parse(output);
      assert.equal(parsed._truncated, true);
      assert.equal(parsed._next_offset, 2);
    });

    it("does not add _truncated when all results shown", () => {
      const fullData = { ...sampleData, count: 2 };
      const output = formatOutput(fullData as any, "json");
      const parsed = JSON.parse(output);
      assert.equal(parsed._truncated, undefined);
    });
  });

  describe("csv format", () => {
    it("outputs header row + data rows", () => {
      const output = formatOutput(sampleData as any, "csv");
      const lines = output.split("\n");
      // First line may be truncation comment
      const headerLine = lines.find((l) => l.startsWith("id,"))!;
      assert.ok(headerLine);
      assert.ok(headerLine.includes("title"));
    });

    it("includes truncation comment when needed", () => {
      const output = formatOutput(sampleData as any, "csv");
      assert.ok(output.startsWith("# Showing 2 of 100"));
    });

    it("quotes values containing commas", () => {
      const data = {
        seriess: [{ id: "TEST", title: "One, Two, Three" }],
      };
      const output = formatOutput(data as any, "csv");
      assert.ok(output.includes('"One, Two, Three"'));
    });
  });

  describe("table format", () => {
    it("outputs aligned columns", () => {
      const output = formatOutput(sampleData as any, "table");
      const lines = output.split("\n");
      // Header, separator, data rows
      assert.ok(lines.length >= 4); // header + sep + 2 rows
      assert.ok(lines[0].includes("id"));
      assert.ok(lines[1].includes("\u2500")); // box-drawing horizontal
    });

    it("shows pagination footer when truncated", () => {
      const output = formatOutput(sampleData as any, "table");
      assert.ok(output.includes("Showing 2 of 100 results"));
    });

    it("returns '(no results)' for empty data", () => {
      const empty = { seriess: [] };
      const output = formatOutput(empty as any, "table");
      assert.equal(output, "(no results)");
    });
  });

  describe("vintage_dates (string arrays)", () => {
    const vintageData = {
      vintage_dates: ["2024-01-01", "2024-02-01", "2024-03-01"],
    };

    it("csv outputs one value per line", () => {
      const output = formatOutput(vintageData as any, "csv");
      const lines = output.split("\n");
      assert.equal(lines[0], "value");
      assert.equal(lines[1], "2024-01-01");
    });

    it("table outputs one date per line", () => {
      const output = formatOutput(vintageData as any, "table");
      assert.ok(output.includes("2024-01-01"));
    });
  });
});

describe("validation", () => {
  describe("validateDate", () => {
    it("accepts valid date", () => {
      assert.doesNotThrow(() => validateDate("2024-01-01", "test"));
    });

    it("rejects invalid format", () => {
      assert.throws(() => validateDate("01/01/2024", "test"), /YYYY-MM-DD/);
    });

    it("rejects partial date", () => {
      assert.throws(() => validateDate("2024-01", "test"), /YYYY-MM-DD/);
    });
  });

  describe("validatePositiveInt", () => {
    it("accepts valid positive integer", () => {
      assert.equal(validatePositiveInt("10", "test"), 10);
    });

    it("rejects zero", () => {
      assert.throws(() => validatePositiveInt("0", "test"), /positive integer/);
    });

    it("rejects negative", () => {
      assert.throws(() => validatePositiveInt("-1", "test"), /positive integer/);
    });

    it("rejects non-numeric", () => {
      assert.throws(() => validatePositiveInt("abc", "test"), /positive integer/);
    });

    it("rejects value exceeding max", () => {
      assert.throws(() => validatePositiveInt("200", "test", 100), /exceeds maximum/);
    });
  });

  describe("resolveApiKey", () => {
    it("prefers flag value", () => {
      assert.equal(resolveApiKey("flag-key"), "flag-key");
    });

    it("falls back to env var", () => {
      const orig = process.env.FRED_API_KEY;
      process.env.FRED_API_KEY = "env-key";
      try {
        assert.equal(resolveApiKey(undefined), "env-key");
      } finally {
        if (orig !== undefined) {
          process.env.FRED_API_KEY = orig;
        } else {
          delete process.env.FRED_API_KEY;
        }
      }
    });

    it("throws when no key available", () => {
      const orig = process.env.FRED_API_KEY;
      delete process.env.FRED_API_KEY;
      try {
        assert.throws(() => resolveApiKey(undefined), /No API key/);
      } finally {
        if (orig !== undefined) {
          process.env.FRED_API_KEY = orig;
        }
      }
    });
  });
});

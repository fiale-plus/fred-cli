import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const exec = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, "..", "cli.ts");
const TSX = join(__dirname, "..", "..", "node_modules", ".bin", "tsx");

async function run(
  args: string[],
  env?: Record<string, string>,
): Promise<{ stdout: string; stderr: string }> {
  try {
    const result = await exec(TSX, [CLI, ...args], {
      env: { ...process.env, ...env },
      timeout: 15_000,
    });
    return { stdout: result.stdout, stderr: result.stderr };
  } catch (err: any) {
    return { stdout: err.stdout || "", stderr: err.stderr || "" };
  }
}

describe("CLI integration (offline)", () => {
  it("shows help with --help", async () => {
    const { stdout } = await run(["--help"]);
    assert.ok(stdout.includes("fred-cli"));
    assert.ok(stdout.includes("COMMANDS"));
    assert.ok(stdout.includes("series"));
  });

  it("shows help with no args", async () => {
    const { stdout } = await run([]);
    assert.ok(stdout.includes("fred-cli"));
  });

  it("shows version with --version", async () => {
    const { stdout } = await run(["--version"]);
    assert.match(stdout.trim(), /^\d+\.\d+\.\d+/);
  });

  it("shows series help with just 'series'", async () => {
    const { stdout } = await run(["series"], { FRED_API_KEY: "fake" });
    assert.ok(stdout.includes("fred series"));
    assert.ok(stdout.includes("observations"));
  });

  it("errors on unknown command", async () => {
    const { stderr } = await run(["foobar"], { FRED_API_KEY: "fake" });
    assert.ok(stderr.includes("Unknown command"));
  });

  it("errors when no API key", async () => {
    const { stderr } = await run(["series", "GDP"], {
      FRED_API_KEY: "",
      // Clear env
    });
    assert.ok(stderr.includes("No API key") || stderr.includes("API key"));
  });

  it("errors on missing required arg", async () => {
    const { stderr } = await run(["series", "observations"], {
      FRED_API_KEY: "fake",
    });
    assert.ok(stderr.includes("series_id") || stderr.includes("Usage"));
  });
});

// ── Live API tests (only when FRED_API_KEY is set) ────────────────

const API_KEY = process.env.FRED_API_KEY;
const liveDescribe = API_KEY ? describe : describe.skip;

liveDescribe("CLI integration (live API)", () => {
  it("fred series GDP returns JSON with seriess array", async () => {
    const { stdout } = await run(["series", "GDP"]);
    const data = JSON.parse(stdout);
    assert.ok(Array.isArray(data.seriess));
    assert.equal(data.seriess[0].id, "GDP");
  });

  it("fred series observations GDP --limit 3 returns observations", async () => {
    const { stdout } = await run([
      "series", "observations", "GDP", "--limit", "3",
    ]);
    const data = JSON.parse(stdout);
    assert.ok(Array.isArray(data.observations));
    assert.equal(data.observations.length, 3);
    assert.ok(data._truncated === true);
  });

  it("fred series search returns results", async () => {
    const { stdout } = await run([
      "series", "search", "unemployment", "--limit", "2",
    ]);
    const data = JSON.parse(stdout);
    assert.ok(Array.isArray(data.seriess));
    assert.ok(data.seriess.length > 0);
  });

  it("fred category returns root category", async () => {
    const { stdout } = await run(["category"]);
    const data = JSON.parse(stdout);
    assert.ok(Array.isArray(data.categories));
  });

  it("fred category children 0 returns top-level categories", async () => {
    const { stdout } = await run(["category", "children", "0"]);
    const data = JSON.parse(stdout);
    assert.ok(data.categories.length > 0);
  });

  it("fred releases returns releases list", async () => {
    const { stdout } = await run(["releases", "--limit", "3"]);
    const data = JSON.parse(stdout);
    assert.ok(Array.isArray(data.releases));
    assert.ok(data.releases.length > 0);
  });

  it("fred sources returns sources list", async () => {
    const { stdout } = await run(["sources", "--limit", "3"]);
    const data = JSON.parse(stdout);
    assert.ok(Array.isArray(data.sources));
  });

  it("fred tags returns tags list", async () => {
    const { stdout } = await run(["tags", "--limit", "3"]);
    const data = JSON.parse(stdout);
    assert.ok(Array.isArray(data.tags));
  });

  it("supports csv output format", async () => {
    const { stdout } = await run([
      "series", "observations", "GDP", "--limit", "3", "-f", "csv",
    ]);
    const lines = stdout.trim().split("\n");
    // May have truncation comment
    const headerIdx = lines.findIndex((l) => l.startsWith("realtime_start"));
    assert.ok(headerIdx >= 0);
    assert.ok(lines.length > headerIdx + 1);
  });

  it("supports table output format", async () => {
    const { stdout } = await run([
      "series", "search", "gdp", "--limit", "2", "-f", "table",
    ]);
    assert.ok(stdout.includes("\u2500")); // box-drawing horizontal
  });
});

import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { FredClient, FredApiError } from "../api/client.js";
import { SERIES_RESPONSE, OBSERVATIONS_RESPONSE, SEARCH_RESPONSE, VINTAGE_DATES_RESPONSE } from "./fixtures/series.js";
import { CATEGORY_RESPONSE, CATEGORY_CHILDREN_RESPONSE, CATEGORY_SERIES_RESPONSE } from "./fixtures/category.js";
import { TAGS_RESPONSE, RELEASES_RESPONSE, SOURCES_RESPONSE } from "./fixtures/common.js";

let client: FredClient;
let fetchMock: ReturnType<typeof mock.fn>;

function mockFetch(response: unknown, status = 200) {
  fetchMock = mock.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock override
  (globalThis as { fetch: unknown }).fetch = fetchMock;
}

function getCalledUrl(): URL {
  const call = fetchMock.mock.calls[0];
  return new URL(call.arguments[0] as string);
}

describe("FredClient", () => {
  beforeEach(() => {
    client = new FredClient("test-api-key");
  });

  afterEach(() => {
    mock.restoreAll();
  });

  // ── Request mechanics ───────────────────────────────────────────

  describe("request mechanics", () => {
    it("includes api_key and file_type=json in every request", async () => {
      mockFetch(SERIES_RESPONSE);
      await client.getSeries("GDP");
      const url = getCalledUrl();
      assert.equal(url.searchParams.get("api_key"), "test-api-key");
      assert.equal(url.searchParams.get("file_type"), "json");
    });

    it("sets User-Agent header", async () => {
      mockFetch(SERIES_RESPONSE);
      await client.getSeries("GDP");
      const call = fetchMock.mock.calls[0];
      const opts = call.arguments[1] as RequestInit;
      assert.equal((opts.headers as Record<string, string>)["User-Agent"], "fred-cli");
    });

    it("constructs correct base URL", async () => {
      mockFetch(SERIES_RESPONSE);
      await client.getSeries("GDP");
      const url = getCalledUrl();
      assert.equal(url.origin, "https://api.stlouisfed.org");
      assert.equal(url.pathname, "/fred/series");
    });

    it("throws FredApiError on non-ok response", async () => {
      mockFetch({ error_message: "Bad Request" }, 400);
      await assert.rejects(
        () => client.getSeries("INVALID"),
        (err: unknown) => {
          assert.ok(err instanceof FredApiError);
          assert.equal(err.status, 400);
          return true;
        },
      );
    });

    it("omits undefined parameters", async () => {
      mockFetch(SERIES_RESPONSE);
      await client.getSeries("GDP", { realtime_start: undefined });
      const url = getCalledUrl();
      assert.equal(url.searchParams.has("realtime_start"), false);
    });
  });

  // ── Series endpoints ────────────────────────────────────────────

  describe("series", () => {
    it("getSeries sends correct params", async () => {
      mockFetch(SERIES_RESPONSE);
      const result = await client.getSeries("GDP", {
        realtime_start: "2024-01-01",
      });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series");
      assert.equal(url.searchParams.get("series_id"), "GDP");
      assert.equal(url.searchParams.get("realtime_start"), "2024-01-01");
      assert.equal(result.seriess[0].id, "GDP");
    });

    it("getObservations sends units and frequency", async () => {
      mockFetch(OBSERVATIONS_RESPONSE);
      await client.getObservations("GDP", {
        units: "pch",
        frequency: "a",
        limit: 10,
      });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series/observations");
      assert.equal(url.searchParams.get("series_id"), "GDP");
      assert.equal(url.searchParams.get("units"), "pch");
      assert.equal(url.searchParams.get("frequency"), "a");
      assert.equal(url.searchParams.get("limit"), "10");
    });

    it("getObservations sends observation date range", async () => {
      mockFetch(OBSERVATIONS_RESPONSE);
      await client.getObservations("GDP", {
        observation_start: "2023-01-01",
        observation_end: "2023-12-31",
        output_type: 1,
      });
      const url = getCalledUrl();
      assert.equal(url.searchParams.get("observation_start"), "2023-01-01");
      assert.equal(url.searchParams.get("observation_end"), "2023-12-31");
      assert.equal(url.searchParams.get("output_type"), "1");
    });

    it("searchSeries sends search_text", async () => {
      mockFetch(SEARCH_RESPONSE);
      await client.searchSeries("unemployment", { limit: 3 });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series/search");
      assert.equal(url.searchParams.get("search_text"), "unemployment");
      assert.equal(url.searchParams.get("limit"), "3");
    });

    it("getSeriesCategories sends series_id", async () => {
      mockFetch(CATEGORY_RESPONSE);
      await client.getSeriesCategories("GDP");
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series/categories");
      assert.equal(url.searchParams.get("series_id"), "GDP");
    });

    it("getSeriesRelease sends series_id", async () => {
      mockFetch({ releases: [] });
      await client.getSeriesRelease("GDP");
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series/release");
      assert.equal(url.searchParams.get("series_id"), "GDP");
    });

    it("getSeriesTags sends series_id", async () => {
      mockFetch(TAGS_RESPONSE);
      await client.getSeriesTags("GDP");
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series/tags");
      assert.equal(url.searchParams.get("series_id"), "GDP");
    });

    it("getSeriesUpdates sends pagination params", async () => {
      mockFetch(SERIES_RESPONSE);
      await client.getSeriesUpdates({ limit: 5, offset: 10 });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series/updates");
      assert.equal(url.searchParams.get("limit"), "5");
      assert.equal(url.searchParams.get("offset"), "10");
    });

    it("getSeriesVintageDates returns vintage_dates array", async () => {
      mockFetch(VINTAGE_DATES_RESPONSE);
      const result = await client.getSeriesVintageDates("GDP", { limit: 3 });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series/vintagedates");
      assert.equal(url.searchParams.get("series_id"), "GDP");
      assert.deepEqual(result.vintage_dates, ["1991-12-04", "1992-01-03", "1992-02-07"]);
    });

    it("getSeriesSearchTags sends search_text", async () => {
      mockFetch(TAGS_RESPONSE);
      await client.getSeriesSearchTags("gdp");
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series/search/tags");
      assert.equal(url.searchParams.get("search_text"), "gdp");
    });

    it("getSeriesSearchRelatedTags sends tag_names", async () => {
      mockFetch(TAGS_RESPONSE);
      await client.getSeriesSearchRelatedTags("gdp", { tag_names: "usa" });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/series/search/related_tags");
      assert.equal(url.searchParams.get("search_text"), "gdp");
      assert.equal(url.searchParams.get("tag_names"), "usa");
    });
  });

  // ── Category endpoints ──────────────────────────────────────────

  describe("categories", () => {
    it("getCategory defaults to root (0)", async () => {
      mockFetch(CATEGORY_RESPONSE);
      await client.getCategory();
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/category");
      assert.equal(url.searchParams.get("category_id"), "0");
    });

    it("getCategory sends specific id", async () => {
      mockFetch(CATEGORY_RESPONSE);
      await client.getCategory(32991);
      const url = getCalledUrl();
      assert.equal(url.searchParams.get("category_id"), "32991");
    });

    it("getCategoryChildren sends category_id", async () => {
      mockFetch(CATEGORY_CHILDREN_RESPONSE);
      const result = await client.getCategoryChildren(32991);
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/category/children");
      assert.equal(url.searchParams.get("category_id"), "32991");
      assert.equal(result.categories.length, 3);
    });

    it("getCategorySeries sends category_id with pagination", async () => {
      mockFetch(CATEGORY_SERIES_RESPONSE);
      await client.getCategorySeries(32991, { limit: 10, sort_order: "desc" });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/category/series");
      assert.equal(url.searchParams.get("category_id"), "32991");
      assert.equal(url.searchParams.get("limit"), "10");
      assert.equal(url.searchParams.get("sort_order"), "desc");
    });

    it("getCategoryTags sends tag filter params", async () => {
      mockFetch(TAGS_RESPONSE);
      await client.getCategoryTags(32991, { tag_group_id: "geo" });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/category/tags");
      assert.equal(url.searchParams.get("tag_group_id"), "geo");
    });

    it("getCategoryRelatedTags requires tag_names", async () => {
      mockFetch(TAGS_RESPONSE);
      await client.getCategoryRelatedTags(32991, { tag_names: "usa" });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/category/related_tags");
      assert.equal(url.searchParams.get("tag_names"), "usa");
    });
  });

  // ── Release endpoints ───────────────────────────────────────────

  describe("releases", () => {
    it("getReleases sends pagination", async () => {
      mockFetch(RELEASES_RESPONSE);
      await client.getReleases({ limit: 2 });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/releases");
      assert.equal(url.searchParams.get("limit"), "2");
    });

    it("getReleasesDates hits correct path", async () => {
      mockFetch({ release_dates: [] });
      await client.getReleasesDates();
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/releases/dates");
    });

    it("getRelease sends release_id", async () => {
      mockFetch({ releases: [] });
      await client.getRelease(53);
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/release");
      assert.equal(url.searchParams.get("release_id"), "53");
    });

    it("getReleaseSeries sends release_id", async () => {
      mockFetch(SERIES_RESPONSE);
      await client.getReleaseSeries(53, { limit: 5 });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/release/series");
      assert.equal(url.searchParams.get("release_id"), "53");
    });

    it("getReleaseTables sends release_id", async () => {
      mockFetch({ name: "test", elements: {} });
      await client.getReleaseTables(53);
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/release/tables");
      assert.equal(url.searchParams.get("release_id"), "53");
    });
  });

  // ── Source endpoints ────────────────────────────────────────────

  describe("sources", () => {
    it("getSources sends pagination", async () => {
      mockFetch(SOURCES_RESPONSE);
      await client.getSources({ limit: 2 });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/sources");
      assert.equal(url.searchParams.get("limit"), "2");
    });

    it("getSource sends source_id", async () => {
      mockFetch({ sources: [] });
      await client.getSource(1);
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/source");
      assert.equal(url.searchParams.get("source_id"), "1");
    });

    it("getSourceReleases sends source_id", async () => {
      mockFetch(RELEASES_RESPONSE);
      await client.getSourceReleases(1, { limit: 5 });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/source/releases");
      assert.equal(url.searchParams.get("source_id"), "1");
    });
  });

  // ── Tag endpoints ───────────────────────────────────────────────

  describe("tags", () => {
    it("getTags sends tag filter params", async () => {
      mockFetch(TAGS_RESPONSE);
      await client.getTags({ tag_group_id: "geo", search_text: "united" });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/tags");
      assert.equal(url.searchParams.get("tag_group_id"), "geo");
      assert.equal(url.searchParams.get("search_text"), "united");
    });

    it("getRelatedTags sends tag_names", async () => {
      mockFetch(TAGS_RESPONSE);
      await client.getRelatedTags({ tag_names: "gdp;usa" });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/related_tags");
      assert.equal(url.searchParams.get("tag_names"), "gdp;usa");
    });

    it("getTagsSeries sends tag_names", async () => {
      mockFetch(SERIES_RESPONSE);
      await client.getTagsSeries("gdp;quarterly", { limit: 5 });
      const url = getCalledUrl();
      assert.equal(url.pathname, "/fred/tags/series");
      assert.equal(url.searchParams.get("tag_names"), "gdp;quarterly");
      assert.equal(url.searchParams.get("limit"), "5");
    });
  });
});

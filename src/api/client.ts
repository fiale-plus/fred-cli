import type {
  RealtimeParams,
  PaginationParams,
  ObservationParams,
  SearchParams,
  TagFilterParams,
  RelatedTagParams,
  FredSeriesResponse,
  FredObservationsResponse,
  FredCategoryResponse,
  FredReleasesResponse,
  FredReleaseResponse,
  FredReleaseDatesResponse,
  FredReleaseTable,
  FredSourcesResponse,
  FredSourceResponse,
  FredTagsResponse,
} from "./types.js";

const BASE_URL = "https://api.stlouisfed.org/fred";

export class FredApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorMessage: string,
  ) {
    super(`FRED API error ${status}: ${errorMessage}`);
    this.name = "FredApiError";
  }
}

export class FredClient {
  private apiKey: string;
  private timeout: number;

  constructor(apiKey: string, timeout = 10_000) {
    this.apiKey = apiKey;
    this.timeout = timeout;
  }

  private async request<T>(
    path: string,
    params: Record<string, unknown> = {},
  ): Promise<T> {
    const url = new URL(`${BASE_URL}/${path}`);
    url.searchParams.set("api_key", this.apiKey);
    url.searchParams.set("file_type", "json");

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { "User-Agent": "fred-cli" },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "Unknown error");
        throw new FredApiError(res.status, text);
      }

      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Series ──────────────────────────────────────────────────────

  async getSeries(seriesId: string, opts: RealtimeParams = {}): Promise<FredSeriesResponse> {
    return this.request("series", { series_id: seriesId, ...opts });
  }

  async getObservations(
    seriesId: string,
    opts: ObservationParams = {},
  ): Promise<FredObservationsResponse> {
    return this.request("series/observations", { series_id: seriesId, ...opts });
  }

  async searchSeries(
    searchText: string,
    opts: SearchParams = {},
  ): Promise<FredSeriesResponse> {
    return this.request("series/search", { search_text: searchText, ...opts });
  }

  async getSeriesCategories(
    seriesId: string,
    opts: RealtimeParams = {},
  ): Promise<FredCategoryResponse> {
    return this.request("series/categories", { series_id: seriesId, ...opts });
  }

  async getSeriesRelease(
    seriesId: string,
    opts: RealtimeParams = {},
  ): Promise<FredReleaseResponse> {
    return this.request("series/release", { series_id: seriesId, ...opts });
  }

  async getSeriesTags(
    seriesId: string,
    opts: PaginationParams = {},
  ): Promise<FredTagsResponse> {
    return this.request("series/tags", { series_id: seriesId, ...opts });
  }

  async getSeriesUpdates(opts: PaginationParams = {}): Promise<FredSeriesResponse> {
    return this.request("series/updates", { ...opts });
  }

  async getSeriesVintageDates(
    seriesId: string,
    opts: PaginationParams = {},
  ): Promise<{ realtime_start: string; realtime_end: string; vintage_dates: string[] }> {
    return this.request("series/vintagedates", { series_id: seriesId, ...opts });
  }

  async getSeriesSearchTags(
    searchText: string,
    opts: TagFilterParams = {},
  ): Promise<FredTagsResponse> {
    return this.request("series/search/tags", { search_text: searchText, ...opts });
  }

  async getSeriesSearchRelatedTags(
    searchText: string,
    opts: RelatedTagParams,
  ): Promise<FredTagsResponse> {
    return this.request("series/search/related_tags", {
      search_text: searchText,
      ...opts,
    });
  }

  // ── Categories ──────────────────────────────────────────────────

  async getCategory(categoryId = 0): Promise<FredCategoryResponse> {
    return this.request("category", { category_id: categoryId });
  }

  async getCategoryChildren(
    categoryId: number,
    opts: RealtimeParams = {},
  ): Promise<FredCategoryResponse> {
    return this.request("category/children", { category_id: categoryId, ...opts });
  }

  async getCategoryRelated(
    categoryId: number,
    opts: RealtimeParams = {},
  ): Promise<FredCategoryResponse> {
    return this.request("category/related", { category_id: categoryId, ...opts });
  }

  async getCategorySeries(
    categoryId: number,
    opts: PaginationParams = {},
  ): Promise<FredSeriesResponse> {
    return this.request("category/series", { category_id: categoryId, ...opts });
  }

  async getCategoryTags(
    categoryId: number,
    opts: TagFilterParams = {},
  ): Promise<FredTagsResponse> {
    return this.request("category/tags", { category_id: categoryId, ...opts });
  }

  async getCategoryRelatedTags(
    categoryId: number,
    opts: RelatedTagParams,
  ): Promise<FredTagsResponse> {
    return this.request("category/related_tags", { category_id: categoryId, ...opts });
  }

  // ── Releases ────────────────────────────────────────────────────

  async getReleases(opts: PaginationParams = {}): Promise<FredReleasesResponse> {
    return this.request("releases", { ...opts });
  }

  async getReleasesDates(opts: PaginationParams = {}): Promise<FredReleaseDatesResponse> {
    return this.request("releases/dates", { ...opts });
  }

  async getRelease(releaseId: number, opts: RealtimeParams = {}): Promise<FredReleaseResponse> {
    return this.request("release", { release_id: releaseId, ...opts });
  }

  async getReleaseDates(
    releaseId: number,
    opts: PaginationParams = {},
  ): Promise<FredReleaseDatesResponse> {
    return this.request("release/dates", { release_id: releaseId, ...opts });
  }

  async getReleaseSeries(
    releaseId: number,
    opts: PaginationParams = {},
  ): Promise<FredSeriesResponse> {
    return this.request("release/series", { release_id: releaseId, ...opts });
  }

  async getReleaseSources(
    releaseId: number,
    opts: RealtimeParams = {},
  ): Promise<FredSourcesResponse> {
    return this.request("release/sources", { release_id: releaseId, ...opts });
  }

  async getReleaseTags(
    releaseId: number,
    opts: TagFilterParams = {},
  ): Promise<FredTagsResponse> {
    return this.request("release/tags", { release_id: releaseId, ...opts });
  }

  async getReleaseRelatedTags(
    releaseId: number,
    opts: RelatedTagParams,
  ): Promise<FredTagsResponse> {
    return this.request("release/related_tags", { release_id: releaseId, ...opts });
  }

  async getReleaseTables(
    releaseId: number,
    opts: { element_id?: number } & RealtimeParams = {},
  ): Promise<FredReleaseTable> {
    return this.request("release/tables", { release_id: releaseId, ...opts });
  }

  // ── Sources ─────────────────────────────────────────────────────

  async getSources(opts: PaginationParams = {}): Promise<FredSourcesResponse> {
    return this.request("sources", { ...opts });
  }

  async getSource(sourceId: number, opts: RealtimeParams = {}): Promise<FredSourceResponse> {
    return this.request("source", { source_id: sourceId, ...opts });
  }

  async getSourceReleases(
    sourceId: number,
    opts: PaginationParams = {},
  ): Promise<FredReleasesResponse> {
    return this.request("source/releases", { source_id: sourceId, ...opts });
  }

  // ── Tags ────────────────────────────────────────────────────────

  async getTags(opts: TagFilterParams = {}): Promise<FredTagsResponse> {
    return this.request("tags", { ...opts });
  }

  async getRelatedTags(opts: RelatedTagParams): Promise<FredTagsResponse> {
    return this.request("related_tags", { ...opts });
  }

  async getTagsSeries(
    tagNames: string,
    opts: PaginationParams & { exclude_tag_names?: string } = {},
  ): Promise<FredSeriesResponse> {
    return this.request("tags/series", { tag_names: tagNames, ...opts });
  }
}

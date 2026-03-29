// ── Common parameter types ──────────────────────────────────────────

export interface RealtimeParams {
  realtime_start?: string;
  realtime_end?: string;
}

export interface PaginationParams extends RealtimeParams {
  limit?: number;
  offset?: number;
  sort_order?: "asc" | "desc";
  order_by?: string;
}

export interface ObservationParams extends RealtimeParams {
  limit?: number;
  offset?: number;
  sort_order?: "asc" | "desc";
  observation_start?: string;
  observation_end?: string;
  units?: "lin" | "chg" | "ch1" | "pch" | "pc1" | "pca" | "cch" | "cca" | "log";
  frequency?: string;
  aggregation_method?: "avg" | "sum" | "eop";
  output_type?: 1 | 2 | 3 | 4;
  vintage_dates?: string;
}

export interface SearchParams extends PaginationParams {
  search_type?: "full_text" | "series_id";
  filter_variable?: string;
  filter_value?: string;
  tag_names?: string;
  exclude_tag_names?: string;
}

export interface TagFilterParams extends PaginationParams {
  tag_names?: string;
  tag_group_id?: "freq" | "gen" | "geo" | "geot" | "rls" | "seas" | "src" | "cc";
  search_text?: string;
  exclude_tag_names?: string;
}

export interface RelatedTagParams extends TagFilterParams {
  tag_names: string; // required for related_tags
}

// ── Response envelope ───────────────────────────────────────────────

export interface FredPaginatedEnvelope {
  realtime_start: string;
  realtime_end: string;
  order_by?: string;
  sort_order?: string;
  count: number;
  offset: number;
  limit: number;
}

// ── Series types ────────────────────────────────────────────────────

export interface FredSeries {
  id: string;
  realtime_start: string;
  realtime_end: string;
  title: string;
  observation_start: string;
  observation_end: string;
  frequency: string;
  frequency_short: string;
  units: string;
  units_short: string;
  seasonal_adjustment: string;
  seasonal_adjustment_short: string;
  last_updated: string;
  popularity: number;
  group_popularity?: number;
  notes?: string;
}

export interface FredSeriesResponse extends FredPaginatedEnvelope {
  seriess: FredSeries[];
}

// ── Observation types ───────────────────────────────────────────────

export interface FredObservation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string; // FRED returns "." for missing values
}

export interface FredObservationsResponse extends FredPaginatedEnvelope {
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  observations: FredObservation[];
}

// ── Category types ──────────────────────────────────────────────────

export interface FredCategory {
  id: number;
  name: string;
  parent_id: number;
  notes?: string;
}

export interface FredCategoryResponse {
  categories: FredCategory[];
}

// ── Release types ───────────────────────────────────────────────────

export interface FredRelease {
  id: number;
  realtime_start: string;
  realtime_end: string;
  name: string;
  press_release: boolean;
  link?: string;
  notes?: string;
}

export interface FredReleasesResponse extends FredPaginatedEnvelope {
  releases: FredRelease[];
}

export interface FredReleaseResponse {
  releases: FredRelease[];
}

export interface FredReleaseDate {
  release_id: number;
  release_name?: string;
  date: string;
}

export interface FredReleaseDatesResponse extends FredPaginatedEnvelope {
  release_dates: FredReleaseDate[];
}

export interface FredReleaseTable {
  name: string;
  element_id: number;
  release_id: string;
  elements: Record<string, FredReleaseTableElement>;
}

export interface FredReleaseTableElement {
  element_id: number;
  release_id: number;
  series_id?: string;
  parent_id: number;
  line: string;
  type: string;
  name: string;
  level: string;
  children: FredReleaseTableElement[];
}

// ── Source types ─────────────────────────────────────────────────────

export interface FredSource {
  id: number;
  realtime_start: string;
  realtime_end: string;
  name: string;
  link?: string;
  notes?: string;
}

export interface FredSourcesResponse extends FredPaginatedEnvelope {
  sources: FredSource[];
}

export interface FredSourceResponse {
  sources: FredSource[];
}

// ── Tag types ───────────────────────────────────────────────────────

export interface FredTag {
  name: string;
  group_id: string;
  notes?: string;
  created: string;
  popularity: number;
  series_count: number;
}

export interface FredTagsResponse extends FredPaginatedEnvelope {
  tags: FredTag[];
}

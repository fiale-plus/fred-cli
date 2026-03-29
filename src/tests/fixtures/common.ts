export const TAGS_RESPONSE = {
  realtime_start: "2024-01-01",
  realtime_end: "2024-01-01",
  order_by: "series_count",
  sort_order: "desc",
  count: 5000,
  offset: 0,
  limit: 2,
  tags: [
    {
      name: "gdp",
      group_id: "gen",
      notes: "",
      created: "2012-02-27 10:18:19-06",
      popularity: 86,
      series_count: 256,
    },
    {
      name: "nsa",
      group_id: "seas",
      notes: "Not Seasonally Adjusted",
      created: "2012-02-27 10:18:19-06",
      popularity: 100,
      series_count: 500000,
    },
  ],
};

export const RELEASES_RESPONSE = {
  realtime_start: "2024-01-01",
  realtime_end: "2024-01-01",
  order_by: "release_id",
  sort_order: "asc",
  count: 300,
  offset: 0,
  limit: 2,
  releases: [
    {
      id: 11,
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      name: "Employment Situation",
      press_release: true,
      link: "https://www.bls.gov/news.release/empsit.toc.htm",
    },
    {
      id: 13,
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      name: "G.17 Industrial Production and Capacity Utilization",
      press_release: true,
      link: "https://www.federalreserve.gov/releases/g17/",
    },
  ],
};

export const SOURCES_RESPONSE = {
  realtime_start: "2024-01-01",
  realtime_end: "2024-01-01",
  order_by: "source_id",
  sort_order: "asc",
  count: 100,
  offset: 0,
  limit: 2,
  sources: [
    {
      id: 1,
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      name: "Board of Governors of the Federal Reserve System (US)",
      link: "http://www.federalreserve.gov/",
    },
    {
      id: 3,
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      name: "Federal Reserve Bank of Philadelphia",
      link: "https://www.philadelphiafed.org/",
    },
  ],
};

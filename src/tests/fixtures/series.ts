export const SERIES_RESPONSE = {
  realtime_start: "2024-01-01",
  realtime_end: "2024-01-01",
  seriess: [
    {
      id: "GDP",
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      title: "Gross Domestic Product",
      observation_start: "1947-01-01",
      observation_end: "2023-10-01",
      frequency: "Quarterly",
      frequency_short: "Q",
      units: "Billions of Dollars",
      units_short: "Bil. of $",
      seasonal_adjustment: "Seasonally Adjusted Annual Rate",
      seasonal_adjustment_short: "SAAR",
      last_updated: "2024-01-25 07:56:02-06",
      popularity: 94,
      notes: "BEA Account Code: A191RC",
    },
  ],
};

export const OBSERVATIONS_RESPONSE = {
  realtime_start: "2024-01-01",
  realtime_end: "2024-01-01",
  observation_start: "2023-01-01",
  observation_end: "2023-12-31",
  units: "lin",
  output_type: 1,
  file_type: "json",
  order_by: "observation_date",
  sort_order: "asc",
  count: 4,
  offset: 0,
  limit: 100000,
  observations: [
    {
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      date: "2023-01-01",
      value: "26813.601",
    },
    {
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      date: "2023-04-01",
      value: "27063.012",
    },
    {
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      date: "2023-07-01",
      value: "27610.128",
    },
  ],
};

export const SEARCH_RESPONSE = {
  realtime_start: "2024-01-01",
  realtime_end: "2024-01-01",
  order_by: "search_rank",
  sort_order: "desc",
  count: 500,
  offset: 0,
  limit: 3,
  seriess: [
    {
      id: "UNRATE",
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      title: "Unemployment Rate",
      observation_start: "1948-01-01",
      observation_end: "2023-12-01",
      frequency: "Monthly",
      frequency_short: "M",
      units: "Percent",
      units_short: "%",
      seasonal_adjustment: "Seasonally Adjusted",
      seasonal_adjustment_short: "SA",
      last_updated: "2024-01-05 08:11:04-06",
      popularity: 98,
      notes: "The unemployment rate...",
    },
  ],
};

export const VINTAGE_DATES_RESPONSE = {
  realtime_start: "1776-07-04",
  realtime_end: "9999-12-31",
  order_by: "vintage_date",
  sort_order: "asc",
  count: 100,
  offset: 0,
  limit: 3,
  vintage_dates: ["1991-12-04", "1992-01-03", "1992-02-07"],
};

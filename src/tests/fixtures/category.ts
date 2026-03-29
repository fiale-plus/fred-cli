export const CATEGORY_RESPONSE = {
  categories: [
    {
      id: 32991,
      name: "Money, Banking, & Finance",
      parent_id: 0,
    },
  ],
};

export const CATEGORY_CHILDREN_RESPONSE = {
  categories: [
    { id: 32992, name: "Banking", parent_id: 32991 },
    { id: 32993, name: "Business Lending", parent_id: 32991 },
    { id: 32994, name: "Exchange Rates", parent_id: 32991 },
  ],
};

export const CATEGORY_SERIES_RESPONSE = {
  realtime_start: "2024-01-01",
  realtime_end: "2024-01-01",
  order_by: "series_id",
  sort_order: "asc",
  count: 50,
  offset: 0,
  limit: 2,
  seriess: [
    {
      id: "DFF",
      realtime_start: "2024-01-01",
      realtime_end: "2024-01-01",
      title: "Federal Funds Effective Rate",
      observation_start: "1954-07-01",
      observation_end: "2024-01-01",
      frequency: "Daily",
      frequency_short: "D",
      units: "Percent",
      units_short: "%",
      seasonal_adjustment: "Not Seasonally Adjusted",
      seasonal_adjustment_short: "NSA",
      last_updated: "2024-01-02 15:16:17-06",
      popularity: 92,
      notes: "",
    },
  ],
};

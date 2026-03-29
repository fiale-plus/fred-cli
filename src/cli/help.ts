export const MAIN_HELP = `fred-cli — Unofficial CLI for the FRED API (Federal Reserve Economic Data)

USAGE
  fred <command> [subcommand] [args] [options]

COMMANDS
  series       Series metadata, observations, and search
  category     Category tree navigation
  releases     All releases
  release      Single release details
  sources      All data sources
  source       Single source details
  tags         Tag search and discovery
  related-tags Related tags lookup

GLOBAL OPTIONS
  --api-key <key>                API key (or set FRED_API_KEY env var)
  -f, --format <json|csv|table>  Output format (default: json)
  --realtime-start <YYYY-MM-DD>  Realtime period start
  --realtime-end <YYYY-MM-DD>    Realtime period end
  --limit <n>                    Max results
  --offset <n>                   Result offset for pagination
  --sort-order <asc|desc>        Sort order
  --order-by <field>             Sort field (varies by endpoint)
  --help                         Show help
  --version                      Show version

API KEY
  Get a free key at: https://fred.stlouisfed.org/docs/api/api_key.html

EXAMPLES
  fred series GDP
  fred series observations CPIAUCSL --units pch --limit 12
  fred series search "unemployment rate" --limit 5
  fred category 0
  fred category children 32991

DISCLAIMER
  This tool is NOT affiliated with the Federal Reserve Bank of St. Louis
  or the Federal Reserve System. FRED is a registered trademark of the
  Federal Reserve Bank of St. Louis.
`;

export const SERIES_HELP = `fred series — Series metadata, observations, and search

USAGE
  fred series <series_id>                        Get series metadata
  fred series observations <series_id>           Get data observations
  fred series search <search_text>               Search for series
  fred series categories <series_id>             Get series categories
  fred series release <series_id>                Get series release
  fred series tags <series_id>                   Get series tags
  fred series updates                            Recently updated series
  fred series vintagedates <series_id>           Get vintage dates
  fred series search-tags <search_text>          Tags for a search
  fred series search-related-tags <search_text>  Related tags for a search

OBSERVATION OPTIONS
  --units <lin|chg|ch1|pch|pc1|pca|cch|cca|log>  Data transformation
  --frequency <d|w|bw|m|q|sa|a>                   Aggregation frequency
  --aggregation-method <avg|sum|eop>               Aggregation method
  --output-type <1|2|3|4>                          Output type
  --observation-start <YYYY-MM-DD>                 Observation start date
  --observation-end <YYYY-MM-DD>                   Observation end date
  --vintage-dates <YYYY-MM-DD,...>                 Comma-separated vintage dates

SEARCH OPTIONS
  --search-type <full_text|series_id>  Search type
  --tag-names <tag1;tag2>              Filter by tags (semicolon-separated)

EXAMPLES
  fred series GDP
  fred series observations GDP --units pch --frequency a
  fred series search "consumer price index" --limit 10
  fred series updates --limit 5
`;

export const CATEGORY_HELP = `fred category — Category tree navigation

USAGE
  fred category [category_id]                    Get category (default: root)
  fred category children [category_id]           Get child categories
  fred category related <category_id>            Get related categories
  fred category series <category_id>             Get series in category
  fred category tags <category_id>               Get category tags
  fred category related-tags <category_id>       Get related tags

EXAMPLES
  fred category                    # root category
  fred category 32991              # specific category
  fred category children 0         # top-level children
  fred category series 32991       # series in category
`;

export const RELEASE_HELP = `fred release — Single release details

USAGE
  fred release <release_id>                      Get release metadata
  fred release dates <release_id>                Get release dates
  fred release series <release_id>               Get series on release
  fred release sources <release_id>              Get release sources
  fred release tags <release_id>                 Get release tags
  fred release related-tags <release_id>         Get related tags
  fred release tables <release_id>               Get release tables

EXAMPLES
  fred release 53
  fred release series 53 --limit 10
`;

export const RELEASES_HELP = `fred releases — All releases of economic data

USAGE
  fred releases                                  Get all releases
  fred releases dates                            Get all release dates

EXAMPLES
  fred releases --limit 10
  fred releases dates --limit 20
`;

export const SOURCE_HELP = `fred source — Single source details

USAGE
  fred source <source_id>                        Get source metadata
  fred source releases <source_id>               Get releases for source

EXAMPLES
  fred source 1
  fred source releases 1 --limit 10
`;

export const SOURCES_HELP = `fred sources — All data sources

USAGE
  fred sources                                   Get all sources

EXAMPLES
  fred sources --limit 10
`;

export const TAGS_HELP = `fred tags — Tag search and discovery

USAGE
  fred tags                                      Get all/search tags
  fred tags series                               Get series matching tags

OPTIONS
  --tag-names <tag1;tag2>          Filter by tag names (semicolon-separated)
  --tag-group-id <id>              Filter by group: freq|gen|geo|geot|rls|seas|src|cc
  --search-text <text>             Search within tags

EXAMPLES
  fred tags --search-text "gdp"
  fred tags --tag-group-id geo --limit 10
  fred tags series --tag-names "gdp;usa"
`;

export const RELATED_TAGS_HELP = `fred related-tags — Related tags lookup

USAGE
  fred related-tags --tag-names <tag1;tag2>      Get related tags (--tag-names required)

EXAMPLES
  fred related-tags --tag-names "gdp" --limit 10
`;

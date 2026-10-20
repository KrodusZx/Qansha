# Qansha? — worldwide city search

## Coverage
- 34,163 populated places in 244 countries and territories, from the GeoNames-derived `datasets/world-cities` catalogue (cities of approximately 15,000+ inhabitants plus capitals).
- Source: https://github.com/datasets/world-cities, upstream https://www.geonames.org/
- Dataset license: Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/
- This is broad worldwide coverage, not literally every settlement.
- Stored as `data/world-cities.tsv`, bundled by `vercel.json` into `api/cities.js`. Search is local and does not invoke a paid geocoding API.
- Earlier deprecated country codes normalized to ISO 3166-1: France FR, UK GB, Benin BJ, Burkina Faso BF, Serbia RS, Timor-Leste TL. Kosovo retains commonly used XK.

## UI and API
- Two controls: country (all catalogue countries) and city autocomplete (up to 24 matching cities with region label). Supports common Cyrillic aliases and transliteration.
- `GET /api/cities?mode=countries` returns countries and coverage.
- `GET /api/cities?q=Paris&country=FR` returns city suggestions; two or more characters required.
- Keyboard support: Up/Down, Enter to select, Escape to close; focus selects existing text.
- Worldwide countries are also available in the country comparison tab.

## Price model and travel inventory
- Existing 17 modeled city examples are maintained, but must not be used as verified live prices.
- A city without modeled price data uses an editable planning template: EUR 60 per person/day and EUR 85 per double room/night by default. These are **user-adjustable placeholder values, NOT city-level cost data**.
- Restaurant, groceries, transit and coffee prices display em dashes (no local data) rather than fabricated prices for a new city. Activity suggestions from another city are not reused.
- Country comparisons show "data unavailable" rather than ranking unmodeled destinations.
- World city coverage for the budget planner does not guarantee an airport or an available hotel in that settlement. Flight search still uses IATA airports and supplier inventory.

## QA
- Backend regression tests: `npm test` including exact names, Russian transliteration, countries, invalid query validation.
- Business requirement: if price data becomes available later from a licensed provider, integrate it separately; do not conflate geographic coverage with verified pricing.

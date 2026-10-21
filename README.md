# Qansha — City Cost Guide

Qansha is moving from paid live travel search to a city cost guide. The current release provides planning estimates for 17 cities, an international city picker, and city comparison in Russian, Kazakh, and English.

## Data notes

- City names are searched against the project's local GeoNames-derived dataset (`data/world-cities.tsv`, CC BY 4.0); this does not call SerpApi.
- The initial cost figures are inherited from Qansha's former trip planner and are clearly labeled as indicative estimates, not verified live prices or a representative cost-of-living index.
- Cities without cost data are searchable but shown as not yet covered. The interface does not invent or borrow prices for them.
- The former flight and hotel metasearch version is preserved on the `archive/metasearch-2026-10-21` branch.

## Run checks

```sh
npm test
```

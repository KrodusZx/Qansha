# Qansha — City Cost Guide

Qansha is a city cost guide and trip budget planner in Russian, Kazakh, and English. The former flight and hotel metasearch is preserved on the `archive/metasearch-2026-10-21` branch.

## City and cost data

- The site searches the local GeoNames-derived city directory (`data/world-cities.tsv`, CC BY 4.0), covering over 34,000 cities. It does not call a paid autocomplete API.
- The homepage offers 86 curated destinations. The 17 cities with cost figures use **indicative estimates** carried forward from the former Qansha planner. These are not verified live prices or a representative cost-of-living index.
- Destinations without Qansha figures can still be selected. Travelers enter their own daily spending assumption; the site never attributes that number to Qansha.

## Trip planner

Travelers choose a destination, trip days, hotel nights, travelers, rooms, and their total trip budget. They enter round-trip flight cost per person and hotel cost per room per night. Daily spending starts from the selected Qansha estimate when available, and is editable. The result separately displays flights, accommodation, everyday spending, total cost, cost per traveler, and the difference from the selected budget. All monetary inputs and outputs are in EUR. A missing flight or hotel cost is left blank until entered; enter `0` if there is no such cost.

The flight and hotel search endpoint is paused and returns HTTP 410, so the planner makes no SerpApi requests. The Travelpayouts Drive snippet remains installed in the page head.

Run checks with `npm test`.

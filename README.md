# Qansha — City Cost Guide

Qansha is a city cost guide and trip budget planner in Russian, Kazakh, and English. The former flight and hotel metasearch is preserved on the `archive/metasearch-2026-10-21` branch.

## City and cost data

- The site searches the local GeoNames-derived city directory (`data/world-cities.tsv`, CC BY 4.0), covering over 34,000 cities. It does not call a paid autocomplete API.
- The homepage includes 65 city profiles. The original 17 editorial EUR estimates from 21 October 2026 are restored exactly, including the daily, room, dinner-for-two, grocery-basket, and single-ride figures. They have no external price source and are labelled as historical planning estimates. The other 48 profiles retain linked traveler spending or Numbeo food data. None are live quotes.
- Separately sourced public transit fares show the price of two selected city rides; short taxi examples appear only where a fare basis was checked. These cards are independent of the daily figure and show the source and checked date. The original editorial single-ride estimate is labelled separately where present.
- Destinations without Qansha figures can still be selected. Travelers enter their own daily spending assumption; the site never attributes that number to Qansha.

## Trip planner

Travelers choose a destination, trip days, hotel nights, travelers, rooms, and their total trip budget. They enter round-trip flight cost per person and hotel cost per room per night. Daily spending starts from the selected Qansha estimate when available, and is editable. The result separately displays flights, accommodation, everyday spending, total cost, cost per traveler, and the difference from the selected budget. KZT is the default display currency. A missing flight or hotel cost is left blank until entered; enter `0` if there is no such cost.

The flight and hotel search endpoint is paused and returns HTTP 410, so the planner makes no SerpApi requests. The old Travelpayouts Drive snippet has been removed from the active site; the metasearch remains archived.

Run checks with `npm test`.

# Qansha? 6.0 — search and booking readiness

## Available search
- SerpApi Google Flights: up to 12 candidate one-way flights per direction and up to 48 cheapest round-trip combinations. A round-trip combination consists of two independent one-way fares, not a through-ticket.
- Flight filters: price, carrier, stops, duration, departure time. Flight detail card includes airline, number and aircraft when provided.
- SerpApi Google Hotels: both properties and non_matching_properties, up to 60 hotel results per page; property detail, amenity and photo gallery on demand.
- Hotel booking: individual provider booking links when available, otherwise Google Hotels search.
- Flight booking: supplier links when a booking token is available. Other flights open Google Flights search for route and dates and are not guaranteed to match a selected itinerary.
- Selected offers update the budget and can be deselected. Favorites toggle persists in browser storage or with configured Supabase.
- Language slogans: Qansha? — Бір жауап / Сколько? — Один ответ / How much? — One answer.

## Remaining prerequisites
This release does NOT accept payments or issue flight tickets within Qansha?. Production merchant agreements, booking API approval and credentials, payment processing, booking management, refunds and support are needed (e.g. Duffel Flights + Duffel Payments, Booking.com Demand API or Expedia Rapid).
SerpApi is for search/comparison, not merchant ticketing. Never imply payment, booking or ticket issuance after redirect.

## Secrets / accounts
The only verified Vercel production environment variable is SERPAPI_API_KEY; do not expose it in client code.
Sign-in remains unconfigured until public Supabase client config and RLS schema are activated.
Prices and currency conversions must be verified before purchase; local living cost model estimates are not live costs.

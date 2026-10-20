# Qansha Security 1.0 — baseline protections

## Implemented
- Shared, best-effort API throttling module in `lib/security.js` used by SerpApi flight/hotel searches, airport autocomplete, and world-city lookup.
- Weighted requests: expensive price-calendar searches consume more request budget. Overuse receives HTTP 429 and `Retry-After`. A per-instance global counter limits simple spoofed-IP rotation.
- Oversized queries (HTTP 414), cross-site browser API requests (HTTP 403 when Fetch Metadata says cross-site), non-GET requests (HTTP 405) are rejected.
- Reject responses carry `Cache-Control: no-store`. Incoming malformed requests are handled before any paid SerpApi request.
- Replaced detailed upstream SerpApi errors with a generic message; API key remains on the server in Vercel environment variables.
- Strict Content Security Policy, no inline JS, HSTS, X-Frame-Options DENY, nosniff, Referrer Policy and feature restrictions.
- Browser-side inline `onerror` attributes removed. Image failure fallback handled by an event listener.
- `npm test` covers regressions; GitHub Actions workflow validates changes.

## Limits and uncompleted work
**This is not DDoS protection.** Node/Serverless in-memory limits are per running instance. High-volume bot attacks, IP spoofing and traffic distributed across many function instances can bypass them. For reliable, project-wide enforcement, activate **Vercel WAF / rate limiting** at the edge or use a distributed store, then review traffic logs and alerts.

During rollout, the connected Vercel account returned HTTP 403 (team-scope grant missing) to the Firewall Configuration API. No Vercel Firewall setting was changed. Owner must re-authorize Vercel team access in the connector or configure the firewall directly in the Vercel dashboard.

## Recommended owner actions
1. Activate passkeys or 2FA for GitHub and Vercel; audit session/devices and connected app permissions.
2. Grant correct Vercel team permissions, inspect WAF and enable bot mitigation and edge request rate limiting specifically for `/api/search`.
3. Keep `SERPAPI_API_KEY` secret only in Vercel. Rotate it immediately if it was ever committed, emailed, or shared.
4. Set low SerpApi spend/request usage alerts and check production errors regularly.
5. Before opening signup, confirm Supabase RLS in `supabase/schema.sql` is applied, review privacy policy, abuse prevention and email OTP quotas.
6. Before taking direct payments, use a licensed booking provider and payment gateway; do not handle raw card details in the app.

No security setup guarantees that a site is unhackable.

# Qansha — Registration launch checklist

**Existing services configured on 21 October 2026:** Supabase project **Project Qansha** already exists, the per-user `public.favorites` table with RLS policies was migrated and verified, and Vercel `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` are set for Preview and Production. **Do not create a second Supabase project or copy keys into front-end files.**

**Still required before users can register:** In Supabase Authentication → URL Configuration set **Site URL** to `https://qansha.com`; allow `https://qansha.com/**` and the exact Vercel Preview URL for QA. Connect a transactional **custom SMTP** provider, verify sending domain via SPF/DKIM, and test confirmation and recovery emails to an address that is not in the Supabase organization. Until SMTP is configured, default emails are restricted to authorized project members. Do not turn off Confirm Email as a workaround.

The acceptance tests below remain necessary before publishing on the main site.

---

# Qansha account registration — Supabase setup

The UI and API integration are implemented, but **registration is not live until a Supabase project is connected**. The login modal deliberately shows a disabled/configuration message without a valid public configuration. No fake accounts are created.

## 1. Supabase project

1. Create a Supabase project owned by Qansha and enable **Authentication → Providers → Email**.
2. Keep **Confirm email** enabled so new users verify their addresses.
3. Set **Authentication → URL Configuration → Site URL** to `https://qansha.com`.
4. Add `https://qansha.com/**` to allowed redirect URLs. For staging tests, add only the precise Vercel Preview URL you intend to use.
5. Configure a proper transactional SMTP provider and adjust auth email rate limits before allowing wide public registration. Default Supabase email delivery is limited and not intended for broad production signup.
6. Review Auth security settings (password policy, email confirmation, rate limits, optional CAPTCHA once UI supports it).

## 2. Vercel

In project `qansha` → Settings → Environment Variables, add these **public** values:
- `SUPABASE_URL` = `https://your-project-ref.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_...` from Supabase API Keys.

Legacy alternative: `SUPABASE_ANON_KEY` = the `anon` JWT. The server checks the JWT role before returning it. Prefer publishable keys.

Do **not** add `service_role`, `sb_secret_...`, or database passwords to the browser or `config.js`. Those privileged secrets are not needed at all for this feature.

Add these env vars for both Production and Preview if you intend to test both, and deploy again. The browser loads **only public** credentials via `/api/auth-config`.

## 3. Favorites table

Run `supabase/schema.sql` in the Supabase SQL Editor. It enables Row-Level Security; every query is scoped to `auth.uid() = user_id`, so users cannot read other people's saved items. Do not weaken the policy or expose public read permissions.

## 4. Acceptance checks before releasing to everyone

- In a clean/private browser, verify an email can sign up and receive the confirmation email.
- Opening the email link creates a session on `https://qansha.com` and displays the account screen.
- Logout works; sign-in works again, including on a second device.
- Password reset email leads to a password update page, then successful login.
- User A's favorites are not visible to User B.
- Signup attempts with invalid passwords and excess requests are rejected.
- RU/KK/EN translations, keyboard support, iPhone Safari and desktop layouts all work.
- `/api/auth-config` returns only `configured: false` when keys are missing, and never reveals service-role secrets.

## Security and privacy

Qansha never handles credit-card data for signup, and passwords are sent directly to Supabase Auth over HTTPS rather than stored in Qansha's own database. New registrations must be covered by a published privacy notice and contact point before broad public launch. Avoid storing unnecessary personal details.

If Supabase is unconfigured, the current Qansha flight and hotel search remains available and signup controls do not pretend to create accounts.

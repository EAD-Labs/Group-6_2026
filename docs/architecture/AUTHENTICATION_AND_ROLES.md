# Authentication and Role Flows

## Decision

PromptShala uses Supabase Auth with cookie-based server-side sessions through `@supabase/ssr`. The ten-user pilot is invitation-only: administrators provision participant accounts, and public registration remains disabled.

The application has two roles:

- `participant` — a teacher or educator completing the learning pathway;
- `admin` — an authorised project member who can provision pilot users, publish content, and view aggregate pilot results.

Authentication proves identity. The `profiles.role` value and PostgreSQL Row Level Security determine authorisation. UI route checks improve navigation but never replace database policies.

## Participant flow

1. An administrator creates or invites an approved pilot participant in Supabase Auth.
2. The participant opens `/sign-in` and enters the provided email and password.
3. Supabase validates the credentials and stores the session in secure cookies.
4. `src/proxy.ts` refreshes authentication cookies and redirects signed-out users away from protected routes.
5. Server code verifies the user with `auth.getUser()` or validated claims; it does not trust an unverified client session for authorisation.
6. The participant reaches `/dashboard`, completes onboarding if required, and accesses only their own progress and attempts.
7. Signing out invalidates the Supabase session and returns the participant to `/sign-in`.

## Admin flow

1. An existing authorised administrator provisions a user using the Supabase dashboard or an approved server-only administration script.
2. The new profile defaults to `participant`; role elevation is never accepted from browser input.
3. An existing administrator changes a role through a controlled server-side operation using audited credentials.
4. Admin pages perform both a server-side role check and database operations protected by admin RLS policies.
5. The service-role key is used only in restricted server-side administration or deployment contexts. It is never sent to the browser.

## Route policy

| Route | Access |
|---|---|
| `/` and `/sign-in` | Public |
| `/auth/callback` | Public callback with validated code exchange |
| `/dashboard`, `/learn/**`, `/settings/**` | Authenticated participant or admin |
| `/admin/**` | Authenticated admin plus database policy |

## Security decisions

- Use email and password for the initial controlled pilot; password reset and magic-link flows can be added after email delivery is configured.
- Do not expose whether a specific email exists; sign-in errors remain generic.
- Do not store roles in editable user metadata or accept role fields from the client.
- Enable RLS on every exposed application table and write operation-specific policies.
- Use separate Supabase projects for staging and production.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and unavailable to Preview deployments unless an approved server task requires it.
- Record administrative role changes outside the participant application during the pilot.

## Failure flows

- Invalid credentials: show a generic message and keep the participant on `/sign-in`.
- Expired session: redirect to `/sign-in?next=<path>`; do not lose persisted learning progress.
- Missing profile: deny learning data access and show an administrator-contact message.
- Disabled participant: Supabase Auth rejects the session and RLS denies application data.
- Insufficient role: return a forbidden state; do not rely on hiding an admin navigation link.

## Deferred decisions

- Password-reset delivery and templates
- Optional Google Workspace identity provider
- Multi-factor authentication for administrators
- Fine-grained content-editor versus reporting roles
- Admin audit-log interface


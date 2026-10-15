> **15 October user decision:** Continue with the existing production Supabase project; emails are deferred for now. Preserve immediate password signup/login and do not enable SMTP or send recovery emails for this release. Custom SMTP was OFF in the 14 October dashboard check. Recovery delivery is **deferred**, not verified. The instructions below remain a future owner reference; they are not a request for current credentials or configuration. Gemini is configured, but real successful generation needs its own evidence.

# Finish Gemini and recovery-email setup

Checked 2 October 2026 for [the live PromptShala site](https://promptshala.vercel.app). The database, trusted server access and recovery redirects are configured. The Gemini key is now configured; general-recipient recovery email still needs approved SMTP credentials. Enter them directly in the provider dashboards; do not paste them into chat, documents or Git.

## Gemini — save the key in Vercel

1. Open [Google AI Studio API keys](https://aistudio.google.com/api-keys), sign in and select the approved Google Cloud project. Create an API key there if you do not already have an appropriate one. Complete any terms or billing decisions yourself. Google now creates authorization keys by default; see [Google's key instructions](https://ai.google.dev/gemini-api/docs/api-key).
2. Open [PromptShala's Vercel environment variables](https://vercel.com/sus-co/promptshala/settings/environment-variables).
3. Choose **Add Environment Variable** and enter:

   | Field | Value |
   | --- | --- |
   | Name | `GEMINI_API_KEY` |
   | Value | Your Gemini key, entered privately |
   | Environment | **Production** |
   | Secret/Sensitive | Enabled |

4. Save. Leave the other production variables in place. The application reads this key only on the server. Do not rename it with a `NEXT_PUBLIC_` prefix. The configured model default is `gemini-3.5-flash`; a credential still requires a successful provider check.
5. Tell the release operator that the variable is saved, without sharing its value. Redeploy the reviewed source and check a fictional, consented request, its live-source label, failure/retry behaviour and quota handling. Environment changes require a new deployment; see [Vercel's environment-variable guide](https://vercel.com/docs/environment-variables/managing-environment-variables).

## Recovery emails — save SMTP settings in Supabase

1. Use your organisation's approved email-sending provider. Obtain its **SMTP** host, port, username and SMTP password/key, plus a sender address that the provider has verified. Complete the provider's required domain verification before testing.
2. Open [this project's Supabase SMTP settings](https://supabase.com/dashboard/project/atqbligrqsderauzfrqi/auth/smtp).
3. Enable **Custom SMTP** and fill the provider's exact values:

   | Field | Value |
   | --- | --- |
   | Sender email | Your verified sender address |
   | Sender name | `PromptShala` |
   | Host | Provider's SMTP hostname |
   | Port | Provider's prescribed port |
   | Username | Provider's SMTP username |
   | Password | Provider's SMTP password/key |

4. Save. SMTP belongs in Supabase, where Auth sends recovery/invitation messages. No SMTP variable needs to be added to Vercel for this application.
5. Keep the existing Auth site URL `https://promptshala.vercel.app` and exact callback redirects. Public signup is enabled and email confirmation is disabled for the approved immediate-login pilot. Preserve this policy unless the client explicitly changes it.
6. Tell the release operator the settings are saved and name an approved test recipient. Verify one recovery email reaches that inbox, opens the production reset page and allows a fresh sign-in after reset. The recipient should enter their own new password. Test an expired/reused link too. A generic recovery-page acknowledgement does not confirm delivery.

Supabase's default SMTP only sends to project-team addresses and is intended for development; custom SMTP is required for participant email delivery. See [Supabase's SMTP instructions](https://supabase.com/docs/guides/auth/auth-smtp).

## Administrator provisioning in a new environment

Provide the intended administrator's email address, without a password. The intended administrator creates their own account at `/sign-up`; the authorised Supabase owner verifies that specifically approved email and UUID. Only then should the owner assign the `admin` role through the trusted database administration channel and test ordinary sign-in. Sending an invitation requires approval for that recipient. User-supplied profile metadata cannot grant staff permissions.

The first approved production administrator was assigned on 6 October 2026; its identity is restricted. A new staging/restore environment needs its own approved bootstrap, and a fresh ordinary production admin login still needs acceptance. The website's dated synthetic checks do not establish successful live Gemini, recovery email arrival, complete client UAT, full managed recovery or the teacher study. Use the [current delivery register](final/FINAL_DELIVERY_RECORD.md) for actual outcomes.

## October 10 redesign: saved CRAFT prompts

Apply `202610100002_private_craft_prompts.sql` with the other migrations before running the updated UI against Supabase. It adds private submitted task/prompt/feedback fields and restricts CRAFT reads to the owner and writes to the trusted server. Old attempts retain null text. Account exports include CRAFT history; deleting an account cascades to its CRAFT records.

The optional Gemini connection setting accepts a personal key in the current tab only; it is never saved to database or browser storage. `GEMINI_API_KEY` remains the optional course default. Both connection types use the existing consent checks and shared account request limits.

> **Open pilot update — 6 October 2026:** Public signup now allows immediate email/password login. The user approved turning email confirmation off for this pilot. Email format is checked; mailbox ownership is not verified. General password recovery still needs approved custom SMTP. Gemini is already configured in production. The historical setup instructions below apply when those services need reconfiguration. See [pilot release](PILOT_RELEASE_2026-10-06.md).

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

## Choose the first administrator

Provide the intended administrator's email address, without a password. The intended administrator creates their own account at `/sign-up`; the authorised Supabase owner verifies that specifically approved email and UUID. Only then should the owner assign the `admin` role through the trusted database administration channel and test ordinary sign-in. Sending an invitation requires approval for that recipient. User-supplied profile metadata cannot grant staff permissions.

The website is deployed and its synthetic account checks passed. An observed live Gemini acceptance check, external email delivery and the first real administrator remain separate setup steps. Client content approval, complete UAT, the isolated restore rehearsal and the teacher pilot remain in [the release plan](../progress.md).

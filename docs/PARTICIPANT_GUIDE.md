> **6 October open pilot:** Create your own account at `/sign-up` using your email and a password of at least 12 characters. Immediate login is enabled for this pilot. Every module, chapter and knowledge check is open; completion requirements are shown separately. Each chapter has two or three practice questions. Administrators can review scores, progress, page activity and question attempts as explained in `/privacy`. Guided demo login has been removed.

# PromptShala participant guide

Updated 1 October 2026. This guide describes the current code. Connected accounts, live AI and certificates require the configured release environment; they have not yet been accepted in a participant pilot.

## Start and return to your work

1. Open the site address shared by your facilitator. Use **Sign in** for a connected account, or the demo entry to explore on this device.
2. Complete your profile, learning goals and safe-use agreement. Use the name you want on a completion certificate. Keep classroom examples fictional or remove identifying details before using a practice tool.
3. Open **Dashboard** for your next activity. The course menu lets you open any of the four modules from the start. **Progress** lists the evidence still needed for assessed completion.
4. Read the save status before leaving. **Progress synced** means the connected save finished. **Saved here · waiting for internet** means this browser still has work to send. Reconnect, return to the same account and use **Try again** if shown.

Demo work is saved in this browser. It does not issue a certificate or establish a cloud account. Clearing browser storage can remove it. A connected account uses separate account-scoped storage; sign out before another person uses the device. Local browser copies are not encrypted. Export important practice drafts before clearing storage or changing devices.

**Checking saved progress**, **Saving progress…** and **Progress has not synced** are not confirmation of a completed cloud save. If a save keeps failing, retain your current browser work and contact the facilitator with the page, time and visible error. Do not send API keys, passwords or private source text.

## Work through the course

Use a 20–30 minute session for one explanation, one worked example and a short attempt of your own. Some practical tasks need several sessions. Lesson estimates are planning aids, not timers or proof of time spent.

| Module | What you will practise | Evidence for completion |
| --- | --- | --- |
| 1 · AI foundations and responsible use | Explain what AI can do, identify a claim to verify and choose a suitable, safe teacher task. | Six completed lessons and a passing knowledge check. Keep your own classroom reflection notes. |
| 2 · Classroom prompt writing | Write a CRAFT prompt, inspect feedback and improve a request for a specific classroom task. | Seven completed lessons, a passing check, and the prompt-practice requirements shown in Progress. |
| 3 · Reusable teacher assistants | Build a Passport, test expected against actual behaviour, repair it, retest and document a teacher-led handoff. | Eight completed lessons, a passing check, and the Staffroom evidence checklist in Progress. |
| 4 · Working with sources | Select permitted material, audit claims against passages, revise a resource and record its limits. | Eight completed lessons, a passing check, and the guided Source Studio portfolio checklist in Progress. |

There are 29 lessons and four retryable knowledge checks. A quiz pass requires at least 70%; each result includes answer explanations. With five questions, this means at least four correct; Module 3 has ten questions and needs at least seven. A quiz pass alone does not complete a module. Opening a lesson or video does not establish understanding: attempt its activity, use the concept check, then mark the lesson complete when you have done the work.

## CRAFT practice and the prompt library

CRAFT means **Context, Role, Action, Format and Target** in this course. In Module 2, enter a teaching task and a prompt, ask for feedback, then revise a specific weakness. Compare attempts for the same task. A higher prompt score is evidence about the request; it does not prove that an AI-produced worksheet is accurate or useful.

The lab identifies its feedback source. Rule-based feedback remains available when live evaluation is unavailable. This fallback inspects prompt features; it is not an AI-generated classroom response. Save a useful prompt in the library with its use, checks and limitations. Test it again when the learners, content or task change.

## AI Staffroom

1. Choose a starter assistant or edit your own Agent Passport. State its purpose, required inputs, output structure, source boundaries and teacher checks.
2. Add a fictional classroom context and a short source pack. Run the challenge cases. Record the input, expected behaviour, actual output and your verdict.
3. Review all six version-1 cases. If a case fails, explain the problem and repair the Passport; if every case passes, choose the strengthen route and explain a useful refinement without inventing a failure. Save version 2 and record three successful retests using the same inputs, source packs and classroom context. Earlier tests without recorded conditions need a fresh baseline: remix the assistant rather than treating them as controlled comparisons. Keep the Passport snapshots so a colleague can inspect the instructions used for each version.
4. Rehearse with synthetic learner responses. Record the teacher decision at each handoff and a later reuse case. Export the Markdown record when useful.

Connected live testing needs an approved configured AI service and the safe-use agreement. Otherwise, load the explicitly labelled prepared response excerpts for the case, or record output you obtained from an approved external tool. Prepared excerpts count as guided review evidence; they do not test whether your edited assistant produces that response. Label its origin accurately. Do not record an invented transcript as a live test. The assistant suggests; the teacher decides what reaches pupils.

## Source Studio and your own material

**Source Studio** in Module 4 is the assessed guided activity. Choose one of three fictional packs, check each claim against a numbered passage, explain your verdict, edit a resource draft, record a meaningful revision and complete the teacher review and reflection. Its prepared examples do not call a live AI service. Export the portfolio to keep the passages, audit and draft together.

The separate **Transform your own source** workspace at `/learn/module-4/transform` is optional transfer practice. It does not replace the guided portfolio requirements.

1. Paste permitted text or open a plain `.txt` file. The workspace accepts 80–20,000 characters; files must also be at most 60,000 bytes. It does not import PDF, Word files or cloud folders.
2. Give the source a title, identify the audience and learning objective, and record your permission to use it. Remove identifying pupil information. Attribution and permission are different checks.
3. Choose a summary, worksheet, quiz, study guide, slide outline or audio script. The default creates a local scaffold using extracts from your text. It needs teacher writing and review; it is not a verified answer key.
4. If the connected AI option is available and you choose it, the source and task brief are sent to the configured Gemini service. The workspace labels the result and any fallback. Check every factual claim against the original passages even when a source label appears beside it.
5. Edit the draft and complete the six review checks. Editing resets those checks. Export includes the review state, draft and source passages; an unfinished export remains a draft.

Local workspace drafts are account-scoped and expire after 30 days. If connected private saving is available, **Save privately** creates a resource with a 30-day expiry from its initial creation; editing does not extend that expiry. Before loading another saved resource, export or clear the current workspace. The source, audience, objective and draft are restored; check that the teaching brief still fits and review the material again. Older records without a teaching brief ask you to add it.

**Clear workspace** removes the local working copy. **Delete this resource** deletes the selected connected saved copy. Use both if you want both copies removed. Downloaded exports and copies in other tools remain under your control. Expired resources become unavailable; the server's scheduled cleanup removes expired database rows.

## Completion and certificates

Open **Progress** to see each missing lesson, quiz and practice requirement with a link back to the work. All four modules must be assessed as passed. Opening later modules is always allowed; access is separate from completion.

In a connected release, finish onboarding, check your profile name, wait for **Progress synced**, then open `/certificate`. The server rechecks saved eligibility. When eligible, request the certificate and download the PDF. The demo cannot issue one. The certificate records course completion; it is not a teaching licence or a measure of classroom impact.

The verification link shows the certificate's identifier, issue date and valid/revoked status. It does not disclose your name or private learning work. Someone checking a PDF must compare its printed details separately. If verification is temporarily unavailable, that is not the same as an invalid certificate.

## Export, deletion and help

Use the account data controls on your profile to download connected account data as JSON. Export local practice drafts from their workspaces separately. Account deletion asks you to type **DELETE MY ACCOUNT**. It removes the connected account and associated records, including certificates, and clears this account's local keys in the current browser. It does not retrieve exports, remove other-device copies or immediately erase provider backup copies. Staff with the admin role must first have another administrator change that role.

For a problem, record the route, approximate time, device/browser, demo or signed-in mode, save-status text and steps that reproduce it. Send a redacted screenshot only if it helps. The in-app **Help** and **Privacy** pages provide the same practical boundaries. For teaching quality, keep the original source, your revision and the reason you accepted or rejected the draft.

If you cannot sign in, open `/account-recovery` and enter your account email. A uniform confirmation protects account privacy; it does not prove a message was delivered. Follow the recovery email on the configured release site, choose a matching password of 12–128 characters, then sign in again. Contact the facilitator if the email or link does not work; never send them your password.

Related: [curriculum and activities](content/CURRICULUM.md), [lesson review and source register](content/LESSON_REVIEW.md).

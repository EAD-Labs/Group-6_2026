# Jira delivery record — 14 October 2026

The connected Atlassian account applied these updates to **ET-617 (KAN)** on 14 October 2026. Issue owners, parent epics, due dates and statuses were read back from Jira after writing. The existing **KAN board**, board ID 2, was independently verified. This record describes current work; it does not recreate earlier worklogs or establish client acceptance.

## New delivery tasks

| Issue | Work | Owner | Due | Status at read-back | Parent |
| --- | --- | --- | --- | --- | --- |
| [KAN-22](https://darshansonawane1110.atlassian.net/browse/KAN-22) | Reusable Teaching Review Lab and public visitor journey | Ashok | 17 October | Testing | KAN-9 |
| [KAN-23](https://darshansonawane1110.atlassian.net/browse/KAN-23) | Versioned staff authoring and cohort publication | Ashok | 17 October | In Progress | KAN-8 |
| [KAN-24](https://darshansonawane1110.atlassian.net/browse/KAN-24) | Educator approval of curriculum, questions and rubrics | Ashok | 19 October | Idea | KAN-6 |
| [KAN-25](https://darshansonawane1110.atlassian.net/browse/KAN-25) | A0 portrait poster and demonstration QR | Vishal | 19 October | In Progress | KAN-9 |
| [KAN-26](https://darshansonawane1110.atlassian.net/browse/KAN-26) | Browser, mobile and accessibility verification | Vishal | 18 October | Testing | KAN-9 |
| [KAN-27](https://darshansonawane1110.atlassian.net/browse/KAN-27) | Genuine four-module learner and certificate journey | Vishal | 19 October | Idea | KAN-5 |
| [KAN-28](https://darshansonawane1110.atlassian.net/browse/KAN-28) | Client UAT, decisions and owner handover | Darshan | 19 October | In Progress | KAN-9 |
| [KAN-29](https://darshansonawane1110.atlassian.net/browse/KAN-29) | Moodle submission and presentation rehearsal | Darshan | 23 October | Idea | KAN-9 |
| [KAN-30](https://darshansonawane1110.atlassian.net/browse/KAN-30) | Ten-teacher study with genuine consented evidence | Darshan | 6 November | In Progress | KAN-4 |
| [KAN-31](https://darshansonawane1110.atlassian.net/browse/KAN-31) | Isolated staging and full recovery rehearsal | Raghuram | 16 October | In Progress | KAN-9 |
| [KAN-32](https://darshansonawane1110.atlassian.net/browse/KAN-32) | Recovery-email delivery and live Gemini verification | Raghuram | 16 October | In Progress | KAN-9 |
| [KAN-33](https://darshansonawane1110.atlassian.net/browse/KAN-33) | Security, retention decisions and monitoring | Raghuram | 18 October | In Progress | KAN-8 |

The poster upload deadline is **20 October**, explicitly recorded in KAN-29; its task due date includes the **23 October** demonstration. The study deadline remains **6 November**. Assignments identify the existing team responsibility split, not invented evidence of individual coding work.

## Existing issues

- KAN-9 now leads with the current release work and the 23 October presentation date; its September record is retained as history.
- KAN-4/5/6/7/8 and KAN-11/12/13/14/15/17/18/20/21 received dated notes linking current implementation and genuine outstanding evidence. Earlier reports and activity remain visible.
- KAN-7 moved to **In Progress**; KAN-8 moved to **Testing**.
- KAN-10 moved to **Done** after the board configuration and assigned, dated tasks were independently verified. Its original September deadline remains visible; completion is recorded on 14 October.
- KAN-13, KAN-14 and KAN-15 moved to **Done** because their repository/branch-policy and test/setup preparation exists. These closures do not claim that hosted staging, full recovery or all UAT has completed; execution is tracked separately in KAN-26/27/31/32/33.
- Client approval, real study observations, observed recovery-email delivery, successful live AI, Moodle upload and owner handover remain open where their evidence is missing.
- Empty legacy placeholders KAN-1/2/3 were left unchanged because their intended scope is unknown. No past hours or backdated contributions were added.

## Evidence boundary

On 15 October, the user chose the existing production database for this release and explicitly deferred email setup. KAN-31/32 were updated with these decisions, the observed Free-project limit and disabled custom SMTP. Isolated restore/load and successful live AI are still separate outstanding evidence; no other project was deleted and no subscription was added.

Read [the current delivery register](FINAL_DELIVERY_RECORD.md) for source, validation and deployment evidence. Testing status is preparation for review; it does not replace the client's acceptance decision. The independent production AI check on 14 October returned two labelled fallbacks and a helper failure. The synthetic account was removed, and managed SQL confirmed zero remaining Auth, profile, learning-state and CRAFT records.

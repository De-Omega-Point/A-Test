# AUS-TEST V3 | Live Release and Assistive-Technology Verification
Date: 31 October 2026 (Adelaide). Public URL: https://de-omega-point.github.io/A-Test/

## Public deployment: VERIFIED
- Latest production commit validated in a live GitHub Actions browser audit: `17a4b74ab5c983c976f402f26c5bb178f38f93ae`.
- Published `release-build.json` matches the latest `main` SHA. Production workflow run `41198789028`: `validate=success`, `deploy=success`.
- Live HTTP 200 verified for app entry, release marker, reader JavaScript and local official `our-common-bond-testable.pdf`.
- Public Chromium rendered all 42 syllabus topics and the booklet shortcut.
- Live automated audit run `41198883607`: 32 checks passed; axe-core found **zero detected WCAG 2.0/2.1 A/AA violations** on Study, a lesson and the Booklet Reader.
- Chromium accessibility tree exposed main/navigation landmarks, heading names and labelled buttons; keyboard Enter opened a lesson; notes save and progress preservation passed.

## What these results do and do not mean
The automated tests confirm accessible structure and detect a useful set of common issues. They **do not** establish that VoiceOver, NVDA or another assistive technology has been manually used and listened to by a human. The PDF plugin's internal document accessibility has not been comprehensively assessed; offer the original local PDF link as a fallback.

## Human VoiceOver acceptance (iOS + Safari)
1. In Settings > Accessibility > VoiceOver, enable VoiceOver, then open https://de-omega-point.github.io/A-Test/#study in Safari.
2. Swipe through the navigation controls. Ensure each says an intelligible name and role and no information is missed.
3. Use the rotor to navigate headings. Confirm the syllabus heading and Part 1–4 headings are discoverable.
4. Double-tap an **Open lesson** control. Ensure the lesson title and learning content are spoken in a sensible reading order.
5. Activate **Read corresponding pages**. Confirm the booklet reader title, page selector, reading checklist and link to open the local PDF are announced. If the embedded PDF is inaccessible, activate the external local-PDF link.
6. Change the booklet page, save a note and return to the lesson. Verify keyboard focus and saved progress work.

## Human NVDA acceptance (Windows + Firefox)
1. Start NVDA, open the Study page in Firefox, press H to step through headings and K to find links.
2. Tab through the syllabus buttons, activate a lesson using Enter and check that the controls have accessible names and roles.
3. Enter the booklet reader, test the page-number input, checkbox and notes textarea, then navigate back using the buttons.
4. Confirm that status messages are announced and that no keyboard trap occurs.

## Human acceptance record (blank until actually tested)
| Assistive technology | Device / OS / browser | Tester | Date | Outcome | Defects |
|---|---|---|---|---|---|
| VoiceOver | TBD | TBD | TBD | NOT PERFORMED | TBD |
| NVDA | TBD | TBD | TBD | NOT PERFORMED | TBD |

Never mark a manual screen-reader session as passed based solely on automated browser checks. Record the evidence and any defects before sign-off.

## Ongoing release checks
The production Pages job stamps a per-deployment build manifest with the exact commit SHA and workflow run ID, then verifies that the published manifest matches that commit. Pull-request checks independently validate public deployment and run axe-core/Chromium accessibility tests before merging.

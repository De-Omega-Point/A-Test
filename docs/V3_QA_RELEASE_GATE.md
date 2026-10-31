# AUS-TEST V3 — QA and release gate (31 October 2026)
**Status: NOT APPROVED FOR PRODUCTION.** Development branch: `dev/aus-test-v3-deep-learning`. Draft PR #1. No changes made to `main`.

## Implemented in this QA phase
- GitHub Actions now includes pull-request validation targeting `main`, while the Pages deployment job is restricted to push events on the `main` branch.
- Existing regression fixtures include V3 scripts in their runtime load order.
- Additional checks cover: 19/20 with 4/5 values **fails**; 15/20 with 5/5 values **passes**; Federation deep-learning content is rendered; adaptive review action appears; previously missed questions become eligible for spaced review.
- Existing browser-smoke script includes both V3 content and examination-intelligence modules in the inline fixture.

## Inspection findings
- Existing app contains 42 source-ordered curriculum domains, with expanded V3 teaching panels for all 42. This is coverage, not proof of factual accuracy or pedagogical depth.
- The mock logic chooses 15 non-values plus 5 values questions; pass requires at least 15 total and all five values questions right.
- Spaced review uses a separate `atest-v3-review` local storage key; compatibility with previous `atest-state` must be verified in real browsers.
- CI was previously main-only, which prevented a pre-merge test gate. The development workflow now requests pull-request tests; **a successful run has not yet been observed**.

## Remaining mandatory verification
1. GitHub Actions validation: observe complete green job status on the draft PR, investigate and fix any failing tests.
2. Run Chromium browser smoke tests at phone and desktop sizes. Check app navigation, errors, horizontal overflow, lesson reveal, touch controls, 45-minute timer and unanswered questions.
3. Confirm `atest-state` continuity from the existing production app through V3, including blocked or corrupted storage.
4. Audit each lesson and each practice question against the official *Australian Citizenship: Our Common Bond* testable section, pages 7–39, and glossary pages 40–43. Cite exact pages and fix any mismatch.
5. Perform a manual accessibility pass: keyboard, screen reader status announcements, focus, labels, contrast and motion.
6. Review current Department of Home Affairs test conditions before production, especially 20 MCQs, 45 minutes, ≥15 correct and all five values correct.
7. Confirm a separate preview URL or staging deployment before founder acceptance. Draft PR source alone is not a usable preview.

## Decision gate
Do NOT merge PR #1 or release the app until the above is verified and the founder explicitly approves the production release.

## Latest acceptance implementation (31 October 2026)
- Browser smoke suite now exercises V3 adaptive review buttons and incorrect-answer scheduling, checks original `atest-state` persistence, and tests the strict values gate at 19/20 with 4/5 values (fail) and 15/20 with 5/5 (pass).
- GitHub commit status and pull-request workflow-run lookup for the latest V3 commit returned **no reported runs/statuses**. This is **NOT a pass**. CI setup/visibility must be resolved before a production merge.
- Source-by-source accuracy and full accessibility verification are still outstanding.
- Do not equate tests committed to GitHub with tests executed successfully.

## Verified CI milestone — 31 October 2026
- GitHub Actions validation run **41158442604** for commit `02e1b92ea7fc35a896670352de63c58b2578ce3c`: **success** (validate job completed successfully).
- Verified steps include syntax, required files, product contract, arcade, study regression checks, V3 content/examination contracts and Chromium browser smoke tests.
- Pages deployment job **skipped as designed** for development-branch validation. No changes merged into production.
- Fixed browser smoke-test regression that improperly accessed the private arcade closure variable `active`; current test measures change in the learner-visible canvas rendering instead.
- Outstanding manual release gates: full fact-by-fact source audit against *Our Common Bond*, accessibility/manual-device review, and founder approval. Green CI is necessary but not sufficient for final publication.

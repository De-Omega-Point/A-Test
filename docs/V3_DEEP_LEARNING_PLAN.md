# AUS-TEST V3 | Deep Learning Upgrade (development specification)
Status: development proposal, NOT production approved. Source of truth: Department of Home Affairs, *Australian Citizenship: Our Common Bond*, testable section (booklet pages 7–39; glossary 40–43). This content is educational paraphrase unless marked as a quotation.

## Product rule
Preserve the existing GitHub app, its routes, arcade, storage keys and student progress. Integrate stronger lesson explanations gradually, not by replacing the app with a standalone HTML file. Every new lesson must have: official source/page, learning objective, plain-English explanation, why it matters, visual model, key terms, everyday scenario, exam traps, explain-it-back prompt, 3+ formative questions with rationales, and next-day/revisit prompt.

## Source-ordered curriculum audit checklist
- Part 1, pp 7–16: First Peoples; early settlement and First Fleet; gold rush; Federation and migration; English and other languages; six states and two mainland territories/capitals; Welcome to Country versus Acknowledgement; Australia Day and Anzac Day; three flags; coat of arms, wattle, national colours, opal, anthem.
- Part 2, pp 17–22: parliamentary democracy; rule of law; peaceful change; dignity; speech/expression; association; religion and secular government; equal rights and fair go; responsibilities, privileges and participation.
- Part 3, pp 23–32: elections and AEC; 1901 Federation; Constitution and referendum double majority; three constitutional powers; Head of State and Governor-General; Commonwealth Parliament; federal/state/territory/local responsibilities; political parties, ministry and Cabinet; bills and Royal Assent; independent courts, police and criminal/traffic laws.
- Part 4, pp 33–39: values with a strict all-five-correct exam gate; rule of law, democracy, lawful freedoms, equality, mutual respect, safety, compassion, community, English and loyalty. Prioritise situational questions requiring application over rote memorisation.
- Glossary, pp 40–43: cross-link definitions with their lessons. Vocabulary must not replace concepts.

## First worked lesson: Federation and Constitution (Part 3, booklet pp 25–26)
**Objective:** Explain why the colonies joined, the significance of 1 January 1901, the purpose of the Constitution, and the double majority required to change it.
**Official facts:** Prior to Federation, six colonies had separate systems creating problems for trade, transport, defence and enforcement of laws across borders. On 1 January 1901 they united into the Commonwealth of Australia. The Constitution sets the basic rules for government; it established the Commonwealth Parliament and High Court. A constitutional amendment needs a referendum double majority: a national majority AND a majority of voters in a majority of states (at least four of six).
**Explanation:** Federation means forming a common national government while states retain powers. The Constitution sets which institutions exercise power and how that power is constrained. A referendum asks voters to change that foundational document, not merely to choose a politician.
**Visual model:** Six colonies → Federation (1901) → Commonwealth of Australia; Constitution → Parliament / Executive / Courts; Referendum → nationwide majority + majority in at least four states.
**Terms:** federation, colony, Constitution, referendum, double majority.
**Example:** An election selects representatives; a constitutional referendum proposes changing the Constitution. They are not interchangeable.
**Exam trap:** A majority across Australia alone is *not* sufficient for constitutional change; the states test must also be met.
**Explain it back:** Why was one national government helpful even though states kept certain powers?
**Practice check:** (1) What happened on 1 January 1901? (A) The six colonies formed the Commonwealth of Australia (correct). (B) The First Fleet arrived. (C) The Constitution was abolished. (2) What sets the basic rules of Australian government? (A) A local council (B) The Constitution (correct) (C) An election advertisement. (3) What does a constitutional double majority require? (A) National majority only (B) States majority only (C) National majority plus voters' majority in at least four states (correct).
**Reinforcement:** Immediately: retell 1901 → Constitution → referendum without notes. Tomorrow: explain double majority to a fictional classmate. After one week: answer a new scenario question.

## Quality and release gates
1. Content coverage: every concept in the testable four parts mapped to a lesson; mark omissions.
2. Source accuracy: explicit page anchors and official wording checked; no unsupported claims presented as official facts.
3. Question integrity: four-choice, single-correct for official-style mock questions; no duplicated answer IDs, no answer cues, no stale details.
4. Exam: 20 questions, 45 minutes, at least 15 overall AND exactly five values questions all correct; values-only failure must override total score.
5. Accessibility: keyboard navigation, focus indication, touch targets, readable mobile layout, colour-independent status, accessible reveal controls.
6. Persistence: existing local-progress keys remain usable; no reset or migration without backups and tests.
7. Browser tests: all routes, quizzes, review loops, mock timing and failure modes on mobile and desktop.
8. Release control: develop on this branch, run tests, open draft PR, seek explicit approval before merging to main.

## Quarterly governance
Quarterly monitoring produces an official-source change report. A report alone is NOT an app update. Content modifications require source citations, tests, and a reviewed PR. No production deployment without founder approval.

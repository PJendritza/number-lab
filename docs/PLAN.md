# First-version plan and learning design

1. A single activity menu with local animal profiles, inspired by Phonics Lab’s static architecture and calm practice rewards.
2. Separate addition and subtraction activities, five questions per round, numeric answers rather than multiple-choice guessing.
3. Dots for joining/taking away and a number line. Children can request support; an incorrect answer reveals it automatically. There is no time limit or speed reward. Every completed round earns a star.
4. Separate adaptive histories for each operation and each learner. Start within 5, then within 10, then within 20. Nine first-try unassisted answers in the most recent ten observations increase the level; five or fewer reduce it, with a floor of 5. Clear the evidence window after a change. New difficulty applies to the next round, avoiding mid-round jumps. Counting aids and retries are supported observations, not independent success.
5. Test arithmetic bounds, progression, profile separation, persistence, and actual browser interactions. Deploy the static app when a hosting destination is selected.

## Rationale and limits

Concrete and visual quantities alongside symbols, explicit feedback, and number lines are common early mathematics teaching approaches. Relevant background references include the IES/What Works Clearinghouse practice guides *Teaching Math to Young Children* (2013) and *Assisting Students Struggling with Mathematics: Intervention in the Elementary Grades* (2021). The latter is at https://ies.ed.gov/ncee/wwc/PracticeGuide/26 . Access to the IES site was denied by the environment proxy during development; this is background guidance, not a fresh literature review or evidence that this app is validated.

The ten-answer thresholds are a transparent prototype heuristic. They are not a validated assessment of mastery. Random facts do not guarantee balanced curriculum coverage; within-20 problems can include crossing ten, so the app may need more granular stages after observation with children. Zero is included and subtraction stays nonnegative. Hints remain available at every level. Basic reading and number-entry ability, or adult support, are needed. No spoken instructions are bundled yet.

## Later iterations

Observe children using the prototype; refine number-bond and crossing-ten stages; add manipulatives and audio directions if needed. Consider German localisation, local backup/restore, exact unfinished-round resumption, and optional mixed review. Multiplication and division should use groups/sharing models in a separate learning design. They are intentionally unavailable in this version.

## Updated touch-first version

The initial numeric-text input has been replaced. Child screens now show only the task, large tap targets or drawing pads, visual feedback, and next/home controls. The first number activity matches a target numeral against a digit row; the second copies it by finger. Completing the tapping round offers the writing activity. Arithmetic offers four choices or a handwriting mode. Marketing text, subheadings, and decorative explanations have been removed from child screens. Local profiles and adaptive arithmetic remain. Counting helpers from the initial UI are not present in this revision; numeral recognition/writing is the entry point. See HANDWRITING.md for the actual model and limitations.

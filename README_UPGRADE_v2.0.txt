ENGLISH PATHWAYS — LIVE APP UPGRADE v2.0
=========================================

IMPORTANT
This upgrade is designed to preserve existing browser progress.
It keeps the same localStorage keys:
- ep-state-v1
- english-placement-test-state-v2

DO NOT clear browser/site data while updating.
DO NOT replace your live config.js. Your existing config.js contains the deployed AI Gateway URL.

WHAT CHANGED
1. Placement progress transfer
   - Profile and More are now available on desktop as well as mobile.
   - Export/import placement progress is visible without Developer Tools.
   - Existing placement progress is preserved.

2. Cross-device student profile
   - Profile picture, name, email, country/location, first language, purpose, English preference, goal, interests and daily study target.
   - Cloud restore uses email + a private sync PIN.
   - Course/profile/placement state can sync between devices after Gateway v2 is deployed.
   - Placement-test state also pushes cloud updates while the placement page is being used.
   - Audio files remain on the original device in this version.

3. AI checking
   NORMAL LESSONS:
   - Open grammar/use-of-English explanation
   - Reading answers
   - Listening answers
   - Writing
   - Speaking recordings
   - Pronunciation recordings

   FORMAL END-OF-LEVEL EXAM:
   - No AI speaking feedback while the exam is active.
   - Writing/speaking AI review unlocks only after submission.

   FORMAL PLACEMENT TEST:
   - No section scores, correct answers, explanations, hints or AI feedback while the exam is active.
   - Mid-exam backup contains progress only; it does not contain an answer key.
   - After the complete test is finished, objective scores/correct answers unlock.
   - Final-only AI grades writing/speaking and produces a diagnostic CEFR synthesis.

4. Lesson quality
   - All 400 lessons receive a “what/why” grammar explanation plus a “how the form is built” explanation.
   - Common-mistake guidance.
   - Reading method by level.
   - Writing method by level.
   - Pronunciation/phonetics method and explanation of why the feature matters.
   - A second meaningful visual map alongside the original topic illustration.
   - Activity lab in every lesson.
   - A second/extension reading passage and extra questions in reading lessons.

5. Interface
   - Smoother panel/tab transitions with reduced-motion accessibility.
   - Subtle English-learning background.
   - Student avatar on the dashboard.
   - Short procedural answer/feedback tones; no copyrighted music files.
   - Formal active tests use neutral taps/chimes only, never right/wrong sounds.
   - Install controls disappear inside an installed standalone PWA and after supported browsers report successful installation.

GITHUB FILES TO REPLACE / ADD
At repository ROOT:
- index.html
- app.js
- mobile-app.js
- mobile-app.css
- lesson-enrichment.js       (NEW)
- service-worker.js
- VERSION.txt

Inside placement-test/:
- index.html
- app.js
- styles.css

DO NOT upload/replace config.js from any old package.

DEPLOYMENT ORDER
A. Deploy English Pathways Gateway v2 first using the separate Gateway ZIP.
B. Then upload the GitHub files above and commit them.
C. Wait for GitHub Pages to finish publishing.
D. Close and reopen the app. The service-worker cache version is bumped to mobile-v2.0.0.
E. Do not reset or clear site storage.

FIRST TEST CHECKLIST
- Desktop header shows Profile and More.
- Wife's existing placement attempt still resumes from its saved point.
- Profile can save a picture and learner details.
- Create/connect cloud sync with email + PIN, then restore on a second device using the same email + PIN.
- A normal reading answer can be checked with AI.
- A normal voice recording can be checked with AI.
- During an active placement test, submitted sections show Locked rather than scores/correct answers.
- After the full placement test finishes, results and final AI grading unlock.
- Open the installed PWA from the Home Screen and confirm Install is no longer shown.

PILOT / COMMERCIAL NOTE
The included Apps Script + Drive sync is appropriate for the current private/pilot stage. Before selling the app publicly at scale, replace it with production authentication, a database/object-storage layer, account recovery, abuse/rate limiting, and formal privacy/data-retention controls.

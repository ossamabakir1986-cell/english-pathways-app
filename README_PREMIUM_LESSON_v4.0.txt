ENGLISH PATHWAYS — PREMIUM LESSON EXPERIENCE v4.0

This update applies the approved lesson model across the existing 400-lesson course without changing lesson IDs or local-storage keys.

MAIN CHANGES
- Five in-lesson stages: Learn / Understand / Practice / Use / Review (skill-specific labels where appropriate).
- Guided next/previous section navigation and persistent current lesson section.
- 12–16+ interactions per lesson through controlled questions, vocabulary retrieval, sentence building, AI open responses, reading/listening questions, speaking/writing and review.
- Richer grammar/use-of-English explanation: meaning, why, form, common mistakes and pronunciation purpose.
- Reading lessons use the main text plus an extension text and more comprehension/interpretation questions.
- Speaking lessons include planning, useful language, main recording and a follow-up response challenge.
- Writing lessons include a three-minute planning board, organisation guidance, drafting, AI check and final edit.
- More readable typography: normal word spacing, improved line height, narrower reading measure and stronger visual hierarchy.
- New Practice hub. Main navigation is Home / Learn / Practice / Progress / Profile; More/settings remains available from the gear button.
- Existing AI, profile, cloud sync, placement transfer and installation behavior are preserved.

DEPLOYMENT
Upload the files in this package to the ROOT of the existing GitHub repository and replace matching files.
Do NOT replace config.js. This package intentionally does not contain config.js.

After commit, wait for GitHub Pages to publish, then hard refresh once. Installed PWAs will receive the new service-worker cache version.

IMPORTANT
This is a design/content-structure enrichment layer. It does not change the 400 lesson IDs, the placement-test storage key, or the main ep-state-v1 progress key.

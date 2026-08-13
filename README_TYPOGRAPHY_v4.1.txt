ENGLISH PATHWAYS — TYPOGRAPHY & LESSON HIERARCHY REFINEMENT v4.1

Purpose
- Correct lesson title/subtitle/body hierarchy.
- Correct paragraph, sentence and word spacing.
- Prevent key-language items and lesson tabs from visually running together.
- Prevent concept-map words from breaking into narrow single-character columns.
- Improve dialogue, vocabulary, practice, activity and review spacing.
- Make CSS updates refresh reliably after GitHub deployment.

Files to upload to repository root
- index.html
- app.js
- mobile-app.css
- lesson-experience-v4.js
- service-worker.js
- VERSION.txt

Do NOT replace config.js.
Existing profiles, placement-test progress, lesson IDs, cloud sync and Gemini configuration are preserved.

Important cache fix
v4.1 versions the lesson stylesheet URL and makes CSS network-first in the service worker. This addresses the partial old/new styling seen after the v4 deployment.

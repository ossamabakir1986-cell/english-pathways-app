English Pathways — Placement Progress Transfer Update v1.0

Adds to More:
- Export placement progress
- Import placement progress

What transfers:
- Candidate details stored in the placement test
- Completed/current section state
- Current question position
- Objective answers and written responses
- Mark-for-review state
- Listening play counters
- Timers and activity log stored in placement-test localStorage

This first transfer file does NOT include IndexedDB voice recordings. For a student who has not yet reached the speaking section, nothing is missing. A later full-transfer update can add placement speaking audio to a ZIP.

INSTALL ON GITHUB:
1. Upload app.js and service-worker.js to the ROOT of english-pathways-app.
2. Replace the existing files.
3. Commit changes.
4. Wait for GitHub Pages to publish, then completely close/reopen the installed app.
5. On the PC: More > Export placement progress.
6. Send the downloaded JSON file to the phone.
7. On the phone: More > Import placement progress > choose the JSON file.
8. The app opens the placement test and resumes imported progress.

Do not replace config.js.

ENGLISH PATHWAYS 5.0 — STUDENT APP UPDATE
==========================================

This is a cumulative overlay for the currently deployed English Pathways v4.5 site.
Upload the contents to the ROOT of the existing GitHub repository, preserving the folders.

IMPORTANT
---------
1. Deploy English Pathways Gateway v5 FIRST.
2. Do NOT replace config.js. It is intentionally not included in this package.
3. Keep the same Apps Script /exec URL. The admin portal and student app both use that URL through config.js.
4. Existing local progress/storage keys are preserved.

WHAT CHANGED
------------
• One student account links the course, placement test and future assessments.
• New students choose an ESTIMATED level, but that choice does not unlock a course level.
• New accounts begin with A1 access.
• Higher access is granted only by:
  - final placement result,
  - passed end-of-level progression,
  - administrator action.
• Verified level opens that level and all lower levels.
• Locked levels no longer expose a first-lesson preview loophole.
• Existing students are migrated conservatively: their previously unlocked levels are preserved as legacy access until reviewed.
• Stable student IDs are added so email can later be changed by the administrator without losing the account link.
• Cloud access is checked when the app opens, returns to the foreground and periodically while open.
• Administrator deactivation is respected after the next online access check.
• Placement Test uses the same English Pathways student profile and no longer creates a separate name/email identity for new attempts.
• Placement result can update verified access automatically after final-only AI grading.
• End-level progression can unlock the next level after the formal result is submitted and productive skills are graded.
• New /admin/ portal for student administration.
• Stronger color and illustration system across Home, Learn, Practice, Progress, Profile, More and lesson pages.
• Existing course illustrations are used in major hero areas as well as lessons.
• Existing v4 lesson methodology, solid Learn/Understand/Practice/Use/Review navigation, help, contact, install prompt and back/exit controls remain.

FORMAL-ASSESSMENT RULES
-----------------------
Placement and end-level exams remain formal: no AI hints/correct-answer feedback while active.
Placement AI access is applied only after the full placement process is completed.

END-LEVEL PROGRESSION RULE IN THIS BUILD
----------------------------------------
The next level unlocks when:
• objective result is at least 70%, AND
• AI writing score is at least 60%, AND
• AI speaking score is at least 60%.
The administrator can override access in the Admin Portal.

CLOUD / AUDIO NOTE
------------------
Course/profile/placement state can sync across devices.
Recorded audio remains device-local in this version and is not silently claimed as cloud-synced.

FILES IN THIS UPDATE
--------------------
index.html
app.js
mobile-app.css
mobile-app.js
lesson-experience-v4.js
service-worker.js
support-info.js
placement-test/index.html
placement-test/app.js
placement-test/styles.css
admin/index.html
admin/admin.css
admin/admin.js
VERSION.txt
README_v5.0.txt
README_ADMIN_v5.0.txt

config.js is deliberately excluded.

ENGLISH PATHWAYS 5.0 — ADMIN PORTAL
===================================

URL AFTER GITHUB DEPLOYMENT
---------------------------
https://<your-github-pages-site>/english-pathways-app/admin/

For the current repository this will be:
https://ossamabakir1986-cell.github.io/english-pathways-app/admin/

SECURITY
--------
The administrator password is NOT stored in GitHub and is NOT stored in student JavaScript.
Administrator credentials are configured in Apps Script Script Properties and checked by Gateway v5.
Admin sessions are short-lived and kept in the browser session.

ADMIN PORTAL CAN
----------------
• Search students by name/email/student ID.
• View profile, estimated level, verified level, placement status and progress summary.
• Set a verified starting level.
• Give additional level exceptions.
• Change the student's email without changing the permanent student ID.
• Activate/deactivate a student account.
• Store private administrator notes.
• Reset the student's sync PIN.
• Reset the placement test.
• Export an individual student record.
• Review audit history of important access changes.

ACCESS MODEL
------------
Estimated level = what the learner thinks their level may be. It never grants access.
Verified level = placement/admin/progression result.
Verified level opens itself and every lower level.
Additional access = an admin exception without changing the verified level.

DEFAULT NEW STUDENT
-------------------
A1: open
A2 through C2: locked

CHANGES DO NOT REQUIRE GITHUB
-----------------------------
Normal student changes made in /admin/ go directly to the cloud record.
Students receive them at the next online access sync. No JSON download/re-upload and no GitHub commit is needed.

EXISTING STUDENTS
-----------------
Existing v4/v2 cloud records are upgraded on access. Previously unlocked course levels are preserved as legacy access so an upgrade does not unexpectedly lock a learner out. The administrator can review and correct verified/access settings afterward.

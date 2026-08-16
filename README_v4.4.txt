ENGLISH PATHWAYS v4.4 — NAVIGATION, INSTALL, HELP & CONTACT

WHAT CHANGED
- Small back arrow in the app header for safe in-app navigation.
- Browser/device Back is guarded where browser history APIs allow it.
- A friendly installation invitation appears automatically for new mobile visitors; the native install confirmation still requires a student tap.
- Installed PWAs continue to hide install controls.
- Added Help & Q&A section.
- Added Contact Us section.
- Added support-info.js so owner contact details stay separate from application code.
- Service worker cache bumped to v4.4.

IMPORTANT BROWSER LIMITS
- A website cannot force-install a PWA without user confirmation.
- iPhone/iPad installation still uses Add to Home Screen.
- Operating-system Home/close gestures cannot always be intercepted by a web app. Progress remains auto-saved.

CONTACT SETUP BEFORE PUBLISHING
Open support-info.js and fill the fields you want students to see:
  contactName
  email
  phone
  whatsapp
  website
  location
  hours
Leave unused fields blank.

DEPLOYMENT
Upload the files in this package to the repository root, replacing matching files.
Do NOT replace config.js.

# ZNAKOMY Production Audit

This checklist is the release gate for `znakomy.online`. Do not treat a green GitHub Pages deploy alone as proof that the app works.

## 1. Runtime / browser startup
- [x] Supabase JS is served locally from `assets/js/supabase.min.js`.
- [x] Main application runtime is local `assets/js/core.js`.
- [x] No production JS depends on raw.githubusercontent.com, jsDelivr or unpkg.
- [x] Legacy `app.js` and `app-stable.js` are harmless same-origin compatibility shims for stale Safari caches.
- [x] All JS files pass `node --check` in GitHub Actions.
- [x] Published GitHub Pages artifact is downloaded and smoke-tested after build.

## 2. Authentication
- [x] Email/password registration.
- [x] Confirmation redirect is explicitly `https://znakomy.online/`.
- [x] Resend confirmation uses production redirect.
- [x] Password reset uses production redirect.
- [x] Session persistence enabled with localStorage.
- [x] Token auto-refresh enabled.
- [x] Refresh/reopen restores session without forcing profile editor open.
- [x] Explicit logout control exists in current DOM.

## 3. Profiles
- [x] Public list only requests approved profiles.
- [x] Own profile is readable under RLS.
- [x] Profile save columns are restricted at PostgreSQL privilege level.
- [x] User cannot directly update role/status/moderation system fields.
- [x] 18+ validation exists in database/RPC flow.
- [x] Profile photo bucket is public-read, owner-write, max 5 MB, JPG/PNG/WebP.
- [x] One-action save/review UX module is present.

## 4. Moderation
- [x] Admin status is enforced server-side by `is_admin()` / RPC.
- [x] Admin cannot suspend/reject own admin profile.
- [x] Existing accidentally suspended admin profile restored.
- [x] Reports are RLS-protected.
- [x] Dedicated admin panel exists.

## 5. Direct messenger
- [x] `start_conversation` requires authenticated users and approved target profile.
- [x] Block relationship prevents conversation/message creation.
- [x] Conversation SELECT is participant-only.
- [x] Message SELECT is participant-only.
- [x] Message INSERT requires sender = auth.uid and participant membership.
- [x] Direct 2.0 owns conversation selection, history rendering and send form.
- [x] Clicking a conversation reveals the composer.
- [x] Clicking `Написать` starts/opens the selected recipient conversation.
- [x] Realtime INSERT subscription is configured per conversation.
- [x] Mark-read RPC is participant-validated.

## 6. Community
- [x] Groups, events, ads, market and studios tables have RLS enabled.
- [x] Anonymous grants reduced to SELECT only.
- [x] Authenticated grants reduced to CRUD needed by owner policies.
- [x] Community media storage has owner-write/public-read rules and file restrictions.

## 7. Navigation / UX resilience
- [x] Browser-history helper is local and syntax-valid.
- [x] Required modal/chat/profile DOM IDs are checked in CI.
- [x] Safari stale-cache compatibility entry points remain local-only.
- [x] Mobile Direct DOM and composer exist in same production HTML.

## 8. Release automation
Every push to `main` must pass `.github/workflows/production-check.yml`.
The smoke script verifies required DOM IDs, JavaScript syntax, local-only runtime dependencies, Core persistence markers and Direct wiring.

## Manual regression after a major functional change
1. Anonymous page load in Safari and Chromium/Opera.
2. Register a disposable test account and confirm email.
3. Close/reopen browser; verify session persists.
4. Fill profile, upload photo, save/send to review.
5. Approve from admin account.
6. Verify approved card appears in public search.
7. From another approved account click `Написать`.
8. Verify recipient is selected and composer visible.
9. Send message A→B, then B→A and verify realtime/read behavior.
10. Test browser Back from profile/Direct.
11. Test mobile layout and keyboard/composer visibility.

Last structural audit: 2026-08-17.

# Validation record

Verified on November 4, 2026 (Asia/Colombo), using Node 24.14.0, npm 11.9.0 and Expo SDK 58.

| Check | Result |
| --- | --- |
| TypeScript (`npm run typecheck`) | Passed |
| Expo ESLint (`npm run lint`) | Passed, no warnings |
| Expo Doctor | 20/20 checks passed |
| Unit tests | 5 passed |
| Production web export | Passed |
| iOS Hermes bundle export | Passed |
| Android Hermes bundle export | Passed |
| Latest browser regression suite | 6 passed; 1 unresolved browser closure |

## Passing browser scenarios

1. Demo entry; task validation, creation, completion, reload persistence, editing, and confirmed deletion.
2. Project creation and board movement; habit creation and completion persistence; note-to-task conversion; global search; calendar navigation; analytics period switching; dark-theme persistence; timer start, reload, pause, and resume.
3. Full onboarding; display-name and theme preferences; desktop layout; cancellation and confirmation of data clearing; empty-state persistence without reseeding.
4. Timer completion after simulated elapsed time; exactly one additional session after reload.
5. Actual pointer-driven dragging of a Kanban card between columns.
6. All five bottom tabs; profile editing; project/habit/note editing and deletion; note pin persistence.

The combined recurrence/duplicate/archive/restore/manual-order scenario did not finish: Chrome's page/context closed during the transition to Tasks. The later independent five-tab navigation scenario passed. A focused rerun was not authorized before handoff, so this scenario is unresolved, not reported as passing. The monthly recurrence/date calculations are separately covered by passing unit tests.

## Fixes made during verification

- Corrected JSX and TypeScript errors before export.
- Used Expo Router SDK 58's typed `emitter` and `navigateToTab` tab-bar APIs.
- Added explicit accessible checked/selected states for browser controls.
- Preserved the Resume label when pausing during the timer's first second.
- Serialized SQLite writes to prevent overlapping initialization/clearing transactions.
- Fixed lint findings and restricted TypeScript inputs to source/test files rather than generated bundles.
- Inspected mobile and desktop screenshots after transitions settled; adjusted the mobile summary to a three-card row.

## Remaining release checks

Native JavaScript bundles were verified, but an installed Android/iOS app was not exercised in this session. Run the app on your Android Studio emulator and a physical device to verify SQLite persistence after force-stop, background/foreground timer behavior, native gestures, keyboard avoidance, safe areas, and screen-reader behavior. iOS device testing is also outstanding.

Package installation reported 18 moderate npm advisories including development dependencies. A separate runtime dependency audit was not authorized, so the scope and fixes have not been reviewed. This is not a security certification or an app-store-ready claim.

Reminder preferences do not deliver OS notifications. Attachments, authentication, and cloud synchronization are intentionally outside this frontend phase and are labeled accordingly in the UI.

## Android Studio + Expo quick start

1. Start an emulator from Android Studio → Device Manager.
2. In the project directory, run `npm run android` (dependencies are already installed here).
3. Use an SDK 58-compatible Expo Go client. If your installed client does not support this SDK, use `npx expo run:android` to build and install a native development app using your Android SDK.
4. Choose **Explore the demo**, then create a task, force-stop/relaunch, and confirm it remains saved.

For a fresh checkout, run `npm ci` first. The app needs no Supabase credentials.

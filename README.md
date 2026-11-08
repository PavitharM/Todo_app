# Super Todo

A local-first productivity app built with Expo SDK 58, React Native, TypeScript, Expo Router, Zustand, NativeWind, and SQLite. No backend credentials are needed.

## Run

```sh
npm ci
npm start
```

From the Expo terminal, press `i` for an available iOS simulator, `a` for an Android emulator, or `w` for the browser. Alternatively:

```sh
npm run ios
npm run android
npm run web
```

Use a matching SDK 58 Expo Go client, or create a development build with `npx expo run:ios` / `npx expo run:android`. Native builds require the corresponding Xcode or Android SDK toolchain. Expo resolves native dependency versions; `package-lock.json` pins the tested install.

On first launch, finish onboarding or choose **Explore the demo**. Sample records are clearly identified as demo data in Profile and Insights. Settings → Clear all local records starts a genuinely empty space; demo data is not reseeded after restarting. Exit demo preserves your records and returns to onboarding.

## What is implemented

- Five tabs: Home, Calendar, Tasks, Insights, Profile. Secondary routes for projects, habits, notes, focus, search, settings, and onboarding.
- A dashboard derived from saved tasks, projects, habit logs, and completed focus sessions.
- Validated task creation and editing, subtasks/checklists, priorities, tags, projects, recurrence, duplicates, archive/restore, completion/restore, deletion confirmation, swipe actions, search, filters, sort, and manual reorder.
- Month/week/day planner with real date calculations, task dots, project deadline indicators, selected-date task creation, and task rescheduling through the editor.
- Project CRUD, date/status/color/icon selection, completion percentages, task lists, and Kanban with drag movement plus accessible arrow controls.
- Habit CRUD, daily/weekday/weekly/custom schedules, editable historical completion calendar, current/longest streaks, and consistency statistics.
- Focus, short-break, and long-break timers; pause/resume/reset; custom durations; task association; session history; persisted absolute end times. On foreground/relaunch, an expired timer records its session once using a stable session ID.
- Notes CRUD, pinning, categories, text search, grid/list layout, simple text-formatting insertion, and conversion to tasks. The editor stores plain text; it is not a WYSIWYG rich-text engine.
- Daily/weekly/monthly analytics, completion charts, focus minutes, habit consistency, priority distribution, and project progress.
- Global search across all record types, recent searches, suggestions, type/category/priority/date filters.
- Profile editing, light/dark/system appearance, accent colors, default task priority, week-start and reminder preferences, and local data clearing.
- Shared design tokens, cards, forms, buttons, modal sheets, navigation, progress components, feedback, loading/error/empty states, reduced-motion-aware screen/progress animation, and labeled controls.

## Frontend boundaries

There is no authentication, cloud sync, Supabase client, or fake API traffic. Notification/reminder preferences are stored and labeled as preferences; the app does not deliver device notifications. Attachments are explicitly labeled as a future storage integration. The task editor is an Expo modal route on native platforms.

Native records use Expo SQLite. Web preview records use an AsyncStorage browser adapter, avoiding SQLite WASM cross-origin isolation requirements. Preferences and timer state use AsyncStorage. Browser and native installations have independent local data.

## Source map

| Location | Purpose |
| --- | --- |
| `app/` | Thin Expo Router routes, root lifecycle, tab layout |
| `src/features/` | Dashboard, task editor/list, calendar, projects, habits, notes, focus, insights, search, profile/settings, onboarding |
| `src/components/` | Reusable UI primitives, record cards, charts, error boundary |
| `src/theme/` | Light/dark tokens and accent resolution |
| `src/types/` | Shared entity and preference contracts |
| `src/store/` | Separate Zustand stores, initialization, task actions, timer reconciliation |
| `src/repositories/` | Repository contracts, native and web implementations, preference repository |
| `src/database/` | SQLite connection, schema initialization, serialized writes |
| `src/mock/` | Realistic relative-date seed records |
| `src/utils/` | Local calendar dates, recurrence and metric calculations |
| `tests/` | Date/metric unit tests and browser user-flow tests |
| `docs/` | Architecture notes, validation record, screenshots |

## Verify

```sh
npm run typecheck
npm run lint
npm test
npm run export:web
node scripts/serve.cjs
# In another terminal (uses installed Google Chrome):
npm run test:e2e
```

To verify native bundles without replacing the browser export:

```sh
npx expo export --platform ios --platform android --output-dir dist-native
```

The browser tests use isolated contexts and do not alter your personal app data. The test preview server binds only to `127.0.0.1:8081`. Screenshots are saved in `docs/`; failure traces are in ignored `test-results/`.

See `docs/ARCHITECTURE.md` for persistence and the future Supabase migration plan, and `docs/VALIDATION.md` for the actual verification scope. A successful native JavaScript bundle is not a substitute for testing a signed app on real iOS and Android devices.

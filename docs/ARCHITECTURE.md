# Architecture and next phase

## Current data flow

A route renders a feature. A feature selects state and calls actions on its Zustand store. Stores call a repository and update in-memory state only after a successful write. Errors stay available to the shared error banner, while editors preserve draft input for a retry.

Task, project, habit, note, and focus stores are separate instances of a typed collection factory. Native repositories write parameterized statements to the `records` table, keyed by `(collection, id)`, with a versioned JSON payload. A shared write queue prevents overlapping SQLite transactions. WAL is enabled. `PRAGMA user_version = 1` identifies the current schema. Future migrations should run before repositories become available, within transactions.

The browser uses the same repository contract with serialized AsyncStorage writes. Native and browser storage intentionally do not sync. Preferences have their own repository; theme and the running timer use Zustand's AsyncStorage persistence.

Initialization hydrates preferences and the timer, reads every collection, and seeds only when the separate initialization marker is absent. No screens requiring records render until this finishes. Clearing data leaves the marker in place, so an empty database remains empty. All seed dates are relative to the first launch date.

## Dates and metrics

Calendar dates use local `YYYY-MM-DD` keys and local-noon arithmetic to avoid DST and UTC midnight shifts. Completion timestamps are ISO instants, converted to local dates for analytics. Monthly recurrence clamps to the destination month's last day. Rest days do not break habit streaks; an incomplete current day does not end a streak until the day passes. A habit cannot be logged before its creation date or in the future.

Daily productivity is the completion percentage of non-archived tasks due that day. Period completion rate is based on tasks due in the selected trailing period. Completed-task charts count actual completion timestamps. Habit consistency counts completed scheduled opportunities divided by all scheduled opportunities since each habit's creation. Focus minutes count only finished focus sessions, excluding breaks. No analytics numbers are presentation constants.

## Timer lifecycle

A running timer persists its end timestamp, configured duration, remaining seconds, kind, selected task, and unique session ID. The visible countdown derives from the wall clock. A root reconciler runs once per second and on foreground entry; it writes an expired session with that stable ID, then clears running state. The same key makes reconciliation idempotent after a crash between the session write and timer-state write. Pausing persists the remaining duration. Reset intentionally abandons unfinished time. OS notification scheduling and automatic Pomodoro-cycle advancement are outside this phase.

## Supabase integration plan (not implemented)

1. Introduce an authenticated user context and real session handling, with an explicit migration choice for existing demo records. Do not upload demo data silently.
2. Implement `TaskRepository`, `ProjectRepository`, `HabitRepository`, `NoteRepository`, `FocusRepository`, and `UserPreferencesRepository` against Supabase behind the store boundary. UI components should keep using the same stores.
3. Normalize tables: `profiles`, `tasks`, `task_items`, `projects`, `habits`, `habit_completions`, `notes`, `focus_sessions`. Add UUID primary keys, `user_id`, server timestamps, and foreign keys. Retain an explicit mapping for legacy local IDs during import.
4. Enable RLS on every user-owned table. Restrict SELECT/INSERT/UPDATE/DELETE to `auth.uid() = user_id`; apply matching ownership checks to parent-child references. Never ship a service-role key to the app.
5. Add a durable local outbox, tombstones, server version numbers, resumable pagination and a conflict policy before introducing automatic cloud synchronization. Keep SQLite as the offline cache. Make sync status reflect actual server acknowledgments.
6. Use a unique `(habit_id, local_date)` constraint for completion records and a unique client-session ID for focus sessions. Store each user's timezone separately from timestamp instants.
7. Add private storage buckets, ownership policies, upload progress and retry handling before enabling attachments. Add consent and platform permission handling before scheduling notifications.
8. Test tenant isolation, offline replay, crash recovery, sign-out data isolation, migrations, and multi-device conflicts before launch.

No credentials, backend SDKs, SQL deployment, network services, or fake sync success are included in this frontend version.

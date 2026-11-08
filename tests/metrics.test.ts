import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dateKey,
  addDays,
  validDate,
  nextDate,
  daysBack,
} from "../src/utils/date";
import {
  habitStreak,
  habitConsistency,
  taskMetrics,
  analytics,
} from "../src/utils/metrics";
import { demoData } from "../src/mock/seed";
test("local dates round trip and reject invalid calendar dates", () => {
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2024-12-31", 1), "2025-01-01");
  assert.equal(validDate("2025-02-29"), false);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate(""), true);
  assert.equal(validDate("2025-13-01"), false);
});
test("monthly recurrence clamps to the last day", () => {
  assert.equal(nextDate("2025-01-31", "monthly"), "2025-02-28");
  assert.equal(nextDate("2024-01-31", "monthly"), "2024-02-29");
  assert.equal(nextDate("2025-12-31", "monthly"), "2026-01-31");
  assert.equal(nextDate("2026-11-04", "weekly"), "2026-11-11");
});
test("dashboard excludes archived records and computes totals", () => {
  const seed = demoData();
  const today = dateKey();
  const metrics = taskMetrics(seed.tasks, today);
  assert.equal(metrics.total, 4);
  assert.equal(metrics.done, 1);
  assert.equal(metrics.rate, 25);
  assert.equal(metrics.overdue, 1);
  assert.equal(taskMetrics([]).rate, 0);
  const archived = seed.tasks.map((t) => ({ ...t, archived: true }));
  assert.equal(taskMetrics(archived).total, 0);
});
test("habit streaks skip rest days and do not break on an unfinished today", () => {
  const h = {
    ...demoData().habits[0],
    createdAt: "2026-10-30T12:00:00.000Z",
    schedule: [1, 2, 3, 4, 5],
    completions: ["2026-10-30", "2026-11-02", "2026-11-03"],
  };
  assert.deepEqual(habitStreak(h, "2026-11-04"), { current: 3, longest: 3 });
  assert.deepEqual(habitStreak(h, "2026-11-05"), { current: 0, longest: 3 });
  assert.equal(
    habitConsistency(
      [h],
      ["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"],
    ),
    100,
  );
});
test("analytics use completedAt and actual focus sessions", () => {
  const { tasks, habits, sessions } = demoData();
  const data = analytics(tasks, habits, sessions, 7);
  assert.equal(data.completed, 2);
  assert.equal(
    data.bars.reduce((n, b) => n + b.value, 0),
    2,
  );
  assert.equal(data.focusMinutes, 150);
  assert.equal(analytics([], [], [], 30).habits, 0);
  assert.equal(analytics([], [], [], 30).rate, 0);
});

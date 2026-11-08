import { test, expect, Page } from "@playwright/test";
async function enter(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore the demo", exact: true })
    .click();
  await expect(page.getByText("YOUR DAILY MOMENTUM")).toBeVisible();
}
test("demo, tasks, validation, completion, persistence, and deletion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "docs/home-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Quick add task" }).click();
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(page.getByText("Give your task a title.")).toBeVisible();
  await page
    .getByLabel("TASK TITLE", { exact: true })
    .fill("Plan a meaningful test");
  await page
    .getByLabel("DESCRIPTION", { exact: true })
    .fill("Persistence is part of the experience.");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(
    page.getByText("Plan a meaningful test", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: "Complete Plan a meaningful test",
      exact: true,
    })
    .click();
  await page.reload();
  await expect(
    page.getByRole("checkbox", {
      name: "Complete Plan a meaningful test",
      exact: true,
    }),
  ).toHaveAttribute("aria-checked", "true");
  await page.getByText("Plan a meaningful test", { exact: true }).click();
  await page
    .getByLabel("TASK TITLE", { exact: true })
    .fill("A thoughtfully edited task");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByText("A thoughtfully edited task", { exact: true }),
  ).toBeVisible();
  await page.getByText("A thoughtfully edited task", { exact: true }).click();
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await expect(
    page.getByText("A thoughtfully edited task", { exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("project, habit, note, search, calendar, insights, theme and timer", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  await page.goto("/projects");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await page
    .getByLabel("PROJECT NAME", { exact: true })
    .fill("My next chapter");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(
    page.getByText("My next chapter", { exact: true }),
  ).toBeVisible();
  await page.getByText("Studio refresh", { exact: true }).click();
  await page.getByRole("button", { name: "Board", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Move Review homepage concepts to Done",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Move Review homepage concepts to In progress",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/habits");
  await page.getByRole("button", { name: "Create habit", exact: true }).click();
  await page
    .getByLabel("HABIT NAME", { exact: true })
    .fill("Read something wonderful");
  await page.getByRole("button", { name: "Save habit", exact: true }).click();
  await page
    .getByRole("checkbox", {
      name: "Log Read something wonderful",
      exact: true,
    })
    .click();
  await page.reload();
  await expect(
    page.getByRole("checkbox", {
      name: "Log Read something wonderful",
      exact: true,
    }),
  ).toHaveAttribute("aria-checked", "true");
  await page.goto("/notes/new");
  await page.getByLabel("TITLE", { exact: true }).fill("A captured idea");
  await page
    .getByPlaceholder("Let your thoughts wander…")
    .fill("Build a little space for good ideas.");
  await page
    .getByRole("button", { name: "Turn into a task", exact: true })
    .click();
  await expect(page.getByLabel("TASK TITLE", { exact: true })).toHaveValue(
    "A captured idea",
  );
  await page.goto("/search");
  await page.getByLabel("Search your space…", { exact: true }).fill("captured");
  await expect(page.getByText("A captured idea", { exact: true })).toHaveCount(
    2,
  );
  await page.goto("/calendar");
  await page.getByRole("button", { name: "Week", exact: true }).click();
  await page.getByRole("button", { name: "Next period", exact: true }).click();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.goto("/insights");
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await expect(
    page.getByText("Your completion rhythm", { exact: true }),
  ).toBeVisible();
  await page.goto("/settings");
  await page.getByRole("button", { name: "dark", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "dark", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "docs/settings-dark-mobile.png",
    fullPage: true,
  });
  await page.goto("/focus");
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("onboarding preferences, desktop layout and clearing local data", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Find your flow", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("WHAT SHOULD WE CALL YOU?", { exact: true })
    .fill("Jamie");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "light", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await expect(page.getByText(/Good .*Jamie/)).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "docs/home-desktop.png" });
  await page.goto("/settings");
  await page
    .getByRole("button", { name: "Clear all local records", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep it", exact: true }).click();
  await page
    .getByRole("button", { name: "Clear all local records", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await expect(
    page.getByText("Your space is ready for a fresh start"),
  ).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByText("Your day is wide open", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Your day is wide open", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Good .*Jamie/)).toBeVisible();
});

test("focus records a finished session exactly once after elapsed time", async ({
  page,
}) => {
  await page.clock.install();
  await enter(page);
  await page.goto("/focus");
  await page
    .getByRole("button", { name: "Timer settings", exact: true })
    .click();
  await page.getByLabel("FOCUS · MINUTES", { exact: true }).fill("1");
  await page
    .getByRole("button", { name: "Save timer settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await page.clock.fastForward(61000);
  await expect(
    page.getByText("SESSION COMPLETE", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("FOCUS SESSIONS", { exact: true }).locator(".."),
  ).toContainText("7");
  await page.reload();
  await expect(
    page.getByText("FOCUS SESSIONS", { exact: true }).locator(".."),
  ).toContainText("7");
  await expect(
    page.getByRole("button", { name: "Start again", exact: true }),
  ).toBeVisible();
});

test("recurrence, duplicate, archive, restore and manual ordering", async ({
  page,
}) => {
  page.on("pageerror", (error) => console.log("PAGE ERROR", error.message));
  await enter(page);
  await page.getByRole("button", { name: "Quick add task" }).click();
  await page
    .getByLabel("TASK TITLE", { exact: true })
    .fill("A daily little win");
  await page.getByRole("button", { name: "daily", exact: true }).click();
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Complete A daily little win", exact: true })
    .click();
  await page.getByRole("tab", { name: "Tasks", exact: true }).click();
  await expect(page.getByText("Your tasks", { exact: true })).toBeVisible({
    timeout: 10000,
  });
  await page.getByRole("button", { name: "Upcoming", exact: true }).click();
  await expect(
    page.getByText("A daily little win", { exact: true }),
  ).toBeVisible();
  await page.getByText("A daily little win", { exact: true }).click();
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await page.getByText("A daily little win (copy)", { exact: true }).click();
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(
    page.getByText("A daily little win (copy)", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Archived", exact: true }).click();
  await page.getByText("A daily little win (copy)", { exact: true }).click();
  await page.getByRole("button", { name: "Unarchive", exact: true }).click();
  await page.getByRole("button", { name: "All Tasks", exact: true }).click();
  await expect(
    page.getByText("A daily little win (copy)", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Manual", exact: true }).click();
  await page
    .getByRole("button", { name: "Move Read 20 pages up", exact: true })
    .click();
  const first = await page
    .getByText("Read 20 pages", { exact: true })
    .boundingBox();
  const second = await page
    .getByText("Review homepage concepts", { exact: true })
    .boundingBox();
  expect(first!.y).toBeLessThan(second!.y);
  await page.reload();
  await page.getByRole("button", { name: "All Tasks", exact: true }).click();
  await page.getByRole("button", { name: "Manual", exact: true }).click();
  const persistedFirst = await page
    .getByText("Read 20 pages", { exact: true })
    .boundingBox();
  const persistedSecond = await page
    .getByText("Review homepage concepts", { exact: true })
    .boundingBox();
  expect(persistedFirst!.y).toBeLessThan(persistedSecond!.y);
});

test("Kanban cards can be dragged between columns", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await enter(page);
  await page.goto("/projects/project-1");
  await page.getByRole("button", { name: "Board", exact: true }).click();
  const source = await page
    .getByText("Review homepage concepts", { exact: true })
    .boundingBox();
  const target = await page.getByText("To do", { exact: true }).boundingBox();
  await page.mouse.move(
    source!.x + source!.width / 2,
    source!.y + source!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(target!.x + 80, target!.y + 100, { steps: 25 });
  await page.mouse.up();
  await expect(
    page.getByRole("button", {
      name: "Move Review homepage concepts to In progress",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Move Review homepage concepts to Done",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("tab navigation and editing/deleting projects, habits, notes and profile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  for (const [tab, title] of [
    ["Calendar", "Your calendar"],
    ["Tasks", "Your tasks"],
    ["Insights", "Your progress, in perspective"],
    ["Profile", "Your space"],
    ["Home", "YOUR DAILY MOMENTUM"],
  ]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  await page.getByRole("tab", { name: "Profile", exact: true }).click();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page.getByLabel("DISPLAY NAME", { exact: true }).fill("Taylor");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await page.reload();
  await expect(page.getByText("Taylor", { exact: true })).toBeVisible();
  await page.goto("/projects/project-3");
  await page.getByRole("button", { name: "Edit project", exact: true }).click();
  await page
    .getByLabel("PROJECT NAME", { exact: true })
    .fill("A better weekend");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(
    page.getByText("A better weekend", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete project", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await page.goto("/projects");
  await expect(page.getByText("A better weekend", { exact: true })).toHaveCount(
    0,
  );
  await page.goto("/habits/habit-1");
  await page.getByRole("button", { name: "Edit habit", exact: true }).click();
  await page.getByLabel("HABIT NAME", { exact: true }).fill("Gentle mornings");
  await page.getByRole("button", { name: "Save habit", exact: true }).click();
  await expect(
    page.getByText("Gentle mornings", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete habit", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await page.goto("/habits");
  await expect(page.getByText("Gentle mornings", { exact: true })).toHaveCount(
    0,
  );
  await page.goto("/notes/note-2");
  await page.getByLabel("TITLE", { exact: true }).fill("A refined idea");
  await page.getByRole("button", { name: "Pin note", exact: true }).click();
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await page.goto("/notes/note-2");
  await expect(
    page.getByRole("button", { name: "Unpin note", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete note", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await page.goto("/notes");
  await expect(page.getByText("A refined idea", { exact: true })).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});

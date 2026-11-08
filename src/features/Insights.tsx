import React, { useState } from "react";
import { View } from "react-native";
import { CheckCheck, Timer, Flame } from "lucide-react-native";
import {
  Screen,
  ScreenHeader,
  Chips,
  AppCard,
  Label,
  Row,
  Section,
  ProgressBar,
  CircularProgress,
} from "../components/ui";
import { StatCard, ProjectCard } from "../components/cards";
import { ActivityChart } from "../components/charts";
import { useTasks, useHabits, useFocus, useProjects } from "../store";
import { analytics } from "../utils/metrics";
import { useTheme } from "../theme";
export default function Insights() {
  const t = useTheme();
  const [period, setPeriod] = useState("Weekly");
  const tasks = useTasks((s) => s.items);
  const habits = useHabits((s) => s.items);
  const sessions = useFocus((s) => s.items);
  const projects = useProjects((s) => s.items);
  const data = analytics(
    tasks,
    habits,
    sessions,
    period === "Daily" ? 1 : period === "Weekly" ? 7 : 30,
  );
  const active = tasks.filter(
    (x) => !x.archived && data.days.includes(x.dueDate),
  );
  return (
    <Screen>
      <ScreenHeader
        title="Your progress, in perspective"
        subtitle="Notice the small wins. They’re adding up."
      />
      <Chips
        items={["Daily", "Weekly", "Monthly"]}
        value={period}
        onChange={setPeriod}
      />
      <AppCard>
        <Row style={{ justifyContent: "space-between" }}>
          <View style={{ flex: 1, gap: 8 }}>
            <Label color={t.primary} bold size={11}>
              PRODUCTIVITY SCORE
            </Label>
            <Label bold size={23}>
              {data.rate >= 70
                ? "A rhythm worth celebrating."
                : "Progress starts with showing up."}
            </Label>
            <Label muted size={12}>
              Completion rate for tasks due in the last {data.days.length}{" "}
              {data.days.length === 1 ? "day" : "days"}.
            </Label>
          </View>
          <CircularProgress value={data.rate} size={108}>
            <Label bold size={28}>
              {data.rate}%
            </Label>
          </CircularProgress>
        </Row>
      </AppCard>
      <Row style={{ flexWrap: "wrap" }}>
        <StatCard
          label="TASKS COMPLETED"
          value={data.completed}
          icon={CheckCheck}
        />
        <StatCard
          label="FOCUS MINUTES"
          value={data.focusMinutes}
          icon={Timer}
        />
        <StatCard
          label="HABIT CONSISTENCY"
          value={`${data.habits}%`}
          icon={Flame}
        />
      </Row>
      <AppCard>
        <Label bold size={18}>
          Your completion rhythm
        </Label>
        <Label muted size={12}>
          Completed tasks by day
          {period === "Monthly" ? " · grouped into 5-day blocks" : ""}
        </Label>
        <ActivityChart data={data.bars} />
      </AppCard>
      <Section title="Where your attention goes" />
      <AppCard>
        {(["urgent", "high", "medium", "low"] as const).map((priority) => {
          const count = active.filter(
            (task) => task.priority === priority,
          ).length;
          const color = {
            urgent: t.danger,
            high: t.primary,
            medium: t.warning,
            low: t.success,
          }[priority];
          return (
            <View key={priority} style={{ gap: 8, marginBottom: 8 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Label>
                  {priority[0].toUpperCase() + priority.slice(1)} priority
                </Label>
                <Label muted size={12}>
                  {count} tasks
                </Label>
              </Row>
              <ProgressBar
                value={active.length ? (count / active.length) * 100 : 0}
                color={color}
              />
            </View>
          );
        })}
      </AppCard>
      <Section title="Projects taking shape" />
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
      <Label muted size={11}>
        All insights come from records on this device. Demo records are included
        until you clear local data in Settings.
      </Label>
    </Screen>
  );
}

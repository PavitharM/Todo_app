import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
} from "lucide-react-native";
import {
  Screen,
  ScreenHeader,
  AppCard,
  Row,
  Label,
  IconButton,
  Chips,
  AppButton,
  EmptyState,
} from "../components/ui";
import { TaskCard } from "../components/cards";
import { useTasks, useProjects, usePreferences } from "../store";
import { dateKey, parseDate, addDays, shortDate } from "../utils/date";
import { useTheme } from "../theme";
export default function Calendar() {
  const t = useTheme();
  const [selected, setSelected] = useState(dateKey());
  const [view, setView] = useState("Month");
  const [cursor, setCursor] = useState(dateKey());
  const tasks = useTasks((s) => s.items);
  const projects = useProjects((s) => s.items);
  const weekStart = usePreferences((s) => s.weekStart);
  const d = parseDate(cursor);
  const first = new Date(d.getFullYear(), d.getMonth(), 1, 12);
  const offset = (first.getDay() - weekStart + 7) % 7;
  const monthStart = addDays(dateKey(first), -offset);
  const week = addDays(
    selected,
    -((parseDate(selected).getDay() - weekStart + 7) % 7),
  );
  const days = Array.from(
    { length: view === "Month" ? 42 : view === "Week" ? 7 : 1 },
    (_, i) =>
      addDays(
        view === "Month" ? monthStart : view === "Week" ? week : selected,
        i,
      ),
  );
  const scheduled = tasks
    .filter((task) => !task.archived && task.dueDate === selected)
    .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  function navigate(n: number) {
    if (view === "Month") {
      const next = new Date(d.getFullYear(), d.getMonth() + n, 1, 12);
      setCursor(dateKey(next));
      setSelected(dateKey(next));
    } else {
      const next = addDays(selected, n * (view === "Week" ? 7 : 1));
      setSelected(next);
      setCursor(next);
    }
  }
  return (
    <Screen>
      <ScreenHeader
        title="Your calendar"
        subtitle="Make space for a well-balanced day."
        right={
          <IconButton
            icon={Plus}
            label="Schedule task"
            onPress={() =>
              router.push({
                pathname: "/tasks/new",
                params: { date: selected },
              })
            }
          />
        }
      />
      <Chips items={["Month", "Week", "Day"]} value={view} onChange={setView} />
      <AppCard>
        <Row style={{ justifyContent: "space-between" }}>
          <Label bold size={18}>
            {d.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </Label>
          <Row style={{ gap: 5 }}>
            <IconButton
              icon={ChevronLeft}
              label="Previous period"
              onPress={() => navigate(-1)}
            />
            <IconButton
              icon={ChevronRight}
              label="Next period"
              onPress={() => navigate(1)}
            />
          </Row>
        </Row>
        {view !== "Day" && (
          <Row style={{ gap: 0 }}>
            {Array.from(
              { length: 7 },
              (_, i) =>
                ["S", "M", "T", "W", "T", "F", "S"][(i + weekStart) % 7],
            ).map((day, i) => (
              <View key={i} style={{ width: "14.285%", alignItems: "center" }}>
                <Label size={11} muted bold>
                  {day}
                </Label>
              </View>
            ))}
          </Row>
        )}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {days.map((day) => {
            const current = parseDate(day);
            const hasTasks = tasks.some(
              (x) => x.dueDate === day && !x.archived,
            );
            const event = projects.some(
              (p) => p.deadline === day && p.status === "active",
            );
            const active = day === selected;
            return (
              <Pressable
                key={day}
                accessibilityRole="button"
                accessibilityLabel={current.toDateString()}
                accessibilityState={{ selected: active }}
                aria-selected={active}
                onPress={() => {
                  setSelected(day);
                  setCursor(day);
                }}
                style={{
                  width: view === "Day" ? "100%" : "14.285%",
                  height: 54,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  backgroundColor: active ? t.primary : "transparent",
                  borderRadius: 14,
                  opacity:
                    view === "Month" && current.getMonth() !== d.getMonth()
                      ? 0.35
                      : 1,
                }}
              >
                <Label
                  size={14}
                  bold={active || day === dateKey()}
                  color={
                    active ? "#fff" : day === dateKey() ? t.primary : t.text
                  }
                >
                  {view === "Day"
                    ? current.toLocaleDateString(undefined, {
                        weekday: "long",
                        day: "numeric",
                      })
                    : current.getDate()}
                </Label>
                <Row style={{ gap: 3, height: 4 }}>
                  {hasTasks && (
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: active ? "white" : t.primary,
                      }}
                    />
                  )}
                  {event && (
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: t.warning,
                      }}
                    />
                  )}
                </Row>
              </Pressable>
            );
          })}
        </View>
        <Row style={{ justifyContent: "space-between" }}>
          <Label muted size={10}>
            ● Tasks{" "}
            <Label size={10} color={t.warning}>
              ● Project deadlines
            </Label>
          </Label>
          <AppButton
            title="Today"
            variant="ghost"
            onPress={() => {
              setSelected(dateKey());
              setCursor(dateKey());
            }}
          />
        </Row>
      </AppCard>
      <Row style={{ justifyContent: "space-between" }}>
        <Label bold size={19}>
          {selected === dateKey() ? "Today" : shortDate(selected)}’s schedule
        </Label>
        <Label size={12} muted>
          {scheduled.length} tasks
        </Label>
      </Row>
      {scheduled.map((task) => (
        <TaskCard task={task} key={task.id} />
      ))}
      {projects
        .filter((p) => p.deadline === selected)
        .map((p) => (
          <AppCard key={p.id} onPress={() => router.push(`/projects/${p.id}`)}>
            <Row>
              <CalendarDays size={19} color={t.warning} />
              <View>
                <Label bold>{p.title}</Label>
                <Label muted size={12}>
                  Project deadline
                </Label>
              </View>
            </Row>
          </AppCard>
        ))}
      {!scheduled.length && (
        <EmptyState
          title="A little room in your day"
          description="Schedule something meaningful, or leave space to breathe."
          action={
            <AppButton
              title="Add to this day"
              onPress={() =>
                router.push({
                  pathname: "/tasks/new",
                  params: { date: selected },
                })
              }
            />
          }
        />
      )}
    </Screen>
  );
}

import React, { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import {
  Clock,
  ArrowUpRight,
  Layers,
  Heart,
  Sun,
  Book,
  Briefcase,
  Flame,
  Check,
  Trash2,
} from "lucide-react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Task, Project, Habit } from "../types";
import { useTheme } from "../theme";
import { useTasks, useHabits, toggleTask, useFeedback } from "../store";
import { dateKey, daysBack, parseDate } from "../utils/date";
import { habitStreak, habitDue } from "../utils/metrics";
import {
  AppCard,
  Row,
  Label,
  PriorityBadge,
  ProgressBar,
  CheckBox,
  ConfirmationDialog,
} from "./ui";
export function TaskCard({
  task,
  compact = false,
}: {
  task: Task;
  compact?: boolean;
}) {
  const t = useTheme();
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<any>(null);
  const done = task.status === "done";
  return (
    <>
      <ReanimatedSwipeable
        ref={ref}
        overshootLeft={false}
        overshootRight={false}
        renderLeftActions={() => (
          <Pressable
            accessibilityLabel="Toggle task completion"
            onPress={() => {
              toggleTask(task);
              ref.current?.close();
            }}
            style={{
              backgroundColor: t.success,
              width: 72,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
            }}
          >
            <Check color="#fff" />
          </Pressable>
        )}
        renderRightActions={() => (
          <Pressable
            accessibilityLabel="Delete task"
            onPress={() => {
              setConfirm(true);
              ref.current?.close();
            }}
            style={{
              backgroundColor: t.danger,
              width: 72,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
            }}
          >
            <Trash2 color="#fff" />
          </Pressable>
        )}
      >
        <AppCard style={{ padding: 16, borderRadius: 18 }}>
          <Row>
            <CheckBox
              checked={done}
              onPress={() => toggleTask(task)}
              label={`Complete ${task.title}`}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/tasks/${task.id}`)}
              style={{ flex: 1, gap: 7 }}
            >
              <Label
                bold
                size={14}
                color={done ? t.muted : t.text}
                style={{ textDecorationLine: done ? "line-through" : "none" }}
              >
                {task.title}
              </Label>
              <Row style={{ gap: 8, flexWrap: "wrap" }}>
                {task.dueTime && (
                  <Row style={{ gap: 4 }}>
                    <Clock size={11} color={t.muted} />
                    <Label size={11} muted>
                      {task.dueTime}
                    </Label>
                  </Row>
                )}
                <Label size={11} color={t.primary}>
                  {task.category}
                </Label>
                {task.subtasks.length > 0 && (
                  <Label size={11} muted>
                    {task.subtasks.filter((s) => s.done).length}/
                    {task.subtasks.length} steps
                  </Label>
                )}
                {!compact && task.dueDate && (
                  <Label size={11} muted>
                    {task.dueDate === dateKey() ? "Today" : task.dueDate}
                  </Label>
                )}
              </Row>
            </Pressable>
            <PriorityBadge priority={task.priority} />
          </Row>
        </AppCard>
      </ReanimatedSwipeable>
      <ConfirmationDialog
        visible={confirm}
        title="Delete this task?"
        description="This task and its checklist will be permanently removed from this device."
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          if (await useTasks.getState().remove(task.id)) {
            setConfirm(false);
            useFeedback.getState().show("Task deleted");
          }
        }}
      />
    </>
  );
}
export function ProjectCard({ project }: { project: Project }) {
  const Icon =
    ({ Layers, Heart, Sun, Book, Briefcase } as Record<string, typeof Layers>)[
      project.icon
    ] || Layers;
  const tasks = useTasks((s) => s.items).filter(
    (t) => t.projectId === project.id && !t.archived,
  );
  const done = tasks.filter((t) => t.status === "done").length;
  return (
    <AppCard onPress={() => router.push(`/projects/${project.id}`)}>
      <Row style={{ justifyContent: "space-between" }}>
        <View
          style={{
            backgroundColor: project.color + "18",
            padding: 11,
            borderRadius: 13,
          }}
        >
          <Icon size={21} color={project.color} />
        </View>
        <ArrowUpRight size={18} color={project.color} />
      </Row>
      <Label bold size={16}>
        {project.title}
      </Label>
      <Label muted size={12}>
        {tasks.length} tasks · {done} completed
      </Label>
      <ProgressBar
        value={tasks.length ? (done / tasks.length) * 100 : 0}
        color={project.color}
      />
    </AppCard>
  );
}
export function HabitCard({ habit }: { habit: Habit }) {
  const t = useTheme();
  const today = dateKey();
  const due = habitDue(habit, today);
  const streak = habitStreak(habit);
  return (
    <AppCard>
      <Row>
        <View
          style={{
            padding: 10,
            borderRadius: 12,
            backgroundColor: habit.color + "15",
          }}
        >
          <Flame size={20} color={habit.color} />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/habits/${habit.id}`)}
          style={{ flex: 1 }}
        >
          <Label bold>{habit.title}</Label>
          <Label size={11} muted>
            {streak.current} day streak ·{" "}
            {due ? "Today is your day" : "Rest day"}
          </Label>
        </Pressable>
        {due && (
          <CheckBox
            checked={habit.completions.includes(today)}
            label={`Log ${habit.title}`}
            onPress={() =>
              useHabits.getState().save({
                ...habit,
                completions: habit.completions.includes(today)
                  ? habit.completions.filter((d) => d !== today)
                  : [...habit.completions, today],
              })
            }
          />
        )}
      </Row>
      <Row style={{ justifyContent: "space-between" }}>
        {daysBack(7).map((day) => (
          <View key={day} style={{ alignItems: "center", gap: 7 }}>
            <Label size={10} muted>
              {parseDate(day).toLocaleDateString(undefined, {
                weekday: "narrow",
              })}
            </Label>
            <View
              style={{
                height: 25,
                width: 25,
                borderRadius: 9,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: habit.completions.includes(day)
                  ? habit.color
                  : t.background,
                borderWidth: day === today ? 1 : 0,
                borderColor: habit.color,
              }}
            >
              {habit.completions.includes(day) && (
                <Check size={14} color="#fff" />
              )}
            </View>
          </View>
        ))}
      </Row>
    </AppCard>
  );
}
export function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color?: string;
}) {
  const t = useTheme();
  return (
    <AppCard style={{ flex: 1, minWidth: 90, padding: 16 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Label size={11} muted>
          {label}
        </Label>
        <Icon size={16} color={color || t.primary} />
      </Row>
      <Label bold size={25}>
        {value}
      </Label>
    </AppCard>
  );
}

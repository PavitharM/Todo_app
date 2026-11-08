import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Plus,
  Pencil,
  Flame,
  Trophy,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import {
  ColorPicker,
  Screen,
  ScreenHeader,
  IconButton,
  AppButton,
  CustomModal,
  CustomInput,
  Chips,
  Label,
  Row,
  AppCard,
  EmptyState,
  ConfirmationDialog,
  ErrorState,
} from "../components/ui";
import { HabitCard, StatCard } from "../components/cards";
import { useHabits, useFeedback } from "../store";
import { Habit } from "../types";
import { stamp, dateKey, daysBack, parseDate } from "../utils/date";
import { habitStreak, habitConsistency, habitDue } from "../utils/metrics";
import { useTheme } from "../theme";
import { colors } from "./Projects";
export default function Habits() {
  const { items, error } = useHabits();
  const [open, setOpen] = useState(false);
  return (
    <Screen>
      <ScreenHeader
        title="Little rituals"
        subtitle="Small habits. A life that feels like you."
        back
        right={
          <IconButton
            icon={Plus}
            label="Create habit"
            onPress={() => setOpen(true)}
          />
        }
      />
      <AppCard>
        <Label bold size={23}>
          {habitConsistency(items, daysBack(7))}%{" "}
          <Label muted size={13}>
            weekly consistency
          </Label>
        </Label>
        <Label muted>Show up for yourself, one day at a time.</Label>
      </AppCard>
      {error && <ErrorState message={error} />}{" "}
      {items.map((h) => (
        <HabitCard key={h.id} habit={h} />
      ))}
      {!items.length && (
        <EmptyState
          action={
            <AppButton title="Create a habit" onPress={() => setOpen(true)} />
          }
        />
      )}{" "}
      {open && <HabitEditor onClose={() => setOpen(false)} />}
    </Screen>
  );
}
export function HabitEditor({
  habit,
  onClose,
}: {
  habit?: Habit;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Habit>(
    habit || {
      ...stamp(),
      title: "",
      description: "",
      color: colors[0],
      schedule: [0, 1, 2, 3, 4, 5, 6],
      reminder: "",
      completions: [],
    },
  );
  const [error, setError] = useState("");
  return (
    <CustomModal
      visible
      title={habit ? "Edit ritual" : "Start a little ritual"}
      onClose={onClose}
    >
      <CustomInput
        label="HABIT NAME"
        value={draft.title}
        onChangeText={(title) => setDraft({ ...draft, title })}
      />
      <CustomInput
        label="YOUR WHY"
        value={draft.description}
        onChangeText={(description) => setDraft({ ...draft, description })}
      />
      <ColorPicker
        colors={colors}
        value={draft.color}
        onChange={(color) => setDraft({ ...draft, color })}
      />
      <Label muted size={12}>
        SCHEDULE
      </Label>
      <Chips
        items={["Every day", "Weekdays", "Weekly"]}
        value={
          draft.schedule.length === 7
            ? "Every day"
            : draft.schedule.join(",") === "1,2,3,4,5"
              ? "Weekdays"
              : draft.schedule.length === 1
                ? "Weekly"
                : ""
        }
        onChange={(v) =>
          setDraft({
            ...draft,
            schedule:
              v === "Every day"
                ? [0, 1, 2, 3, 4, 5, 6]
                : v === "Weekdays"
                  ? [1, 2, 3, 4, 5]
                  : [parseDate(dateKey()).getDay()],
          })
        }
      />
      <Row style={{ gap: 6, flexWrap: "wrap" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
          <AppButton
            key={day}
            title={day}
            variant={draft.schedule.includes(i) ? "primary" : "secondary"}
            onPress={() =>
              setDraft({
                ...draft,
                schedule: draft.schedule.includes(i)
                  ? draft.schedule.filter((x) => x !== i)
                  : [...draft.schedule, i].sort(),
              })
            }
          />
        ))}
      </Row>
      <CustomInput
        label="REMINDER PREFERENCE · HH:MM"
        value={draft.reminder}
        onChangeText={(reminder) => setDraft({ ...draft, reminder })}
      />
      <Label size={11} muted>
        Reminder preferences are stored locally. Device alerts are not enabled.
      </Label>
      {error && <Label color="#EF5B65">{error}</Label>}
      <AppButton
        title="Save habit"
        onPress={async () => {
          if (!draft.title.trim()) return setError("Give your habit a name.");
          if (!draft.schedule.length)
            return setError("Choose at least one day.");
          if (
            draft.reminder &&
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.reminder)
          )
            return setError("Use HH:MM for the reminder.");
          if (
            await useHabits
              .getState()
              .save({ ...draft, title: draft.title.trim() })
          ) {
            useFeedback.getState().show("Habit saved");
            onClose();
          } else setError("Could not save. Please retry.");
        }}
      />
    </CustomModal>
  );
}
export function HabitDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const store = useHabits();
  const habit = store.items.find((h) => h.id === id);
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [cursor, setCursor] = useState(dateKey());
  if (!habit)
    return (
      <Screen>
        <ScreenHeader title="Habit not found" back />
        <EmptyState />
      </Screen>
    );
  const streak = habitStreak(habit);
  const month = parseDate(cursor);
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const count = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  function move(n: number) {
    setCursor(
      dateKey(new Date(month.getFullYear(), month.getMonth() + n, 1, 12)),
    );
  }
  return (
    <Screen>
      <ScreenHeader
        title={habit.title}
        back
        right={
          <IconButton
            icon={Pencil}
            label="Edit habit"
            onPress={() => setEdit(true)}
          />
        }
      />
      <Label muted>{habit.description}</Label>
      <Row>
        <StatCard label="CURRENT STREAK" value={streak.current} icon={Flame} />
        <StatCard label="LONGEST STREAK" value={streak.longest} icon={Trophy} />
      </Row>
      <Row>
        <StatCard
          label="LAST 7 DAYS"
          value={`${habitConsistency([habit], daysBack(7))}%`}
          icon={Check}
        />
        <StatCard
          label="LAST 30 DAYS"
          value={`${habitConsistency([habit], daysBack(30))}%`}
          icon={Check}
        />
      </Row>
      <AppCard>
        <Row style={{ justifyContent: "space-between" }}>
          <IconButton
            icon={ChevronLeft}
            label="Previous month"
            onPress={() => move(-1)}
          />
          <Label bold>
            {month.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </Label>
          <IconButton
            icon={ChevronRight}
            label="Next month"
            onPress={() => move(1)}
          />
        </Row>
        <Row style={{ gap: 0 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <View key={i} style={{ width: "14.285%", alignItems: "center" }}>
              <Label muted size={11}>
                {d}
              </Label>
            </View>
          ))}
        </Row>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {Array.from({ length: first.getDay() }, (_, i) => (
            <View key={`blank-${i}`} style={{ width: "14.285%" }} />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const day = dateKey(
              new Date(month.getFullYear(), month.getMonth(), i + 1, 12),
            );
            const due = habitDue(habit, day);
            const checked = habit.completions.includes(day);
            return (
              <Pressable
                key={day}
                accessibilityRole="checkbox"
                accessibilityLabel={`Log habit for ${day}`}
                accessibilityState={{
                  checked,
                  disabled: !due || day > dateKey(),
                }}
                disabled={!due || day > dateKey()}
                onPress={() =>
                  store.save({
                    ...habit,
                    completions: checked
                      ? habit.completions.filter((d) => d !== day)
                      : [...habit.completions, day],
                  })
                }
                style={{
                  width: "14.285%",
                  height: 48,
                  padding: 4,
                  opacity: !due || day > dateKey() ? 0.3 : 1,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    backgroundColor: checked ? habit.color : t.background,
                    borderWidth: day === dateKey() ? 1 : 0,
                    borderColor: habit.color,
                  }}
                >
                  <Label color={checked ? "#fff" : t.text}>{i + 1}</Label>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Label size={12} muted>
          Tap a scheduled day to log or undo a completion.
        </Label>
      </AppCard>
      <AppButton
        title="Delete habit"
        variant="danger"
        onPress={() => setConfirm(true)}
      />
      {edit && <HabitEditor habit={habit} onClose={() => setEdit(false)} />}
      <ConfirmationDialog
        visible={confirm}
        title="Delete this habit?"
        description="This habit and its completion history will be removed."
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          if (await store.remove(id)) {
            setConfirm(false);
            router.back();
          }
        }}
      />
    </Screen>
  );
}

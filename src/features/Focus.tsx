import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Settings2, Play, Pause, RotateCcw, Timer } from "lucide-react-native";
import {
  Screen,
  ScreenHeader,
  IconButton,
  Chips,
  CircularProgress,
  Label,
  AppButton,
  Row,
  AppCard,
  CustomModal,
  CustomInput,
  Section,
  EmptyState,
} from "../components/ui";
import { useTimer, useFocus, useTasks } from "../store";
import { uid, shortDate, dateKey } from "../utils/date";
import { useTheme } from "../theme";
export default function Focus() {
  const t = useTheme();
  const timer = useTimer();
  const tasks = useTasks((s) => s.items).filter(
    (x) => !x.archived && x.status !== "done",
  );
  const sessions = useFocus((s) => s.items);
  const [now, setNow] = useState(() => Date.now());
  const [settings, setSettings] = useState(false);
  const [mins, setMins] = useState({
    focus: String(timer.focusMinutes),
    short: String(timer.shortMinutes),
    long: String(timer.longMinutes),
  });
  const [error, setError] = useState("");
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);
  const remaining =
    timer.running && timer.endsAt
      ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
      : timer.remaining;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0"),
    ss = String(remaining % 60).padStart(2, "0");
  function reset(kind = timer.kind) {
    const duration =
      (kind === "focus"
        ? timer.focusMinutes
        : kind === "short"
          ? timer.shortMinutes
          : timer.longMinutes) * 60;
    timer.set({
      kind,
      duration,
      remaining: duration,
      endsAt: null,
      running: false,
      hasStarted: false,
      sessionId: uid(),
    });
  }
  function toggle() {
    if (timer.running) {
      timer.set({ remaining, endsAt: null, running: false });
    } else {
      const rest = remaining || timer.duration;
      timer.set({
        remaining: rest,
        endsAt: Date.now() + rest * 1000,
        running: true,
        hasStarted: true,
        sessionId: remaining ? timer.sessionId : uid(),
      });
    }
  }
  return (
    <Screen>
      <ScreenHeader
        title="A little focus"
        subtitle="One thing at a time. You’ve got this."
        back
        right={
          <IconButton
            icon={Settings2}
            label="Timer settings"
            onPress={() => setSettings(true)}
          />
        }
      />
      <Chips
        items={["Focus", "Short break", "Long break"]}
        value={
          timer.kind === "focus"
            ? "Focus"
            : timer.kind === "short"
              ? "Short break"
              : "Long break"
        }
        onChange={(v) =>
          reset(
            v === "Focus" ? "focus" : v === "Short break" ? "short" : "long",
          )
        }
      />
      <View style={{ alignItems: "center", paddingVertical: 30, gap: 30 }}>
        <CircularProgress
          size={265}
          value={(1 - remaining / timer.duration) * 100}
        >
          <Label size={54} bold style={{ fontVariant: ["tabular-nums"] }}>
            {mm}:{ss}
          </Label>
          <Label muted size={12}>
            {timer.running
              ? "YOU’RE IN YOUR FOCUS SPACE"
              : remaining === 0
                ? "SESSION COMPLETE"
                : "A MOMENT FOR YOURSELF"}
          </Label>
        </CircularProgress>
        <Row>
          <IconButton
            icon={RotateCcw}
            label="Reset timer"
            onPress={() => reset()}
          />
          <AppButton
            title={
              timer.running
                ? "Pause"
                : !timer.hasStarted
                  ? timer.kind === "focus"
                    ? "Start focus"
                    : "Start break"
                  : remaining === 0
                    ? "Start again"
                    : "Resume"
            }
            icon={timer.running ? Pause : Play}
            onPress={toggle}
          />
        </Row>
      </View>
      <AppCard>
        <Label bold>What’s your intention?</Label>
        <Label muted size={12}>
          Connect this session to a task, or simply be present.
        </Label>
        <Chips
          items={["Open focus", ...tasks.map((task) => task.title)]}
          value={
            tasks.find((task) => task.id === timer.taskId)?.title ||
            "Open focus"
          }
          onChange={(v) =>
            timer.set({
              taskId: tasks.find((task) => task.title === v)?.id || "",
            })
          }
        />
      </AppCard>
      <Section title="Time well spent" />
      <Row>
        <AppCard style={{ flex: 1 }}>
          <Label muted size={11}>
            FOCUS SESSIONS
          </Label>
          <Label size={27} bold>
            {sessions.filter((s) => s.kind === "focus").length}
          </Label>
        </AppCard>
        <AppCard style={{ flex: 1 }}>
          <Label muted size={11}>
            FOCUS MINUTES
          </Label>
          <Label size={27} bold>
            {Math.round(
              sessions
                .filter((s) => s.kind === "focus")
                .reduce((n, s) => n + s.duration, 0) / 60,
            )}
          </Label>
        </AppCard>
      </Row>
      {sessions
        .slice()
        .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
        .slice(0, 20)
        .map((s) => (
          <AppCard key={s.id} style={{ padding: 15 }}>
            <Row>
              <Timer size={20} color={t.primary} />
              <View style={{ flex: 1 }}>
                <Label bold>
                  {s.kind === "focus"
                    ? "Deep focus"
                    : s.kind === "short"
                      ? "Short break"
                      : "Long break"}
                </Label>
                <Label muted size={11}>
                  {shortDate(dateKey(new Date(s.endedAt)))} ·{" "}
                  {useTasks
                    .getState()
                    .items.find((task) => task.id === s.taskId)?.title ||
                    "Open focus"}
                </Label>
              </View>
              <Label bold>{Math.round(s.duration / 60)} min</Label>
            </Row>
          </AppCard>
        ))}
      {!sessions.length && (
        <EmptyState
          title="Your first focus session awaits"
          description="Completed sessions will appear here."
        />
      )}
      <CustomModal
        visible={settings}
        title="Make it your rhythm"
        onClose={() => setSettings(false)}
      >
        {(["focus", "short", "long"] as const).map((kind) => (
          <CustomInput
            key={kind}
            label={`${kind.toUpperCase()} · MINUTES`}
            keyboardType="number-pad"
            value={mins[kind]}
            onChangeText={(value) => setMins({ ...mins, [kind]: value })}
          />
        ))}
        {error && <Label color={t.danger}>{error}</Label>}
        <Label muted size={12}>
          Saving resets the current timer. Completed sessions stay in your
          history.
        </Label>
        <AppButton
          title="Save timer settings"
          onPress={() => {
            if (
              Object.values(mins).some(
                (v) => !/^\d+$/.test(v) || Number(v) < 1 || Number(v) > 180,
              )
            )
              return setError("Choose whole minutes between 1 and 180.");
            const duration = Number(mins[timer.kind]) * 60;
            timer.set({
              focusMinutes: Number(mins.focus),
              shortMinutes: Number(mins.short),
              longMinutes: Number(mins.long),
              duration,
              remaining: duration,
              running: false,
              hasStarted: false,
              endsAt: null,
              sessionId: uid(),
            });
            setSettings(false);
            setError("");
          }}
        />
      </CustomModal>
    </Screen>
  );
}

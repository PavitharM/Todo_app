import React, { useState } from "react";
import { View, Pressable, Switch } from "react-native";
import { router } from "expo-router";
import {
  Settings,
  Layers,
  Flame,
  NotebookPen,
  Timer,
  ChevronRight,
  LogOut,
  Pencil,
  Info,
  Palette,
  Database,
  Check,
} from "lucide-react-native";
import {
  Screen,
  ScreenHeader,
  AppCard,
  Row,
  Label,
  IconButton,
  CustomInput,
  AppButton,
  CustomModal,
  Chips,
  ConfirmationDialog,
  Section,
  ErrorState,
} from "../components/ui";
import {
  usePreferences,
  useThemeStore,
  useTasks,
  useFocus,
  clearData,
  useFeedback,
} from "../store";
import { useTheme } from "../theme";
import { colors } from "./Projects";
export default function Profile() {
  const t = useTheme();
  const prefs = usePreferences();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(prefs.name);
  const [email, setEmail] = useState(prefs.email);
  const [error, setError] = useState("");
  const completed = useTasks((s) => s.items).filter(
    (x) => x.status === "done",
  ).length;
  const focus = useFocus((s) => s.items).filter(
    (x) => x.kind === "focus",
  ).length;
  return (
    <Screen>
      <ScreenHeader
        title="Your space"
        subtitle="A little more intentional. A little more you."
        right={
          <IconButton
            icon={Settings}
            label="Settings"
            onPress={() => router.push("/settings")}
          />
        }
      />
      <AppCard style={{ alignItems: "center", padding: 30 }}>
        <View
          style={{
            width: 82,
            height: 82,
            borderRadius: 28,
            backgroundColor: t.primary + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Label bold color={t.primary} size={29}>
            {prefs.name
              .split(" ")
              .map((x) => x[0])
              .join("")
              .slice(0, 2)}
          </Label>
        </View>
        <Label bold size={25}>
          {prefs.name}
        </Label>
        <Label muted>{prefs.intention}</Label>
        <AppButton
          title="Edit profile"
          icon={Pencil}
          variant="secondary"
          onPress={() => setEdit(true)}
        />
        <Row style={{ marginTop: 14, gap: 38 }}>
          <View style={{ alignItems: "center" }}>
            <Label bold size={23}>
              {completed}
            </Label>
            <Label size={11} muted>
              Tasks finished
            </Label>
          </View>
          <View style={{ alignItems: "center" }}>
            <Label bold size={23}>
              {focus}
            </Label>
            <Label size={11} muted>
              Focus sessions
            </Label>
          </View>
        </Row>
      </AppCard>
      <AppCard>
        <Label size={11} color={t.primary} bold>
          YOUR LOCAL DEMO SPACE
        </Label>
        <Label muted size={13}>
          Everything stays on this device. No account, password, or cloud
          connection needed.
        </Label>
      </AppCard>
      {[
        { title: "Projects", icon: Layers, path: "/projects" },
        { title: "Habit tracker", icon: Flame, path: "/habits" },
        { title: "Focus mode", icon: Timer, path: "/focus" },
        { title: "Notes & ideas", icon: NotebookPen, path: "/notes" },
        { title: "Settings & appearance", icon: Settings, path: "/settings" },
      ].map((item) => (
        <AppCard
          key={item.path}
          onPress={() => router.push(item.path as any)}
          style={{ padding: 17 }}
        >
          <Row>
            <item.icon size={21} color={t.primary} />
            <Label bold style={{ flex: 1 }}>
              {item.title}
            </Label>
            <ChevronRight size={18} color={t.muted} />
          </Row>
        </AppCard>
      ))}
      <AppButton
        title="Exit demo"
        icon={LogOut}
        variant="ghost"
        onPress={() => {
          prefs.set({ onboarded: false });
          router.replace("/onboarding");
        }}
      />
      <CustomModal
        visible={edit}
        title="Make yourself at home"
        onClose={() => setEdit(false)}
      >
        <CustomInput label="DISPLAY NAME" value={name} onChangeText={setName} />
        <CustomInput
          label="EMAIL · OPTIONAL, STORED LOCALLY"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {error && <Label color={t.danger}>{error}</Label>}
        <AppButton
          title="Save profile"
          onPress={() => {
            if (!name.trim()) return setError("Please enter a display name.");
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
              return setError("Enter a valid email, or leave it blank.");
            prefs.set({ name: name.trim(), email });
            setEdit(false);
            useFeedback.getState().show("Profile updated");
          }}
        />
      </CustomModal>
    </Screen>
  );
}
export function SettingsScreen() {
  const t = useTheme();
  const prefs = usePreferences();
  const theme = useThemeStore();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Screen>
      <ScreenHeader
        title="Make it yours"
        subtitle="A space that works the way you do."
        back
      />
      <Section title="Appearance" />
      <AppCard>
        <Row>
          <Palette size={19} color={t.primary} />
          <Label bold>Theme</Label>
        </Row>
        <Chips
          items={["light", "dark", "system"]}
          value={theme.mode}
          onChange={(mode) =>
            theme.set({ mode: mode as "light" | "dark" | "system" })
          }
        />
        <Label size={12} muted>
          ACCENT COLOR
        </Label>
        <Row style={{ flexWrap: "wrap" }}>
          {colors.map((color) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Set accent ${color}`}
              key={color}
              onPress={() => theme.set({ accent: color })}
              style={{
                width: 38,
                height: 38,
                borderRadius: 13,
                backgroundColor: color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {theme.accent === color && <Check color="#fff" size={20} />}
            </Pressable>
          ))}
        </Row>
      </AppCard>
      <Section title="Your preferences" />
      <AppCard>
        <Label bold>First day of the week</Label>
        <Chips
          items={["Monday", "Sunday"]}
          value={prefs.weekStart === 1 ? "Monday" : "Sunday"}
          onChange={(v) => prefs.set({ weekStart: v === "Monday" ? 1 : 0 })}
        />
        <Label bold>Default task priority</Label>
        <Chips
          items={["low", "medium", "high", "urgent"]}
          value={prefs.defaultPriority}
          onChange={(v) => prefs.set({ defaultPriority: v as any })}
        />
        <Row style={{ justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Label bold>Reminder preference</Label>
            <Label muted size={12}>
              Saved for future device alerts.
            </Label>
          </View>
          <Switch
            accessibilityLabel="Reminder preference"
            value={prefs.notifications}
            onValueChange={(notifications) => prefs.set({ notifications })}
            trackColor={{ true: t.primary }}
          />
        </Row>
        <Label muted size={11}>
          This frontend version does not request notification permissions or
          deliver alerts.
        </Label>
      </AppCard>
      <Section title="Your data" />
      <AppCard>
        <Row>
          <Database size={19} color={t.primary} />
          <Label bold>Local, and yours</Label>
        </Row>
        <Label muted size={13}>
          Tasks, projects, habits, notes, and sessions are stored on this
          device. Clearing them starts a fresh space without demo records.
        </Label>
        <AppButton
          title={busy ? "Clearing…" : "Clear all local records"}
          variant="danger"
          disabled={busy}
          onPress={() => setConfirm(true)}
        />
        {error && <ErrorState message={error} />}
      </AppCard>
      <AppCard>
        <Row>
          <Info size={19} color={t.primary} />
          <Label bold>Super Todo · 1.0.0</Label>
        </Row>
        <Label muted size={13}>
          A calmer place to plan, focus, and grow. Built for intentional days.
        </Label>
        <Label muted size={11}>
          Frontend demo · No cloud sync or authentication. Native data uses
          SQLite; the browser preview uses browser storage.
        </Label>
      </AppCard>
      <ConfirmationDialog
        visible={confirm}
        title="Start with a clean slate?"
        description="All tasks, projects, habits, notes, focus history, and the running timer will be cleared. Your profile and appearance preferences will stay. This cannot be undone."
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          setBusy(true);
          try {
            await clearData();
            setConfirm(false);
            useFeedback
              .getState()
              .show("Your space is ready for a fresh start");
          } catch (e) {
            setError(String(e));
            setConfirm(false);
          } finally {
            setBusy(false);
          }
        }}
      />
    </Screen>
  );
}

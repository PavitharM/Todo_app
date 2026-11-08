import React from "react";
import { View, Pressable } from "react-native";
import { Tabs, router } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import {
  Home,
  CalendarDays,
  ListTodo,
  ChartNoAxesColumnIncreasing,
  UserRound,
  Plus,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme";
import { Label } from "../../src/components/ui";
const icons = [
  Home,
  CalendarDays,
  ListTodo,
  ChartNoAxesColumnIncreasing,
  UserRound,
];
function BottomNavigation({
  state,
  emitter,
  navigateToTab,
}: BottomTabBarProps) {
  const t = useTheme();
  const inset = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: t.surface,
        borderTopWidth: 1,
        borderColor: t.border,
        paddingBottom: Math.max(inset.bottom, 12),
        paddingTop: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "center",
          width: "100%",
          maxWidth: 700,
        }}
      >
        {state.routes.map((route, index) => {
          const Icon = icons[index];
          const active = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={
                ["Home", "Calendar", "Tasks", "Insights", "Profile"][index]
              }
              accessibilityState={{ selected: active }}
              aria-selected={active}
              onPress={() => {
                const e = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!active && !e.defaultPrevented) navigateToTab(route.key);
              }}
              style={{ flex: 1, alignItems: "center", gap: 5, minHeight: 44 }}
            >
              <Icon
                size={21}
                color={active ? t.primary : t.muted}
                strokeWidth={active ? 2.3 : 1.7}
              />
              <Label
                size={10}
                bold={active}
                color={active ? t.primary : t.muted}
              >
                {["Home", "Calendar", "Tasks", "Insights", "Profile"][index]}
              </Label>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <BottomNavigation {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
        <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
        <Tabs.Screen name="insights" options={{ title: "Insights" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
      <QuickAdd />
    </View>
  );
}
function QuickAdd() {
  const t = useTheme();
  const inset = useSafeAreaInsets();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Quick add task"
      onPress={() => router.push("/tasks/new")}
      style={({ pressed }) => ({
        position: "absolute",
        bottom: 85 + inset.bottom,
        right: 24,
        width: 52,
        height: 52,
        backgroundColor: t.primary,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: t.primary,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 4,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Plus size={25} color="#fff" />
    </Pressable>
  );
}

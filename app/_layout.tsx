import "../global.css";
import { ErrorBoundary as AppErrorBoundary } from "../src/components/ErrorBoundary";
import React, { useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initialize, reconcileTimer, usePreferences } from "../src/store";
import { useTheme } from "../src/theme";
import { LoadingState, ErrorState } from "../src/components/ui";
SplashScreen.preventAutoHideAsync().catch(() => {});
export default function RootLayout() {
  const t = useTheme();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const onboarded = usePreferences((s) => s.onboarded);
  const segments = useSegments();
  async function boot() {
    try {
      await initialize();
      setError("");
      setReady(true);
    } catch (e) {
      setError(String(e));
    } finally {
      await SplashScreen.hideAsync();
    }
  }
  useEffect(() => {
    let mounted = true;
    initialize()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((e) => {
        if (mounted) setError(String(e));
      })
      .finally(() => SplashScreen.hideAsync());
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    reconcileTimer();
    const interval = setInterval(() => reconcileTimer(), 1000);
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") reconcileTimer();
    });
    return () => {
      clearInterval(interval);
      listener.remove();
    };
  }, [ready]);
  useEffect(() => {
    if (ready && !onboarded && segments[0] !== "onboarding")
      router.replace("/onboarding");
  }, [ready, onboarded, segments]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppErrorBoundary>
          <StatusBar style={t.dark ? "light" : "dark"} />
          {error ? (
            <View
              style={{
                flex: 1,
                padding: 30,
                justifyContent: "center",
                backgroundColor: t.background,
              }}
            >
              <ErrorState
                message={`Your local space could not be loaded. ${error}`}
                retry={boot}
              />
            </View>
          ) : !ready ? (
            <LoadingState />
          ) : (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: t.background },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="onboarding/index"
                options={{ animation: "fade" }}
              />
              <Stack.Screen
                name="tasks/[id]"
                options={{ presentation: "modal" }}
              />
            </Stack>
          )}
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

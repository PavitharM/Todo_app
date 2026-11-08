import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Check,
  Sparkles,
  Layers,
  Timer,
  Leaf,
  ArrowRight,
  CheckCheck,
} from "lucide-react-native";
import {
  Screen,
  Row,
  Label,
  AppCard,
  AppButton,
  Chips,
  CustomInput,
  ProgressBar,
} from "../components/ui";
import { usePreferences, useThemeStore } from "../store";
import { useTheme } from "../theme";
const slides = [
  {
    eyebrow: "A LITTLE LESS NOISE",
    title: "Make room for\nwhat matters.",
    body: "Your tasks, thoughts, and daily rituals. Together in one thoughtfully simple space.",
  },
  {
    eyebrow: "YOUR DAY, IN HARMONY",
    title: "Big plans.\nSmall, steady steps.",
    body: "Bring your projects into focus, build habits that last, and give your ideas a home.",
  },
  {
    eyebrow: "FIND YOUR OWN RHYTHM",
    title: "What brings\nyou here?",
    body: "Choose an intention. There is no perfect pace, only the one that works for you.",
  },
  {
    eyebrow: "A SPACE THAT FEELS LIKE YOU",
    title: "Set the mood\nfor your day.",
    body: "Bright and open, or calm and quiet. You can change your theme anytime.",
  },
  {
    eyebrow: "YOUR NEXT CHAPTER",
    title: "A fresh start\nlooks good on you.",
    body: "Your demo space comes with a few ideas to explore. Make it yours, one small step at a time.",
  },
];
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const prefs = usePreferences();
  const theme = useThemeStore();
  const t = useTheme();
  const [name, setName] = useState(prefs.name);
  function enter() {
    prefs.set({ onboarded: true, name: name.trim() || "Alex Morgan" });
    router.replace("/(tabs)");
  }
  const slide = slides[step];
  return (
    <Screen style={{ maxWidth: 560, gap: 28 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Row>
          <View
            style={{ padding: 8, borderRadius: 11, backgroundColor: t.primary }}
          >
            <CheckCheck size={20} color="#fff" />
          </View>
          <Label bold size={18}>
            super todo.
          </Label>
        </Row>
        <Label muted size={12}>
          {step + 1} / 5
        </Label>
      </Row>
      <View
        style={{
          height: 240,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <View
          style={{
            position: "absolute",
            width: 215,
            height: 215,
            borderRadius: 110,
            backgroundColor: t.primary + "12",
          }}
        />
        <View style={{ width: 220, transform: [{ rotate: "-6deg" }] }}>
          <AppCard
            style={{
              shadowColor: t.primary,
              shadowOpacity: 0.1,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
            }}
          >
            <Row>
              <View
                style={{
                  padding: 8,
                  borderRadius: 10,
                  backgroundColor: t.primary + "15",
                }}
              >
                <Sparkles size={19} color={t.primary} />
              </View>
              <Label bold>Your kind of day</Label>
            </Row>
            {["A clear mind", "A little progress", "Time for yourself"].map(
              (text, i) => (
                <Row key={text}>
                  <View
                    style={{
                      width: 21,
                      height: 21,
                      borderRadius: 7,
                      backgroundColor: i < 2 ? t.primary : t.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i < 2 && <Check size={14} color="#fff" />}
                  </View>
                  <Label size={12} muted>
                    {text}
                  </Label>
                </Row>
              ),
            )}
            <ProgressBar value={67} />
          </AppCard>
        </View>
        <View
          style={{
            position: "absolute",
            right: 25,
            bottom: 15,
            backgroundColor: t.success,
            padding: 16,
            borderRadius: 20,
            transform: [{ rotate: "12deg" }],
          }}
        >
          <Leaf size={28} color="#fff" />
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <Label size={11} color={t.primary} bold>
          {slide.eyebrow}
        </Label>
        <Label bold size={37} style={{ lineHeight: 44 }}>
          {slide.title}
        </Label>
        <Label muted size={16}>
          {slide.body}
        </Label>
      </View>
      {step === 1 && (
        <Row style={{ flexWrap: "wrap" }}>
          {[
            { icon: Layers, title: "Plan with clarity" },
            { icon: Timer, title: "Focus deeply" },
            { icon: Leaf, title: "Grow daily" },
          ].map((x) => (
            <Row key={x.title}>
              <x.icon size={17} color={t.primary} />
              <Label size={12}>{x.title}</Label>
            </Row>
          ))}
        </Row>
      )}
      {step === 2 && (
        <>
          <CustomInput
            label="WHAT SHOULD WE CALL YOU?"
            value={name}
            onChangeText={setName}
          />
          <Chips
            items={[
              "Make time for what matters",
              "Build better habits",
              "Focus on meaningful work",
              "Find a calmer routine",
            ]}
            value={prefs.intention}
            onChange={(intention) => prefs.set({ intention })}
          />
        </>
      )}
      {step === 3 && (
        <Chips
          items={["light", "dark", "system"]}
          value={theme.mode}
          onChange={(mode) => theme.set({ mode: mode as any })}
        />
      )}
      <Row style={{ gap: 6 }}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={{
              height: 5,
              width: i === step ? 26 : 7,
              borderRadius: 5,
              backgroundColor: i === step ? t.primary : t.border,
            }}
          />
        ))}
      </Row>
      <AppButton
        title={
          step === 4
            ? "Get started"
            : step === 0
              ? "Find your flow"
              : "Continue"
        }
        icon={ArrowRight}
        onPress={() => (step === 4 ? enter() : setStep(step + 1))}
      />
      {step > 0 ? (
        <AppButton
          title="Back"
          variant="ghost"
          onPress={() => setStep(step - 1)}
        />
      ) : (
        <AppButton title="Explore the demo" variant="ghost" onPress={enter} />
      )}
      <Label size={11} muted style={{ textAlign: "center" }}>
        No account needed. Your data stays on your device.
      </Label>
    </Screen>
  );
}

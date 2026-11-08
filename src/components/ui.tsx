import React, { PropsWithChildren, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  AccessibilityInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  Check,
  LucideIcon,
  Sparkles,
} from "lucide-react-native";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  FadeIn,
  useReducedMotion,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "../theme";
import {
  useFeedback,
  useTasks,
  useProjects,
  useHabits,
  useNotes,
  useFocus,
} from "../store";
import { Priority } from "../types";
export function Label({
  children,
  size = 14,
  bold = false,
  muted = false,
  color,
  style,
}: PropsWithChildren<{
  size?: number;
  bold?: boolean;
  muted?: boolean;
  color?: string;
  style?: any;
}>) {
  const t = useTheme();
  return (
    <Text
      style={[
        {
          fontSize: size,
          fontWeight: bold ? "700" : "400",
          color: color || (muted ? t.muted : t.text),
          lineHeight: size * 1.45,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Row({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View className="flex-row items-center" style={[{ gap: 12 }, style]}>
      {children}
    </View>
  );
}
export function AppCard({
  children,
  style,
  onPress,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; onPress?: () => void }>) {
  const t = useTheme();
  const content = (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: 22,
          padding: 20,
          borderWidth: 1,
          borderColor: t.border,
          gap: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      {content}
    </Pressable>
  ) : (
    content
  );
}
export function AppButton({
  title,
  onPress,
  variant = "primary",
  icon: Icon,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: LucideIcon;
  disabled?: boolean;
}) {
  const t = useTheme();
  const color =
    variant === "primary"
      ? "#fff"
      : variant === "danger"
        ? t.danger
        : t.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        backgroundColor:
          variant === "primary"
            ? t.primary
            : variant === "ghost"
              ? "transparent"
              : variant === "danger"
                ? t.danger + "15"
                : t.primary + "14",
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
      })}
    >
      {Icon && <Icon size={18} color={color} />}
      <Label bold color={color}>
        {title}
      </Label>
    </Pressable>
  );
}
export function IconButton({
  icon: Icon,
  onPress,
  label,
  color,
}: {
  icon: LucideIcon;
  onPress: () => void;
  label: string;
  color?: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        height: 44,
        width: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed ? t.elevated : t.surface,
        borderWidth: 1,
        borderColor: t.border,
      })}
    >
      <Icon size={20} color={color || t.text} />
    </Pressable>
  );
}
export function CategoryChip({
  label,
  selected = false,
  onPress,
  color,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  const t = useTheme();
  const c = color || t.primary;
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={{ selected }}
      aria-selected={selected}
      onPress={onPress}
      style={{
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: selected ? c : t.surface,
        borderWidth: 1,
        borderColor: selected ? c : t.border,
      }}
    >
      <Label size={12} bold color={selected ? "#fff" : t.muted}>
        {label}
      </Label>
    </Pressable>
  );
}
export function Chips({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {items.map((item) => (
        <CategoryChip
          key={item}
          label={item}
          selected={value === item}
          onPress={() => onChange(item)}
        />
      ))}
    </ScrollView>
  );
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  const t = useTheme();
  const color = {
    low: t.success,
    medium: t.warning,
    high: t.primary,
    urgent: t.danger,
  }[priority];
  return (
    <View
      style={{
        backgroundColor: color + "13",
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
      }}
    >
      <Label size={10} bold color={color}>
        {priority.toUpperCase()}
      </Label>
    </View>
  );
}
export function ProgressBar({
  value,
  color,
}: {
  value: number;
  color?: string;
}) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const progress = useSharedValue(value);
  useEffect(() => {
    progress.value = withTiming(Math.min(100, Math.max(0, value)), {
      duration: reduced ? 0 : 300,
    });
  }, [value, reduced, progress]);
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%` as `${number}%`,
  }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      style={{
        height: 6,
        backgroundColor: t.border,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            height: 6,
            backgroundColor: color || t.primary,
            borderRadius: 8,
          },
        ]}
      />
    </View>
  );
}
export function CircularProgress({
  value,
  size = 112,
  color,
  children,
}: PropsWithChildren<{ value: number; size?: number; color?: string }>) {
  const t = useTheme();
  const r = (size - 12) / 2,
    c = 2 * Math.PI * r;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={t.border}
          strokeWidth={7}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color || t.primary}
          strokeWidth={7}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - Math.min(100, Math.max(0, value)) / 100)}
          strokeLinecap="round"
        />
      </Svg>
      {children}
    </View>
  );
}
export function CustomInput({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 7 }}>
      {label && (
        <Label size={12} bold muted>
          {label}
        </Label>
      )}
      <TextInput
        accessibilityLabel={label || props.placeholder}
        placeholderTextColor={t.muted}
        {...props}
        style={[
          {
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: error ? t.danger : t.border,
            borderRadius: 13,
            padding: 14,
            color: t.text,
            fontSize: 15,
            minHeight: 48,
            textAlignVertical: props.multiline ? "top" : "center",
          },
          props.multiline && { minHeight: 110 },
          props.style,
        ]}
      />
      {error && (
        <Label color={t.danger} size={12}>
          {error}
        </Label>
      )}
    </View>
  );
}
export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search your space…",
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  const t = useTheme();
  return (
    <Row
      style={{
        backgroundColor: t.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: t.border,
        paddingHorizontal: 14,
      }}
    >
      <Search size={19} color={t.muted} />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.muted}
        style={{ flex: 1, height: 50, color: t.text, fontSize: 14 }}
      />
      {value && (
        <Pressable
          accessibilityLabel="Clear search"
          onPress={() => onChangeText("")}
        >
          <X size={18} color={t.muted} />
        </Pressable>
      )}
    </Row>
  );
}
export function EmptyState({
  title = "A little breathing room",
  description = "Nothing here yet. Start with one small thing.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ alignItems: "center", padding: 30, gap: 12 }}>
      <View
        style={{
          padding: 18,
          borderRadius: 24,
          backgroundColor: t.primary + "12",
        }}
      >
        <Sparkles size={30} color={t.primary} />
      </View>
      <Label bold size={17}>
        {title}
      </Label>
      <Label muted style={{ textAlign: "center", maxWidth: 300 }}>
        {description}
      </Label>
      {action}
    </View>
  );
}
export function LoadingState() {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.background,
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
      }}
    >
      <ActivityIndicator color={t.primary} />
      <Label muted>Getting your space ready…</Label>
    </View>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <AppCard>
      <Label color="#EF5B65">{message}</Label>
      {retry && <AppButton title="Try again" onPress={retry} />}
    </AppCard>
  );
}
export function ScreenHeader({
  title,
  subtitle,
  back = false,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <Row style={{ justifyContent: "space-between", marginBottom: 4 }}>
      <Row style={{ flex: 1 }}>
        {back && (
          <IconButton
            icon={ArrowLeft}
            label="Go back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(tabs)")
            }
          />
        )}
        <View style={{ flex: 1, gap: 3 }}>
          <Label size={28} bold>
            {title}
          </Label>
          {subtitle && (
            <Label size={13} muted>
              {subtitle}
            </Label>
          )}
        </View>
      </Row>
      {right}
    </Row>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  return (
    <Row style={{ justifyContent: "space-between", marginTop: 8 }}>
      <Label size={18} bold>
        {title}
      </Label>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={{ paddingVertical: 10 }}
        >
          <Label color={t.primary} size={12} bold>
            {action} →
          </Label>
        </Pressable>
      )}
    </Row>
  );
}
export function Screen({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const t = useTheme();
  const reduced = useReducedMotion();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: t.background }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 22,
          paddingBottom: 110,
          alignItems: "center",
        }}
      >
        <Animated.View
          entering={reduced ? undefined : FadeIn.duration(220)}
          style={[{ width: "100%", maxWidth: 1040, gap: 20 }, style]}
        >
          <StoreErrors />
          {children}
        </Animated.View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}
export function CustomModal({
  visible,
  onClose,
  title,
  children,
}: PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title: string;
}>) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: width > 650 ? "center" : "flex-end",
          alignItems: "center",
          backgroundColor: "#10102088",
        }}
      >
        <Pressable
          accessibilityLabel="Close dialog"
          onPress={onClose}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          accessibilityViewIsModal
          style={{
            width: "100%",
            maxWidth: 560,
            maxHeight: "92%",
            backgroundColor: t.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderRadius: width > 650 ? 28 : undefined,
            padding: 24,
            gap: 18,
          }}
        >
          <Row style={{ justifyContent: "space-between" }}>
            <Label bold size={23}>
              {title}
            </Label>
            <IconButton icon={X} onPress={onClose} label="Close" />
          </Row>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 16, paddingBottom: 28 }}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export const BottomSheet = CustomModal;
export function ConfirmationDialog({
  visible,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <CustomModal visible={visible} title={title} onClose={onCancel}>
      <Label muted>{description}</Label>
      <AppButton
        title="Delete permanently"
        variant="danger"
        onPress={onConfirm}
      />
      <AppButton title="Keep it" variant="secondary" onPress={onCancel} />
    </CustomModal>
  );
}
export function FloatingActionButton({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create task"
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute",
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: t.primary,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: pressed ? 0.94 : 1 }],
        shadowColor: t.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
      })}
    >
      <Plus size={27} color="#fff" />
    </Pressable>
  );
}
export function CheckBox({
  checked,
  onPress,
  label,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      aria-checked={checked}
      onPress={onPress}
      hitSlop={10}
      style={{
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: checked ? t.primary : t.border,
        backgroundColor: checked ? t.primary : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked && (
        <Animated.View entering={FadeIn.duration(160)}>
          <Check size={16} color="#fff" />
        </Animated.View>
      )}
    </Pressable>
  );
}
export function Toast() {
  const { message, show } = useFeedback();
  const t = useTheme();
  useEffect(() => {
    if (!message) return;
    AccessibilityInfo.announceForAccessibility(message);
    const timeout = setTimeout(() => show(""), 3500);
    return () => clearTimeout(timeout);
  }, [message, show]);
  return message ? (
    <View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={{
        position: "absolute",
        bottom: 24,
        left: 24,
        right: 24,
        alignItems: "center",
      }}
    >
      <View style={{ backgroundColor: t.text, padding: 14, borderRadius: 14 }}>
        <Label color={t.background} size={13}>
          {message}
        </Label>
      </View>
    </View>
  ) : null;
}

function StoreErrors() {
  const errors = [
    useTasks((s) => s.error),
    useProjects((s) => s.error),
    useHabits((s) => s.error),
    useNotes((s) => s.error),
    useFocus((s) => s.error),
  ];
  const retries = [
    useTasks.getState().load,
    useProjects.getState().load,
    useHabits.getState().load,
    useNotes.getState().load,
    useFocus.getState().load,
  ];
  return (
    <>
      {errors.map((error, i) =>
        error ? (
          <ErrorState key={i} message={error} retry={retries[i]} />
        ) : null,
      )}
    </>
  );
}

export function ColorPicker({
  value,
  onChange,
  colors,
}: {
  value: string;
  onChange: (color: string) => void;
  colors: string[];
}) {
  return (
    <Row style={{ flexWrap: "wrap" }}>
      {colors.map((color) => (
        <Pressable
          key={color}
          accessibilityRole="button"
          accessibilityLabel={`Choose color ${color}`}
          aria-selected={value === color}
          onPress={() => onChange(color)}
          style={{
            height: 40,
            width: 40,
            borderRadius: 14,
            backgroundColor: color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {color === value && <Check size={20} color="#fff" />}
        </Pressable>
      ))}
    </Row>
  );
}

import { useColorScheme } from "react-native";
import { useThemeStore } from "../store";
export const palette = {
  primary: "#7165E8",
  secondary: "#A89DF7",
  success: "#36B37E",
  warning: "#F5A623",
  danger: "#EF5B65",
};
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export function useTheme() {
  const system = useColorScheme();
  const { mode, accent } = useThemeStore();
  const dark = mode === "dark" || (mode === "system" && system === "dark");
  return {
    ...palette,
    primary: dark && accent === "#7165E8" ? "#9488FF" : accent,
    dark,
    background: dark ? "#12121A" : "#F8F8FC",
    surface: dark ? "#1D1D29" : "#FFFFFF",
    elevated: dark ? "#252536" : "#F1EFFC",
    text: dark ? "#F5F5FA" : "#202033",
    muted: dark ? "#A1A1B5" : "#85859A",
    border: dark ? "#303043" : "#EBEAF2",
  };
}

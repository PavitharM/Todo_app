import React from "react";
import { View, Text, Pressable } from "react-native";
export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <View
          style={{
            flex: 1,
            padding: 32,
            justifyContent: "center",
            gap: 18,
            backgroundColor: "#F8F8FC",
          }}
        >
          <Text style={{ fontSize: 23, fontWeight: "700", color: "#202033" }}>
            Let’s take a breath.
          </Text>
          <Text style={{ color: "#85859A" }}>
            This screen could not be displayed. Your saved data is still on this
            device.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => this.setState({ error: null })}
            style={{
              backgroundColor: "#7165E8",
              padding: 16,
              borderRadius: 14,
            }}
          >
            <Text
              style={{ color: "white", textAlign: "center", fontWeight: "700" }}
            >
              Try again
            </Text>
          </Pressable>
        </View>
      );
    return this.props.children;
  }
}

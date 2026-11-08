import { router } from "expo-router";
import { Screen, EmptyState, AppButton } from "../src/components/ui";
export default function NotFound() {
  return (
    <Screen>
      <EmptyState
        title="A little off the path"
        description="This page isn’t in your space."
        action={
          <AppButton
            title="Back home"
            onPress={() => router.replace("/(tabs)")}
          />
        }
      />
    </Screen>
  );
}

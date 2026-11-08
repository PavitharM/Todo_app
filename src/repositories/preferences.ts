import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserPreferencesRepository } from "./interfaces";
export const preferencesRepository: UserPreferencesRepository = {
  async remove() {
    await AsyncStorage.removeItem("super-todo:preferences");
  },
  async read() {
    const raw = await AsyncStorage.getItem("super-todo:preferences");
    return raw ? JSON.parse(raw).state : null;
  },
  async write(value) {
    await AsyncStorage.setItem(
      "super-todo:preferences",
      JSON.stringify({ state: value, version: 0 }),
    );
  },
};

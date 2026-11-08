// Web preview adapter. Native iOS/Android use SQLite; this avoids WASM isolation requirements.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entity } from "../types";
import { Repository } from "./interfaces";
const queues = new Map<string, Promise<unknown>>();
export function localRepository<T extends Entity>(
  collection: string,
): Repository<T> {
  const key = `super-todo:records:${collection}`;
  const list = async (): Promise<T[]> =>
    JSON.parse((await AsyncStorage.getItem(key)) || "[]");
  const write = (fn: (rows: T[]) => T[]) => {
    const next = (queues.get(key) || Promise.resolve())
      .catch(() => {})
      .then(async () => {
        await AsyncStorage.setItem(key, JSON.stringify(fn(await list())));
      });
    queues.set(key, next);
    return next;
  };
  return {
    list,
    put: (entity) =>
      write((rows) => [...rows.filter((r) => r.id !== entity.id), entity]),
    remove: (id) => write((rows) => rows.filter((r) => r.id !== id)),
    replace: (entities) => write(() => entities),
  };
}

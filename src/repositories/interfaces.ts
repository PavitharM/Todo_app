import {
  Entity,
  Task,
  Project,
  Habit,
  Note,
  FocusSession,
  Preferences,
} from "../types";
export interface Repository<T extends Entity> {
  list(): Promise<T[]>;
  put(entity: T): Promise<void>;
  remove(id: string): Promise<void>;
  replace(entities: T[]): Promise<void>;
}
export type TaskRepository = Repository<Task>;
export type ProjectRepository = Repository<Project>;
export type HabitRepository = Repository<Habit>;
export type NoteRepository = Repository<Note>;
export type FocusRepository = Repository<FocusSession>;
export interface UserPreferencesRepository {
  read(): Promise<Preferences | null>;
  write(value: Preferences): Promise<void>;
  remove(): Promise<void>;
}

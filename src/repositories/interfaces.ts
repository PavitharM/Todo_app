import { Entity, Task, Project, Habit, Note, FocusSession, Preferences } from '../types';
export interface Repository<T extends Entity> { list(): Promise<T[]>; put(entity:T):Promise<void>; remove(id:string):Promise<void>; replace(entities:T[]):Promise<void> }
export interface TaskRepository extends Repository<Task> {}
export interface ProjectRepository extends Repository<Project> {}
export interface HabitRepository extends Repository<Habit> {}
export interface NoteRepository extends Repository<Note> {}
export interface FocusRepository extends Repository<FocusSession> {}
export interface UserPreferencesRepository { read():Promise<Preferences|null>; write(value:Preferences):Promise<void> }

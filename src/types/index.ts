export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'progress' | 'done';
export interface Entity { id: string; createdAt: string; updatedAt: string }
export interface ChecklistItem { id: string; title: string; done: boolean }
export interface Task extends Entity {
 title: string; description: string; dueDate: string; dueTime: string; priority: Priority;
 category: string; tags: string[]; projectId: string; subtasks: ChecklistItem[]; checklist: ChecklistItem[];
 reminder: string; recurrence: 'none' | 'daily' | 'weekly' | 'monthly'; attachments: string[];
 status: TaskStatus; archived: boolean; order: number; completedAt?: string;
}
export interface Project extends Entity { title: string; description: string; icon: string; color: string; startDate: string; deadline: string; status: 'active' | 'completed' }
export interface Habit extends Entity { title: string; description: string; color: string; schedule: number[]; reminder: string; completions: string[] }
export interface Note extends Entity { title: string; body: string; category: string; pinned: boolean }
export interface FocusSession extends Entity { taskId: string; duration: number; endedAt: string; kind: 'focus' | 'short' | 'long' }
export interface Preferences { name: string; email: string; intention: string; onboarded: boolean; notifications: boolean; weekStart: 0 | 1; defaultPriority: Priority; recentSearches: string[] }
export interface ThemePreferences { mode: 'light' | 'dark' | 'system'; accent: string }
export interface TimerState { kind: FocusSession['kind']; taskId: string; duration: number; remaining: number; endsAt: number | null; running: boolean; sessionId: string; focusMinutes: number; shortMinutes: number; longMinutes: number }

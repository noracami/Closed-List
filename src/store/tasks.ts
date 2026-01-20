import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// --- Data Types ---
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isUrgent: boolean;
  createdAt: number; // Timestamp
}

export interface DailyList {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  tomorrowInbox: Task[];
}

// --- Store Definitions ---
// We use persistentAtom to automatically save and restore the state from localStorage.
// The key (e.g., 'currentTasks') is used for localStorage.
export const currentDayTasks = persistentAtom<Task[]>('currentTasks', []);
export const tomorrowInbox = persistentAtom<Task[]>('tomorrowInbox', []);
export const pastDailyLists = persistentAtom<DailyList[]>('pastLists', []);

// --- Action Functions ---
// These functions contain the logic for modifying our stores.

/**
 * Adds a new task to the current day's list.
 * @param text The content of the task.
 */
export function addTask(text: string) {
  if (!text.trim()) return;
  const newTask: Task = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    isUrgent: false,
    createdAt: Date.now(),
  };
  currentDayTasks.set([...currentDayTasks.get(), newTask]);
}

/**
 * Toggles the completion status of a task in the current day's list.
 * @param taskId The ID of the task to toggle.
 */
export function toggleTask(taskId: string) {
  const tasks = currentDayTasks.get();
  currentDayTasks.set(
    tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
  );
}

import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// --- Data Types ---
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isUrgent: boolean;
  createdAt: number; // Timestamp
  // Add a date for when the task was originally part of a list
  listDate?: string; // YYYY-MM-DD
}

export interface DailyList {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  tomorrowInbox: Task[];
}

// --- Helper Functions ---
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * A robust JSON decoder for persistentAtom.
 * It handles empty strings and invalid JSON by returning the initial value.
 */
function createDecoder<T>(initialValue: T) {
  return (value: string | null): T => {
    if (value === null || value === undefined || value === '') {
      return initialValue;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error("Failed to parse from localStorage, returning initial value:", e);
      return initialValue;
    }
  };
}


// --- Store Definitions ---
// We use persistentAtom to automatically save and restore the state from localStorage,
// with a robust custom decoder to handle corrupted data.
export const currentDayTasks = persistentAtom<Task[]>(
  'currentTasks',
  [],
  {
    encode: JSON.stringify,
    decode: createDecoder([]),
  }
);
export const tomorrowInbox = persistentAtom<Task[]>(
  'tomorrowInbox',
  [],
  {
    encode: JSON.stringify,
    decode: createDecoder([]),
  }
);
export const pastDailyLists = persistentAtom<DailyList[]>(
  'pastLists',
  [],
  {
    encode: JSON.stringify,
    decode: createDecoder([]),
  }
);
export const currentDate = persistentAtom<string>(
  'currentDate',
  getTodayDateString(),
  {
    encode: JSON.stringify,
    decode: createDecoder(getTodayDateString()),
  }
);

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
    listDate: currentDate.get(),
  };
  currentDayTasks.set([...currentDayTasks.get(), newTask]);
}

/**
 * Adds a new task to the tomorrow's inbox.
 * @param text The content of the task.
 */
export function addTaskToInbox(text: string) {
  if (!text.trim()) return;
  const newTask: Task = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    isUrgent: false,
    createdAt: Date.now(),
    listDate: currentDate.get(), // Initially added on this date
  };
  tomorrowInbox.set([...tomorrowInbox.get(), newTask]);
}

/**
 * Adds a new urgent task to the current day's list.
 * @param text The content of the task.
 */
export function addUrgentTask(text: string) {
  if (!text.trim()) return;
  const newTask: Task = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    isUrgent: true, // Mark as urgent
    createdAt: Date.now(),
    listDate: currentDate.get(),
  };
  // Add urgent tasks to the top for visibility
  currentDayTasks.set([newTask, ...currentDayTasks.get()]);
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

/**
 * Processes the end of the current day.
 * - Archives current day's tasks and tomorrow's inbox to pastDailyLists.
 * - Rolls over unfinished tasks and tasks from tomorrow's inbox to the next day.
 * - Advances the current date.
 */
export function endOfDay() {
  const todayDate = currentDate.get();
  
  // Defensive checks to prevent crashes from corrupted localStorage
  const tasksForTodayValue = currentDayTasks.get();
  const tasksForToday = Array.isArray(tasksForTodayValue) ? tasksForTodayValue : [];

  const inboxForTodayValue = tomorrowInbox.get();
  const inboxForToday = Array.isArray(inboxForTodayValue) ? inboxForTodayValue : [];

  const pastLists = pastDailyLists.get();


  // Archive current day's tasks and inbox
  pastDailyLists.set([
    {
      date: todayDate,
      tasks: tasksForToday,
      tomorrowInbox: inboxForToday,
    },
    ...pastLists, // Add to the beginning of the history
  ]);

  // Determine tasks for the *next* day
  const nextDayTasks: Task[] = [];

  // 1. Roll over unfinished tasks from today
  const unfinishedTasks = tasksForToday.filter(task => !task.completed);
  nextDayTasks.push(...unfinishedTasks);

  // 2. Add tasks from tomorrow's inbox
  nextDayTasks.push(...inboxForToday);

  // Clear current tasks and inbox, and set for the next day
  currentDayTasks.set(nextDayTasks);
  tomorrowInbox.set([]);

  // Advance to the next day (for display purposes primarily)
  // This simulation is simplified; a real app might re-evaluate date on load.
  const nextDay = new Date(todayDate);
  nextDay.setDate(nextDay.getDate() + 1);
  currentDate.set(nextDay.toISOString().split('T')[0]);
}

/**
 * Reverts the state to the most recent entry in the history.
 * This effectively "undos" the last "End Day" action.
 */
export function revertToPreviousDay() {
  const pastLists = pastDailyLists.get();
  
  if (pastLists.length === 0) {
    console.warn("No history to revert to.");
    return;
  }

  // Defensive check for the array itself
  const validPastLists = Array.isArray(pastLists) ? pastLists : [];
  if (validPastLists.length === 0) return;
  
  const latestHistory = validPastLists[0];

  // Restore the state from the latest history item
  currentDate.set(latestHistory.date);
  currentDayTasks.set(latestHistory.tasks || []);
  tomorrowInbox.set(latestHistory.tomorrowInbox || []);

  // Remove the reverted item from the history
  pastDailyLists.set(validPastLists.slice(1));
}

// Function to reset all stores for testing purposes (optional)
export function resetAllStores() {
  currentDayTasks.set([]);
  tomorrowInbox.set([]);
  pastDailyLists.set([]);
  currentDate.set(getTodayDateString());
  console.log("All stores reset!");
}

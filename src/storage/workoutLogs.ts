const KEY = 'workout_logs';

export type SetLog = { weight: number; reps: number };

export type ExerciseLog = {
  exerciseId: number;
  exerciseName: string;
  sets: SetLog[];
};

export type DayLog = {
  date: string;
  dayIndex: number;
  focus: string;
  exercises: ExerciseLog[];
};

export type WorkoutLogs = Record<string, DayLog>;

export function loadLogs(): WorkoutLogs {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); }
  catch { return {}; }
}

export function saveLogs(logs: WorkoutLogs): void {
  localStorage.setItem(KEY, JSON.stringify(logs));
}

export function saveExerciseLog(
  date: string,
  dayIndex: number,
  focus: string,
  log: ExerciseLog,
): WorkoutLogs {
  const logs = loadLogs();
  const day: DayLog = logs[date] ?? { date, dayIndex, focus, exercises: [] };
  const idx = day.exercises.findIndex(e => e.exerciseId === log.exerciseId);
  const exercises = [...day.exercises];
  if (idx >= 0) exercises[idx] = log; else exercises.push(log);
  const updated = { ...logs, [date]: { ...day, exercises } };
  saveLogs(updated);
  return updated;
}

export function deleteExerciseLog(date: string, exerciseId: number): WorkoutLogs {
  const logs = loadLogs();
  if (!logs[date]) return logs;
  const exercises = logs[date].exercises.filter(e => e.exerciseId !== exerciseId);
  const updated = { ...logs, [date]: { ...logs[date], exercises } };
  saveLogs(updated);
  return updated;
}

// Helpers
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return toISODate(new Date());
}

// Mon=0 … Sun=6
export function dateToWeekIndex(date: string): number {
  const d = new Date(date + 'T12:00:00');
  return (d.getDay() + 6) % 7;
}

export function getWeekDates(anchorDate: string): string[] {
  const d = new Date(anchorDate + 'T12:00:00');
  const monday = new Date(d);
  monday.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return toISODate(day);
  });
}

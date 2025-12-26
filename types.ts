
export enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  dailyGoalHours: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface ScheduleItem {
  id: string;
  userId: string;
  subjectId: string;
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface StudyLog {
  id: string;
  userId: string;
  subjectId: string;
  date: string; // ISO Date
  durationMinutes: number;
  note?: string;
}

export interface AppState {
  user: User | null;
  subjects: Subject[];
  schedules: ScheduleItem[];
  logs: StudyLog[];
}

export type ViewType = 'DASHBOARD' | 'TIMETABLE' | 'ANALYTICS' | 'CHATBOT' | 'SETTINGS' | 'LOGIN';

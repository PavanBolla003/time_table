export enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}

export enum ActivityType {
  STUDY = 'Study',
  SLEEP = 'Sleep',
  MEAL = 'Meal',
  SOCIAL = 'Social',
  EXERCISE = 'Exercise',
  CLASS = 'Class',
  OTHER = 'Other'
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  // Goals & Preferences
  dailyGoalHours: number;
  sleepGoalHours: number;
  socialMediaLimitMinutes: number;
  theme?: 'light' | 'dark';
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface ScheduleItem {
  id: string;
  userId: string;
  subjectId?: string; // Optional, only for STUDY/CLASS type
  title: string;      // "Math Class" or "Lunch Break"
  type: ActivityType;
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  color?: string;    // Override default subject color or type color
}

// Unified Log for all activities (replacing simple StudyLog in concept, but keeping StudyLog specialized)
export interface ActivityLog {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;        // "Calculus Study" or "Sleep"
  startTime: string;    // ISO Date Time
  endTime: string;      // ISO Date Time
  durationMinutes: number;

  // Specific to Study
  subjectId?: string;
  topics?: string[];     // ["Derivatives", "Limits"]
  difficulty?: DifficultyLevel;
  productivityRating?: number; // 1-5
  note?: string;
}

export interface AppState {
  user: User | null;
  subjects: Subject[];
  schedules: ScheduleItem[];
  logs: ActivityLog[]; // Renamed from 'studyLogs' to generic 'logs' but now typed as ActivityLog
}

export type ViewType = 'DASHBOARD' | 'TIMETABLE' | 'DAILY_LOG' | 'ANALYTICS' | 'CHATBOT' | 'SETTINGS' | 'LOGIN';

// Types and interfaces for DayPlanner Pro

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedDuration: number; // in minutes
  completed: boolean;
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  color: string;
  createdAt: string;
  completedAt?: string;
  points: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'tasks' | 'time' | 'special';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
  color: string;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalFocusTime: number; // in minutes
  averageTaskDuration: number;
  productivityScore: number;
  lastActivityDate: string;
}

export interface DayTemplate {
  id: string;
  name: string;
  description: string;
  tasks: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt'>[];
  color: string;
}

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  taskId?: string;
  type: 'work' | 'break' | 'focus' | 'meeting' | 'personal';
  title: string;
  color: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  workingHours: {
    start: string;
    end: string;
  };
  breakReminders: boolean;
  notifications: boolean;
  focusMode: boolean;
  autoSuggestBreaks: boolean;
  defaultTaskDuration: number;
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
}

export interface DailyData {
  date: string; // YYYY-MM-DD format
  tasks: Task[];
  timeBlocks: TimeBlock[];
  focusTime: number;
  completed: boolean;
  mood?: 'great' | 'good' | 'okay' | 'bad';
  notes?: string;
}

// Priority levels with colors and weights
export const PRIORITY_CONFIG = {
  low: { color: '#10B981', weight: 1, label: 'Faible' },
  medium: { color: '#F59E0B', weight: 2, label: 'Moyenne' },
  high: { color: '#EF4444', weight: 3, label: 'Haute' }
} as const;

// Task categories with colors
export const CATEGORY_CONFIG = {
  work: { color: '#3B82F6', label: 'Travail' },
  personal: { color: '#8B5CF6', label: 'Personnel' },
  health: { color: '#10B981', label: 'Santé' },
  learning: { color: '#F59E0B', label: 'Apprentissage' },
  social: { color: '#EC4899', label: 'Social' },
  creative: { color: '#06B6D4', label: 'Créatif' },
  finance: { color: '#84CC16', label: 'Finance' },
  home: { color: '#F97316', label: 'Maison' }
} as const;

export type TaskCategory = keyof typeof CATEGORY_CONFIG;
export type TaskPriority = keyof typeof PRIORITY_CONFIG;
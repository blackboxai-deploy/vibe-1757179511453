'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, Achievement, UserStats, AppSettings, DailyData, TimeBlock } from '@/types';

// Initial achievements
const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-task',
    title: 'Premier Pas',
    description: 'Complétez votre première tâche',
    type: 'tasks',
    requirement: 1,
    unlocked: false,
    icon: '🎯',
    color: '#3B82F6'
  },
  {
    id: 'streak-3',
    title: 'Momentum',
    description: 'Maintenez une série de 3 jours',
    type: 'streak',
    requirement: 3,
    unlocked: false,
    icon: '🔥',
    color: '#EF4444'
  },
  {
    id: 'tasks-10',
    title: 'Productif',
    description: 'Complétez 10 tâches au total',
    type: 'tasks',
    requirement: 10,
    unlocked: false,
    icon: '⚡',
    color: '#F59E0B'
  },
  {
    id: 'focus-60',
    title: 'Concentration',
    description: 'Accumulez 1 heure de temps focus',
    type: 'time',
    requirement: 60,
    unlocked: false,
    icon: '🧠',
    color: '#8B5CF6'
  },
  {
    id: 'early-bird',
    title: 'Lève-tôt',
    description: 'Complétez une tâche avant 9h',
    type: 'special',
    requirement: 1,
    unlocked: false,
    icon: '🌅',
    color: '#10B981'
  },
  {
    id: 'night-owl',
    title: 'Oiseau de nuit',
    description: 'Complétez une tâche après 22h',
    type: 'special',
    requirement: 1,
    unlocked: false,
    icon: '🌙',
    color: '#6366F1'
  }
];

// Initial settings
const INITIAL_SETTINGS: AppSettings = {
  theme: 'system',
  workingHours: {
    start: '09:00',
    end: '18:00'
  },
  breakReminders: true,
  notifications: true,
  focusMode: false,
  autoSuggestBreaks: true,
  defaultTaskDuration: 30,
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15
};

// Initial user stats
const INITIAL_STATS: UserStats = {
  totalTasks: 0,
  completedTasks: 0,
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalFocusTime: 0,
  averageTaskDuration: 30,
  productivityScore: 0,
  lastActivityDate: new Date().toISOString().split('T')[0]
};

interface AppState {
  tasks: Task[];
  achievements: Achievement[];
  userStats: UserStats;
  settings: AppSettings;
  dailyData: { [date: string]: DailyData };
  currentDate: string;
  focusMode: boolean;
  selectedTask: Task | null;
}

type AppAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'UPDATE_ACHIEVEMENT'; payload: Achievement }
  | { type: 'UPDATE_STATS'; payload: Partial<UserStats> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_CURRENT_DATE'; payload: string }
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'SELECT_TASK'; payload: Task | null }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_TIME_BLOCK'; payload: { date: string; timeBlock: TimeBlock } }
  | { type: 'UPDATE_TIME_BLOCK'; payload: { date: string; timeBlock: TimeBlock } }
  | { type: 'DELETE_TIME_BLOCK'; payload: { date: string; timeBlockId: string } };

const initialState: AppState = {
  tasks: [],
  achievements: INITIAL_ACHIEVEMENTS,
  userStats: INITIAL_STATS,
  settings: INITIAL_SETTINGS,
  dailyData: {},
  currentDate: new Date().toISOString().split('T')[0],
  focusMode: false,
  selectedTask: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };

    case 'COMPLETE_TASK':
      const taskToComplete = state.tasks.find(task => task.id === action.payload);
      if (!taskToComplete) return state;

      const updatedTask = {
        ...taskToComplete,
        completed: true,
        completedAt: new Date().toISOString()
      };

      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? updatedTask : task
        ),
        userStats: {
          ...state.userStats,
          completedTasks: state.userStats.completedTasks + 1,
          totalPoints: state.userStats.totalPoints + updatedTask.points
        }
      };

    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload
      };

    case 'UPDATE_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map(achievement =>
          achievement.id === action.payload.id ? action.payload : achievement
        )
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        userStats: { ...state.userStats, ...action.payload }
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case 'SET_CURRENT_DATE':
      return {
        ...state,
        currentDate: action.payload
      };

    case 'TOGGLE_FOCUS_MODE':
      return {
        ...state,
        focusMode: !state.focusMode
      };

    case 'SELECT_TASK':
      return {
        ...state,
        selectedTask: action.payload
      };

    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload
      };

    case 'ADD_TIME_BLOCK':
      const { date, timeBlock } = action.payload;
      const existingData = state.dailyData[date] || {
        date,
        tasks: [],
        timeBlocks: [],
        focusTime: 0,
        completed: false
      };

      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [date]: {
            ...existingData,
            timeBlocks: [...existingData.timeBlocks, timeBlock]
          }
        }
      };

    case 'UPDATE_TIME_BLOCK':
      const updateDate = action.payload.date;
      const updateTimeBlock = action.payload.timeBlock;
      const updateData = state.dailyData[updateDate];

      if (!updateData) return state;

      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [updateDate]: {
            ...updateData,
            timeBlocks: updateData.timeBlocks.map(tb =>
              tb.id === updateTimeBlock.id ? updateTimeBlock : tb
            )
          }
        }
      };

    case 'DELETE_TIME_BLOCK':
      const deleteDate = action.payload.date;
      const deleteData = state.dailyData[deleteDate];

      if (!deleteData) return state;

      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [deleteDate]: {
            ...deleteData,
            timeBlocks: deleteData.timeBlocks.filter(tb => tb.id !== action.payload.timeBlockId)
          }
        }
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  saveData: () => void;
  loadData: () => void;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-save data when state changes
  useEffect(() => {
    const timer = setTimeout(saveData, 1000); // Debounce saves
    return () => clearTimeout(timer);
  }, [state]);

  const saveData = () => {
    try {
      const dataToSave = {
        tasks: state.tasks,
        achievements: state.achievements,
        userStats: state.userStats,
        settings: state.settings,
        dailyData: state.dailyData
      };
      localStorage.setItem('dayplanner-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const loadData = () => {
    try {
      const savedData = localStorage.getItem('dayplanner-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, saveData, loadData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
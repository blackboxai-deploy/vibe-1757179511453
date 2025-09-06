'use client';

import { useApp } from '@/contexts/AppContext';
import { Task, TaskCategory, TaskPriority, PRIORITY_CONFIG } from '@/types';
import { useCallback } from 'react';

export function useTasks() {
  const { state, dispatch } = useApp();

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'points'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      points: calculateTaskPoints(taskData.priority, taskData.estimatedDuration)
    };
    
    dispatch({ type: 'ADD_TASK', payload: newTask });
    return newTask;
  }, [dispatch]);

  const updateTask = useCallback((task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  }, [dispatch]);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, [dispatch]);

  const completeTask = useCallback((taskId: string) => {
    dispatch({ type: 'COMPLETE_TASK', payload: taskId });
    
    // Check for achievements after completing a task
    checkAchievements();
  }, [dispatch]);

  const toggleTaskCompletion = useCallback((taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.completed) {
      // If task is completed, mark as incomplete
      const updatedTask = {
        ...task,
        completed: false,
        completedAt: undefined
      };
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      
      // Update stats
      dispatch({
        type: 'UPDATE_STATS',
        payload: {
          completedTasks: Math.max(0, state.userStats.completedTasks - 1),
          totalPoints: Math.max(0, state.userStats.totalPoints - task.points)
        }
      });
    } else {
      completeTask(taskId);
    }
  }, [state.tasks, state.userStats, completeTask, dispatch]);

  const checkAchievements = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    state.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'tasks':
          shouldUnlock = state.userStats.completedTasks >= achievement.requirement;
          break;
        
        case 'streak':
          shouldUnlock = state.userStats.currentStreak >= achievement.requirement;
          break;
        
        case 'time':
          shouldUnlock = state.userStats.totalFocusTime >= achievement.requirement;
          break;
        
        case 'special':
          if (achievement.id === 'early-bird') {
            shouldUnlock = currentHour < 9;
          } else if (achievement.id === 'night-owl') {
            shouldUnlock = currentHour >= 22;
          }
          break;
      }

      if (shouldUnlock) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        dispatch({ type: 'UPDATE_ACHIEVEMENT', payload: unlockedAchievement });
      }
    });
  }, [state.achievements, state.userStats, dispatch]);

  const getTasksByCategory = useCallback((category: TaskCategory) => {
    return state.tasks.filter(task => task.category === category);
  }, [state.tasks]);

  const getTasksByPriority = useCallback((priority: TaskPriority) => {
    return state.tasks.filter(task => task.priority === priority);
  }, [state.tasks]);

  const getTodayTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.tasks.filter(task => task.createdAt.startsWith(today));
  }, [state.tasks]);

  const getCompletedTasks = useCallback(() => {
    return state.tasks.filter(task => task.completed);
  }, [state.tasks]);

  const getPendingTasks = useCallback(() => {
    return state.tasks.filter(task => !task.completed);
  }, [state.tasks]);

  const getTasksWithTimeBlocks = useCallback(() => {
    return state.tasks.filter(task => task.startTime && task.endTime);
  }, [state.tasks]);

  const calculateTaskPoints = (priority: TaskPriority, duration: number): number => {
    const basePoints = 10;
    const priorityMultiplier = PRIORITY_CONFIG[priority].weight;
    const durationBonus = Math.floor(duration / 15); // 1 point per 15 minutes
    
    return basePoints + (priorityMultiplier * 5) + durationBonus;
  };

  const getProductivityStats = useCallback(() => {
    const today = getTodayTasks();
    const completed = today.filter(task => task.completed);
    const totalDuration = today.reduce((sum, task) => sum + task.estimatedDuration, 0);
    const completedDuration = completed.reduce((sum, task) => sum + task.estimatedDuration, 0);
    
    return {
      totalTasks: today.length,
      completedTasks: completed.length,
      completionRate: today.length > 0 ? (completed.length / today.length) * 100 : 0,
      totalDuration,
      completedDuration,
      timeEfficiency: totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0,
      points: completed.reduce((sum, task) => sum + task.points, 0)
    };
  }, [getTodayTasks]);

  return {
    tasks: state.tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    toggleTaskCompletion,
    getTasksByCategory,
    getTasksByPriority,
    getTodayTasks,
    getCompletedTasks,
    getPendingTasks,
    getTasksWithTimeBlocks,
    getProductivityStats,
    calculateTaskPoints
  };
}
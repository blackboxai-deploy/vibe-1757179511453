'use client';

import { useApp } from '@/contexts/AppContext';
import { Achievement } from '@/types';
import { useCallback, useEffect } from 'react';

export function useAchievements() {
  const { state, dispatch } = useApp();

  const checkAndUnlockAchievements = useCallback(() => {
    const { userStats, achievements } = state;
    const now = new Date();
    const todayTasks = state.tasks.filter(task => 
      task.createdAt.startsWith(now.toISOString().split('T')[0])
    );

    achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'tasks':
          if (achievement.id === 'first-task') {
            shouldUnlock = userStats.completedTasks >= 1;
          } else if (achievement.id === 'tasks-10') {
            shouldUnlock = userStats.completedTasks >= 10;
          }
          break;

        case 'streak':
          if (achievement.id === 'streak-3') {
            shouldUnlock = userStats.currentStreak >= 3;
          }
          break;

        case 'time':
          if (achievement.id === 'focus-60') {
            shouldUnlock = userStats.totalFocusTime >= 60;
          }
          break;

        case 'special':
          if (achievement.id === 'early-bird') {
            // Check if any task was completed before 9 AM today
            const earlyTasks = todayTasks.filter(task => {
              if (!task.completedAt) return false;
              const completedHour = new Date(task.completedAt).getHours();
              return completedHour < 9;
            });
            shouldUnlock = earlyTasks.length > 0;
          } else if (achievement.id === 'night-owl') {
            // Check if any task was completed after 10 PM today
            const lateTasks = todayTasks.filter(task => {
              if (!task.completedAt) return false;
              const completedHour = new Date(task.completedAt).getHours();
              return completedHour >= 22;
            });
            shouldUnlock = lateTasks.length > 0;
          }
          break;
      }

      if (shouldUnlock) {
        const unlockedAchievement: Achievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        
        dispatch({ type: 'UPDATE_ACHIEVEMENT', payload: unlockedAchievement });
        
        // Show achievement notification (you can implement this later)
        showAchievementNotification(unlockedAchievement);
      }
    });
  }, [state, dispatch]);

  const showAchievementNotification = (achievement: Achievement) => {
    // This could trigger a toast notification or modal
    console.log(`🎉 Achievement unlocked: ${achievement.title}!`);
    
    // You could implement a more sophisticated notification system here
    // For now, we'll just log it and potentially use a toast library later
  };

  const getUnlockedAchievements = useCallback(() => {
    return state.achievements.filter(achievement => achievement.unlocked);
  }, [state.achievements]);

  const getLockedAchievements = useCallback(() => {
    return state.achievements.filter(achievement => !achievement.unlocked);
  }, [state.achievements]);

  const getAchievementProgress = useCallback((achievementId: string) => {
    const achievement = state.achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;

    const { userStats } = state;

    switch (achievement.type) {
      case 'tasks':
        return Math.min((userStats.completedTasks / achievement.requirement) * 100, 100);
      
      case 'streak':
        return Math.min((userStats.currentStreak / achievement.requirement) * 100, 100);
      
      case 'time':
        return Math.min((userStats.totalFocusTime / achievement.requirement) * 100, 100);
      
      case 'special':
        return achievement.unlocked ? 100 : 0;
      
      default:
        return 0;
    }
  }, [state.achievements, state.userStats]);

  const getTotalAchievementPoints = useCallback(() => {
    return getUnlockedAchievements().length * 50; // 50 points per achievement
  }, [getUnlockedAchievements]);

  const getAchievementsByType = useCallback((type: Achievement['type']) => {
    return state.achievements.filter(achievement => achievement.type === type);
  }, [state.achievements]);

  const calculateStreak = useCallback(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    let currentStreak = 0;
    let date = new Date(today);
    
    // Check backwards from today to find the current streak
    while (true) {
      const dateString = date.toISOString().split('T')[0];
      const dayTasks = state.tasks.filter(task => 
        task.createdAt.startsWith(dateString) && task.completed
      );
      
      if (dayTasks.length > 0) {
        currentStreak++;
        date.setDate(date.getDate() - 1);
      } else {
        // If today has no completed tasks, don't count it in the streak yet
        if (dateString === todayString) {
          date.setDate(date.getDate() - 1);
          continue;
        }
        break;
      }
      
      // Prevent infinite loop - max 365 days
      if (currentStreak >= 365) break;
    }
    
    return currentStreak;
  }, [state.tasks]);

  // Auto-check achievements when dependencies change
  useEffect(() => {
    checkAndUnlockAchievements();
  }, [state.userStats.completedTasks, state.userStats.currentStreak, state.userStats.totalFocusTime]);

  return {
    achievements: state.achievements,
    checkAndUnlockAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementProgress,
    getTotalAchievementPoints,
    getAchievementsByType,
    calculateStreak,
    showAchievementNotification
  };
}
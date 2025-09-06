'use client';

import { useApp } from '@/contexts/AppContext';
import { TimeBlock } from '@/types';
import { useCallback } from 'react';

export function useTimeBlocks() {
  const { state, dispatch } = useApp();

  const addTimeBlock = useCallback((date: string, timeBlockData: Omit<TimeBlock, 'id'>) => {
    const timeBlock: TimeBlock = {
      ...timeBlockData,
      id: `timeblock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    dispatch({ type: 'ADD_TIME_BLOCK', payload: { date, timeBlock } });
    return timeBlock;
  }, [dispatch]);

  const updateTimeBlock = useCallback((date: string, timeBlock: TimeBlock) => {
    dispatch({ type: 'UPDATE_TIME_BLOCK', payload: { date, timeBlock } });
  }, [dispatch]);

  const deleteTimeBlock = useCallback((date: string, timeBlockId: string) => {
    dispatch({ type: 'DELETE_TIME_BLOCK', payload: { date, timeBlockId } });
  }, [dispatch]);

  const getTimeBlocksForDate = useCallback((date: string) => {
    return state.dailyData[date]?.timeBlocks || [];
  }, [state.dailyData]);

  const getTodayTimeBlocks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return getTimeBlocksForDate(today);
  }, [getTimeBlocksForDate]);

  const isTimeSlotAvailable = useCallback((date: string, startTime: string, endTime: string, excludeId?: string) => {
    const timeBlocks = getTimeBlocksForDate(date);
    
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    return !timeBlocks.some(block => {
      if (excludeId && block.id === excludeId) return false;
      
      const blockStart = parseTime(block.startTime);
      const blockEnd = parseTime(block.endTime);
      
      // Check for overlap
      return (start < blockEnd && end > blockStart);
    });
  }, [getTimeBlocksForDate]);

  const getNextAvailableSlot = useCallback((date: string, duration: number) => {
    const timeBlocks = getTimeBlocksForDate(date).sort((a, b) => 
      parseTime(a.startTime) - parseTime(b.startTime)
    );
    
    let currentTime = parseTime('09:00'); // Start from 9 AM
    const endOfDay = parseTime('22:00'); // End at 10 PM
    
    for (const block of timeBlocks) {
      const blockStart = parseTime(block.startTime);
      const blockEnd = parseTime(block.endTime);
      
      // Check if there's enough space before this block
      if (blockStart - currentTime >= duration) {
        return {
          startTime: formatTime(currentTime),
          endTime: formatTime(currentTime + duration)
        };
      }
      
      currentTime = Math.max(currentTime, blockEnd);
    }
    
    // Check if there's space at the end of the day
    if (endOfDay - currentTime >= duration) {
      return {
        startTime: formatTime(currentTime),
        endTime: formatTime(currentTime + duration)
      };
    }
    
    return null;
  }, [getTimeBlocksForDate]);

  const assignTaskToTimeBlock = useCallback((date: string, taskId: string, startTime: string, endTime: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return null;
    
    if (!isTimeSlotAvailable(date, startTime, endTime)) {
      return null;
    }
    
    const timeBlock: TimeBlock = {
      id: `timeblock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime,
      endTime,
      taskId,
      type: 'work',
      title: task.title,
      color: task.color
    };
    
    dispatch({ type: 'ADD_TIME_BLOCK', payload: { date, timeBlock } });
    
    // Update the task with time information
    const updatedTask = {
      ...task,
      startTime,
      endTime
    };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    
    return timeBlock;
  }, [state.tasks, isTimeSlotAvailable, dispatch]);

  const suggestOptimalSchedule = useCallback((date: string, tasks: string[]) => {
    // Get tasks to schedule
    const tasksToSchedule = tasks.map(taskId => 
      state.tasks.find(t => t.id === taskId)
    ).filter(Boolean);
    
    if (tasksToSchedule.length === 0) return [];
    
    // Sort by priority and estimated duration
    const sortedTasks = tasksToSchedule.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b!.priority] - priorityOrder[a!.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, shorter tasks first
      return a!.estimatedDuration - b!.estimatedDuration;
    });
    
    const suggestions: { task: any, timeBlock: Omit<TimeBlock, 'id'> }[] = [];
    
    for (const task of sortedTasks) {
      const slot = getNextAvailableSlot(date, task!.estimatedDuration);
      
      if (slot) {
        suggestions.push({
          task,
          timeBlock: {
            startTime: slot.startTime,
            endTime: slot.endTime,
            taskId: task!.id,
            type: 'work',
            title: task!.title,
            color: task!.color
          }
        });
        
        // Temporarily add this block to avoid conflicts
        dispatch({
          type: 'ADD_TIME_BLOCK',
          payload: {
            date,
            timeBlock: {
              id: `temp-${Date.now()}`,
              ...suggestions[suggestions.length - 1].timeBlock
            } as TimeBlock
          }
        });
      }
    }
    
    return suggestions;
  }, [state.tasks, getNextAvailableSlot, dispatch]);

  const getTimeBlockStatistics = useCallback((date: string) => {
    const timeBlocks = getTimeBlocksForDate(date);
    
    const totalScheduled = timeBlocks.reduce((sum, block) => {
      const duration = parseTime(block.endTime) - parseTime(block.startTime);
      return sum + duration;
    }, 0);
    
    const workBlocks = timeBlocks.filter(block => block.type === 'work').length;
    const breakBlocks = timeBlocks.filter(block => block.type === 'break').length;
    const focusBlocks = timeBlocks.filter(block => block.type === 'focus').length;
    
    return {
      totalBlocks: timeBlocks.length,
      totalScheduledMinutes: totalScheduled,
      workBlocks,
      breakBlocks,
      focusBlocks,
      averageBlockDuration: timeBlocks.length > 0 ? totalScheduled / timeBlocks.length : 0
    };
  }, [getTimeBlocksForDate]);

  return {
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    getTimeBlocksForDate,
    getTodayTimeBlocks,
    isTimeSlotAvailable,
    getNextAvailableSlot,
    assignTaskToTimeBlock,
    suggestOptimalSchedule,
    getTimeBlockStatistics
  };
}

// Helper functions
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
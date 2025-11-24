// Progress tracking utilities for weekly study program

import { isAuthenticated, authenticatedFetch } from './auth';
import { API_ENDPOINTS } from '../config/api';

const STORAGE_KEY = 'bcw_weekly_progress';

// Sync progress to backend if authenticated
const syncToBackend = async (progress) => {
  if (!isAuthenticated()) {
    return false;
  }

  try {
    // Also get reflections, study answers, and practical applications
    const reflections = {};
    const studyAnswers = {};
    const practicalApplications = {};
    
    for (let i = 1; i <= 12; i++) {
      const weekReflections = localStorage.getItem(`week_${i}_reflections`);
      const weekStudy = localStorage.getItem(`week_${i}_study`);
      const weekPractical = localStorage.getItem(`week_${i}_practical`);
      if (weekReflections) {
        try {
          reflections[i] = JSON.parse(weekReflections);
        } catch (e) {
          console.warn(`Error parsing reflections for week ${i}:`, e);
        }
      }
      if (weekStudy) {
        try {
          studyAnswers[i] = JSON.parse(weekStudy);
        } catch (e) {
          console.warn(`Error parsing study answers for week ${i}:`, e);
        }
      }
      if (weekPractical) {
        practicalApplications[i] = weekPractical;
      }
    }

    const progressToSync = {
      ...progress,
      reflections,
      studyAnswers,
      practicalApplications
    };

    const response = await authenticatedFetch(API_ENDPOINTS.PROGRESS, {
      method: 'POST',
      body: JSON.stringify({ progress: progressToSync }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error syncing progress to backend:', error);
    return false;
  }
};

// Load progress from backend if authenticated
const loadFromBackend = async () => {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const response = await authenticatedFetch(API_ENDPOINTS.PROGRESS);
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.progress;
      } else {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 100));
      }
    } else {
      // If not ok, try to get error message
      try {
        const errorData = await response.json();
        console.error('Error loading progress:', errorData);
      } catch (e) {
        console.error('Error loading progress, status:', response.status);
      }
    }
  } catch (error) {
    console.error('Error loading progress from backend:', error);
  }
  return null;
};

export const getProgress = async () => {
  // Default progress structure
  const defaultProgress = {
    baselineCompleted: false,
    baselineFRIQ: null,
    completedWeeks: [],
    assessments: {},
    currentWeek: 0 // 0 means baseline not completed
  };

  // Try to load from backend first if authenticated
  if (isAuthenticated()) {
    const backendProgress = await loadFromBackend();
    if (backendProgress) {
      // Ensure all required fields exist with defaults
      const normalizedProgress = {
        ...defaultProgress,
        ...backendProgress,
        completedWeeks: Array.isArray(backendProgress.completedWeeks) 
          ? backendProgress.completedWeeks 
          : [],
        assessments: backendProgress.assessments && typeof backendProgress.assessments === 'object'
          ? backendProgress.assessments
          : {},
        reflections: backendProgress.reflections && typeof backendProgress.reflections === 'object'
          ? backendProgress.reflections
          : {},
        studyAnswers: backendProgress.studyAnswers && typeof backendProgress.studyAnswers === 'object'
          ? backendProgress.studyAnswers
          : {},
        practicalApplications: backendProgress.practicalApplications && typeof backendProgress.practicalApplications === 'object'
          ? backendProgress.practicalApplications
          : {}
      };
      
      // Also sync reflections, study answers, and practical applications to localStorage
      if (normalizedProgress.reflections) {
        Object.entries(normalizedProgress.reflections).forEach(([week, data]) => {
          localStorage.setItem(`week_${week}_reflections`, JSON.stringify(data));
        });
      }
      if (normalizedProgress.studyAnswers) {
        Object.entries(normalizedProgress.studyAnswers).forEach(([week, data]) => {
          localStorage.setItem(`week_${week}_study`, JSON.stringify(data));
        });
      }
      if (normalizedProgress.practicalApplications) {
        Object.entries(normalizedProgress.practicalApplications).forEach(([week, data]) => {
          localStorage.setItem(`week_${week}_practical`, data);
        });
      }
      // Save to localStorage as backup
      const { reflections, studyAnswers, practicalApplications, ...progressToStore } = normalizedProgress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressToStore));
      return normalizedProgress;
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all required fields exist
      return {
        ...defaultProgress,
        ...parsed,
        completedWeeks: Array.isArray(parsed.completedWeeks) 
          ? parsed.completedWeeks 
          : [],
        assessments: parsed.assessments && typeof parsed.assessments === 'object'
          ? parsed.assessments
          : {}
      };
    }
    return defaultProgress;
  } catch (error) {
    console.error('Error reading progress:', error);
    return defaultProgress;
  }
};

export const saveProgress = async (progress) => {
  try {
    // Save to localStorage first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    
    // Sync to backend if authenticated
    await syncToBackend(progress);
    
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
};

export const saveBaselineAssessment = async (results) => {
  const progress = await getProgress();
  progress.baselineCompleted = true;
  progress.baselineFRIQ = results.FRIQ;
  progress.assessments['baseline'] = {
    ...results,
    completedAt: new Date().toISOString()
  };
  // After baseline, current week becomes 1
  if (progress.currentWeek === 0) {
    progress.currentWeek = 1;
  }
  return await saveProgress(progress);
};

export const saveAssessmentResult = async (weekNumber, results) => {
  const progress = await getProgress();
  
  // Ensure completedWeeks is an array
  if (!Array.isArray(progress.completedWeeks)) {
    progress.completedWeeks = [];
  }
  
  // Ensure assessments is an object
  if (!progress.assessments || typeof progress.assessments !== 'object') {
    progress.assessments = {};
  }
  
  progress.assessments[weekNumber] = {
    ...results,
    completedAt: new Date().toISOString()
  };
  
  // Mark week as completed if not already
  if (!progress.completedWeeks.includes(weekNumber)) {
    progress.completedWeeks.push(weekNumber);
    progress.completedWeeks.sort((a, b) => a - b);
  }
  
  // Update current week to next uncompleted week
  const totalWeeks = 12; // Update this based on your total weeks
  for (let i = 1; i <= totalWeeks; i++) {
    if (!progress.completedWeeks.includes(i)) {
      progress.currentWeek = i;
      break;
    }
  }
  
  return await saveProgress(progress);
};

export const getAssessmentResult = async (weekNumber) => {
  const progress = await getProgress();
  return progress.assessments[weekNumber] || null;
};

export const isWeekCompleted = async (weekNumber) => {
  const progress = await getProgress();
  return Array.isArray(progress.completedWeeks) && progress.completedWeeks.includes(weekNumber);
};

export const getCurrentWeek = async () => {
  const progress = await getProgress();
  return progress.currentWeek || 0; // 0 means baseline not completed
};

export const isBaselineCompleted = async () => {
  const progress = await getProgress();
  return progress.baselineCompleted || false;
};

export const getBaselineFRIQ = async () => {
  const progress = await getProgress();
  return progress.baselineFRIQ || null;
};

// Level 2 Assessment (after Week 5)
export const saveLevel2Assessment = async (results) => {
  const progress = await getProgress();
  progress.level2Completed = true;
  progress.level2FRIQ = results.FRIQ;
  progress.assessments['level2'] = {
    ...results,
    completedAt: new Date().toISOString()
  };
  return await saveProgress(progress);
};

export const isLevel2Completed = async () => {
  const progress = await getProgress();
  return progress.level2Completed || false;
};

export const getLevel2FRIQ = async () => {
  const progress = await getProgress();
  return progress.level2FRIQ || null;
};

export const getLevel2Assessment = async () => {
  const progress = await getProgress();
  return progress.assessments['level2'] || null;
};

// Level 3 Assessment (Final FRIQ - after Week 10)
export const saveLevel3Assessment = async (results) => {
  const progress = await getProgress();
  progress.level3Completed = true;
  progress.level3FRIQ = results.FRIQ;
  progress.finalFRIQ = results.FRIQ; // Also store as finalFRIQ for backward compatibility
  progress.assessments['level3'] = {
    ...results,
    completedAt: new Date().toISOString()
  };
  return await saveProgress(progress);
};

export const isLevel3Completed = async () => {
  const progress = await getProgress();
  return progress.level3Completed || false;
};

export const getLevel3FRIQ = async () => {
  const progress = await getProgress();
  return progress.level3FRIQ || null;
};

export const getLevel3Assessment = async () => {
  const progress = await getProgress();
  return progress.assessments['level3'] || null;
};

// Check if user has completed enough weeks to take Level 2 (after week 5)
export const canTakeLevel2 = async () => {
  const progress = await getProgress();
  if (!progress.baselineCompleted) return false;
  const completedWeeks = Array.isArray(progress.completedWeeks) ? progress.completedWeeks : [];
  const unlockedWeek = progress.currentWeek || 0;
  // Allow when Week 5 is completed OR the user has reached Week 5 (currentWeek shows unlocked access)
  return completedWeeks.includes(5) || unlockedWeek >= 5;
};

// Check if user has completed enough weeks to take Level 3 (after week 10)
export const canTakeLevel3 = async () => {
  const progress = await getProgress();
  if (!progress.baselineCompleted) return false;
  const completedWeeks = Array.isArray(progress.completedWeeks) ? progress.completedWeeks : [];
  const unlockedWeek = progress.currentWeek || 0;
  // Allow when Week 10 is completed OR the user has unlocked Week 10
  return completedWeeks.includes(10) || unlockedWeek >= 10;
};

export const resetProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return false;
  }
};


import { API_ENDPOINTS } from '../config/api';

let weeklyContentCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch all weekly content from API
export const fetchWeeklyContent = async (forceRefresh = false) => {
  // Return cached data if still valid
  if (!forceRefresh && weeklyContentCache && cacheTimestamp) {
    const now = Date.now();
    if (now - cacheTimestamp < CACHE_DURATION) {
      return weeklyContentCache;
    }
  }

  try {
    const response = await fetch(API_ENDPOINTS.WEEKLY_CONTENT);
    if (!response.ok) {
      throw new Error('Failed to fetch weekly content');
    }
    
    const data = await response.json();
    if (data.success && data.content) {
      weeklyContentCache = data.content;
      cacheTimestamp = Date.now();
      return data.content;
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching weekly content:', error);
    // Return cached data if available, even if expired
    if (weeklyContentCache) {
      return weeklyContentCache;
    }
    return {};
  }
};

// Get content for a specific week
export const getWeekData = async (weekNumber) => {
  const content = await fetchWeeklyContent();
  return content[weekNumber] || null;
};

// Get total number of weeks
export const getTotalWeeks = async () => {
  const content = await fetchWeeklyContent();
  return Object.keys(content).length;
};

// Get study questions for a week (from the week data)
export const getStudyQuestions = async (weekNumber) => {
  const weekData = await getWeekData(weekNumber);
  if (!weekData) return null;
  
  return {
    studyQuestions: weekData.studyQuestions || [],
    reflectionQuestions: weekData.reflectionQuestions || []
  };
};

// Clear cache (useful for admin updates)
export const clearWeeklyContentCache = () => {
  weeklyContentCache = null;
  cacheTimestamp = null;
};


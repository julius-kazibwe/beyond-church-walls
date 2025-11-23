const fs = require('fs').promises;
const path = require('path');

const weeklyContentDir = path.join(__dirname, '..', 'data', 'weekly-content');
const weeklyContentFile = path.join(weeklyContentDir, 'weeks.json');

// Ensure weekly content directory exists
const ensureWeeklyContentDir = async () => {
  await fs.mkdir(weeklyContentDir, { recursive: true });
};

// Initialize with default content if file doesn't exist
const initializeDefaultContent = async () => {
  const defaultContent = {
    1: {
      title: "Week 1: Rediscovering God's Design for Work",
      theme: "Understanding work as worship - Work began in Eden as sacred service (avodah)",
      keyScripture: "Genesis 2:15 - 'The Lord God took the man and put him in the Garden of Eden to work it and take care of it.'",
      learningObjective: "Understand that work was God's idea and remains part of His plan for worship",
      startDate: "2025-11-23",
      endDate: "2025-11-29",
      studyQuestions: [
        {
          id: 'sq1-1',
          question: "What does it mean that God 'put' Adam in the garden? What does this reveal about God's role in assigning work and purpose?"
        },
        {
          id: 'sq1-2',
          question: "The words 'tend' and 'keep' imply responsibility and stewardship. How do these two actions shape our understanding of the purpose of work?"
        },
        {
          id: 'sq1-3',
          question: "Work existed before the Fall. How does this truth challenge the belief that work is a curse or a punishment?"
        },
        {
          id: 'sq1-4',
          question: "'Tend' means to cultivate, develop, and improve. How does God call you to cultivate the environment where He has placed you today?"
        },
        {
          id: 'sq1-5',
          question: "'Keep' means to guard, protect, preserve. What spiritual or moral responsibilities come with your work, position, or influence?"
        }
      ],
      reflectionQuestions: [
        {
          id: 'rq1-1',
          question: "How does knowing God worked before creating man reshape your view of work?"
        },
        {
          id: 'rq1-2',
          question: "What would change if you saw your desk, classroom, or tools as an altar?"
        }
      ],
      completionMessage: {
        title: "Congratulations!",
        message: "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work."
      }
    },
    2: {
      title: "Week 2: Tearing Down the Sacred–Secular Divide",
      theme: "Expose and dismantle the false separation between 'spiritual' and 'ordinary' work",
      keyScripture: "Romans 12:2 - 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will.'",
      learningObjective: "True discipleship integrates faith into every sphere of life. Every believer is a full-time minister in their God-given field.",
      startDate: "2025-11-30",
      endDate: "2025-12-06",
      studyQuestions: [
        {
          id: 'sq2-1',
          question: "What does 'do not be conformed to this world' mean?"
        },
        {
          id: 'sq2-2',
          question: "What is the difference between conforming and transforming?"
        },
        {
          id: 'sq2-3',
          question: "What does 'renewing of your mind' involve?"
        },
        {
          id: 'sq2-4',
          question: "Why is the mind the starting point for transformation?"
        },
        {
          id: 'sq2-5',
          question: "How does a renewed mind affect your daily life?"
        }
      ],
      reflectionQuestions: [
        {
          id: 'rq2-1',
          question: "When do you tend to divide 'church life' from 'work life'?"
        },
        {
          id: 'rq2-2',
          question: "What steps can you take this week to bridge them?"
        }
      ],
      completionMessage: {
        title: "Congratulations!",
        message: "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work."
      }
    }
  };

  await fs.writeFile(weeklyContentFile, JSON.stringify(defaultContent, null, 2));
  return defaultContent;
};

// Get all weekly content
const getAllWeeklyContent = async () => {
  await ensureWeeklyContentDir();
  try {
    const data = await fs.readFile(weeklyContentFile, 'utf8');
    return JSON.parse(data);
  } catch {
    // Initialize with default content if file doesn't exist
    return await initializeDefaultContent();
  }
};

// Get content for a specific week
const getWeekContent = async (weekNumber) => {
  const allContent = await getAllWeeklyContent();
  return allContent[weekNumber] || null;
};

// Save weekly content
const saveWeeklyContent = async (weekNumber, content) => {
  await ensureWeeklyContentDir();
  const allContent = await getAllWeeklyContent();
  allContent[weekNumber] = {
    ...content,
    updatedAt: new Date().toISOString()
  };
  await fs.writeFile(weeklyContentFile, JSON.stringify(allContent, null, 2));
  return allContent[weekNumber];
};

// Delete a week
const deleteWeek = async (weekNumber) => {
  await ensureWeeklyContentDir();
  const allContent = await getAllWeeklyContent();
  delete allContent[weekNumber];
  await fs.writeFile(weeklyContentFile, JSON.stringify(allContent, null, 2));
  return true;
};

module.exports = {
  getAllWeeklyContent,
  getWeekContent,
  saveWeeklyContent,
  deleteWeek,
};


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
      questions: {
        Worship: [
          {
            id: 'w1-1',
            question: "This week, I intentionally began my workday with prayer or reflection on God's presence, recognizing that God 'put' me in my current position.",
            dimension: 'Worship'
          },
          {
            id: 'w1-2',
            question: "I saw my work tasks as acts of worship and service to God, understanding that work existed before the Fall and is part of God's design.",
            dimension: 'Worship'
          },
          {
            id: 'w1-3',
            question: "I maintained awareness of God's presence throughout my workday, viewing my workplace as a sacred space where God is present.",
            dimension: 'Worship'
          },
          {
            id: 'w1-4',
            question: "I dedicated my work efforts this week to God's glory, recognizing that my work is part of God's plan for worship.",
            dimension: 'Worship'
          },
          {
            id: 'w1-5',
            question: "I viewed my desk, classroom, or tools as an altar - a place where I can worship God through my work.",
            dimension: 'Worship'
          }
        ],
        Integrity: [
          {
            id: 'i1-1',
            question: "I took responsibility and stewardship seriously in my work, understanding the 'tend' and 'keep' aspects of my role.",
            dimension: 'Integrity'
          },
          {
            id: 'i1-2',
            question: "I was honest and transparent in all my professional interactions, recognizing that my work reflects God's character.",
            dimension: 'Integrity'
          },
          {
            id: 'i1-3',
            question: "I kept my commitments and followed through on promises, understanding that work involves responsibility and stewardship.",
            dimension: 'Integrity'
          },
          {
            id: 'i1-4',
            question: "I actively cultivated and improved my work environment, living out the 'tend' aspect of work (to cultivate, develop, and improve).",
            dimension: 'Integrity'
          },
          {
            id: 'i1-5',
            question: "I guarded and protected what was entrusted to me, living out the 'keep' aspect of work (to guard, protect, preserve) in my spiritual and moral responsibilities.",
            dimension: 'Integrity'
          }
        ],
        Service: [
          {
            id: 's1-1',
            question: "I actively looked for opportunities to help and serve my colleagues, recognizing that work is meant to serve others.",
            dimension: 'Service'
          },
          {
            id: 's1-2',
            question: "I served others with humility, without seeking recognition, understanding that work is sacred service (avodah).",
            dimension: 'Service'
          },
          {
            id: 's1-3',
            question: "I showed compassion and empathy toward those I work with, reflecting God's heart for people in my workplace.",
            dimension: 'Service'
          }
        ],
        Excellence: [
          {
            id: 'e1-1',
            question: "I pursued quality and excellence in all my work tasks, understanding that work is part of God's good design.",
            dimension: 'Excellence'
          },
          {
            id: 'e1-2',
            question: "I worked diligently and gave my best effort, recognizing that work is not a curse but part of God's original plan.",
            dimension: 'Excellence'
          },
          {
            id: 'e1-3',
            question: "I continuously sought to grow and improve, cultivating my work environment as God called Adam to cultivate the garden.",
            dimension: 'Excellence'
          }
        ]
      },
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
      questions: {
        Worship: [
          {
            id: 'w2-1',
            question: "I maintained a worshipful attitude in my work, refusing to separate 'church life' from 'work life'.",
            dimension: 'Worship'
          },
          {
            id: 'w2-2',
            question: "I saw my work as an act of worship throughout the week, understanding that every believer is a full-time minister.",
            dimension: 'Worship'
          },
          {
            id: 'w2-3',
            question: "I integrated my faith naturally into my workplace, living out the truth that there is no sacred-secular divide.",
            dimension: 'Worship'
          }
        ],
        Integrity: [
          {
            id: 'i2-1',
            question: "I refused to conform to worldly patterns in my workplace, choosing transformation over conformity.",
            dimension: 'Integrity'
          },
          {
            id: 'i2-2',
            question: "I maintained moral consistency between my church life and work life, living as an integrated believer.",
            dimension: 'Integrity'
          },
          {
            id: 'i2-3',
            question: "I was honest about my faith in appropriate ways at work, bridging the gap between my spiritual and professional life.",
            dimension: 'Integrity'
          },
          {
            id: 'i2-4',
            question: "I took steps this week to bridge the divide between my faith and work, living as a full-time minister in my field.",
            dimension: 'Integrity'
          }
        ],
        Service: [
          {
            id: 's2-1',
            question: "I served others at work with the same heart I serve at church, understanding that all work is ministry.",
            dimension: 'Service'
          },
          {
            id: 's2-2',
            question: "I looked for opportunities to demonstrate Christ's love in my workplace, living out integrated discipleship.",
            dimension: 'Service'
          },
          {
            id: 's2-3',
            question: "I showed compassion and empathy at work, recognizing that my workplace is part of my mission field.",
            dimension: 'Service'
          }
        ],
        Excellence: [
          {
            id: 'e2-1',
            question: "I pursued excellence in my work as an act of worship, understanding that transformation starts with renewing my mind.",
            dimension: 'Excellence'
          },
          {
            id: 'e2-2',
            question: "I worked diligently, recognizing that my work is part of testing and approving God's will in my life.",
            dimension: 'Excellence'
          },
          {
            id: 'e2-3',
            question: "I continuously sought to grow, allowing my mind to be renewed so I could discern God's good, pleasing, and perfect will.",
            dimension: 'Excellence'
          },
          {
            id: 'e2-4',
            question: "I gave my best effort, working as unto the Lord, not conforming to the pattern of this world.",
            dimension: 'Excellence'
          }
        ]
      },
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


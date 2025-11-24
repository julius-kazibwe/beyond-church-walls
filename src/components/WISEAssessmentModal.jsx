import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FRIQResultsModal from './FRIQResultsModal';

// Assessment questions for Level 1 (Baseline) - Before Week 1
// Each question has its own specific options A-E
const WISE_QUESTIONS_LEVEL_1 = {
  Worship: [
    {
      id: 'w1',
      question: "How often do you consciously acknowledge God's presence at work?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Rarely' },
        { label: 'B', value: 0.4, text: 'Sometimes' },
        { label: 'C', value: 0.6, text: 'Often' },
        { label: 'D', value: 0.8, text: 'Very Often' },
        { label: 'E', value: 1.0, text: 'Always' }
      ]
    },
    {
      id: 'w2',
      question: "Do you pray before beginning tasks?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Seldom' },
        { label: 'C', value: 0.6, text: 'Occasionally' },
        { label: 'D', value: 0.8, text: 'Regularly' },
        { label: 'E', value: 1.0, text: 'Always' }
      ]
    },
    {
      id: 'w3',
      question: "How often do you think of your work as worship?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Occasionally' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Always' }
      ]
    },
    {
      id: 'w4',
      question: "Do you reflect scripture or biblical truths during work?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Daily' }
      ]
    },
    {
      id: 'w5',
      question: "How often do you invite God to lead your decisions?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Always' }
      ]
    }
  ],
  Integrity: [
    {
      id: 'i1',
      question: "How do you respond when no one is watching?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'I compromise' },
        { label: 'B', value: 0.4, text: 'I struggle' },
        { label: 'C', value: 0.6, text: 'I try' },
        { label: 'D', value: 0.8, text: 'I choose honesty' },
        { label: 'E', value: 1.0, text: 'I am consistently honest' }
      ]
    },
    {
      id: 'i2',
      question: "How do you handle confidential information?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Carelessly' },
        { label: 'B', value: 0.4, text: 'Sometimes careless' },
        { label: 'C', value: 0.6, text: 'Neutral' },
        { label: 'D', value: 0.8, text: 'Carefully' },
        { label: 'E', value: 1.0, text: 'With utmost trustworthiness' }
      ]
    },
    {
      id: 'i3',
      question: "How do you respond to workplace gossip?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Join in' },
        { label: 'B', value: 0.4, text: 'Listen silently' },
        { label: 'C', value: 0.6, text: 'Walk away sometimes' },
        { label: 'D', value: 0.8, text: 'Avoid it' },
        { label: 'E', value: 1.0, text: 'Stop it' }
      ]
    },
    {
      id: 'i4',
      question: "How accurate are your reports/timesheets?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Not accurate' },
        { label: 'B', value: 0.4, text: 'Sometimes adjusted' },
        { label: 'C', value: 0.6, text: 'Mostly correct' },
        { label: 'D', value: 0.8, text: 'Always correct' },
        { label: 'E', value: 1.0, text: 'Exact and precise' }
      ]
    },
    {
      id: 'i5',
      question: "If pressured to do wrong, what do you do?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Compromise' },
        { label: 'B', value: 0.4, text: 'Struggle' },
        { label: 'C', value: 0.6, text: 'Look for escape' },
        { label: 'D', value: 0.8, text: 'Stand firm' },
        { label: 'E', value: 1.0, text: 'Refuse boldly' }
      ]
    }
  ],
  Service: [
    {
      id: 's1',
      question: "How willing are you to help coworkers?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Always' }
      ]
    },
    {
      id: 's2',
      question: "How do you respond to difficult clients?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'React negatively' },
        { label: 'B', value: 0.4, text: 'Get irritated' },
        { label: 'C', value: 0.6, text: 'Stay neutral' },
        { label: 'D', value: 0.8, text: 'Stay patient' },
        { label: 'E', value: 1.0, text: 'Show compassion' }
      ]
    },
    {
      id: 's3',
      question: "Do you encourage others at work?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Always' }
      ]
    },
    {
      id: 's4',
      question: "How do you handle team success?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Take credit' },
        { label: 'B', value: 0.4, text: 'Accept praise silently' },
        { label: 'C', value: 0.6, text: 'Share sometimes' },
        { label: 'D', value: 0.8, text: 'Share credit' },
        { label: 'E', value: 1.0, text: 'Promote others fully' }
      ]
    },
    {
      id: 's5',
      question: "Do you serve beyond your job description?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Always' }
      ]
    }
  ],
  Excellence: [
    {
      id: 'e1',
      question: "How consistent is your quality of work?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Low' },
        { label: 'B', value: 0.4, text: 'Inconsistent' },
        { label: 'C', value: 0.6, text: 'Average' },
        { label: 'D', value: 0.8, text: 'High' },
        { label: 'E', value: 1.0, text: 'Excellent' }
      ]
    },
    {
      id: 'e2',
      question: "How do you handle feedback?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Reject it' },
        { label: 'B', value: 0.4, text: 'Resist it' },
        { label: 'C', value: 0.6, text: 'Listen' },
        { label: 'D', value: 0.8, text: 'Apply it' },
        { label: 'E', value: 1.0, text: 'Seek feedback proactively' }
      ]
    },
    {
      id: 'e3',
      question: "How do you manage deadlines?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Miss often' },
        { label: 'B', value: 0.4, text: 'Miss sometimes' },
        { label: 'C', value: 0.6, text: 'Meet most' },
        { label: 'D', value: 0.8, text: 'Meet all' },
        { label: 'E', value: 1.0, text: 'Exceed expectations' }
      ]
    },
    {
      id: 'e4',
      question: "How intentional are you about improving your skills?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Always' }
      ]
    },
    {
      id: 'e5',
      question: "How would you describe your personal performance standard?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Minimal' },
        { label: 'B', value: 0.4, text: 'Adequate' },
        { label: 'C', value: 0.6, text: 'Reasonable' },
        { label: 'D', value: 0.8, text: 'High' },
        { label: 'E', value: 1.0, text: 'Excellent unto God' }
      ]
    }
  ]
};

// Assessment questions for Level 2 - After Week 5
const WISE_QUESTIONS_LEVEL_2 = {
  Worship: [
    {
      id: 'w1',
      question: "How consistently do you align daily decisions with God's will?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Rarely' },
        { label: 'B', value: 0.4, text: 'Occasionally' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Always-well' }
      ]
    },
    {
      id: 'w2',
      question: "How deeply does prayer shape your planning and priorities?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Seldom' },
        { label: 'C', value: 0.6, text: 'Somewhat' },
        { label: 'D', value: 0.8, text: 'Significantly' },
        { label: 'E', value: 1.0, text: 'Fully shaped' }
      ]
    },
    {
      id: 'w3',
      question: "How intentionally do you maintain a worshipful mindset at work?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently' }
      ]
    },
    {
      id: 'w4',
      question: "How actively do you discern and apply scripture to work situations?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Proactively' }
      ]
    },
    {
      id: 'w5',
      question: "How confident are you in discerning God's guidance in decisions?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Not confident' },
        { label: 'B', value: 0.4, text: 'Slightly' },
        { label: 'C', value: 0.6, text: 'Moderately' },
        { label: 'D', value: 0.8, text: 'Very' },
        { label: 'E', value: 1.0, text: 'Extremely' }
      ]
    }
  ],
  Integrity: [
    {
      id: 'i1',
      question: "How consistently does your private character match your public witness?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Poor match' },
        { label: 'B', value: 0.4, text: 'Inconsistent' },
        { label: 'C', value: 0.6, text: 'Moderately' },
        { label: 'D', value: 0.8, text: 'Strong match' },
        { label: 'E', value: 1.0, text: 'Fully aligned' }
      ]
    },
    {
      id: 'i2',
      question: "How diligently do you protect confidential information?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Poorly' },
        { label: 'B', value: 0.4, text: 'Occasionally' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Very reliably' },
        { label: 'E', value: 1.0, text: 'Exceptionally' }
      ]
    },
    {
      id: 'i3',
      question: "How boldly do you resist and stop harmful conversations?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently' }
      ]
    },
    {
      id: 'i4',
      question: "How accurate and audit-ready are your reports at all times?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Not accurate' },
        { label: 'B', value: 0.4, text: 'Sometimes' },
        { label: 'C', value: 0.6, text: 'Mostly accurate' },
        { label: 'D', value: 0.8, text: 'Always compliant' },
        { label: 'E', value: 1.0, text: 'Meticulous' }
      ]
    },
    {
      id: 'i5',
      question: "How strong is your integrity response when moral risks arise?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Weak' },
        { label: 'B', value: 0.4, text: 'Unstable' },
        { label: 'C', value: 0.6, text: 'Developing' },
        { label: 'D', value: 0.8, text: 'Consistent' },
        { label: 'E', value: 1.0, text: 'Unshakeable' }
      ]
    }
  ],
  Service: [
    {
      id: 's1',
      question: "How sacrificially do you support coworkers in demanding situations?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently' }
      ]
    },
    {
      id: 's2',
      question: "How effectively do you de-escalate difficult clients or conflicts?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Poorly' },
        { label: 'B', value: 0.4, text: 'Sometimes' },
        { label: 'C', value: 0.6, text: 'Remain neutral' },
        { label: 'D', value: 0.8, text: 'Often de-escalate' },
        { label: 'E', value: 1.0, text: 'Consistently' }
      ]
    },
    {
      id: 's3',
      question: "How intentionally do you create a culture of encouragement?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Proactively' }
      ]
    },
    {
      id: 's4',
      question: "How meaningfully do you strengthen team success by promoting others?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Take credit' },
        { label: 'B', value: 0.4, text: 'Silent observer' },
        { label: 'C', value: 0.6, text: 'Supports' },
        { label: 'D', value: 0.8, text: 'Support of others' },
        { label: 'E', value: 1.0, text: 'Empower others' }
      ]
    },
    {
      id: 's5',
      question: "How consistently do you notice and meet needs beyond your role?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently' }
      ]
    }
  ],
  Excellence: [
    {
      id: 'e1',
      question: "How consistently do you deliver excellence without external pressure?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Rarely' },
        { label: 'B', value: 0.4, text: 'Sometimes' },
        { label: 'C', value: 0.6, text: 'Moderately' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Always-strive' }
      ]
    },
    {
      id: 'e2',
      question: "How intentionally do you use feedback as a growth tool?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Ignore' },
        { label: 'B', value: 0.4, text: 'Resist' },
        { label: 'C', value: 0.6, text: 'Occasionally' },
        { label: 'D', value: 0.8, text: 'Often apply' },
        { label: 'E', value: 1.0, text: 'Actively seek' }
      ]
    },
    {
      id: 'e3',
      question: "How effectively do you manage multiple deadlines and priorities?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Poorly' },
        { label: 'B', value: 0.4, text: 'Sometimes' },
        { label: 'C', value: 0.6, text: 'Adequate' },
        { label: 'D', value: 0.8, text: 'Strong' },
        { label: 'E', value: 1.0, text: 'Exceptionally' }
      ]
    },
    {
      id: 'e4',
      question: "How committed are you to continuous mastery in your field?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Not committed' },
        { label: 'B', value: 0.4, text: 'Low commitment' },
        { label: 'C', value: 0.6, text: 'Moderate' },
        { label: 'D', value: 0.8, text: 'Strong' },
        { label: 'E', value: 1.0, text: 'Exceptionally' }
      ]
    },
    {
      id: 'e5',
      question: "How well do your standards inspire others to pursue excellence?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently' }
      ]
    }
  ]
};

// Assessment questions for Level 3 (Final FRIQ) - After Week 10
const WISE_QUESTIONS_LEVEL_3 = {
  Worship: [
    {
      id: 'w1',
      question: "How fully does your work reflect a mature understanding of calling and stewardship?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Partially' },
        { label: 'C', value: 0.6, text: 'Moderately' },
        { label: 'D', value: 0.8, text: 'Strongly' },
        { label: 'E', value: 1.0, text: 'Fully—Spirit-led' }
      ]
    },
    {
      id: 'w2',
      question: "How deeply is your work life centered around sustained communion with God?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Disconnected' },
        { label: 'B', value: 0.4, text: 'Occasional' },
        { label: 'C', value: 0.6, text: 'Growing' },
        { label: 'D', value: 0.8, text: 'Deep' },
        { label: 'E', value: 1.0, text: 'Continual communion' }
      ]
    },
    {
      id: 'w3',
      question: "How strongly do you model a lifestyle where work itself becomes worship to others?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently—culture shaping' }
      ]
    },
    {
      id: 'w4',
      question: "How well do you discern spiritual seasons and assignments in your work?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently—with clarity' }
      ]
    },
    {
      id: 'w5',
      question: "How aligned are your long-term career goals with God's Kingdom agenda?",
      dimension: 'Worship',
      options: [
        { label: 'A', value: 0.2, text: 'Not aligned' },
        { label: 'B', value: 0.4, text: 'Slightly aligned' },
        { label: 'C', value: 0.6, text: 'Moderately aligned' },
        { label: 'D', value: 0.8, text: 'Strongly aligned' },
        { label: 'E', value: 1.0, text: 'Fully aligned—Kingdom-driven' }
      ]
    }
  ],
  Integrity: [
    {
      id: 'i1',
      question: "How unwavering is your integrity when facing high-stakes pressure?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Very weak' },
        { label: 'B', value: 0.4, text: 'Weak' },
        { label: 'C', value: 0.6, text: 'Moderate' },
        { label: 'D', value: 0.8, text: 'Strong' },
        { label: 'E', value: 1.0, text: 'Immovable' }
      ]
    },
    {
      id: 'i2',
      question: "How consistently do you influence others toward ethical behavior?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently—transformational' }
      ]
    },
    {
      id: 'i3',
      question: "How deeply have honesty and purity become your natural default reactions?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Occasionally' },
        { label: 'C', value: 0.6, text: 'Developing' },
        { label: 'D', value: 0.8, text: 'Consistent' },
        { label: 'E', value: 1.0, text: 'Automatic—reflex integrity' }
      ]
    },
    {
      id: 'i4',
      question: "How thoroughly do you ensure transparency in all transactions, decisions, and processes?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Minimal' },
        { label: 'C', value: 0.6, text: 'Moderate' },
        { label: 'D', value: 0.8, text: 'Consistent' },
        { label: 'E', value: 1.0, text: 'Exceptional—model of integrity' }
      ]
    },
    {
      id: 'i5',
      question: "How effectively do you confront, correct, or cleanse toxic cultures around you?",
      dimension: 'Integrity',
      options: [
        { label: 'A', value: 0.2, text: 'Never' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently—atmosphere changer' }
      ]
    }
  ],
  Service: [
    {
      id: 's1',
      question: "How naturally do you create transformation through service at work?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Minimal' },
        { label: 'C', value: 0.6, text: 'Occasional' },
        { label: 'D', value: 0.8, text: 'Regular' },
        { label: 'E', value: 1.0, text: 'Consistently—transformational' }
      ]
    },
    {
      id: 's2',
      question: "How influential are you in restoring broken relationships or teams?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently—restorer' }
      ]
    },
    {
      id: 's3',
      question: "How fully do you model Christlike compassion even under extreme pressure?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Minimal' },
        { label: 'C', value: 0.6, text: 'Moderate' },
        { label: 'D', value: 0.8, text: 'Strong' },
        { label: 'E', value: 1.0, text: 'Overflowing—Christlike' }
      ]
    },
    {
      id: 's4',
      question: "How significantly do you shape your workplace into a healthier environment?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Slightly' },
        { label: 'C', value: 0.6, text: 'Moderately' },
        { label: 'D', value: 0.8, text: 'Strongly' },
        { label: 'E', value: 1.0, text: 'Consistently—culture shaper' }
      ]
    },
    {
      id: 's5',
      question: "How far beyond your role do you operate to elevate people and systems?",
      dimension: 'Service',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Minimal' },
        { label: 'C', value: 0.6, text: 'Occasional' },
        { label: 'D', value: 0.8, text: 'Regular' },
        { label: 'E', value: 1.0, text: 'Consistently—Kingdom multiplier' }
      ]
    }
  ],
  Excellence: [
    {
      id: 'e1',
      question: "How consistently do you achieve excellence that produces measurable impact?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Minimal' },
        { label: 'C', value: 0.6, text: 'Moderate' },
        { label: 'D', value: 0.8, text: 'High' },
        { label: 'E', value: 1.0, text: 'Consistently—exceptional impact' }
      ]
    },
    {
      id: 'e2',
      question: "How deeply have discipline, mastery, and growth become part of your identity?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Low' },
        { label: 'C', value: 0.6, text: 'Moderate' },
        { label: 'D', value: 0.8, text: 'Strong' },
        { label: 'E', value: 1.0, text: 'Fully integrated identity' }
      ]
    },
    {
      id: 'e3',
      question: "How effectively do you foresee challenges and create proactive solutions?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Rarely' },
        { label: 'C', value: 0.6, text: 'Sometimes' },
        { label: 'D', value: 0.8, text: 'Often' },
        { label: 'E', value: 1.0, text: 'Consistently—visionary problem solver' }
      ]
    },
    {
      id: 'e4',
      question: "How significantly do you raise the performance of people around you?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Minimal' },
        { label: 'C', value: 0.6, text: 'Some' },
        { label: 'D', value: 0.8, text: 'Strong' },
        { label: 'E', value: 1.0, text: 'Consistently—performance elevator' }
      ]
    },
    {
      id: 'e5',
      question: "How consistently do your results reflect Kingdom excellence and eternal fruit?",
      dimension: 'Excellence',
      options: [
        { label: 'A', value: 0.2, text: 'Not at all' },
        { label: 'B', value: 0.4, text: 'Minimal' },
        { label: 'C', value: 0.6, text: 'Moderate' },
        { label: 'D', value: 0.8, text: 'Strong' },
        { label: 'E', value: 1.0, text: 'Fully—lasting fruit' }
      ]
    }
  ]
};

// Get questions for a specific level
const getQuestionsForLevel = (level) => {
  switch (level) {
    case 1:
      return WISE_QUESTIONS_LEVEL_1;
    case 2:
      return WISE_QUESTIONS_LEVEL_2;
    case 3:
      return WISE_QUESTIONS_LEVEL_3;
    default:
      return WISE_QUESTIONS_LEVEL_1;
  }
};

// Get level title
const getLevelTitle = (level) => {
  switch (level) {
    case 1:
      return 'Level 1: Baseline Assessment';
    case 2:
      return 'Level 2: Mid-Program Assessment';
    case 3:
      return 'Level 3: Final FRIQ Assessment';
    default:
      return 'WISE Framework Assessment';
  }
};

const WISEAssessmentModal = ({ isOpen, onClose, onComplete, level = 1 }) => {
  const [currentDimension, setCurrentDimension] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const WISE_QUESTIONS = getQuestionsForLevel(level);
  const dimensions = ['Worship', 'Integrity', 'Service', 'Excellence'];
  const currentDim = dimensions[currentDimension];
  const questions = WISE_QUESTIONS[currentDim];
  const currentQ = questions[currentQuestion];
  const totalQuestions = Object.values(WISE_QUESTIONS).flat().length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (currentDimension < dimensions.length - 1) {
      setCurrentDimension(prev => prev + 1);
      setCurrentQuestion(0);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (currentDimension > 0) {
      setCurrentDimension(prev => prev - 1);
      setCurrentQuestion(WISE_QUESTIONS[dimensions[currentDimension - 1]].length - 1);
    }
  };

  const calculateResults = () => {
    // Calculate average score for each dimension
    const dimensionScores = {};
    
    dimensions.forEach(dim => {
      const dimQuestions = WISE_QUESTIONS[dim];
      const dimAnswers = dimQuestions
        .map(q => answers[q.id])
        .filter(val => val !== undefined);
      
      if (dimAnswers.length > 0) {
        const sum = dimAnswers.reduce((acc, val) => acc + val, 0);
        dimensionScores[dim] = sum / dimAnswers.length;
      } else {
        dimensionScores[dim] = 0;
      }
    });

    // Calculate FRIQ (product of all dimensions)
    const W = dimensionScores.Worship || 0;
    const I = dimensionScores.Integrity || 0;
    const S = dimensionScores.Service || 0;
    const E = dimensionScores.Excellence || 0;
    const FRIQ = W * I * S * E;

    // Determine impact level
    let impactLevel = '';
    let impactDescription = '';
    
    if (FRIQ >= 0.91) {
      impactLevel = 'Christlike Impact';
      impactDescription = 'A rare level of maturity where daily work becomes ministry and influence is effortless, natural, and powerful.';
    } else if (FRIQ >= 0.76) {
      impactLevel = 'Transformational Impact';
      impactDescription = 'Your presence lifts teams, inspires others, and changes systems.';
    } else if (FRIQ >= 0.51) {
      impactLevel = 'Influential Impact';
      impactDescription = 'Faith is strong and steady; you shape the atmosphere and culture around you.';
    } else if (FRIQ >= 0.31) {
      impactLevel = 'Consistent Impact';
      impactDescription = 'Work increasingly reflects worship; reliability and integrity are visible.';
    } else if (FRIQ >= 0.16) {
      impactLevel = 'Emerging Impact';
      impactDescription = 'Faith begins to shape daily decisions more regularly; others may start to notice.';
    } else if (FRIQ >= 0.06) {
      impactLevel = 'Developing Impact';
      impactDescription = 'Faith is awakening; influence is inconsistent but growing.';
    } else {
      impactLevel = 'Dormant Impact';
      impactDescription = 'Faith has little visible influence on daily work; this is the starting point of growth.';
    }

    const resultsData = {
      level,
      dimensionScores,
      FRIQ,
      impactLevel,
      impactDescription
    };
    setResults(resultsData);
    setShowResults(true);
  };

  const handleClose = () => {
    setShowResults(false);
    setResults(null);
    setAnswers({});
    setCurrentDimension(0);
    setCurrentQuestion(0);
    onClose();
  };

  const handleRestart = () => {
    setShowResults(false);
    setResults(null);
    setAnswers({});
    setCurrentDimension(0);
    setCurrentQuestion(0);
  };

  if (showResults && results) {
    const handleResultsClose = () => {
      // Call onComplete before closing if provided
      if (onComplete) {
        onComplete(results);
      }
      handleClose();
    };
    
    return (
      <FRIQResultsModal
        isOpen={isOpen}
        onClose={handleResultsClose}
        results={results}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-navy to-blue-900 text-white p-4 md:p-5 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">{getLevelTitle(level)}</h2>
                    <p className="text-xs md:text-sm text-white/80 mt-0.5">WISE Framework Assessment</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-white hover:text-gold transition-colors p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                    {answeredQuestions} / {totalQuestions}
                  </span>
                </div>
                <div className="flex gap-2">
                  {dimensions.map((dim, idx) => (
                    <div
                      key={dim}
                      className={`px-2.5 py-1 rounded-full text-xs md:text-sm font-semibold ${
                        idx === currentDimension
                          ? 'bg-gold text-navy'
                          : idx < currentDimension
                          ? 'bg-white/30 text-white'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {dim[0]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
                <div className="mb-3">
                  <div className="inline-block bg-gold/10 text-navy px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-2">
                    {currentDim} — {currentQuestion + 1} of {questions.length}
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-navy mb-3 leading-relaxed">
                    {currentQ.question}
                  </h3>
                </div>

                <div className="space-y-2">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = answers[currentQ.id] === option.value;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(currentQ.id, option.value)}
                        className={`w-full text-left p-2.5 md:p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-gold bg-gold/10 shadow-md'
                            : 'border-gray-200 hover:border-gold/50 hover:bg-gold/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 md:gap-3">
                          <div className="flex items-center gap-2 md:gap-3 flex-1">
                            <div className="font-bold text-navy text-base md:text-lg min-w-[1.5rem] md:min-w-[2rem]">
                              {option.label}
                            </div>
                            <div className="text-xs md:text-sm text-gray-700">
                              {option.text}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-gold text-navy rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center font-bold flex-shrink-0 text-xs md:text-sm">
                              ✓
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 md:p-5 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={handlePrevious}
                  disabled={currentDimension === 0 && currentQuestion === 0}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm md:text-base"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQ.id]}
                  className="px-5 py-2.5 bg-navy text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm md:text-base"
                >
                  {currentDimension === dimensions.length - 1 && currentQuestion === questions.length - 1
                    ? 'View Results'
                    : 'Next'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WISEAssessmentModal;

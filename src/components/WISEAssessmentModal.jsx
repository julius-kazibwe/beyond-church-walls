import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FRIQResultsModal from './FRIQResultsModal';

// Assessment questions for each WISE dimension
const WISE_QUESTIONS = {
  Worship: [
    {
      id: 'w1',
      question: "I begin my workday with prayer or reflection on God's presence.",
      dimension: 'Worship'
    },
    {
      id: 'w2',
      question: "I see my work as an act of worship and service to God.",
      dimension: 'Worship'
    },
    {
      id: 'w3',
      question: "I maintain awareness of God's presence throughout my workday.",
      dimension: 'Worship'
    },
    {
      id: 'w4',
      question: "I dedicate my work efforts to God's glory.",
      dimension: 'Worship'
    },
    {
      id: 'w5',
      question: "I view my workplace as a sacred space where God is present.",
      dimension: 'Worship'
    }
  ],
  Integrity: [
    {
      id: 'i1',
      question: "I am honest and transparent in all my professional dealings.",
      dimension: 'Integrity'
    },
    {
      id: 'i2',
      question: "My private life matches my public witness and values.",
      dimension: 'Integrity'
    },
    {
      id: 'i3',
      question: "I keep my commitments and follow through on promises.",
      dimension: 'Integrity'
    },
    {
      id: 'i4',
      question: "I admit mistakes and take responsibility for my actions.",
      dimension: 'Integrity'
    },
    {
      id: 'i5',
      question: "I maintain moral consistency in difficult situations.",
      dimension: 'Integrity'
    }
  ],
  Service: [
    {
      id: 's1',
      question: "I actively look for ways to help and serve my colleagues.",
      dimension: 'Service'
    },
    {
      id: 's2',
      question: "I serve others with humility, without seeking recognition.",
      dimension: 'Service'
    },
    {
      id: 's3',
      question: "I show compassion and empathy toward those I work with.",
      dimension: 'Service'
    },
    {
      id: 's4',
      question: "I generously share my time, knowledge, and resources with others.",
      dimension: 'Service'
    },
    {
      id: 's5',
      question: "I prioritize the needs of others when appropriate.",
      dimension: 'Service'
    }
  ],
  Excellence: [
    {
      id: 'e1',
      question: "I pursue quality and excellence in all my work tasks.",
      dimension: 'Excellence'
    },
    {
      id: 'e2',
      question: "I work diligently and give my best effort consistently.",
      dimension: 'Excellence'
    },
    {
      id: 'e3',
      question: "I continuously seek to grow and improve my skills.",
      dimension: 'Excellence'
    },
    {
      id: 'e4',
      question: "I strive for mastery in my field of work.",
      dimension: 'Excellence'
    },
    {
      id: 'e5',
      question: "I work as if serving the Lord, not just people.",
      dimension: 'Excellence'
    }
  ]
};

// Scoring options
const SCORING_OPTIONS = [
  { label: 'A - Weak or inconsistent', value: 0.2, description: 'Rarely demonstrated' },
  { label: 'B - Growing but inconsistent', value: 0.4, description: 'Improving but easily disrupted' },
  { label: 'C - Good but needs strengthening', value: 0.6, description: 'Visible and fairly consistent' },
  { label: 'D - Strong and visible', value: 0.8, description: 'Reliable and natural expression' },
  { label: 'E - Christlike level', value: 1.0, description: 'Consistent, inspiring, and deeply rooted' }
];

const WISEAssessmentModal = ({ isOpen, onClose }) => {
  const [currentDimension, setCurrentDimension] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

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

    setResults({
      dimensionScores,
      FRIQ,
      impactLevel,
      impactDescription
    });
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
    return (
      <FRIQResultsModal
        isOpen={isOpen}
        onClose={handleClose}
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
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-navy to-blue-900 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold">WISE Framework Assessment</h2>
                  <button
                    onClick={handleClose}
                    className="text-white hover:text-gold transition-colors p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {answeredQuestions} / {totalQuestions}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  {dimensions.map((dim, idx) => (
                    <div
                      key={dim}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
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
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="mb-6">
                  <div className="inline-block bg-gold/10 text-navy px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    {currentDim} — {currentQuestion + 1} of {questions.length}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-navy mb-6 leading-relaxed">
                    {currentQ.question}
                  </h3>
                </div>

                <div className="space-y-3">
                  {SCORING_OPTIONS.map((option, idx) => {
                    const isSelected = answers[currentQ.id] === option.value;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(currentQ.id, option.value)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-gold bg-gold/10 shadow-md'
                            : 'border-gray-200 hover:border-gold/50 hover:bg-gold/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-navy mb-1">
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              {option.description}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-gold text-navy rounded-full w-8 h-8 flex items-center justify-center font-bold">
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
              <div className="border-t border-gray-200 p-6 flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentDimension === 0 && currentQuestion === 0}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQ.id]}
                  className="px-6 py-3 bg-navy text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
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


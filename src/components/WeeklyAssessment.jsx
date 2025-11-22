import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SCORING_OPTIONS } from '../data/weeklyQuestions';
import { saveAssessmentResult } from '../utils/progressTracker';
import WeeklyResultsModal from './WeeklyResultsModal';

const WeeklyAssessment = ({ isOpen, onClose, weekNumber, weekData, onComplete }) => {
  const [currentDimension, setCurrentDimension] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  if (!weekData) return null;

  const dimensions = ['Worship', 'Integrity', 'Service', 'Excellence'];
  const currentDim = dimensions[currentDimension];
  const questions = weekData.questions[currentDim] || [];
  const currentQ = questions[currentQuestion];
  const totalQuestions = Object.values(weekData.questions).flat().length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

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
      // Move to next dimension
      const nextDim = currentDimension + 1;
      setCurrentDimension(nextDim);
      setCurrentQuestion(0);
    } else {
      // All questions answered, calculate results
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else if (currentDimension > 0) {
      // Move to previous dimension
      const prevDim = currentDimension - 1;
      const prevQuestions = weekData.questions[dimensions[prevDim]] || [];
      setCurrentDimension(prevDim);
      setCurrentQuestion(prevQuestions.length - 1);
    }
  };

  const calculateResults = async () => {
    // Calculate average score for each dimension
    const dimensionScores = {};
    
    dimensions.forEach(dim => {
      const dimQuestions = weekData.questions[dim] || [];
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
      weekNumber,
      dimensionScores,
      FRIQ,
      impactLevel,
      impactDescription,
      weekTitle: weekData.title,
      weekTheme: weekData.theme
    };

    setResults(resultsData);
    
    // Save to localStorage and backend
    await saveAssessmentResult(weekNumber, resultsData);
    
    setShowResults(true);
    
    // Notify parent component
    if (onComplete) {
      onComplete(weekNumber, resultsData);
    }
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

  // Skip dimensions with no questions
  useEffect(() => {
    if (questions.length === 0 && currentDimension < dimensions.length - 1) {
      setCurrentDimension(prev => prev + 1);
      setCurrentQuestion(0);
    }
  }, [currentDimension, questions.length, dimensions.length]);

  // If no questions for current dimension, show loading
  if (questions.length === 0) {
    return null;
  }

  if (showResults && results) {
    return (
      <WeeklyResultsModal
        isOpen={isOpen}
        onClose={handleClose}
        results={results}
        onRestart={handleRestart}
      />
    );
  }

  if (!currentQ) {
    return null;
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
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
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">{weekData.title}</h2>
                    <p className="text-sm text-white/80 mt-1">Week {weekNumber} Assessment</p>
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
                  {dimensions.map((dim, idx) => {
                    const dimQuestions = weekData.questions[dim] || [];
                    const dimAnswered = dimQuestions.filter(q => answers[q.id] !== undefined).length;
                    const dimTotal = dimQuestions.length;
                    const isComplete = dimTotal > 0 && dimAnswered === dimTotal;
                    const isCurrent = idx === currentDimension;
                    
                    return (
                      <div
                        key={dim}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          isCurrent
                            ? 'bg-gold text-navy'
                            : isComplete
                            ? 'bg-white/30 text-white'
                            : 'bg-white/10 text-white/70'
                        }`}
                        title={`${dim}: ${dimAnswered}/${dimTotal}`}
                      >
                        {dim[0]} {dimTotal > 0 && `(${dimAnswered}/${dimTotal})`}
                      </div>
                    );
                  })}
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

export default WeeklyAssessment;


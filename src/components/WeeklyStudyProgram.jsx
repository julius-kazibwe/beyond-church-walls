import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WeeklyStudyContent from './WeeklyStudyContent';
import WeeklyAssessment from './WeeklyAssessment';
import WISEAssessmentModal from './WISEAssessmentModal';
import { 
  getWeekData, 
  getTotalWeeks
} from '../utils/weeklyContent';
import { 
  getProgress, 
  getCurrentWeek, 
  isWeekCompleted,
  getAssessmentResult,
  isBaselineCompleted,
  getBaselineFRIQ,
  saveBaselineAssessment
} from '../utils/progressTracker';

const WeeklyStudyProgram = ({ isOpen, onClose }) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showBaselineAssessment, setShowBaselineAssessment] = useState(false);
  const [progress, setProgress] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [baselineCompleted, setBaselineCompleted] = useState(false);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [weekData, setWeekData] = useState(null);
  const [allWeeksData, setAllWeeksData] = useState({});
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    // Load progress and weekly content on mount
    const loadData = async () => {
      setLoadingContent(true);
      const savedProgress = await getProgress();
      setProgress(savedProgress);
      // Ensure completedWeeks is always an array
      setCompletedWeeks(Array.isArray(savedProgress?.completedWeeks) ? savedProgress.completedWeeks : []);
      const week = await getCurrentWeek();
      setCurrentWeek(week);
      const baseline = await isBaselineCompleted();
      setBaselineCompleted(baseline);
      
      // Load all weekly content
      const { fetchWeeklyContent } = await import('../utils/weeklyContent');
      const allContent = await fetchWeeklyContent();
      setAllWeeksData(allContent);
      const total = Object.keys(allContent).length;
      setTotalWeeks(total);
      
      // Load initial week data
    if (week > 0) {
      setSelectedWeek(week);
        setWeekData(allContent[week] || null);
      } else if (total > 0) {
        setWeekData(allContent[1] || null);
    }
      
      setLoadingContent(false);
    };
    loadData();
  }, []);

  // Load week data when selectedWeek changes
  useEffect(() => {
    if (selectedWeek && allWeeksData[selectedWeek]) {
      setWeekData(allWeeksData[selectedWeek]);
    } else if (selectedWeek) {
      // Fallback: fetch if not in cache
      const loadWeekData = async () => {
        const data = await getWeekData(selectedWeek);
        setWeekData(data);
      };
      loadWeekData();
    }
    
    // Also load study questions to get reflection questions
    const loadStudyQuestions = async () => {
      if (selectedWeek) {
        const { getStudyQuestions } = await import('../utils/weeklyContent');
        const questions = await getStudyQuestions(selectedWeek);
        setStudyQuestionsData(questions);
      }
    };
    loadStudyQuestions();
  }, [selectedWeek, allWeeksData]);
  const [weekCompleted, setWeekCompleted] = useState(false);
  const [weekResult, setWeekResult] = useState(null);
  const [baselineFRIQ, setBaselineFRIQ] = useState(null);
  const [reflectionAnswers, setReflectionAnswers] = useState({});
  const [studyQuestionsData, setStudyQuestionsData] = useState(null);

  // Update week-specific data when selectedWeek changes
  useEffect(() => {
    const loadWeekData = async () => {
      if (selectedWeek) {
        const completed = await isWeekCompleted(selectedWeek);
        const result = await getAssessmentResult(selectedWeek);
        const baseline = await getBaselineFRIQ();
        setWeekCompleted(completed);
        setWeekResult(result);
        setBaselineFRIQ(baseline);
      }
    };
    loadWeekData();
  }, [selectedWeek]);

  const handleStartBaselineAssessment = () => {
    setShowBaselineAssessment(true);
  };

  const handleBaselineComplete = async (results) => {
    // Save baseline results
    await saveBaselineAssessment(results);
    // Refresh progress
    const updatedProgress = await getProgress();
    setProgress(updatedProgress);
    setCompletedWeeks(updatedProgress.completedWeeks || []);
    const week = await getCurrentWeek();
    setCurrentWeek(week);
    setBaselineCompleted(true);
    setSelectedWeek(1); // Start with Week 1 after baseline
    setShowBaselineAssessment(false);
  };

  // Load reflection answers when week changes
  useEffect(() => {
    if (selectedWeek) {
      const saved = localStorage.getItem(`week_${selectedWeek}_reflections`);
      if (saved) {
        try {
          setReflectionAnswers(JSON.parse(saved));
        } catch (e) {
          setReflectionAnswers({});
        }
      } else {
        setReflectionAnswers({});
      }
    }
  }, [selectedWeek]);

  // Listen for reflection answer changes (when user answers questions in WeeklyStudyContent)
  useEffect(() => {
    const handleReflectionChange = (e) => {
      // Reload reflection answers from localStorage
      const saved = localStorage.getItem(`week_${selectedWeek}_reflections`);
      if (saved) {
        try {
          setReflectionAnswers(JSON.parse(saved));
        } catch (e) {
          setReflectionAnswers({});
        }
      } else {
        setReflectionAnswers({});
      }
    };
    
    window.addEventListener('reflectionAnswerChanged', handleReflectionChange);
    
    return () => {
      window.removeEventListener('reflectionAnswerChanged', handleReflectionChange);
    };
  }, [selectedWeek]);

  // Check if all reflection questions are answered for the current week
  const checkReflectionQuestionsAnswered = () => {
    if (!weekData) return true; // If no week data, allow (shouldn't happen)
    
    // Get reflection questions from weekData or studyQuestionsData
    let reflectionQuestions = weekData.reflectionQuestions || [];
    
    // Fallback: try to get from studyQuestionsData (loaded separately)
    if (reflectionQuestions.length === 0 && studyQuestionsData) {
      reflectionQuestions = studyQuestionsData.reflectionQuestions || [];
    }
    
    if (reflectionQuestions.length === 0) {
      return true; // No reflection questions, allow assessment
    }
    
    // Check if all questions have non-empty answers
    const allAnswered = reflectionQuestions.every(q => {
      const questionId = q.id || `reflection-${reflectionQuestions.indexOf(q)}`;
      const answer = reflectionAnswers[questionId];
      return answer && typeof answer === 'string' && answer.trim().length > 0;
    });
    
    return allAnswered;
  };

  const handleStartAssessment = () => {
    // Check if reflection questions need to be answered
    if (!checkReflectionQuestionsAnswered()) {
      // Scroll to reflection questions section
      const reflectionSection = document.querySelector('[data-reflection-section]');
      if (reflectionSection) {
        reflectionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return; // Don't open assessment
    }
    
    setShowAssessment(true);
  };

  const handleAssessmentComplete = async (weekNumber, results) => {
    // Refresh progress
    const updatedProgress = await getProgress();
    setProgress(updatedProgress);
    setCompletedWeeks(updatedProgress.completedWeeks || []);
    const week = await getCurrentWeek();
    setCurrentWeek(week);
    // Update week-specific data
    const completed = await isWeekCompleted(selectedWeek);
    const result = await getAssessmentResult(selectedWeek);
    setWeekCompleted(completed);
    setWeekResult(result);
    setShowAssessment(false);
  };

  const handleWeekSelect = (weekNum) => {
    if (!baselineCompleted) return; // Can't select weeks without baseline
    setSelectedWeek(weekNum);
    setShowAssessment(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-navy to-blue-900 text-white p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                      10-Week Study Program
                    </h2>
                    <p className="text-white/80">
                      Join us on a transformative journey through <strong>Beyond Church Walls</strong>
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gold transition-colors p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-gold/10 via-white to-gold/10">
                <div className="max-w-7xl mx-auto">

                  {/* Baseline Assessment Requirement */}
                  {!baselineCompleted && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <div className="bg-gradient-to-r from-navy to-blue-900 text-white rounded-xl shadow-lg p-8 border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gold text-navy rounded-full flex items-center justify-center font-bold text-xl">
                            1
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">Before Week 1: Baseline Assessment</h3>
                            <p className="text-white/90 mb-4">
                              Take the Level 1 Assessment Test to establish your baseline FRIQ score. This will help you track your growth throughout the study program.
                            </p>
                            <button
                              onClick={handleStartBaselineAssessment}
                              className="px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              Start Baseline
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Baseline Results Display */}
                  {baselineCompleted && baselineFRIQ !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-green-800 mb-1">✓ Baseline Assessment Completed</h3>
                            <p className="text-green-700">Your baseline FRIQ score: <strong className="text-xl">{(baselineFRIQ * 100).toFixed(1)}</strong></p>
                          </div>
                          <button
                            onClick={handleStartBaselineAssessment}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                          >
                            Retake
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Week Navigation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                  >
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-navy mb-4">Select a Week</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
              {Array.from({ length: totalWeeks }, (_, i) => {
                const weekNum = i + 1;
                const weekInfo = allWeeksData[weekNum] || null;
                const isCompleted = completedWeeks.includes(weekNum);
                const isCurrent = weekNum === currentWeek;
                const isSelected = weekNum === selectedWeek;
                const isAvailable = weekInfo?.isAvailable !== false; // Default to true if not set
                const isLocked = !baselineCompleted || (weekNum > currentWeek && !isCompleted) || !isAvailable;

                return (
                  <button
                    key={weekNum}
                    onClick={() => !isLocked && handleWeekSelect(weekNum)}
                    disabled={isLocked}
                    className={`
                      relative px-4 py-3 rounded-lg font-semibold transition-all
                      ${isSelected 
                        ? 'bg-navy text-white shadow-lg scale-105' 
                        : isCompleted
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : isCurrent
                        ? 'bg-gold text-navy hover:bg-gold/80'
                        : !isAvailable
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : isLocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    title={
                      !isAvailable && weekInfo?.startDate
                        ? `Available starting ${formatDate(weekInfo.startDate)}`
                        : weekInfo && weekInfo.startDate
                        ? `${formatDate(weekInfo.startDate)} - ${formatDate(weekInfo.endDate)}`
                        : ''
                    }
                  >
                    Week {weekNum}
                    {weekInfo && weekInfo.startDate && (
                      <div className="text-xs mt-1 opacity-75">
                        {formatDate(weekInfo.startDate).split(',')[0]}
                      </div>
                    )}
                    {isCompleted && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                    {isCurrent && !isCompleted && isAvailable && (
                      <span className="absolute -top-1 -right-1 bg-gold text-navy rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        •
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

                  {/* Progress Overview */}
                  {progress && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-8"
                    >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-navy mb-4">Your Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Weeks Completed</span>
                    <span>{(Array.isArray(progress?.completedWeeks) ? progress.completedWeeks.length : 0)} / {totalWeeks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gold h-3 rounded-full transition-all duration-500"
                      style={{ width: `${((Array.isArray(progress?.completedWeeks) ? progress.completedWeeks.length : 0) / totalWeeks) * 100}%` }}
                    />
                  </div>
                </div>
                {weekResult && (
                  <div className="text-center px-4">
                    <div className="text-2xl font-bold text-navy">
                      {((weekResult.FRIQ || 0) * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-600">Week {selectedWeek} FRIQ</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

                  {/* Completion Message - Show after each week is completed */}
                  {baselineCompleted && progress && weekCompleted && weekData?.completionMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="mb-8"
                    >
                      <div className="bg-gradient-to-br from-gold via-yellow-400 to-gold rounded-xl shadow-2xl p-8 md:p-12 border-4 border-navy">
                        <div className="text-center">
                          <div className="mb-6">
                            <div className="inline-block bg-navy text-gold rounded-full w-20 h-20 flex items-center justify-center text-4xl font-bold mb-4 shadow-lg">
                              ✓
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                              {weekData.completionMessage.title || "Congratulations!"}
                            </h2>
                            <h3 className="text-2xl md:text-3xl font-bold text-navy mb-6">
                              Week {selectedWeek} Completed!
                            </h3>
                          </div>
                          
                          <div className="bg-white/90 rounded-lg p-6 md:p-8 mb-6 text-left max-w-3xl mx-auto">
                            <p className="text-lg md:text-xl text-gray-800 leading-relaxed">
                              {weekData.completionMessage.message || "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Week Content */}
                  {baselineCompleted ? (
                    <>
                      {/* Show message if week is not available yet */}
                      {weekData && weekData.isAvailable === false && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">⏸</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                This Week is Not Yet Available
                              </h3>
                              <p className="text-yellow-700">
                                {weekData.startDate 
                                  ? `This week will be available starting ${formatDate(weekData.startDate)}.`
                                  : 'This week will be available soon.'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
          {weekData ? (
            <div className="space-y-6">
              <WeeklyStudyContent weekNumber={selectedWeek} weekData={weekData} />
              
              {/* Assessment Button */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                {(() => {
                  // Get reflection questions from weekData or studyQuestionsData
                  let reflectionQuestions = weekData?.reflectionQuestions || [];
                  if (reflectionQuestions.length === 0 && studyQuestionsData) {
                    reflectionQuestions = studyQuestionsData.reflectionQuestions || [];
                  }
                  
                  const hasReflectionQuestions = reflectionQuestions.length > 0;
                  const allReflectionsAnswered = checkReflectionQuestionsAnswered();
                  const isWeekAvailable = weekData?.isAvailable !== false; // Default to true if not set
                  const canTakeAssessment = isWeekAvailable && (!hasReflectionQuestions || allReflectionsAnswered);
                  
                  return (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-navy mb-2">Week {selectedWeek} Assessment</h3>
                        {!isWeekAvailable ? (
                          <div className="space-y-2">
                            <p className="text-yellow-700 font-medium">
                              ⏸ This week is not yet available. The assessment will be accessible once the week starts.
                            </p>
                            {weekData?.startDate && (
                              <p className="text-gray-600 text-sm">
                                Available starting: {formatDate(weekData.startDate)}
                              </p>
                            )}
                          </div>
                        ) : !canTakeAssessment ? (
                          <div className="space-y-2">
                            <p className="text-orange-600 font-medium">
                              ⚠️ Please complete all Reflection/Discussion Questions before taking the assessment.
                            </p>
                            <p className="text-gray-600 text-sm">
                              Scroll up to find the Reflection/Discussion Questions section and provide answers to all questions.
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-600">
                              {weekCompleted 
                                ? "You've completed this week's assessment. You can retake it to see your progress."
                                : "Complete the WISE assessment to measure your growth in this week's focus areas."
                              }
                            </p>
                            {weekResult && (
                              <div className="mt-2 text-sm text-gray-600">
                                Last completed: {new Date(weekResult.completedAt).toLocaleDateString()}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        onClick={handleStartAssessment}
                        disabled={!canTakeAssessment}
                        className={`
                          px-8 py-4 rounded-lg font-semibold transition-all duration-200 text-lg shadow-lg
                          ${canTakeAssessment
                            ? 'bg-navy text-white hover:bg-blue-900 hover:shadow-xl transform hover:scale-105 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                          }
                        `}
                      >
                        {weekCompleted ? 'Retake' : 'Start Assessment'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-200 text-center">
              <p className="text-gray-600 text-lg">
                Week {selectedWeek} content is coming soon!
              </p>
            </div>
          )}
        </motion.div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-xl shadow-lg p-12 border border-gray-200 text-center"
                    >
                      <p className="text-gray-600 text-lg mb-4">
                        Please complete the baseline assessment to access the weekly study content.
                      </p>
                      <button
                        onClick={handleStartBaselineAssessment}
                        className="px-6 py-3 bg-navy text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                      >
                        Start Baseline
                      </button>
                    </motion.div>
                  )}

                </div>
              </div>

              {/* Baseline Assessment Modal */}
              <WISEAssessmentModal
                isOpen={showBaselineAssessment}
                onClose={() => setShowBaselineAssessment(false)}
                onComplete={handleBaselineComplete}
              />

              {/* Weekly Assessment Modal */}
              {weekData && baselineCompleted && (
                <WeeklyAssessment
                  isOpen={showAssessment}
                  onClose={() => setShowAssessment(false)}
                  weekNumber={selectedWeek}
                  weekData={weekData}
                  onComplete={handleAssessmentComplete}
                />
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WeeklyStudyProgram;


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WeeklyStudyContent from './WeeklyStudyContent';
import WISEAssessmentModal from './WISEAssessmentModal';
import { 
  getWeekData, 
  getTotalWeeks
} from '../utils/weeklyContent';
import { 
  getProgress, 
  getCurrentWeek, 
  isBaselineCompleted,
  getBaselineFRIQ,
  saveBaselineAssessment,
  isLevel2Completed,
  getLevel2FRIQ,
  saveLevel2Assessment,
  canTakeLevel2,
  isLevel3Completed,
  getLevel3FRIQ,
  saveLevel3Assessment,
  canTakeLevel3
} from '../utils/progressTracker';

const WeeklyStudyProgram = ({ isOpen, onClose }) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showBaselineAssessment, setShowBaselineAssessment] = useState(false);
  const [showLevel2Assessment, setShowLevel2Assessment] = useState(false);
  const [showLevel3Assessment, setShowLevel3Assessment] = useState(false);
  const [progress, setProgress] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [baselineCompleted, setBaselineCompleted] = useState(false);
  const [level2Completed, setLevel2Completed] = useState(false);
  const [level3Completed, setLevel3Completed] = useState(false);
  const [level2FRIQ, setLevel2FRIQ] = useState(null);
  const [level3FRIQ, setLevel3FRIQ] = useState(null);
  const [canTakeLevel2Assessment, setCanTakeLevel2Assessment] = useState(false);
  const [canTakeLevel3Assessment, setCanTakeLevel3Assessment] = useState(false);
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
      
      // Load Level 2 and Level 3 status
      const level2 = await isLevel2Completed();
      const level3 = await isLevel3Completed();
      const level2FRIQValue = await getLevel2FRIQ();
      const level3FRIQValue = await getLevel3FRIQ();
      const canLevel2 = await canTakeLevel2();
      const canLevel3 = await canTakeLevel3();
      setLevel2Completed(level2);
      setLevel3Completed(level3);
      setLevel2FRIQ(level2FRIQValue);
      setLevel3FRIQ(level3FRIQValue);
      setCanTakeLevel2Assessment(canLevel2);
      setCanTakeLevel3Assessment(canLevel3);
      
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
  const [baselineFRIQ, setBaselineFRIQ] = useState(null);
  const [reflectionAnswers, setReflectionAnswers] = useState({});
  const [studyQuestionsData, setStudyQuestionsData] = useState(null);

  // Update week-specific data when selectedWeek changes
  useEffect(() => {
    const loadWeekData = async () => {
      if (selectedWeek) {
        const baseline = await getBaselineFRIQ();
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

  const handleStartLevel2Assessment = () => {
    setShowLevel2Assessment(true);
  };

  const handleLevel2Complete = async (results) => {
    await saveLevel2Assessment(results);
    const updatedProgress = await getProgress();
    setProgress(updatedProgress);
    const level2FRIQValue = await getLevel2FRIQ();
    setLevel2FRIQ(level2FRIQValue);
    setLevel2Completed(true);
    setShowLevel2Assessment(false);
  };

  const handleStartLevel3Assessment = () => {
    setShowLevel3Assessment(true);
  };

  const handleLevel3Complete = async (results) => {
    await saveLevel3Assessment(results);
    const updatedProgress = await getProgress();
    setProgress(updatedProgress);
    const level3FRIQValue = await getLevel3FRIQ();
    setLevel3FRIQ(level3FRIQValue);
    setLevel3Completed(true);
    setShowLevel3Assessment(false);
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


  const handleWeekSelect = (weekNum) => {
    if (!baselineCompleted) return; // Can't select weeks without baseline
    setSelectedWeek(weekNum);
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
                      <div className="bg-navy text-white rounded-xl shadow-lg p-8 border border-gray-200">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">Before Week 1: Baseline Assessment</h3>
                          <p className="text-white/90 mb-4">
                            Take the Level 1 Assessment Test to establish your baseline FRIQ score. This will help you track your growth throughout the study program.
                          </p>
                          <button
                            onClick={handleStartBaselineAssessment}
                            className="px-6 py-3 bg-white text-navy rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Start Baseline
                          </button>
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
                            <h3 className="text-lg font-bold text-green-800 mb-1">✓ Level 1: Baseline Assessment Completed</h3>
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

                  {/* Level 2 Assessment - After Week 5 */}
                  {baselineCompleted && canTakeLevel2Assessment && !level2Completed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <div className="bg-blue-600 text-white rounded-xl shadow-lg p-8 border border-gray-200">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">After Week 5: Level 2 Assessment</h3>
                          <p className="text-white/90 mb-4">
                            Take the Level 2 Assessment to measure your progress. This assessment uses more advanced questions to evaluate your growth in the WISE Framework.
                          </p>
                          <button
                            onClick={handleStartLevel2Assessment}
                            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Start Level 2 Assessment
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Level 2 Results Display */}
                  {level2Completed && level2FRIQ !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-blue-800 mb-1">✓ Level 2: Mid-Program Assessment Completed</h3>
                            <p className="text-blue-700">Your Level 2 FRIQ score: <strong className="text-xl">{(level2FRIQ * 100).toFixed(1)}</strong></p>
                            {baselineFRIQ !== null && (
                              <p className="text-blue-600 text-sm mt-1">
                                Change from baseline: {((level2FRIQ - baselineFRIQ) * 100).toFixed(1)} points
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleStartLevel2Assessment}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                          >
                            Retake
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Level 3 Assessment - After Week 10 */}
                  {baselineCompleted && canTakeLevel3Assessment && !level3Completed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <div className="bg-blue-700 text-white rounded-xl shadow-lg p-8 border border-gray-200">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">After Week 10: Level 3 Final FRIQ Assessment</h3>
                          <p className="text-white/90 mb-4">
                            Take the final Level 3 Assessment to measure your complete transformation. This assessment uses the most advanced questions to evaluate your Kingdom impact and final FRIQ score.
                          </p>
                          <button
                            onClick={handleStartLevel3Assessment}
                            className="px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Start Final FRIQ Assessment
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Level 3 Results Display */}
                  {level3Completed && level3FRIQ !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-blue-800 mb-1">✓ Level 3: Final FRIQ Assessment Completed</h3>
                            <p className="text-blue-700">Your Final FRIQ score: <strong className="text-xl">{(level3FRIQ * 100).toFixed(1)}</strong></p>
                            {baselineFRIQ !== null && (
                              <p className="text-blue-600 text-sm mt-1">
                                Total growth from baseline: {((level3FRIQ - baselineFRIQ) * 100).toFixed(1)} points
                              </p>
                            )}
                            {level2FRIQ !== null && (
                              <p className="text-blue-600 text-sm">
                                Change from Level 2: {((level3FRIQ - level2FRIQ) * 100).toFixed(1)} points
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleStartLevel3Assessment}
                            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-semibold"
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

              {/* Baseline Assessment Modal (Level 1) */}
              <WISEAssessmentModal
                isOpen={showBaselineAssessment}
                onClose={() => setShowBaselineAssessment(false)}
                onComplete={handleBaselineComplete}
                level={1}
              />

              {/* Level 2 Assessment Modal */}
              <WISEAssessmentModal
                isOpen={showLevel2Assessment}
                onClose={() => setShowLevel2Assessment(false)}
                onComplete={handleLevel2Complete}
                level={2}
              />

              {/* Level 3 Assessment Modal (Final FRIQ) */}
              <WISEAssessmentModal
                isOpen={showLevel3Assessment}
                onClose={() => setShowLevel3Assessment(false)}
                onComplete={handleLevel3Complete}
                level={3}
              />

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WeeklyStudyProgram;


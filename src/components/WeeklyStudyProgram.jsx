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
  const [selectedAssessmentLevel, setSelectedAssessmentLevel] = useState('1');
  const [hasManualAssessmentSelection, setHasManualAssessmentSelection] = useState(false);
  const [showAssessmentDetails, setShowAssessmentDetails] = useState(false);
  const [showWeekList, setShowWeekList] = useState(false);

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

  const formatFRIQScore = (score) => {
    if (typeof score !== 'number' || Number.isNaN(score)) return null;
    return (score * 100).toFixed(1);
  };

  const assessmentOptions = [
    {
      value: '1',
      title: 'Level 1 • Determine Baseline FRIQ',
      description: 'Start here. This unlocks the 10-week study guide and saves your starting score.',
      available: true,
      completed: baselineCompleted,
      score: formatFRIQScore(baselineFRIQ),
      lockedReason: '',
      helperText: 'Required before you can open the weekly lessons.',
      activationWeek: 0, // Always available
    },
    {
      value: '2',
      title: 'Level 2 • Midpoint Assessment',
      description: 'Re-check your FRIQ after Week 5 to measure how you are growing.',
      available: baselineCompleted && currentWeek >= 5 && (canTakeLevel2Assessment || level2Completed),
      completed: level2Completed,
      score: formatFRIQScore(level2FRIQ),
      lockedReason: !baselineCompleted
        ? 'Complete Level 1 first.'
        : currentWeek < 5
        ? 'Unlocks when you reach Week 5.'
        : !canTakeLevel2Assessment && !level2Completed
        ? 'Unlocks after Week 5 is completed.'
        : '',
      helperText: 'Shows how far you have come halfway through the study.',
      activationWeek: 5,
    },
    {
      value: '3',
      title: 'Level 3 • Final FRIQ Assessment',
      description: 'Celebrate your transformation after Week 10 and capture your final score.',
      available:
        baselineCompleted &&
        currentWeek >= 10 &&
        (canTakeLevel3Assessment || level3Completed),
      completed: level3Completed,
      score: formatFRIQScore(level3FRIQ),
      lockedReason: !baselineCompleted
        ? 'Complete Level 1 first.'
        : currentWeek < 10
        ? 'Unlocks when you reach Week 10.'
        : !level2Completed
        ? 'Finish Level 2 before taking the final assessment.'
        : !canTakeLevel3Assessment && !level3Completed
        ? 'Unlocks after Week 10 is completed.'
        : '',
      helperText: 'Confirms your final FRIQ and the impact of the full journey.',
      activationWeek: 10,
    },
  ];

  const selectedAssessment =
    assessmentOptions.find((option) => option.value === selectedAssessmentLevel) ||
    assessmentOptions[0];

  const getAssessmentStatusLabel = (option) => {
    if (option.completed && option.score) {
      return `Completed · ${option.score} FRIQ`;
    }
    if (option.completed) {
      return 'Completed';
    }
    if (!option.available) {
      return option.lockedReason || 'Locked';
    }
    return 'Ready';
  };

  const handleAssessmentStart = () => {
    if (!selectedAssessment?.available) return;
    if (selectedAssessmentLevel === '1') {
      handleStartBaselineAssessment();
    } else if (selectedAssessmentLevel === '2') {
      handleStartLevel2Assessment();
    } else if (selectedAssessmentLevel === '3') {
      handleStartLevel3Assessment();
    }
  };

  const baselineUnlockedWeekValue = baselineCompleted ? String(selectedWeek) : '';
  const isLevel2AccessWindow =
    baselineCompleted && currentWeek >= 5 && (canTakeLevel2Assessment || level2Completed);
  const isLevel3AccessWindow =
    baselineCompleted && currentWeek >= 10 && (canTakeLevel3Assessment || level3Completed);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  useEffect(() => {
    if (hasManualAssessmentSelection) {
      return;
    }
    if (!baselineCompleted) {
      setSelectedAssessmentLevel('1');
      return;
    }
    if (isLevel3AccessWindow) {
      setSelectedAssessmentLevel('3');
      return;
    }
    if (isLevel2AccessWindow) {
      setSelectedAssessmentLevel('2');
      return;
    }
    setSelectedAssessmentLevel('1');
  }, [
    baselineCompleted,
    isLevel2AccessWindow,
    isLevel3AccessWindow,
    hasManualAssessmentSelection,
  ]);


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

                  {/* Quick Navigation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Step 1 */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gold">Step 1</p>
                              <h3 className="text-lg font-bold text-navy">Determine FRIQ Level</h3>
                            </div>
                            <button
                              onClick={() => setShowAssessmentDetails((prev) => !prev)}
                              className="text-sm text-navy underline hover:text-gold"
                            >
                              {showAssessmentDetails ? 'Hide details' : 'Show details'}
                            </button>
                          </div>
                          <select
                            id="assessment-select"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-gold focus:border-gold transition disabled:bg-gray-100 disabled:text-gray-500"
                            value={selectedAssessmentLevel}
                            onChange={(e) => {
                              setHasManualAssessmentSelection(true);
                              setSelectedAssessmentLevel(e.target.value);
                            }}
                          >
                            {assessmentOptions.map((option) => (
                              <option 
                                key={option.value} 
                                value={option.value}
                                disabled={!option.available}
                              >
                                {option.title}
                                {option.completed && option.score ? ` • ${option.score} FRIQ` : ''}
                                {!option.available && option.activationWeek > 0 ? ` (Unlocks at Week ${option.activationWeek})` : ''}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleAssessmentStart}
                              disabled={!selectedAssessment?.available}
                              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                selectedAssessment?.available
                                  ? 'bg-navy text-white hover:bg-blue-900 shadow-md hover:shadow-lg'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {selectedAssessment?.completed ? 'Retake Assessment' : 'Start Assessment'}
                            </button>
                            <div className="text-sm text-gray-600">
                              <p className="font-semibold text-navy">{getAssessmentStatusLabel(selectedAssessment)}</p>
                              {selectedAssessment?.helperText && (
                                <p className="text-xs mt-1">{selectedAssessment.helperText}</p>
                              )}
                              {!selectedAssessment?.available && selectedAssessment?.lockedReason && (
                                <p className="text-xs text-red-500 mt-1">{selectedAssessment.lockedReason}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gold">Step 2</p>
                              <h3 className="text-lg font-bold text-navy">10 Week Study Guide</h3>
                            </div>
                            <button
                              onClick={() => setShowWeekList((prev) => !prev)}
                              className="text-sm text-navy underline hover:text-gold"
                            >
                              {showWeekList ? 'Hide all weeks' : 'Show all weeks'}
                            </button>
                          </div>
                          <select
                            id="week-select"
                            value={baselineUnlockedWeekValue}
                            disabled={!baselineCompleted}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (!Number.isNaN(value)) {
                                handleWeekSelect(value);
                              }
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-gold focus:border-gold transition disabled:bg-gray-100 disabled:text-gray-500"
                          >
                            <option value="" disabled>
                              {baselineCompleted ? 'Select a week' : 'Finish Level 1 to unlock weeks'}
                            </option>
                            {Array.from({ length: totalWeeks }, (_, i) => {
                              const weekNum = i + 1;
                              const weekInfo = allWeeksData[weekNum] || null;
                              const isCompleted = completedWeeks.includes(weekNum);
                              const isCurrent = weekNum === currentWeek;
                              const isAvailable = weekInfo?.isAvailable !== false;
                              const isLocked = !baselineCompleted || (weekNum > currentWeek && !isCompleted) || !isAvailable;

                              return (
                                <option key={weekNum} value={weekNum} disabled={isLocked}>
                                  {`Week ${weekNum}${isCompleted ? ' • Completed' : isCurrent ? ' • Current' : ''}${
                                    !isAvailable ? ' • Coming Soon' : ''
                                  }`}
                                </option>
                              );
                            })}
                          </select>
                          <div className="text-sm text-gray-600 bg-navy/5 border border-navy/10 rounded-lg p-4">
                            <p className="font-semibold text-navy mb-1">
                              {baselineCompleted ? `Currently viewing Week ${selectedWeek}` : 'Unlock weeks by finishing Level 1'}
                            </p>
                            <p>
                              Your responses are saved automatically. Need a PDF? Download from the dashboard any time.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Optional details */}
                      {showAssessmentDetails && (
                        <div className="grid gap-4 md:grid-cols-3 mt-6">
                          {assessmentOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`border rounded-lg p-4 ${
                                selectedAssessmentLevel === option.value ? 'border-navy shadow-md' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-500">Level {option.value}</p>
                                  <h4 className="font-semibold text-navy">
                                    {option.title.split('•')[1]?.trim() || option.title}
                                  </h4>
                                </div>
                                {option.completed && (
                                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-2">{option.description}</p>
                              <p className="text-sm font-semibold text-gray-800 mt-3">
                                Status: {getAssessmentStatusLabel(option)}
                              </p>
                              {!option.available && option.lockedReason && (
                                <p className="text-xs text-red-500 mt-1">{option.lockedReason}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {showWeekList && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3 mt-6">
                          {Array.from({ length: totalWeeks }, (_, i) => {
                            const weekNum = i + 1;
                            const weekInfo = allWeeksData[weekNum] || null;
                            const isCompleted = completedWeeks.includes(weekNum);
                            const isCurrent = weekNum === currentWeek;
                            const isSelected = weekNum === selectedWeek;
                            const isAvailable = weekInfo?.isAvailable !== false;
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
                      )}
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
                      {((isLevel2AccessWindow && !level2Completed) || (isLevel3AccessWindow && !level3Completed)) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6"
                        >
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-blue-700">
                                {isLevel3AccessWindow && !level3Completed
                                  ? 'You have unlocked the Level 3 Final FRIQ Assessment.'
                                  : 'You have unlocked the Level 2 Midpoint Assessment.'}
                              </p>
                              <p className="text-sm text-blue-600">
                                {isLevel3AccessWindow && !level3Completed
                                  ? 'Capture your final score now that you are in Week 10.'
                                  : 'Measure your growth now that you have reached Week 5.'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  const levelToStart = isLevel3AccessWindow && !level3Completed ? '3' : '2';
                                  setSelectedAssessmentLevel(levelToStart);
                                  setHasManualAssessmentSelection(true);
                                  if (levelToStart === '3') {
                                    handleStartLevel3Assessment();
                                  } else {
                                    handleStartLevel2Assessment();
                                  }
                                }}
                                className="px-5 py-2 bg-navy text-white rounded-lg font-semibold hover:bg-blue-900 transition"
                              >
                                {isLevel3AccessWindow && !level3Completed
                                  ? 'Start Level 3 Assessment'
                                  : 'Start Level 2 Assessment'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowAssessmentDetails(true);
                                }}
                                className="text-sm text-blue-700 underline hover:text-blue-900"
                              >
                                View details
                              </button>
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


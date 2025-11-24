import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStudyQuestions } from '../utils/weeklyContent';
import { markWeekComplete, isWeekCompleted } from '../utils/progressTracker';

const WeeklyStudyContent = ({ weekNumber, weekData }) => {
  const [reflectionAnswers, setReflectionAnswers] = useState({});
  const [studyAnswers, setStudyAnswers] = useState({});
  const [practicalApplication, setPracticalApplication] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Load saved answers from localStorage and check completion status
  useEffect(() => {
    if (weekNumber) {
      const saved = localStorage.getItem(`week_${weekNumber}_reflections`);
      if (saved) {
        try {
          setReflectionAnswers(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading reflections:', e);
        }
      }
      
      const savedStudy = localStorage.getItem(`week_${weekNumber}_study`);
      if (savedStudy) {
        try {
          setStudyAnswers(JSON.parse(savedStudy));
        } catch (e) {
          console.error('Error loading study answers:', e);
        }
      }
      
      const savedApp = localStorage.getItem(`week_${weekNumber}_practical`);
      if (savedApp) {
        setPracticalApplication(savedApp);
      }
      
      // Check if week is already completed
      const checkCompletion = async () => {
        const completed = await isWeekCompleted(weekNumber);
        setIsCompleted(completed);
      };
      checkCompletion();
    }
  }, [weekNumber]);

  // Save reflection answers
  const handleReflectionChange = (questionId, value) => {
    const updated = { ...reflectionAnswers, [questionId]: value };
    setReflectionAnswers(updated);
    localStorage.setItem(`week_${weekNumber}_reflections`, JSON.stringify(updated));
    
    // Dispatch custom event to notify parent component
    window.dispatchEvent(new CustomEvent('reflectionAnswerChanged', { 
      detail: { weekNumber, questionId, value } 
    }));
  };

  // Save study question answers
  const handleStudyChange = (questionId, value) => {
    const updated = { ...studyAnswers, [questionId]: value };
    setStudyAnswers(updated);
    localStorage.setItem(`week_${weekNumber}_study`, JSON.stringify(updated));
    
    // Dispatch custom event to notify parent component
    window.dispatchEvent(new CustomEvent('studyAnswerChanged', { 
      detail: { weekNumber, questionId, value } 
    }));
  };

  // Save practical application
  const handlePracticalChange = (value) => {
    setPracticalApplication(value);
    localStorage.setItem(`week_${weekNumber}_practical`, value);
  };

  // Check if all sections have content
  const hasAllContent = () => {
    const studyQuestionsCount = studyQuestions?.studyQuestions?.length || 0;
    const reflectionQuestionsCount = studyQuestions?.reflectionQuestions?.length || 0;
    
    const studyAnswersCount = Object.keys(studyAnswers).filter(key => studyAnswers[key]?.trim()).length;
    const reflectionAnswersCount = Object.keys(reflectionAnswers).filter(key => reflectionAnswers[key]?.trim()).length;
    const hasPractical = practicalApplication.trim().length > 0;
    
    // If there are no questions, only require practical application
    if (studyQuestionsCount === 0 && reflectionQuestionsCount === 0) {
      return hasPractical;
    }
    
    // Otherwise, require all sections to be completed
    return studyAnswersCount >= studyQuestionsCount && 
           reflectionAnswersCount >= reflectionQuestionsCount && 
           hasPractical;
  };

  // Handle marking week as complete
  const handleMarkComplete = async () => {
    setIsMarkingComplete(true);
    try {
      await markWeekComplete(weekNumber);
      setIsCompleted(true);
      // Dispatch event to notify parent component
      window.dispatchEvent(new CustomEvent('weekCompleted', { 
        detail: { weekNumber } 
      }));
    } catch (error) {
      console.error('Error marking week as complete:', error);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  if (!weekData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Week {weekNumber} content is not available yet.</p>
      </div>
    );
  }

  const [studyQuestions, setStudyQuestions] = useState(null);

  useEffect(() => {
    const loadStudyQuestions = async () => {
      if (weekNumber) {
        // First, check if weekData already has the questions
        if (weekData && (weekData.studyQuestions || weekData.reflectionQuestions)) {
          const questions = {
            studyQuestions: Array.isArray(weekData.studyQuestions) ? weekData.studyQuestions : [],
            reflectionQuestions: Array.isArray(weekData.reflectionQuestions) ? weekData.reflectionQuestions : []
          };
          setStudyQuestions(questions);
        } else {
          // Fallback: load from API
          try {
            const questions = await getStudyQuestions(weekNumber);
            setStudyQuestions(questions);
          } catch (error) {
            console.error('Error loading study questions:', error);
            setStudyQuestions({ studyQuestions: [], reflectionQuestions: [] });
          }
        }
      }
    };
    loadStudyQuestions();
  }, [weekNumber, weekData]);

  return (
    <div className="space-y-8">
      {/* Week Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-navy to-blue-900 text-white rounded-xl p-8"
      >
        <div className="text-sm font-semibold text-white/80 mb-2">Week {weekNumber}</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{weekData.title}</h2>
        {weekData.theme && (
          <p className="text-lg text-white/90 mb-4">{weekData.theme}</p>
        )}
        {weekData.learningObjective && (
          <div className="bg-white/10 rounded-lg p-4 mt-4">
            <div className="text-sm font-semibold mb-2">Learning Objective:</div>
            <p className="text-white/90">{weekData.learningObjective}</p>
          </div>
        )}
        {weekData.keyScripture && (
          <div className="bg-gold/20 border-2 border-gold/40 rounded-lg p-6 mt-4 shadow-lg">
            <div className="text-sm font-bold text-gold mb-3 uppercase tracking-wide">Key Scripture</div>
            <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed italic">
              "{weekData.keyScripture.split(' - ')[1] || weekData.keyScripture}"
            </p>
            {weekData.keyScripture.includes(' - ') && (
              <p className="text-gold text-sm font-semibold mt-3">
                — {weekData.keyScripture.split(' - ')[0]}
              </p>
            )}
          </div>
        )}
        {weekData.startDate && weekData.endDate && (
          <div className="bg-white/10 rounded-lg p-4 mt-4">
            <div className="text-sm font-semibold mb-2">Study Period:</div>
            <p className="text-white">
              {new Date(weekData.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(weekData.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        )}
      </motion.div>

      {/* Study Questions */}
      {studyQuestions && studyQuestions.studyQuestions && studyQuestions.studyQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gold/10 to-navy/5 rounded-xl p-6 md:p-8 border-2 border-gold/30"
        >
          <h3 className="text-2xl font-bold text-navy mb-4">Study Questions</h3>
          <p className="text-gray-700 mb-6">
            Reflect on these questions as you study this week's content. Write your answers below.
          </p>
          <ol className="space-y-6">
            {studyQuestions.studyQuestions.map((q, idx) => {
              const questionId = q.id || `study-${idx}`;
              const questionText = q.question || q;
              return (
                <li key={questionId} className="bg-white/50 rounded-lg p-4">
                  <div className="flex gap-4 mb-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-gray-800 font-medium leading-relaxed flex-1">{questionText}</p>
                  </div>
                  <div className="border-t-2 border-dashed border-gray-300 pt-3">
                    <textarea
                      value={studyAnswers[questionId] || ''}
                      onChange={(e) => handleStudyChange(questionId, e.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full min-h-[60px] bg-transparent border-none outline-none resize-none text-gray-800 placeholder:text-gray-500 placeholder:italic focus:placeholder:text-gray-400"
                      rows={3}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </motion.div>
      )}

      {/* Reflection/Discussion Questions */}
      {studyQuestions && studyQuestions.reflectionQuestions && studyQuestions.reflectionQuestions.length > 0 && (
        <motion.div
          data-reflection-section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gold/10 to-navy/5 rounded-xl p-6 md:p-8 border-2 border-gold/30"
        >
          <h3 className="text-xl font-bold text-navy mb-4">Reflection / Discussion Questions</h3>
          <p className="text-gray-700 mb-6">
            Take time to reflect on these questions. Consider sharing your insights with your group or mentor.
          </p>
          <ul className="space-y-6">
            {studyQuestions.reflectionQuestions.map((q, idx) => {
              const questionId = q.id || `reflection-${idx}`;
              const questionText = q.question || q;
              return (
                <li key={questionId} className="bg-white/50 rounded-lg p-4">
                  <p className="text-gray-800 font-medium mb-3">{questionText}</p>
                  <div className="border-t-2 border-dashed border-gray-300 pt-3">
                    <textarea
                      value={reflectionAnswers[questionId] || ''}
                      onChange={(e) => handleReflectionChange(questionId, e.target.value)}
                      placeholder="Write your reflection here..."
                      className="w-full min-h-[60px] bg-transparent border-none outline-none resize-none text-gray-800 placeholder:text-gray-500 placeholder:italic focus:placeholder:text-gray-400"
                      rows={3}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}

      {/* Practical Application */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-navy mb-4">Practical Application</h3>
        <p className="text-gray-700 mb-4">
          {weekData.practicalApplications && Array.isArray(weekData.practicalApplications) && weekData.practicalApplications.length > 0
            ? weekData.practicalApplications[0].prompt || 'Apply this week\'s lessons to your daily work.'
            : 'Apply this week\'s lessons to your daily work. Reflect on how you can integrate faith into your workplace.'
          }
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[120px] bg-gray-50">
          <textarea
            value={practicalApplication}
            onChange={(e) => handlePracticalChange(e.target.value)}
            placeholder="Write your practical application here..."
            className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-gray-800 placeholder:text-gray-500 placeholder:italic placeholder:text-sm focus:placeholder:text-gray-400"
            rows={5}
          />
        </div>
      </motion.div>

      {/* Completion Section */}
      {isCompleted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-green-50 border-2 border-green-200 rounded-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-800">
                {weekData.completionMessage?.title || 'Week Complete'}
              </h3>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-gold/30"
        >
          <div className="text-center">
            {!hasAllContent() && (
              <p className="text-sm text-gray-600 mb-4">Complete all sections to finish this week.</p>
            )}
            <button
              onClick={handleMarkComplete}
              disabled={!hasAllContent() || isMarkingComplete}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                hasAllContent() && !isMarkingComplete
                  ? 'bg-gold text-navy hover:bg-yellow-500 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isMarkingComplete ? 'Marking Complete...' : 'Mark Week as Complete'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Study Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-gold/10 to-navy/5 rounded-xl p-6 md:p-8 border-2 border-gold/30"
      >
        <h3 className="text-xl font-bold text-navy mb-4">How to Use This Week's Study</h3>
        <ol className="space-y-3 text-gray-700 list-decimal list-inside">
          <li>Read the Key Scripture and Summary</li>
          <li>Answer the Study Questions thoughtfully (your answers are saved automatically)</li>
          <li>Complete the Reflection/Discussion Questions (your answers are saved automatically)</li>
          <li>Write your Practical Application (saved automatically)</li>
          <li>Apply the principles to your work life throughout the week</li>
        </ol>
      </motion.div>
    </div>
  );
};

export default WeeklyStudyContent;


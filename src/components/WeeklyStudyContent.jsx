import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStudyQuestions } from '../utils/weeklyContent';

const WeeklyStudyContent = ({ weekNumber, weekData }) => {
  const [reflectionAnswers, setReflectionAnswers] = useState({});
  const [practicalApplication, setPracticalApplication] = useState('');

  // Load saved answers from localStorage
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
      
      const savedApp = localStorage.getItem(`week_${weekNumber}_practical`);
      if (savedApp) {
        setPracticalApplication(savedApp);
      }
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

  // Save practical application
  const handlePracticalChange = (value) => {
    setPracticalApplication(value);
    localStorage.setItem(`week_${weekNumber}_practical`, value);
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
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
        >
          <h3 className="text-2xl font-bold text-navy mb-4">Study Questions</h3>
          <p className="text-gray-600 mb-6">
            Reflect on these questions as you study this week's content. Consider writing your answers in a journal or discussing them with your group.
          </p>
          <ol className="space-y-4">
            {studyQuestions.studyQuestions.map((q, idx) => (
              <li key={q.id || idx} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">{q.question || q}</p>
                </div>
              </li>
            ))}
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
          {weekNumber === 1 
            ? "Write a short 'Work as Worship' declaration for your current role."
            : "Share one example of living out faith naturally in your workplace."
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

      {/* Study Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gold/10 to-navy/5 rounded-xl p-6 md:p-8 border-2 border-gold/30"
      >
        <h3 className="text-xl font-bold text-navy mb-4">How to Use This Week's Study</h3>
        <ol className="space-y-3 text-gray-700 list-decimal list-inside">
          <li>Read the Key Scripture and Summary</li>
          <li>Reflect on the Study Questions and answer them thoughtfully</li>
          <li>Complete the Reflection/Discussion Questions</li>
          <li>Write your Practical Application</li>
          <li>Apply the principles to your work life throughout the week</li>
          <li>Complete the WISE assessment at the end of the week</li>
          <li>Review your results and identify areas for growth</li>
        </ol>
      </motion.div>

      {/* Assessment Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-navy mb-4">WISE Assessment Preview</h3>
        <p className="text-gray-700 mb-4">
          After completing this week's study and reflection, you'll take a WISE assessment with questions aligned to this week's theme. The assessment will measure your growth in:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(weekData.questions).map((dimension) => {
            const questions = weekData.questions[dimension] || [];
            if (questions.length === 0) return null;
            
            return (
              <div
                key={dimension}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="font-semibold text-navy mb-2">{dimension}</div>
                <div className="text-sm text-gray-600">
                  {questions.length} assessment question{questions.length !== 1 ? 's' : ''} this week
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default WeeklyStudyContent;


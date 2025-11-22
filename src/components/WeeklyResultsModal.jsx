import { motion, AnimatePresence } from 'framer-motion';

const WeeklyResultsModal = ({ isOpen, onClose, results, onRestart }) => {
  if (!results) return null;

  const { dimensionScores, FRIQ, impactLevel, impactDescription, weekNumber, weekTitle, weekTheme } = results;

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getFRIQColor = (friq) => {
    if (friq >= 0.76) return 'text-green-600';
    if (friq >= 0.51) return 'text-blue-600';
    if (friq >= 0.31) return 'text-yellow-600';
    if (friq >= 0.16) return 'text-orange-600';
    return 'text-red-600';
  };

  const getImpactColor = (level) => {
    if (level.includes('Christlike') || level.includes('Transformational')) return 'bg-green-100 text-green-800 border-green-300';
    if (level.includes('Influential') || level.includes('Consistent')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (level.includes('Emerging') || level.includes('Developing')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  const dimensions = [
    { key: 'Worship', letter: 'W', description: 'Living with continual awareness of God\'s presence in your work' },
    { key: 'Integrity', letter: 'I', description: 'Honesty, moral consistency, and private obedience that matches public witness' },
    { key: 'Service', letter: 'S', description: 'Serving others with compassion, humility, and generosity' },
    { key: 'Excellence', letter: 'E', description: 'Pursuing quality, diligence, growth, and mastery as unto the Lord' }
  ];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-navy to-blue-900 text-white p-6 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">Week {weekNumber} Results</h2>
                    <p className="text-sm text-white/80 mt-1">{weekTitle}</p>
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

              {/* Content */}
              <div className="p-6 md:p-8 space-y-8">
                {/* FRIQ Score */}
                <div className="text-center bg-gradient-to-br from-gold/10 to-navy/5 rounded-xl p-8 border-2 border-gold/30">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Week {weekNumber} FRIQ Score</div>
                  <div className={`text-6xl md:text-7xl font-bold mb-4 ${getFRIQColor(FRIQ)}`}>
                    {(FRIQ * 100).toFixed(1)}
                  </div>
                  <div className="text-2xl font-semibold text-navy mb-2">FRIQ Score</div>
                  <div className="text-sm text-gray-600">
                    FRIQ = W × I × S × E = {(dimensionScores.Worship || 0).toFixed(2)} × {(dimensionScores.Integrity || 0).toFixed(2)} × {(dimensionScores.Service || 0).toFixed(2)} × {(dimensionScores.Excellence || 0).toFixed(2)}
                  </div>
                </div>

                {/* Impact Level */}
                <div className={`border-2 rounded-xl p-6 ${getImpactColor(impactLevel)}`}>
                  <div className="text-sm font-semibold mb-2">Your Impact Level</div>
                  <div className="text-2xl md:text-3xl font-bold mb-3">{impactLevel}</div>
                  <div className="text-base leading-relaxed">{impactDescription}</div>
                </div>

                {/* Dimension Scores */}
                <div>
                  <h3 className="text-xl font-bold text-navy mb-4">Your WISE Dimension Scores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dimensions.map((dim) => {
                      const score = dimensionScores[dim.key] || 0;
                      const percentage = (score * 100).toFixed(1);
                      return (
                        <motion.div
                          key={dim.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gold/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-3xl font-bold text-gold mb-1">{dim.letter}</div>
                              <div className="text-lg font-semibold text-navy">{dim.key}</div>
                            </div>
                            <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                              {percentage}%
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">{dim.description}</div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-3 rounded-full ${
                                score >= 0.8 ? 'bg-green-500' :
                                score >= 0.6 ? 'bg-blue-500' :
                                score >= 0.4 ? 'bg-yellow-500' :
                                'bg-orange-500'
                              }`}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Score: {score.toFixed(2)} / 1.0
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Week Theme Reflection */}
                {weekTheme && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-navy mb-3">Week {weekNumber} Theme: {weekTheme}</h3>
                    <p className="text-gray-700">
                      Reflect on how your scores relate to this week's theme. Consider what areas showed growth and what areas need continued focus in the coming week.
                    </p>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-gradient-to-br from-gold/10 to-navy/5 rounded-xl p-6 border-2 border-gold/30">
                  <h3 className="text-lg font-bold text-navy mb-3">Next Steps</h3>
                  <p className="text-gray-700 mb-4">
                    Continue to the next week's study, focusing on areas where you can grow. Remember, your FRIQ is a product of all four dimensions, so growth in any area will multiply your overall impact.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 flex items-center justify-center gap-4">
                <button
                  onClick={onRestart}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Retake Assessment
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors font-semibold"
                >
                  Continue to Next Week
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WeeklyResultsModal;


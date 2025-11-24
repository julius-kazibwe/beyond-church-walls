import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetch } from '../utils/auth';
import { getTotalWeeks } from '../utils/weeklyContent';

const UserDashboard = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [totalWeeks, setTotalWeeks] = useState(0);

  useEffect(() => {
    if (isOpen && user) {
      loadProgress();
      loadTotalWeeks();
    }
  }, [isOpen, user]);

  const loadTotalWeeks = async () => {
    const total = await getTotalWeeks();
    setTotalWeeks(total);
  };

  const loadProgress = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.PROGRESS);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setProgress(data.progress);
        } else {
          const text = await response.text();
          console.error('Expected JSON but got:', text.substring(0, 100));
        }
      } else {
        // If not ok, try to get error message
        try {
          const errorData = await response.json();
          console.error('Error loading progress:', errorData);
        } catch (e) {
          console.error('Error loading progress, status:', response.status);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncLocalProgress = async () => {
    setSyncing(true);
    try {
      // Get local progress from localStorage
      const localProgressStr = localStorage.getItem('bcw_weekly_progress');
      if (!localProgressStr) {
        setSyncing(false);
        return;
      }

      let localProgress;
      try {
        localProgress = JSON.parse(localProgressStr);
      } catch (e) {
        console.error('Error parsing local progress:', e);
        setSyncing(false);
        return;
      }
      
      // Get reflections, study answers, and practical applications from localStorage
      const reflections = {};
      const studyAnswers = {};
      const practicalApplications = {};
      
      for (let i = 1; i <= 12; i++) {
        const weekReflections = localStorage.getItem(`week_${i}_reflections`);
        const weekStudy = localStorage.getItem(`week_${i}_study`);
        const weekPractical = localStorage.getItem(`week_${i}_practical`);
        if (weekReflections) {
          try {
            reflections[i] = JSON.parse(weekReflections);
          } catch (e) {
            console.warn(`Error parsing reflections for week ${i}:`, e);
          }
        }
        if (weekStudy) {
          try {
            studyAnswers[i] = JSON.parse(weekStudy);
          } catch (e) {
            console.warn(`Error parsing study answers for week ${i}:`, e);
          }
        }
        if (weekPractical) {
          practicalApplications[i] = weekPractical;
        }
      }

      const progressToSync = {
        ...localProgress,
        reflections,
        studyAnswers,
        practicalApplications
      };

      const response = await authenticatedFetch(API_ENDPOINTS.PROGRESS_SYNC, {
        method: 'POST',
        body: JSON.stringify({ progress: progressToSync }),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setProgress(data.progress);
          updateUser({ ...user, progress: data.progress });
        } else {
          const text = await response.text();
          console.error('Expected JSON but got:', text.substring(0, 100));
          throw new Error('Invalid response format');
        }
        
        // Clear local storage after successful sync
        localStorage.removeItem('bcw_weekly_progress');
        for (let i = 1; i <= 12; i++) {
          localStorage.removeItem(`week_${i}_reflections`);
          localStorage.removeItem(`week_${i}_study`);
          localStorage.removeItem(`week_${i}_practical`);
        }
      }
    } catch (error) {
      console.error('Error syncing progress:', error);
    } finally {
      setSyncing(false);
    }
  };

  const completedWeeks = progress?.completedWeeks?.length || 0;
  const progressPercent = totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-navy to-blue-900 text-white p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">My Dashboard</h2>
                    <p className="text-white/80">
                      Welcome back, {user?.name || user?.email?.split('@')[0]}!
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-gold/10 via-white to-gold/10">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
                    <p className="mt-4 text-gray-600">Loading your progress...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Sync Local Progress Button */}
                    {localStorage.getItem('bcw_weekly_progress') && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Local Progress Found</h3>
                            <p className="text-sm text-blue-700">
                              We found progress saved on this device. Sync it to your account?
                            </p>
                          </div>
                          <button
                            onClick={syncLocalProgress}
                            disabled={syncing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                          >
                            {syncing ? 'Syncing...' : 'Sync Now'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Progress Overview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                    >
                      <h3 className="text-xl font-bold text-navy mb-4">Study Progress</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Weeks Completed</span>
                            <span className="font-semibold">{completedWeeks} / {totalWeeks}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.5 }}
                              className="bg-gold h-4 rounded-full"
                            />
                          </div>
                        </div>

                        {progress?.baselineCompleted && progress?.baselineFRIQ !== null && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="text-sm text-green-700 mb-1">Baseline FRIQ Score</div>
                            <div className="text-3xl font-bold text-green-800">
                              {(progress.baselineFRIQ * 100).toFixed(1)}
                            </div>
                          </div>
                        )}

                        {progress?.currentWeek > 0 && (
                          <div className="text-sm text-gray-600">
                            Current Week: <span className="font-semibold text-navy">Week {progress.currentWeek}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Assessment History */}
                    {progress?.assessments && Object.keys(progress.assessments).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                      >
                        <h3 className="text-xl font-bold text-navy mb-4">Assessment History</h3>
                        <div className="space-y-3">
                          {Object.entries(progress.assessments)
                            .filter(([key]) => key !== 'baseline')
                            .map(([week, assessment]) => (
                              <div key={week} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <div className="font-semibold text-navy">Week {week}</div>
                                  <div className="text-sm text-gray-600">
                                    Completed: {new Date(assessment.completedAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-2xl font-bold text-navy">
                                  {((assessment.FRIQ || 0) * 100).toFixed(0)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Account Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                    >
                      <h3 className="text-xl font-bold text-navy mb-4">Account Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-navy">{user?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium text-navy">{user?.name || 'Not set'}</span>
                        </div>
                        {user?.createdAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Member since:</span>
                            <span className="font-medium text-navy">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserDashboard;


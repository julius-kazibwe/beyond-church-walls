import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import SecurePDFViewer from './SecurePDFViewer';
import WISEAssessmentModal from './WISEAssessmentModal';

const AboutBook = () => {
  const [email, setEmail] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewToken, setPreviewToken] = useState(null);
  const [showWISEModal, setShowWISEModal] = useState(false);

  // Check if user already has access (from localStorage)
  useEffect(() => {
    const storedAccess = localStorage.getItem('bookPreviewAccess');
    const storedToken = localStorage.getItem('bookPreviewToken');
    if (storedAccess === 'granted' && storedToken) {
      setHasAccess(true);
      setPreviewToken(storedToken);
    }
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        const response = await fetch(API_ENDPOINTS.BOOK_PREVIEW_ACCESS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          // Graceful degradation - grant access even if API fails
          localStorage.setItem('bookPreviewAccess', 'granted');
          localStorage.setItem('bookPreviewEmail', email);
          setHasAccess(true);
          // Note: Without token, PDF won't load, but user sees access granted
          return;
        }

        const data = await response.json();

        if (response.ok) {
          // Grant access and store token in localStorage
          const token = data.token;
          localStorage.setItem('bookPreviewAccess', 'granted');
          localStorage.setItem('bookPreviewEmail', email);
          if (token) {
            localStorage.setItem('bookPreviewToken', token);
            setPreviewToken(token);
          }
          setHasAccess(true);
          setSubmitted(true);
          
          // Reset submitted message after 3 seconds
          setTimeout(() => setSubmitted(false), 3000);
        } else {
          // Even if API fails, grant access locally (graceful degradation)
          localStorage.setItem('bookPreviewAccess', 'granted');
          localStorage.setItem('bookPreviewEmail', email);
          setHasAccess(true);
        }
      } catch (err) {
        console.error('Preview access error:', err);
        // Graceful degradation - grant access even if API fails
        localStorage.setItem('bookPreviewAccess', 'granted');
        localStorage.setItem('bookPreviewEmail', email);
        setHasAccess(true);
      }
    }
  };

  return (
    <section id="about-book" className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <span className="inline-block bg-gold text-navy px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Coming Soon
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-8">
              About the Book
            </h2>
            
            {/* Book Cover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <img 
                  src="/bookcover.jpeg" 
                  alt="Beyond Church Walls Book Cover" 
                  className="w-64 md:w-80 lg:w-96 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none"></div>
              </div>
            </motion.div>
            
            {/* Book Preview/Sample */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-white rounded-xl p-6 md:p-8 border-2 border-gold/20 shadow-2xl max-w-5xl mx-auto mb-6"
            >
              <div className="text-center space-y-3 mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-navy">Preview the Book</h3>
                <p className="text-gray-600 text-lg">
                  Get a sample of <em className="text-navy font-semibold">Beyond Church Walls</em> and discover how it can transform your perspective on work and worship.
                </p>
              </div>

              {!hasAccess ? (
                /* Email Gate - Show form before granting access */
                <div className="bg-gradient-to-br from-gold/5 to-navy/5 rounded-xl p-8 md:p-10 border border-gold/20">
                  <form onSubmit={handleEmailSubmit} className="space-y-5 max-w-md mx-auto">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-4">
                        <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <label htmlFor="preview-email" className="block text-gray-800 font-semibold text-lg mb-1">
                        Enter your email to access the preview
                      </label>
                      <p className="text-sm text-gray-600">
                        We'll send you updates about the book launch
                      </p>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="email"
                        id="preview-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        className="w-full px-5 py-4 rounded-lg border-2 border-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-gray-900 text-lg transition-all duration-200"
                      />
                      <button
                        type="submit"
                        className="w-full px-6 py-4 bg-navy text-white font-bold rounded-lg hover:bg-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-lg"
                      >
                        Get Access to Preview
                      </button>
                    </div>
                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <p className="text-green-700 font-semibold">
                          ✓ Access granted! Loading preview...
                        </p>
                      </motion.div>
                    )}
                  </form>
                </div>
              ) : (
                /* PDF Viewer - Show after access is granted */
                <div className="space-y-4">
                  {/* PDF Viewer Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Preview Access Granted</span>
                    </div>
                  </div>
                  
                  {/* Secure PDF Viewer - Canvas-based, download prevention */}
                  <div className="w-full rounded-lg overflow-hidden shadow-xl bg-gray-50 border border-gray-200 relative" style={{ minHeight: '650px', height: '85vh', maxHeight: '1000px', display: 'flex', flexDirection: 'column' }}>
                    {previewToken ? (
                      <SecurePDFViewer token={previewToken} />
                    ) : (
                      <div className="p-8 text-center text-gray-600">
                        <p>Please refresh the page to load the preview.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* Launch Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-navy/5 to-gold/5 rounded-xl p-6 md:p-8 border-2 border-gold/20 shadow-lg max-w-2xl mx-auto"
            >
              <div className="text-center space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-navy mb-4">Launch Information</h3>
                <div className="space-y-3 text-gray-700">
                  <p className="text-lg">
                    <span className="font-semibold text-navy">Proposed Launch Date:</span> Mid-December
                  </p>
                  <div className="pt-3 border-t border-gold/20">
                    <p className="font-semibold text-navy mb-2">Available Formats:</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>E-book via Amazon KDP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Hard Copy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-navy leading-tight">
                MINISTRY IS NOT TO BE CONFINED TO CHURCH WALLS
              </h3>
            </div>
            
            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gold/5 to-transparent rounded-lg border-l-4 border-gold">
                <span className="text-gold text-2xl font-bold mt-1">•</span>
                <p className="text-lg leading-relaxed italic text-gray-800 flex-1">
                  Faith isn't just for Sundays—it's for your nine-to-five.
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gold/5 to-transparent rounded-lg border-l-4 border-gold">
                <span className="text-gold text-2xl font-bold mt-1">•</span>
                <p className="text-lg leading-relaxed italic text-gray-800 flex-1">
                  Your job is more than a profession: it's your platform for Kingdom impact.
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gold/5 to-transparent rounded-lg border-l-4 border-gold">
                <span className="text-gold text-2xl font-bold mt-1">•</span>
                <p className="text-lg leading-relaxed italic text-gray-800 flex-1">
                  Your workplace is your mission field. Your work is your worship.
            </p>
              </div>
            </div>
            
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                <em className="text-navy font-semibold">Beyond Church Walls</em> is a powerful call to live out faith in the everyday world. Rev. John William Kasirye dismantles the false divide between Sunday worship and weekday work, reminding readers that the workplace is not secular ground—it's sacred space where God's presence belongs.
              </p>
              <p>
                Drawing from Scripture, biblical examples, and his own professional journey from statistics to ministry, Kasirye shows how every believer can live with purpose, integrity, and excellence. Using practical tools like the <strong className="text-navy">WISE Framework</strong> (Worship, Integrity, Service, Excellence) and the <strong className="text-navy">Faith Relevance Index Quotient (FRIQ)</strong>, this book equips readers to integrate faith and work, transforming ordinary professions into extraordinary platforms for God's glory.
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-10 p-8 bg-gradient-to-br from-gold/10 via-gold/5 to-navy/5 rounded-xl border-2 border-gold/30 shadow-lg"
            >
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-navy mb-2">The WISE Framework</h4>
                <p className="text-gray-600 mb-4">
                  Assess your faith integration at work with the WISE Framework and discover your Faith Relevance Index Quotient (FRIQ)
                </p>
                <button
                  onClick={() => setShowWISEModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Take WISE Assessment
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Worship', 'Integrity', 'Service', 'Excellence'].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="text-center p-4 bg-white/50 rounded-lg"
                  >
                    <div className="text-3xl font-bold text-gold mb-2">{item[0]}</div>
                    <div className="font-semibold text-navy">{item}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* WISE Assessment Modal */}
      <WISEAssessmentModal
        isOpen={showWISEModal}
        onClose={() => setShowWISEModal(false)}
      />
    </section>
  );
};

export default AboutBook;


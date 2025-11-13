import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

// Pastoral Voices
const pastoralVoices = [
  {
    id: 1,
    name: "Dr. Fred Wantante Setttuba-Male",
    title: "Senior Pastor, Makerere Full Gospel Church",
    quote: "Beyond Church Walls presents Bible-based tools to integrate work and worship with a mission mindset in the 21st century. It is laced with testimonies of Christian workers in the trenches of real-life situations, inspiring scholars, practitioners, and ordinary believers alike to live out their faith in the workplace. This book is a must-read for anyone studying or interested in spirituality in the workplace."
  },
  {
    id: 2,
    name: "Dr. Joseph Serwadda",
    title: "Presiding Apostle of the Born-Again Faith, Uganda",
    quote: "Beyond Church Walls is a powerful call to live out faith with authenticity and purpose. Blending spiritual insight with practical wisdom, it challenges believers to move beyond the pews and bring Christ's love to life through service and godly influence. A must-read for those ready to make faith a daily reality."
  },
  {
    id: 3,
    name: "Rev. Peter Kasirivu",
    title: "Founder and Team Leader, Gaba Community Church & Africa Renewal Ministries",
    quote: "Rev. Kasirye is a prophetic voice in the marketplace, revealing how God has guided his professional and spiritual journey. His book testifies to a life of integrity, vision, and obedience lived across cultures. With depth and authenticity, it shows how faith thrives amid modern pressures. An inspiring work that offers hope, strength, and purpose against all odds."
  },
  {
    id: 4,
    name: "Bishop Michael Kyazze",
    title: "Lead Pastor, Omega Healing Centre, Namasuba, Uganda",
    quote: "Rev. John William Kasirye extends a refreshing and urgent call to the Body of Christ—a divine reset for those weary of routine and bound by tradition. Beyond Church Walls reminds us that the world is our true diocese and the marketplace our mission field. This is a prophetic and empowering message, stirring believers to carry the Gospel into every sphere of influence with renewed passion and purpose."
  },
  {
    id: 5,
    name: "Pastor Paul Kinatama",
    title: "General Overseer, Full Gospel Churches of Uganda",
    quote: "I have known Rev. John William Kasirye since he first joined Makerere Full Gospel Church over four decades ago. His walk with God has always carried a prophetic edge—and this book is no exception. Beyond Church Walls is a must-read, a must-act message for our time, and a must-have on every believer's library shelf. It calls every believer to rise, reclaim the workplace, and reveal God's Kingdom in every sphere of life."
  }
];

// Hardcoded feedback from Ministry Partners (initial feedback)
const initialFeedback = [
  {
    id: 1,
    name: "His Worship Elias Kakooza",
    title: "Chief Magistrate, Nakawa Chief Magistrate's Court – Uganda",
    quote: "Beyond Church Walls is timely and transformational, restoring the believer's understanding of calling and showing that ministry extends to every sphere of life."
  },
  {
    id: 2,
    name: "Dr. Olivia Kasirye",
    title: "Public Health Physician & Ministry Partner – Sacramento, California",
    quote: "This book restores the sacred connection between faith and daily work, calling believers to live with integrity, compassion, and excellence wherever God has placed them."
  },
  {
    id: 3,
    name: "Elizabeth Baleke",
    title: "Global Outreach International",
    quote: "In a generation searching for identity and purpose, Beyond Church Walls shines as a beacon of truth and hope—guiding readers to live with significance in God's service."
  },
  {
    id: 4,
    name: "Mr. Samuel Turyahikayo",
    title: "National Director, Scripture Union Uganda",
    quote: "A timely call to bridge faith and daily work, Beyond Church Walls equips believers to see work as sacred service and live with purpose, faith, and excellence."
  }
];

const Endorsements = () => {
  const [pastoralIndex, setPastoralIndex] = useState(0);
  const [feedbackIndex, setFeedbackIndex] = useState(0);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Fetch feedback from API
  const fetchFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const response = await fetch(API_ENDPOINTS.FEEDBACK);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.feedback) {
          // Combine initial feedback with API feedback
          // Convert API feedback format to match component format
          const apiFeedback = data.feedback.map(item => ({
            id: item.id,
            name: item.name,
            title: item.title || '',
            quote: item.quote
          }));
          
          // Merge: initial feedback first, then API feedback
          setFeedback([...initialFeedback, ...apiFeedback]);
        }
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      // Keep initial feedback if API fails
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Fetch feedback on component mount
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Listen for feedback submission events
  useEffect(() => {
    const handleFeedbackSubmitted = () => {
      // Refresh feedback list when new feedback is submitted
      fetchFeedback();
    };

    window.addEventListener('feedbackSubmitted', handleFeedbackSubmitted);
    return () => {
      window.removeEventListener('feedbackSubmitted', handleFeedbackSubmitted);
    };
  }, []);

  useEffect(() => {
    const pastoralInterval = setInterval(() => {
      setPastoralIndex((prev) => (prev + 1) % pastoralVoices.length);
    }, 10000); // Rotate every 10 seconds for better readability

    const feedbackInterval = setInterval(() => {
      if (feedback.length > 0) {
        setFeedbackIndex((prev) => (prev + 1) % feedback.length);
      }
    }, 10000);

    return () => {
      clearInterval(pastoralInterval);
      clearInterval(feedbackInterval);
    };
  }, [feedback.length]);

  return (
    <section id="endorsements" className="py-20 px-4 bg-navy text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Praise for Beyond Church Walls
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              The following voices represent pastors, professionals, educators, and ministry partners who have witnessed and affirmed the message of Beyond Church Walls. Their words testify to a growing Kingdom movement that calls believers to live out their faith beyond the pulpit—seeing their workplaces as platforms for transformation and their daily work as worship.
            </p>
          </div>

          {/* Pastoral Voices Section */}
          <div className="mb-20">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gold">
              Pastoral Voices
            </h3>
            
            {/* Rotating testimonial */}
            <div className="mb-8">
              <motion.div
                key={pastoralIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-8 md:p-12 border border-white/20 max-w-4xl mx-auto shadow-lg"
              >
                <div className="text-4xl md:text-5xl text-gold mb-4 font-serif">"</div>
                <p className="text-lg md:text-xl leading-relaxed mb-6 italic text-white/95">
                  {pastoralVoices[pastoralIndex].quote}
                </p>
                <div className="border-t border-white/30 pt-4">
                  <p className="font-bold text-xl text-white">{pastoralVoices[pastoralIndex].name}</p>
                  <p className="text-white/80 mt-1">{pastoralVoices[pastoralIndex].title}</p>
                </div>
              </motion.div>
            </div>

            {/* Indicator dots */}
            <div className="flex justify-center gap-2 mb-8">
              {pastoralVoices.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPastoralIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === pastoralIndex ? 'bg-gold w-8' : 'bg-white/30 w-3 hover:bg-white/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Card grid for all pastoral voices (hidden on mobile, shown on larger screens) - Max 4 cards visible, all items rotate through */}
            {(() => {
              // Queue-style rotation: as carousel transitions, the item that just left carousel is added to grid top,
              // and the bottom card is removed, creating a rotating queue effect
              // All items will cycle through the 4 visible slots as carousel rotates
              const maxCards = 4;
              const getDisplayedPastoralVoices = () => {
                // Calculate previous carousel index (the item that just left carousel)
                const previousIndex = (pastoralIndex - 1 + pastoralVoices.length) % pastoralVoices.length;
                
                // Start from the item after the previous carousel position
                // This creates a queue where the item that just left carousel will be at the top
                const displayed = [];
                
                // Add the item that just left the carousel at the beginning (top of grid)
                if (previousIndex !== pastoralIndex) {
                  displayed.push({ item: pastoralVoices[previousIndex], index: previousIndex });
                }
                
                let currentIdx = (previousIndex + 1) % pastoralVoices.length;
                let attempts = 0;
                const maxAttempts = pastoralVoices.length * 2; // Allow full cycle
                
                // Collect remaining items: next items after previous (excluding current carousel)
                // This ensures all items cycle through the grid as carousel rotates
                while (displayed.length < maxCards && attempts < maxAttempts) {
                  if (currentIdx !== pastoralIndex && currentIdx !== previousIndex) {
                    displayed.push({ item: pastoralVoices[currentIdx], index: currentIdx });
                  }
                  currentIdx = (currentIdx + 1) % pastoralVoices.length;
                  attempts++;
                  
                  // If we've collected all available items and still need more, break
                  if (displayed.length >= pastoralVoices.length - 1) {
                    break;
                  }
                }
                
                return displayed;
              };
              
              const displayedPastoralVoices = getDisplayedPastoralVoices();
              
              return (
                <div className="hidden md:grid md:grid-cols-2 gap-6 overflow-hidden">
                  {displayedPastoralVoices.slice(0, maxCards).map(({ item, index }, displayIndex) => (
                    <motion.div
                      key={`${item.id}-${pastoralIndex}-${index}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: displayIndex * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-gold/50 transition-all duration-300 shadow-lg"
                    >
                      <div className="text-2xl text-gold mb-3 font-serif">"</div>
                      <p className="text-base leading-relaxed mb-4 italic text-white/95">
                        {item.quote}
                      </p>
                      <div className="border-t border-white/30 pt-3">
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-white/80 text-sm mt-1">{item.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Feedback Section */}
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gold">
              Feedback
            </h3>
            
            {feedback.length > 0 ? (
              <>
                {/* Rotating testimonial */}
                <div className="mb-8">
                  <motion.div
                    key={feedbackIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-8 md:p-12 border border-white/20 max-w-4xl mx-auto shadow-lg"
                  >
                    <div className="text-4xl md:text-5xl text-gold mb-4 font-serif">"</div>
                    <p className="text-lg md:text-xl leading-relaxed mb-6 italic text-white/95">
                      {feedback[feedbackIndex]?.quote}
                    </p>
                    <div className="border-t border-white/30 pt-4">
                      <p className="font-bold text-xl text-white">{feedback[feedbackIndex]?.name}</p>
                      {feedback[feedbackIndex]?.title && (
                        <p className="text-white/80 mt-1">{feedback[feedbackIndex].title}</p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Indicator dots */}
                {feedback.length > 1 && (
                  <div className="flex justify-center gap-2 mb-8">
                    {feedback.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setFeedbackIndex(index)}
                        className={`h-3 rounded-full transition-all duration-300 ${
                          index === feedbackIndex ? 'bg-gold w-8' : 'bg-white/30 w-3 hover:bg-white/50'
                        }`}
                        aria-label={`Go to feedback ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/70 text-lg">
                  No feedback yet. Be the first to share your thoughts!
                </p>
              </div>
            )}

            {/* Card grid for all feedback (hidden on mobile, shown on larger screens) - Max 4 cards visible, all items rotate through */}
            {feedback.length > 0 && (() => {
              // Queue-style rotation: as carousel transitions, the item that just left carousel is added to grid top,
              // and the bottom card is removed, creating a rotating queue effect
              // All items will cycle through the 4 visible slots as carousel rotates
              const maxCards = 4;
              const getDisplayedFeedback = () => {
                // Calculate previous carousel index (the item that just left carousel)
                const previousIndex = (feedbackIndex - 1 + feedback.length) % feedback.length;
                
                // Start from the item after the previous carousel position
                // This creates a queue where the item that just left carousel will be at the top
                const displayed = [];
                
                // Add the item that just left the carousel at the beginning (top of grid)
                if (previousIndex !== feedbackIndex) {
                  displayed.push({ item: feedback[previousIndex], index: previousIndex });
                }
                
                let currentIdx = (previousIndex + 1) % feedback.length;
                let attempts = 0;
                const maxAttempts = feedback.length * 2; // Allow full cycle
                
                // Collect remaining items: next items after previous (excluding current carousel)
                // This ensures all items cycle through the grid as carousel rotates
                while (displayed.length < maxCards && attempts < maxAttempts) {
                  if (currentIdx !== feedbackIndex && currentIdx !== previousIndex) {
                    displayed.push({ item: feedback[currentIdx], index: currentIdx });
                  }
                  currentIdx = (currentIdx + 1) % feedback.length;
                  attempts++;
                  
                  // If we've collected all available items and still need more, break
                  if (displayed.length >= feedback.length - 1) {
                    break;
                  }
                }
                
                return displayed;
              };
              
              const displayedFeedback = getDisplayedFeedback();
              
              return (
                <div className="hidden md:grid md:grid-cols-2 gap-6 overflow-hidden">
                  {displayedFeedback.slice(0, maxCards).map(({ item, index }, displayIndex) => (
                    <motion.div
                      key={`${item.id}-${feedbackIndex}-${index}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: displayIndex * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-gold/50 transition-all duration-300 shadow-lg"
                    >
                      <div className="text-2xl text-gold mb-3 font-serif">"</div>
                      <p className="text-base leading-relaxed mb-4 italic text-white/95">
                        {item.quote}
                      </p>
                      <div className="border-t border-white/30 pt-3">
                        <p className="font-bold text-white">{item.name}</p>
                        {item.title && (
                          <p className="text-white/80 text-sm mt-1">{item.title}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Endorsements;


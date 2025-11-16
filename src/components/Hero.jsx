import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-blue-900 to-navy text-white">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 py-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            Beyond Church Walls
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-4 text-gold font-semibold italic">
            Where Work and Worship Intersect
          </p>
          <p className="text-base sm:text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto italic">
            Inviting His Presence Every Day, Every Moment, Every Task
          </p>
          
          <div className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <a
                href="#join-mission"
                className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gold text-navy font-bold text-sm sm:text-base md:text-lg rounded-lg hover:bg-gold/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl whitespace-nowrap"
              >
                Join the Mission
              </a>
              <a
                href="#wise-assessment"
                className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-md border-2 border-gold text-gold font-bold text-sm sm:text-base md:text-lg rounded-lg hover:bg-gold hover:text-navy transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl whitespace-nowrap"
              >
                Take WISE Assessment
              </a>
              <a
                href="#pre-order"
                className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-transparent border-2 border-gold text-gold font-bold text-sm sm:text-base md:text-lg rounded-lg hover:bg-gold hover:text-navy transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                Express Interest
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:border-gold/50 transition-all duration-300"
                >
                  <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-medium text-white text-center">Work as Worship</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:border-gold/50 transition-all duration-300"
                >
                  <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-medium text-white text-center">Sacred Workplaces</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:border-gold/50 transition-all duration-300"
                >
                  <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-medium text-white text-center">Kingdom Impact</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;


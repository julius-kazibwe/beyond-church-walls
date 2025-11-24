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
          
          {/* Mission and Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 mb-16 grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 border border-white/20 hover:border-gold/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl md:text-2xl font-bold text-gold">Our Mission</h3>
              </div>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                To equip and empower believers to manifest God's presence—everywhere, every moment, every task.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 border border-white/20 hover:border-gold/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h3 className="text-xl md:text-2xl font-bold text-gold">Our Vision</h3>
              </div>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Mobilize believers to manifest God's presence and bring Kingdom influence to every sphere of society.
              </p>
            </div>
          </motion.div>
          
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
                href="#pre-order"
                className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-transparent border-2 border-gold text-gold font-bold text-sm sm:text-base md:text-lg rounded-lg hover:bg-gold hover:text-navy transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                Express Interest
              </a>
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


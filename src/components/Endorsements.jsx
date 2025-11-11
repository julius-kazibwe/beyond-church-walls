import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Endorsements from the book
const endorsements = [
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
    name: "Rev. Jotham Mutebi (Retired)",
    title: "Overseer, Full Gospel Churches of Uganda, and Senior Pastor, Makerere and Masaka Full Gospel Churches",
    quote: "Beyond Church Walls is a powerful call to live out faith with authenticity and purpose. Blending spiritual insight with practical wisdom, it challenges believers to move beyond the pews and bring Christ's love to life through service and godly influence. A must-read for those ready to make faith a daily reality."
  },
  {
    id: 5,
    name: "His Worship Elias Kakooza",
    title: "Chief Magistrate, Nakawa Chief Magistrate's Court – Uganda",
    quote: "Beyond Church Walls is timely and transformational, restoring the believer's understanding of calling and showing that ministry extends to every sphere of life."
  },
  {
    id: 6,
    name: "Dr. Olivia Kasirye",
    title: "Public Health Physician & Ministry Partner – Sacramento, California",
    quote: "This book restores the sacred connection between faith and daily work, calling believers to live with integrity, compassion, and excellence wherever God has placed them."
  },
  {
    id: 7,
    name: "Elizabeth Baleke",
    title: "Global Outreach International",
    quote: "In a generation searching for identity and purpose, Beyond Church Walls shines as a beacon of truth and hope—guiding readers to live with significance in God's service."
  },
  {
    id: 8,
    name: "Mr. Samuel Turyahikayo",
    title: "National Director, Scripture Union Uganda",
    quote: "A timely call to bridge faith and daily work, Beyond Church Walls equips believers to see work as sacred service and live with purpose, faith, and excellence."
  }
];

const Endorsements = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % endorsements.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="endorsements" className="py-20 px-4 bg-navy text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            What Key Leaders Are Saying
          </h2>
          
          {/* Rotating testimonial */}
          <div className="mb-12">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-8 md:p-12 border border-white/20 max-w-4xl mx-auto shadow-lg"
            >
              <div className="text-4xl md:text-5xl text-gold mb-4 font-serif">"</div>
              <p className="text-lg md:text-xl leading-relaxed mb-6 italic text-white/95">
                {endorsements[currentIndex].quote}
              </p>
              <div className="border-t border-white/30 pt-4">
                <p className="font-bold text-xl text-white">{endorsements[currentIndex].name}</p>
                <p className="text-white/80 mt-1">{endorsements[currentIndex].title}</p>
              </div>
            </motion.div>
          </div>

          {/* Indicator dots */}
          <div className="flex justify-center gap-2 mb-12">
            {endorsements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-gold w-8' : 'bg-white/30 w-3 hover:bg-white/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Card grid for all endorsements (hidden on mobile, shown on larger screens) */}
          <div className="hidden md:grid md:grid-cols-2 gap-6">
            {endorsements.map((endorsement, index) => (
              <motion.div
                key={endorsement.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-gold/50 transition-all duration-300 shadow-lg"
              >
                <div className="text-2xl text-gold mb-3 font-serif">"</div>
                <p className="text-base leading-relaxed mb-4 italic text-white/95">
                  {endorsement.quote}
                </p>
                <div className="border-t border-white/30 pt-3">
                  <p className="font-bold text-white">{endorsement.name}</p>
                  <p className="text-white/80 text-sm mt-1">{endorsement.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Endorsements;


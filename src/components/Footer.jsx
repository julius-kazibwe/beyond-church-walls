import { motion } from 'framer-motion';

const Footer = () => {

  return (
    <footer id="contact" className="bg-navy text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
        >
          {/* Logo */}
          <div className="flex items-start justify-center md:justify-start">
            <img
              src="/logo_bcws.png"
              alt="Beyond Church Walls - Work and Ministry"
              className="h-20 md:h-24 lg:h-28 w-auto object-contain"
            />
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">Contact</h3>
            <p className="text-white/80 mb-2">
              <a href="mailto:info@inos.info" className="hover:text-gold transition-colors">info@inos.info</a>
            </p>
            <p className="text-white/80 mb-2">
              <a href="mailto:ms42000@gmail.com" className="hover:text-gold transition-colors">ms42000@gmail.com</a>
            </p>
            <p className="text-white/80">
              <a href="tel:+19168028223" className="hover:text-gold transition-colors">+1 (916) 802-8223</a>
            </p>
          </div>
          
          {/* Vision & Mission */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">Vision & Mission</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gold font-semibold mb-1">Vision:</p>
                <p className="text-white/80">
                  To see believers carry God's presence beyond church walls and transform every sphere of society.
                </p>
              </div>
              <div>
                <p className="text-gold font-semibold mb-1">Mission:</p>
                <p className="text-white/80">
                  Activate believers to manifest God's presence—everywhere, every moment, every task.
            </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/80 mb-2">
            &copy; {new Date().getFullYear()} Beyond Church Walls. All rights reserved.
          </p>
          <p className="text-gold font-semibold mb-4">
            All proceeds go toward funding clean water projects in Uganda
          </p>
          <p className="text-white/60 text-sm">
            <a 
              href="/admin" 
              className="hover:text-gold transition-colors underline"
            >
              Admin
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


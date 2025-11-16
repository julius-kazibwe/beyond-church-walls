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
          
          {/* Mission Statement */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">Our Mission</h3>
            <p className="text-white/80 text-sm">
              Empowering believers to extend their faith beyond the sanctuary and make a lasting impact in their communities.
            </p>
          </div>
        </motion.div>
        
        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/80 mb-2">
            &copy; {new Date().getFullYear()} Beyond Church Walls. All rights reserved.
          </p>
          <p className="text-gold font-semibold">
            All proceeds go toward funding clean water projects in Uganda
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


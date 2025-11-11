import { motion } from 'framer-motion';

const AboutAuthor = () => {
  return (
    <section id="about-author" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-8"
        >
          {/* Author Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0"
          >
            <img 
              src="/author.jpeg" 
              alt="Rev. John William Kasirye" 
              className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-gold shadow-2xl"
            />
          </motion.div>
          
          {/* Author Bio */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
              About the Author
            </h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                <strong>Rev. John William Kasirye</strong> is an ordained minister, teacher, and professional who has served in both ministry and the public sector over four decades. From his twenty-seven years at the California Public Employees' Retirement System (CalPERS) to his lifelong commitment to ministry, his life embodies the message of this book.
              </p>
              <p>
                Drawing from his unique journey from statistics to ministry, Rev. Kasirye brings a perspective that bridges the gap between professional excellence and spiritual calling. His experience demonstrates how believers can integrate their faith with their work, transforming their workplaces into sacred spaces for Kingdom impact.
              </p>
              <p>
                Through <em>Beyond Church Walls</em>, Rev. Kasirye invites readers to rediscover work as worship and ministry as a lifestyle—not just a title—equipping them with practical tools to live out their calling with purpose.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutAuthor;


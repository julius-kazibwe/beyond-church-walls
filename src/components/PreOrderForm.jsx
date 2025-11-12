import { motion } from 'framer-motion';
import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

const PreOrderForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.PRE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. API endpoint may not be deployed.');
      }

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          interest: '',
          message: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Pre-order error:', err);
      if (err.message && err.message.includes('non-JSON')) {
        setError('API endpoint not found. Please check if serverless functions are deployed.');
      } else {
        setError('Failed to connect to server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pre-order" className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4 text-center">
            Pre-Order Interest & Feedback
          </h2>
          <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">
            Let us know how you'd like to engage with <strong>Beyond Church Walls</strong>. 
            Your input helps us serve you better.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 md:p-10 rounded-xl border border-gray-200 shadow-lg">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-gray-900 transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-gray-900 transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-gray-900 transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="interest" className="block text-gray-700 font-semibold mb-2">
                I would like to: <span className="text-red-500">*</span>
              </label>
              <select
                id="interest"
                name="interest"
                value={formData.interest}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-gold focus:outline-none text-gray-900 bg-white"
              >
                <option value="">Select an option</option>
                <option value="endorse">Endorse the book</option>
                <option value="pre-order">Pre-order a copy</option>
                <option value="request-copy">Request a copy</option>
                <option value="feedback">Give feedback</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                Comments or Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-gray-900 resize-none transition-all duration-200"
                placeholder="Tell us more about your interest or share any feedback..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-navy text-white rounded-lg font-semibold hover:bg-blue-900 transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
            
            {submitted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center"
              >
                Thank you for your interest! We'll be in touch soon.
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default PreOrderForm;


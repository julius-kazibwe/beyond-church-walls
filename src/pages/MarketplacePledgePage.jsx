import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

const PLEDGE_PDF_URL = '/pdfs/marketplace-pledge.pdf';
const PLEDGE_PDF_FILENAME = 'Marketplace-Pledge-Card.pdf';
const PLEDGE_PREVIEW_URL = '/pdfs/marketplace-pledge-preview.png';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55 },
};

const journeySteps = [
  { label: 'Assess', detail: 'Audit your impact' },
  { label: 'Covenant', detail: 'Sign the pledge' },
  { label: 'Harvest', detail: 'Bear lasting fruit' },
];

const howToUseSteps = [
  {
    title: 'Download & print',
    description:
      'Save the high-resolution gold-accented PDF and print it on quality paper for a keepsake you can display or carry.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    title: 'Reflect & sign',
    description:
      'Take the pledge privately or read it aloud in a group. Pause, reflect, and sign it as your personal covenant before God.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    ),
  },
  {
    title: 'Share & stay accountable',
    description:
      'Consider sharing your commitment with a trusted friend, small group, or mentor who can walk with you beyond church walls.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
];

const MarketplacePledgePage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute('content');

    document.title = 'Marketplace Pledge | Beyond Church Walls';
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Download your printable Marketplace Pledge card — a covenantal response to living faith beyond church walls. By Rev. John William Kasirye.'
      );
    }

    const ogTags = [
      { property: 'og:title', content: 'Marketplace Pledge | Beyond Church Walls' },
      {
        property: 'og:description',
        content:
          'Download your printable, gold-accented Marketplace Pledge card and move from observation to covenant.',
      },
      { property: 'og:image', content: `${window.location.origin}${PLEDGE_PREVIEW_URL}` },
      { property: 'og:type', content: 'website' },
    ];

    const createdTags = ogTags.map(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      const previous = tag.getAttribute('content');
      tag.setAttribute('content', content);
      return { tag, previous, created: !previous };
    });

    const onScroll = () => setHeaderScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.title = previousTitle;
      if (metaDescription && previousDescription) {
        metaDescription.setAttribute('content', previousDescription);
      }
      createdTags.forEach(({ tag, previous, created }) => {
        if (created) {
          tag.remove();
        } else if (previous) {
          tag.setAttribute('content', previous);
        }
      });
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.EMAIL_SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'marketplace-pledge' }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response.');
      }

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setEmail('');
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Failed to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          headerScrolled
            ? 'bg-navy/95 backdrop-blur-md shadow-lg border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-[4.5rem] flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <img
              src="/logo_bcws.png"
              alt="Beyond Church Walls"
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span
              className={`hidden sm:block text-sm font-semibold tracking-wide transition-colors ${
                headerScrolled ? 'text-white/90' : 'text-white/80'
              }`}
            >
              Beyond Church Walls
            </span>
          </a>
          <a
            href={PLEDGE_PDF_URL}
            download={PLEDGE_PDF_FILENAME}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-gold text-navy text-sm font-bold rounded-lg hover:bg-yellow-500 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">Download</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-blue-900 to-navy text-white pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="absolute inset-0 bg-black/25" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, #D4AF37 1px, transparent 1px), radial-gradient(circle at 75% 75%, #D4AF37 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-0 right-0 w-72 h-72 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs sm:text-sm font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Chapter 9 · The Harvest
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-5">
              The Marketplace Pledge
            </h1>
            <p className="text-lg sm:text-xl text-gold font-semibold italic mb-4">
              From Observation to Covenant
            </p>
            <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl">
              You have assessed your impact and defined your commitment. Now move from personal
              assessment to a covenant that ensures the fruit you bear today outlasts your career
              and extends into eternity.
            </p>
          </motion.div>

          {/* Journey strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl"
          >
            {journeySteps.map((step, index) => (
              <div
                key={step.label}
                className={`relative text-center px-3 py-4 sm:px-4 sm:py-5 rounded-xl border transition-colors ${
                  index === 1
                    ? 'bg-gold/20 border-gold/50 shadow-lg shadow-gold/10'
                    : 'bg-white/10 border-white/20'
                }`}
              >
                <p
                  className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-1 ${
                    index === 1 ? 'text-gold' : 'text-white/70'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-white/90 text-xs sm:text-sm leading-snug">{step.detail}</p>
                {index < journeySteps.length - 1 && (
                  <span className="hidden sm:block absolute top-1/2 -right-3 w-6 text-gold/60 text-lg leading-none -translate-y-1/2">
                    →
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            {/* Left column — context & instructions */}
            <div className="lg:col-span-2 space-y-10">
              <motion.div {...fadeUp}>
                <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
                  Why This Pledge Matters
                </h2>
                <div className="w-16 h-1 bg-gold rounded-full mb-6" />
                <p className="text-gray-700 leading-relaxed mb-4">
                  A pledge is more than a goal — it is a <strong className="text-navy">covenantal response</strong> to
                  God&apos;s strategic placement of you in your profession. With your impact audited
                  and your commitment defined, you have laid the foundation for a harvest that
                  endures.
                </p>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Unlike conceptual models alone, discipleship advances when we move beyond theory
                  into practical, measurable application within professional environments — living
                  faith <em>beyond church walls</em>, every day, every moment, every task.
                </p>
              </motion.div>

              <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }}>
                <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">How to Use the Pledge</h2>
                <div className="w-16 h-1 bg-gold rounded-full mb-6" />
                <div className="space-y-4">
                  {howToUseSteps.map((step, index) => (
                    <div
                      key={step.title}
                      className="flex gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-gold/5 to-white border border-gold/20 hover:border-gold/40 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white text-navy border border-navy/20 flex items-center justify-center font-bold text-sm shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <svg
                            className="w-5 h-5 text-gold flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {step.icon}
                          </svg>
                          <h3 className="font-bold text-navy">{step.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-navy/5 border border-navy/10"
              >
                <img
                  src="/book cover.jpeg"
                  alt="Beyond Church Walls book cover"
                  className="w-20 sm:w-24 rounded-lg shadow-md flex-shrink-0 object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold mb-1">
                    From the book
                  </p>
                  <p className="font-bold text-navy leading-snug mb-1">
                    Beyond Church Walls: Where Work and Worship Intersect
                  </p>
                  <p className="text-sm text-gray-600">Rev. John William Kasirye</p>
                </div>
              </motion.div>
            </div>

            {/* Right column — download card */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="lg:col-span-3 lg:sticky lg:top-24"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gold/30 bg-white">
                <div className="bg-gradient-to-r from-navy to-blue-900 px-6 py-5 sm:px-8 sm:py-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Download Your Printable Marketplace Pledge Card
                  </h2>
                </div>

                <div className="p-5 sm:p-8 bg-gradient-to-b from-gold/[0.08] to-white">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold/40 via-gold/20 to-gold/40 rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="relative rounded-xl overflow-hidden border-2 border-gold/40 shadow-lg bg-white">
                      <img
                        src={PLEDGE_PREVIEW_URL}
                        alt="Preview of the gold-accented Marketplace Pledge card"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 space-y-3">
                    <a
                      href={PLEDGE_PDF_URL}
                      download={PLEDGE_PDF_FILENAME}
                      className="flex items-center justify-center gap-3 w-full px-6 py-4 sm:py-5 bg-gold text-navy rounded-xl font-bold text-base sm:text-lg shadow-lg hover:bg-yellow-500 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download Pledge Card (PDF)
                    </a>

                    <a
                      href={PLEDGE_PDF_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-navy/15 text-navy rounded-xl font-semibold text-sm hover:border-gold hover:text-navy hover:bg-gold/5 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Open in browser instead
                    </a>
                  </div>


                  <p className="mt-5 text-center text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Tip: For best results, print on heavier stock paper or take the file to a local
                    print shop for a professional finish.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-gold/10 via-white to-gold/10 border-y border-gold/10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
              Optional — stay connected
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Want More Leadership Resources?
            </h2>
            <p className="text-gray-700 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Join our community newsletter for book updates, exclusive content, and resources to
              help you live your faith beyond church walls. Your download is instant — no email
              required.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  aria-label="Email address for newsletter"
                  className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-300 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-gray-900 text-lg transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-navy text-white rounded-lg font-semibold hover:bg-blue-900 transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                >
                  {loading ? 'Joining...' : 'Join Newsletter'}
                </button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-red-600 font-semibold"
                >
                  {error}
                </motion.p>
              )}
              {submitted && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-green-600 font-semibold"
                >
                  Thank you! We&apos;ll be in touch soon.
                </motion.p>
              )}
            </form>

            <p className="mt-6 text-sm text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="bg-gradient-to-br from-navy via-blue-900 to-navy py-8 px-4 text-center">
        <a
          href="/"
          className="text-gold/90 hover:text-gold text-sm font-medium transition-colors"
        >
          ← Back to Beyond Church Walls
        </a>
        <footer className="mt-6 text-white/40 text-xs">
          © {new Date().getFullYear()} Beyond Church Walls · Rev. John William Kasirye
        </footer>
      </div>
    </div>
  );
};

export default MarketplacePledgePage;

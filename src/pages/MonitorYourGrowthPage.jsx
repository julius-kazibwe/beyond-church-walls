import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import YouTubeVideoCard from '../components/YouTubeVideoCard';
import {
  PLEDGE_PDF_URL,
  PLEDGE_PDF_FILENAME,
  PLEDGE_PREVIEW_URL,
  YOUTUBE_CHANNEL_URL,
  growthVideos as fallbackGrowthVideos,
} from '../data/growthResources';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55 },
};

const journeySteps = [
  { label: 'Monitor', detail: 'Watch & learn', anchor: '#watch' },
  { label: 'Measure', detail: 'DF & D-Score', anchor: '#measure' },
  { label: 'Commit', detail: 'Sign the pledge', anchor: '#commit-pledge' },
];

const MonitorYourGrowthPage = ({ scrollToPledge = false }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [growthVideos, setGrowthVideos] = useState(fallbackGrowthVideos);

  useEffect(() => {
    let cancelled = false;
    const loadVideos = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.GROWTH_VIDEOS);
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && Array.isArray(data.videos)) {
          setGrowthVideos(data.videos);
        }
      } catch {
        // Keep hardcoded fallback videos if API is unavailable
      }
    };
    loadVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  const dfDScoreVideo = growthVideos.find((v) => v.category === 'df-dscore');
  const watchVideos = growthVideos.filter((v) => v.category !== 'df-dscore');

  useEffect(() => {
    const previousTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute('content');

    document.title = 'Monitor Your Growth | Beyond Church Walls';
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Watch teaching videos on DF, D-Score, and the Marketplace Pledge. Download your pledge card and continue your growth beyond church walls.'
      );
    }

    const target = scrollToPledge ? '#commit-pledge' : window.location.hash;
    if (target) {
      requestAnimationFrame(() => {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const onScroll = () => setHeaderScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.title = previousTitle;
      if (metaDescription && previousDescription) {
        metaDescription.setAttribute('content', previousDescription);
      }
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollToPledge]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.EMAIL_SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'monitor-your-growth' }),
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
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          headerScrolled
            ? 'bg-navy/95 backdrop-blur-md shadow-lg border-b border-white/10'
            : 'bg-navy/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-[4.5rem] flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3 group flex-shrink-0">
            <img
              src="/logo_bcws.png"
              alt="Beyond Church Walls"
              className="h-9 sm:h-10 w-auto object-contain"
            />
            <span className="hidden md:block text-sm font-semibold text-white/90 tracking-wide">
              Beyond Church Walls
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {journeySteps.map((step) => (
              <a
                key={step.label}
                href={step.anchor}
                className="px-3 py-2 text-sm font-medium text-white/75 hover:text-gold transition-colors rounded-lg hover:bg-white/5"
              >
                {step.label}
              </a>
            ))}
          </nav>

          <a
            href={PLEDGE_PDF_URL}
            download={PLEDGE_PDF_FILENAME}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gold text-navy text-xs sm:text-sm font-bold rounded-lg hover:bg-yellow-500 transition-all duration-200 shadow-md flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Pledge PDF</span>
            <span className="sm:hidden">PDF</span>
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs sm:text-sm font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Steward Your Growth
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-5">
              Monitor Your Growth
            </h1>
            <p className="text-lg sm:text-xl text-gold font-semibold italic mb-4">
              Watch. Measure. Commit.
            </p>
            <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl">
              Continue your journey beyond church walls — explore teaching on the Discipleship
              Framework and D-Score, watch Rev. Kasirye&apos;s podcasts, and download your
              Marketplace Pledge card.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl"
          >
            {journeySteps.map((step, index) => (
              <a
                key={step.label}
                href={step.anchor}
                className={`relative text-center px-3 py-4 sm:px-4 sm:py-5 rounded-xl border transition-all hover:scale-[1.02] ${
                  index === 0
                    ? 'bg-gold/20 border-gold/50 shadow-lg shadow-gold/10'
                    : 'bg-white/10 border-white/20 hover:border-gold/40'
                }`}
              >
                <p
                  className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-1 ${
                    index === 0 ? 'text-gold' : 'text-white/70'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-white/90 text-xs sm:text-sm leading-snug">{step.detail}</p>
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Watch — YouTube videos */}
      <section id="watch" className="py-16 sm:py-20 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10 sm:mb-12">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">Watch</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-4">
              Teaching &amp; Podcasts
            </h2>
            <div className="w-16 h-1 bg-gold rounded-full mx-auto mb-4" />
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Video teachings from Rev. John William Kasirye on the Marketplace Pledge, the
              Discipleship Framework, and D-Score.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {watchVideos.map((video) => (
              <motion.div key={video.id} {...fadeUp}>
                <YouTubeVideoCard video={video} />
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-10 text-center">
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-navy text-navy font-semibold rounded-lg hover:bg-navy hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              View William Kasirye on YouTube
            </a>
          </motion.div>
        </div>
      </section>

      {/* Measure — DF & D-Score */}
      <section
        id="measure"
        className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-gold/5 via-white to-navy/5 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <motion.div {...fadeUp}>
              <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
                Measure
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
                DF &amp; D-Score
              </h2>
              <div className="w-16 h-1 bg-gold rounded-full mb-6" />
              <p className="text-gray-700 leading-relaxed mb-4">
                Unlike conceptual models alone, the <strong className="text-navy">Discipleship
                Framework (DF)</strong> and <strong className="text-navy">D-Score</strong> offer
                quantifiable metrics that can be taught, tracked, and scaled across diverse
                sectors — moving discipleship beyond theory into practical, measurable application
                in your professional life.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Watch Rev. Kasirye unpack these twin &ldquo;crown jewels&rdquo; of measurable
                discipleship in the marketplace.
              </p>
            </motion.div>

            {dfDScoreVideo && (
              <motion.div {...fadeUp} transition={{ duration: 0.55, delay: 0.1 }}>
                <YouTubeVideoCard video={dfDScoreVideo} featured />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Commit — Marketplace Pledge */}
      <section id="commit-pledge" className="py-16 sm:py-20 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10 sm:mb-12">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
              Commit
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-4">
              The Marketplace Pledge
            </h2>
            <div className="w-16 h-1 bg-gold rounded-full mx-auto mb-4" />
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Move from observation to covenant. Download your print-ready pledge card, sign it,
              and share your commitment with a trusted friend, small group, or mentor.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gold/30 bg-white"
          >
            <div className="bg-gradient-to-r from-navy to-blue-900 px-6 py-5 sm:px-8 sm:py-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Download Your Printable Marketplace Pledge Card
              </h3>
            </div>

            <div className="p-5 sm:p-8 bg-gradient-to-b from-gold/[0.08] to-white">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-gold/40 via-gold/20 to-gold/40 rounded-xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="relative rounded-xl overflow-hidden border-2 border-gold/40 shadow-lg bg-white">
                  <img
                    src={PLEDGE_PREVIEW_URL}
                    alt="Preview of the Marketplace Pledge card"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href={PLEDGE_PDF_URL}
                  download={PLEDGE_PDF_FILENAME}
                  className="flex items-center justify-center gap-3 w-full px-6 py-4 sm:py-5 bg-gold text-navy rounded-xl font-bold text-base sm:text-lg shadow-lg hover:bg-yellow-500 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
          </motion.div>

          <motion.div
            {...fadeUp}
            className="max-w-2xl mx-auto mt-6 flex items-start gap-4 p-5 rounded-xl bg-navy/5 border border-navy/10"
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
              help you live your faith beyond church walls.
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
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-red-600 font-semibold">
                  {error}
                </motion.p>
              )}
              {submitted && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-green-600 font-semibold">
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
        <a href="/" className="text-gold/90 hover:text-gold text-sm font-medium transition-colors">
          ← Back to Beyond Church Walls
        </a>
        <footer className="mt-6 text-white/40 text-xs">
          © {new Date().getFullYear()} Beyond Church Walls · Rev. John William Kasirye
        </footer>
      </div>
    </div>
  );
};

export default MonitorYourGrowthPage;

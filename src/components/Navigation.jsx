import { useState, useEffect } from 'react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About Book', href: '#about-book' },
    { name: 'WISE Assessment', href: '#wise-assessment', highlight: true },
    { name: 'About Author', href: '#about-author' },
    { name: 'Endorsements', href: '#endorsements' },
    { name: 'Get Updates', href: '#join-mission' },
    { name: 'Pre-Order', href: '#pre-order' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, '#hero')}
            className="flex items-center h-full py-2 transition-opacity duration-200 hover:opacity-80"
          >
            <img
              src="/logo_bcws.png"
              alt="Beyond Church Walls - Work and Ministry"
              className={`h-14 md:h-16 lg:h-20 w-auto object-contain transition-all duration-300 ${
                isScrolled 
                  ? 'brightness-0 saturate-100' 
                  : ''
              }`}
              style={isScrolled ? {
                filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(2000%) hue-rotate(220deg) brightness(0.9) contrast(1.2)'
              } : {}}
            />
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gold ${
                  link.highlight
                    ? `px-4 py-2 rounded-lg font-semibold ${
                        isScrolled 
                          ? 'bg-gold text-navy hover:bg-yellow-500' 
                          : 'bg-gold/20 text-gold hover:bg-gold/30'
                      }`
                    : isScrolled 
                    ? 'text-navy' 
                    : 'text-white'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-200 ${
              isScrolled ? 'text-navy' : 'text-white'
            }`}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`text-base font-medium transition-colors duration-200 hover:text-gold px-2 py-1 ${
                    link.highlight
                      ? `bg-gold/20 text-gold rounded-lg font-semibold`
                      : isScrolled 
                      ? 'text-navy' 
                      : 'text-white'
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;


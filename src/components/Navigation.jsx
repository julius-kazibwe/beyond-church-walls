import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isAdminAuthenticated } from '../utils/adminAuth';

const Navigation = ({ onOpenWeeklyStudy, onOpenAuth, onOpenDashboard }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const [showGetInvolvedMenu, setShowGetInvolvedMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check if user is an admin
    const checkAdminStatus = () => {
      setIsAdmin(isAdminAuthenticated());
    };
    
    checkAdminStatus();
    
    // Listen for storage changes (when admin logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'bcw_admin_token' || e.key === 'bcw_admin') {
        checkAdminStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case admin logs in/out in same tab
    const interval = setInterval(checkAdminStatus, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      // Close dropdowns on scroll
      setShowResourcesMenu(false);
      setShowGetInvolvedMenu(false);
      setShowUserMenu(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Main navigation links (reduced)
  const mainNavLinks = [
    { name: 'About Book', href: '#about-book' },
    { name: 'About Author', href: '#about-author' },
    { name: 'Endorsements', href: '#endorsements' },
  ];

  // Resources dropdown items
  const resourcesItems = [
    { name: 'Weekly Study', href: '#weekly-study', highlight: true, isModal: true },
    { name: 'WISE Assessment', href: '#wise-assessment' },
  ];

  // Get Involved dropdown items
  const getInvolvedItems = [
    { name: 'Get Updates', href: '#join-mission' },
    { name: 'Pre-Order', href: '#pre-order' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // Handle weekly study modal
    if (href === '#weekly-study' && onOpenWeeklyStudy) {
      onOpenWeeklyStudy();
      return;
    }
    
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
          <div className="hidden md:flex items-center space-x-4">
            {/* Main Links */}
            {mainNavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gold ${
                  isScrolled ? 'text-navy' : 'text-white'
                }`}
              >
                {link.name}
              </a>
            ))}

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowResourcesMenu(!showResourcesMenu);
                  setShowGetInvolvedMenu(false);
                }}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gold flex items-center space-x-1 ${
                  isScrolled ? 'text-navy' : 'text-white'
                }`}
              >
                <span>Resources</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showResourcesMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowResourcesMenu(false)}
                  />
                  <div className="absolute left-0 mt-2 w-auto min-w-fit bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden">
                    <div className="py-1">
                      {resourcesItems.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={(e) => {
                            setShowResourcesMenu(false);
                            if (item.isModal && item.href === '#weekly-study' && onOpenWeeklyStudy) {
                              e.preventDefault();
                              onOpenWeeklyStudy();
                            } else {
                              scrollToSection(e, item.href);
                            }
                          }}
                          className={`block text-left px-4 py-2 text-sm transition-colors whitespace-nowrap ${
                            item.highlight
                              ? 'bg-gold/10 text-navy font-semibold hover:bg-gold/20'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Get Involved Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowGetInvolvedMenu(!showGetInvolvedMenu);
                  setShowResourcesMenu(false);
                }}
                className={`text-sm font-medium transition-colors duration-200 hover:text-gold flex items-center space-x-1 px-4 py-2 rounded-lg font-semibold ${
                  isScrolled 
                    ? 'bg-gold text-navy hover:bg-yellow-500' 
                    : 'bg-gold/20 text-gold hover:bg-gold/30'
                }`}
              >
                <span>Get Involved</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showGetInvolvedMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowGetInvolvedMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-auto min-w-fit bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden">
                    <div className="py-1">
                      {getInvolvedItems.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={(e) => {
                            setShowGetInvolvedMenu(false);
                            scrollToSection(e, item.href);
                          }}
                          className="block text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isScrolled
                      ? 'bg-navy text-white hover:bg-blue-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">{user.name || user.email.split('@')[0]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-auto min-w-fit bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenDashboard();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2 whitespace-nowrap">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Dashboard</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <div className="flex items-center space-x-2 whitespace-nowrap">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  isScrolled
                    ? 'bg-navy text-white hover:bg-blue-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Sign In
              </button>
            )}
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
              {/* Main Links */}
              {mainNavLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`text-base font-medium transition-colors duration-200 hover:text-gold px-2 py-1 ${
                    isScrolled ? 'text-navy' : 'text-white'
                  }`}
                >
                  {link.name}
                </a>
              ))}

              {/* Resources Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Resources
                </div>
                {resourcesItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      if (item.isModal && item.href === '#weekly-study' && onOpenWeeklyStudy) {
                        e.preventDefault();
                        onOpenWeeklyStudy();
                      } else {
                        scrollToSection(e, item.href);
                      }
                    }}
                    className={`block text-base font-medium transition-colors duration-200 hover:text-gold py-1 ${
                      item.highlight
                        ? 'bg-gold/20 text-gold rounded-lg font-semibold px-2'
                        : isScrolled ? 'text-navy' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Get Involved Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Get Involved
                </div>
                {getInvolvedItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      scrollToSection(e, item.href);
                    }}
                    className={`block text-base font-medium transition-colors duration-200 hover:text-gold py-1 ${
                      isScrolled ? 'text-navy' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              
              {/* Mobile Auth */}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenDashboard();
                    }}
                    className={`text-base font-medium transition-colors duration-200 px-2 py-1 text-left ${
                      isScrolled ? 'text-navy' : 'text-white'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-base font-medium text-red-400 hover:text-red-300 px-2 py-1 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className={`text-base font-medium transition-colors duration-200 px-2 py-1 text-left ${
                    isScrolled ? 'text-navy' : 'text-white'
                  }`}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;


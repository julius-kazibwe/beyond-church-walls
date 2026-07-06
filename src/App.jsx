import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import AboutBook from './components/AboutBook';
import WeeklyStudyProgram from './components/WeeklyStudyProgram';
import AboutAuthor from './components/AboutAuthor';
import Endorsements from './components/Endorsements';
import JoinMission from './components/JoinMission';
import PreOrderForm from './components/PreOrderForm';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import UserDashboard from './components/UserDashboard';
import AdminPage from './pages/AdminPage';
import MonitorYourGrowthPage from './pages/MonitorYourGrowthPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();
  const [showWeeklyStudy, setShowWeeklyStudy] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showDashboard, setShowDashboard] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [isMarketplacePledgePage, setIsMarketplacePledgePage] = useState(false);
  const [isMonitorYourGrowthPage, setIsMonitorYourGrowthPage] = useState(false);
  const [pendingWeeklyStudyAccess, setPendingWeeklyStudyAccess] = useState(false);

  // Handler to open weekly study - requires authentication
  const handleOpenWeeklyStudy = () => {
    if (!user && !loading) {
      // User not logged in, prompt login
      setAuthMode('login');
      setShowAuthModal(true);
      setPendingWeeklyStudyAccess(true);
      return;
    }
    // User is authenticated, open weekly study
    if (user) {
      setShowWeeklyStudy(true);
      setPendingWeeklyStudyAccess(false);
    }
  };

  // Open weekly study after successful login
  useEffect(() => {
    if (user && pendingWeeklyStudyAccess) {
      setShowWeeklyStudy(true);
      setPendingWeeklyStudyAccess(false);
      setShowAuthModal(false);
    }
  }, [user, pendingWeeklyStudyAccess]);

  useEffect(() => {
    const path = window.location.pathname;
    setIsAdminPage(path === '/admin' || path.startsWith('/admin'));
    setIsMarketplacePledgePage(path === '/marketplace-pledge');
    setIsMonitorYourGrowthPage(path === '/monitor-your-growth');
    
    // Listen for custom event to open auth modal
    const handleOpenAuthModal = (event) => {
      setAuthMode(event.detail.mode || 'login');
      setShowAuthModal(true);
    };
    
    window.addEventListener('openAuthModal', handleOpenAuthModal);
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  if (isAdminPage) {
    return <AdminPage />;
  }

  if (isMonitorYourGrowthPage) {
    return <MonitorYourGrowthPage />;
  }

  if (isMarketplacePledgePage) {
    return <MonitorYourGrowthPage scrollToPledge />;
  }

  return (
    <div className="App">
      <Navigation 
        onOpenWeeklyStudy={handleOpenWeeklyStudy}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'login');
          setShowAuthModal(true);
        }}
        onOpenDashboard={() => setShowDashboard(true)}
      />
      <Hero />
      <AboutBook onOpenWeeklyStudy={handleOpenWeeklyStudy} />
      <AboutAuthor />
      <Endorsements />
      <JoinMission />
      <PreOrderForm />
      <Footer />
      <WeeklyStudyProgram 
        isOpen={showWeeklyStudy} 
        onClose={() => setShowWeeklyStudy(false)} 
      />
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingWeeklyStudyAccess(false);
        }}
        initialMode={authMode}
        onLoginSuccess={() => {
          // The useEffect will handle opening weekly study after login
        }}
      />
      <UserDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </div>
  );
}

export default App;

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

function App() {
  const [showWeeklyStudy, setShowWeeklyStudy] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showDashboard, setShowDashboard] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    // Check if we're on the admin page
    setIsAdminPage(window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin'));
  }, []);

  // Render admin page if on /admin route
  if (isAdminPage) {
    return <AdminPage />;
  }

  return (
    <div className="App">
      <Navigation 
        onOpenWeeklyStudy={() => setShowWeeklyStudy(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'login');
          setShowAuthModal(true);
        }}
        onOpenDashboard={() => setShowDashboard(true)}
      />
      <Hero />
      <AboutBook />
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
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
      <UserDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </div>
  );
}

export default App;

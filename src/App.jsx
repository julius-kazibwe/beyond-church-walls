import Navigation from './components/Navigation';
import Hero from './components/Hero';
import AboutBook from './components/AboutBook';
import AboutAuthor from './components/AboutAuthor';
import Endorsements from './components/Endorsements';
import JoinMission from './components/JoinMission';
import PreOrderForm from './components/PreOrderForm';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Navigation />
      <Hero />
      <AboutBook />
      <AboutAuthor />
      <Endorsements />
      <JoinMission />
      <PreOrderForm />
      <Footer />
    </div>
  );
}

export default App;

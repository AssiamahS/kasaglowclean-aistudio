import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/ServiceSelection';
import ServicesPage from './components/Services';
import AboutPage from './components/WhyChooseUs';
import LocationsPage from './components/Locations';
import AdminPage from './components/AdminView';
import ContactPage from './components/LeadCapture';
import EmploymentTab from './components/EmploymentTab';
import FAQ from './components/FAQ';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const routes: { [key: string]: React.FC } = {
  '/': HomePage,
  '/services': ServicesPage,
  '/about': AboutPage,
  '/locations': LocationsPage,
  '/careers': EmploymentTab,
  '/admin': AdminPage,
  '/contact': ContactPage,
  '/faq': FAQ,
  '/privacy': PrivacyPolicy,
  '/terms': TermsOfService,
  '/process': HomePage, // Anchors to section on homepage
};

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      // Scroll to top on page change
      window.scrollTo(0, 0);
      setCurrentPath(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Handle anchor links on the homepage
  useEffect(() => {
    if (currentPath.startsWith('/#')) {
      const id = currentPath.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Set path to root to allow navigating away and back
      setCurrentPath('/');
    }
  }, [currentPath]);


  const PageComponent = routes[currentPath] || routes['/'];

  return (
    <div className="font-sans text-neutral bg-base-100">
      <Header />
      <main>
        <PageComponent />
      </main>
      <Footer />
    </div>
  );
};

export default App;

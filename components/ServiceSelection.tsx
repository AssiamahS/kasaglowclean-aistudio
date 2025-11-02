import React from 'react';
import Hero from './Hero';
import Services from './Services';
import WhyChooseUs from './WhyChooseUs';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
import LeadCapture from './LeadCapture';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <Services />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <LeadCapture />
    </>
  );
};

export default HomePage;

import React from 'react';
import type { ProcessStep } from '../types';
import { HOW_IT_WORKS_STEPS } from '../constants';

const StepCard: React.FC<{ step: ProcessStep, index: number }> = ({ step, index }) => {
  const Icon = step.icon;
  return (
    <div className="relative text-center">
       {index < HOW_IT_WORKS_STEPS.length - 1 && (
        <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gray-200" style={{ transform: 'translateX(50%)' }}></div>
      )}
      <div className="relative bg-white z-10 inline-flex items-center justify-center h-20 w-20 mb-6 rounded-full bg-primary/10 text-primary border-4 border-white ring-4 ring-primary/10">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
      <p className="text-neutral">{step.description}</p>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  return (
    <section id="process" className="py-20 bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-7xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
        <p className="text-lg text-neutral mb-16 max-w-3xl mx-auto">
          Getting a sparkling clean home is as easy as 1-2-3.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

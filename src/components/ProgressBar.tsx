import React from 'react';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
            
            {/* Step content */}
            {stepIdx <= currentStep ? (
              // Completed or Current Step
              <div className="flex items-center font-semibold">
                <span className="flex-shrink-0">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${stepIdx === currentStep ? 'bg-primary' : 'bg-primary'}`}>
                    {stepIdx < currentStep ? (
                       <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                    ) : (
                      <span className="text-white">{stepIdx + 1}</span>
                    )}
                  </span>
                </span>
                <span className={`ml-2 sm:ml-4 text-xs sm:text-sm font-medium hidden sm:inline-block ${stepIdx <= currentStep ? 'text-primary' : 'text-gray-500'}`}>{step}</span>
              </div>
            ) : (
              // Upcoming Step
              <div className="flex items-center">
                <span className="flex-shrink-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300">
                    <span className="text-gray-500">{stepIdx + 1}</span>
                  </span>
                </span>
                <span className="ml-2 sm:ml-4 text-xs sm:text-sm font-medium text-gray-500 hidden sm:inline-block">{step}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ProgressBar;
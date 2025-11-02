import React, { useState } from 'react';
import type { FeatureSlide } from '../types';
import { FEATURE_SLIDES } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

const WhyChooseUs: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? FEATURE_SLIDES.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === FEATURE_SLIDES.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const currentSlide = FEATURE_SLIDES[currentIndex];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 lg:h-[500px] rounded-lg shadow-2xl overflow-hidden group">
            {FEATURE_SLIDES.map((slide, index) => (
               <div key={index} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0'}`}>
                 {slide.video ? (
                   <video
                     autoPlay
                     loop
                     muted
                     playsInline
                     poster={slide.image}
                     className="w-full h-full object-cover"
                   >
                     <source src={slide.video} type="video/mp4" />
                   </video>
                 ) : (
                   <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                 )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
               </div>
            ))}
             <button onClick={prevSlide} className="absolute top-1/2 left-3 z-20 -translate-y-1/2 bg-white/70 hover:bg-white text-neutral p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100">
                <ChevronLeftIcon className="h-6 w-6"/>
             </button>
             <button onClick={nextSlide} className="absolute top-1/2 right-3 z-20 -translate-y-1/2 bg-white/70 hover:bg-white text-neutral p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100">
                <ChevronRightIcon className="h-6 w-6"/>
             </button>
          </div>
          <div className="space-y-6">
            <h3 className="text-primary font-semibold">{currentSlide.subtitle}</h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              {currentSlide.title}
            </h2>
            <p className="text-lg text-neutral">
              {currentSlide.description}
            </p>
            <div className="space-y-4 pt-4">
              {currentSlide.features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="font-semibold text-neutral">{feature.text}</span>
                  </div>
                )
              })}
            </div>
             <a href="#/contact" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-primary-content font-bold rounded-lg shadow-md hover:bg-primary-focus transition-colors">
              Request Your Free Estimate
              <ChevronRightIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

import React, { useState } from 'react';
import type { Testimonial } from '../types';
import { TESTIMONIALS } from '../constants';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-secondary' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-base-300 h-full flex flex-col flex-shrink-0 w-full">
      <StarRating rating={testimonial.rating} />
      <blockquote className="mt-4 text-neutral flex-grow">
        <p>"{testimonial.quote}"</p>
      </blockquote>
      <footer className="mt-6">
        <p className="font-bold text-gray-900">{testimonial.author}</p>
        <p className="text-sm text-neutral">{testimonial.location}</p>
      </footer>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? TESTIMONIALS.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === TESTIMONIALS.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // Auto-advance carousel every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-lg text-neutral mb-12 max-w-3xl mx-auto">
            We're proud to have earned the trust of homeowners and businesses across the country.
            </p>
        </div>
        <div className="relative max-w-3xl mx-auto">
            <div className="overflow-hidden">
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {TESTIMONIALS.map((testimonial) => (
                        <div key={testimonial.author} className="w-full flex-shrink-0">
                            <TestimonialCard testimonial={testimonial} />
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={prevSlide} aria-label="Previous testimonial" className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-base-200 transition">
                <ChevronLeftIcon className="h-6 w-6 text-neutral" />
            </button>
            <button onClick={nextSlide} aria-label="Next testimonial" className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-base-200 transition">
                <ChevronRightIcon className="h-6 w-6 text-neutral" />
            </button>
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex space-x-2">
                {TESTIMONIALS.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-primary' : 'bg-gray-300'} transition-colors`}></button>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative text-white h-[60vh] min-h-[500px] md:h-screen md:min-h-[600px] flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <img
        src="/images/ppi-time-header.jpg"
        alt="Family and dog at home"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left max-w-7xl z-10">
        <div className="sm:w-3/4 lg:w-1/2">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Professional House Cleaning You Can Trust
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200">
            Reclaim your time and enjoy a sparkling clean home with KasaGlow. Your satisfaction is guaranteed.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-block px-8 py-4 bg-primary text-primary-content text-lg font-bold rounded-lg shadow-lg hover:bg-primary-focus transition-colors transform hover:scale-105"
          >
            Get a Free Estimate
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;

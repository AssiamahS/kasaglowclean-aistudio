import React from 'react';
import { Link } from 'react-router-dom';
import type { Location } from '../types';
import { LOCATIONS } from '../constants';
import { MapPinIcon } from './IconComponents';

const LocationCard: React.FC<{ location: Location }> = ({ location }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <img src={location.image} alt={`A scenic view of ${location.state}`} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPinIcon className="h-6 w-6 text-primary" />
          {location.state}
        </h3>
        <p className="text-neutral mt-2 mb-4">Proudly serving communities across the state, including:</p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
            {location.cities.map(city => (
                <li key={city} className="truncate">
                  <span className="text-primary mr-1">✓</span>{city}
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

const LocationsPage: React.FC = () => {
  return (
    <section id="locations" className="py-20 bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Our Service Areas</h2>
            <p className="text-lg text-neutral max-w-3xl mx-auto">
            KasaGlow is proud to offer top-quality cleaning services across the tri-state area. Find out if we serve your community.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {LOCATIONS.map(location => (
            <LocationCard key={location.state} location={location} />
          ))}
        </div>

        <div className="mt-16 text-center bg-white p-8 rounded-lg shadow-md border border-base-300">
            <h3 className="text-2xl font-bold text-gray-800">Don't See Your Location?</h3>
            <p className="mt-2 text-neutral max-w-2xl mx-auto">We are constantly expanding! Contact us today to see if we can bring the KasaGlow shine to your neighborhood.</p>
            <Link to="/contact" className="mt-6 inline-block px-8 py-3 bg-primary text-primary-content font-bold rounded-lg shadow-md hover:bg-primary-focus transition-colors">
              Request Service
            </Link>
        </div>
      </div>
    </section>
  );
};

export default LocationsPage;

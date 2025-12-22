import React from 'react';
import type { Service } from '../types';
import { SERVICES } from '../constants';

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const Icon = service.icon;
  return (
    <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-base-300">
      <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-primary/10 text-primary">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
      <p className="text-neutral">{service.description}</p>
    </div>
  );
};

const Services: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-7xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Our Cleaning Services</h2>
        <p className="text-lg text-neutral mb-12 max-w-3xl mx-auto">
          We offer a range of services to meet your needs, each performed with the highest standards of quality and care.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

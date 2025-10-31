
import React from 'react';
import { SERVICES } from '../constants';
import type { Service } from '../types';
import { ClockIcon, PriceTagIcon, SparklesIcon } from './IconComponents';

interface ServiceSelectionProps {
  onServiceSelect: (service: Service) => void;
}

const ServiceCard: React.FC<{ service: Service; onSelect: () => void }> = ({ service, onSelect }) => (
  <div
    onClick={onSelect}
    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-base-200 hover:border-primary transform hover:-translate-y-1 flex flex-col"
  >
    <div className="p-6 flex-grow">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-primary/10 rounded-full mr-4 flex-shrink-0">
          <SparklesIcon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{service.name}</h3>
      </div>
      <p className="text-neutral text-sm mb-4 min-h-[60px]">{service.description}</p>
    </div>
    <div className="bg-base-200 px-6 py-4 rounded-b-lg flex justify-between items-center text-sm">
      <div className="flex items-center text-neutral">
        <ClockIcon className="h-5 w-5 mr-2" />
        <span>{service.duration} mins</span>
      </div>
      <div className="flex items-center font-semibold text-primary">
        <PriceTagIcon className="h-5 w-5 mr-2" />
        <span>${service.reservationFee} Fee</span>
      </div>
    </div>
  </div>
);

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ onServiceSelect }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Choose Your Service</h2>
      <p className="text-lg text-neutral mb-12 max-w-2xl mx-auto">Select from our range of professional cleaning services to find the perfect fit for your needs.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {SERVICES.map(service => (
          <ServiceCard key={service.id} service={service} onSelect={() => onServiceSelect(service)} />
        ))}
      </div>
    </div>
  );
};

export default ServiceSelection;
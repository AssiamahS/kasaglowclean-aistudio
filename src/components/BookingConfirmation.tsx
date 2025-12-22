

import React from 'react';
import type { BookingDetails } from '../types';
// FIX: Replaced CalendarIcon with CalendarDaysIcon and imported missing icons
// FIX: The missing icons 'ClockIcon', 'LocationMarkerIcon', and 'PriceTagIcon' were added to IconComponents.tsx to resolve the import error.
import { CalendarDaysIcon, ClockIcon, LocationMarkerIcon, PriceTagIcon, UserIcon, MailIcon, PhoneIcon, CheckCircleIcon } from './IconComponents';

interface BookingConfirmationProps {
  details: BookingDetails;
  onReset: () => void;
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start py-3">
    <div className="text-primary mr-4 mt-1">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      <p className="text-md text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ details, onReset }) => {
  const { service, dateTime, customer, confirmationId } = details;

  return (
    <div className="text-center max-w-2xl mx-auto py-8">
      <CheckCircleIcon className="h-16 w-16 text-success mx-auto mb-4" />
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
      <p className="text-lg text-neutral mb-6">Thank you, {customer.name}. Your appointment is set.</p>
      <p className="text-md text-neutral mb-8">
        A confirmation email has been sent to <span className="font-semibold text-primary">{customer.email}</span>.
      </p>

      <div className="bg-base-200/50 rounded-lg p-4 sm:p-6 text-left border border-base-300 divide-y divide-base-300">
        <div className="pb-4">
          {/* FIX: Changed property 'name' to 'title' to match the 'Service' type definition. */}
          <h3 className="text-xl font-bold mb-2">{service.title}</h3>
          <p className="text-sm text-neutral">Confirmation ID: <br className="sm:hidden"/><span className="font-mono bg-base-300/50 px-2 py-1 rounded">{confirmationId}</span></p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
          <DetailRow icon={<CalendarDaysIcon className="h-5 w-5"/>} label="Date" value={dateTime.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })} />
          <DetailRow icon={<ClockIcon className="h-5 w-5"/>} label="Time" value={dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} />
          <DetailRow icon={<LocationMarkerIcon className="h-5 w-5"/>} label="Address" value={customer.address} />
          <DetailRow icon={<PriceTagIcon className="h-5 w-5"/>} label="Reservation Fee Paid" value={`$${service.reservationFee}`} />
        </div>
        
        <div className="pt-4">
             <h4 className="font-semibold mb-2">Your Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
                <DetailRow icon={<UserIcon className="h-5 w-5"/>} label="Name" value={customer.name} />
                <DetailRow icon={<MailIcon className="h-5 w-5"/>} label="Email" value={customer.email} />
                <DetailRow icon={<PhoneIcon className="h-5 w-5"/>} label="Phone" value={customer.phone} />
            </div>
        </div>

      </div>

      <button
        onClick={onReset}
        className="mt-10 w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-focus transition-colors"
      >
        Book Another Service
      </button>
    </div>
  );
};

export default BookingConfirmation;

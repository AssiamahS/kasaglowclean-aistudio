
import React from 'react';
import type { BookingDetails } from '../types';
import { CalendarIcon, ClockIcon, UserIcon, MailIcon, PhoneIcon, LocationMarkerIcon, SparklesIcon } from './IconComponents';

interface AdminViewProps {
  bookings: BookingDetails[];
  onExit: () => void;
}

const BookingCard: React.FC<{ booking: BookingDetails }> = ({ booking }) => {
  const { service, dateTime, customer, confirmationId } = booking;
  return (
    <div className="bg-white rounded-lg shadow-md border border-base-200 overflow-hidden">
      <div className="p-4 bg-primary text-primary-content">
        <h3 className="font-bold text-lg flex items-center gap-2"><SparklesIcon className="h-5 w-5" /> {service.name}</h3>
        <p className="text-xs font-mono opacity-80">ID: {confirmationId}</p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center text-sm">
            <CalendarIcon className="h-5 w-5 mr-3 text-neutral" />
            <span>{dateTime.toLocaleDateString('default', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
         <div className="flex items-center text-sm">
            <ClockIcon className="h-5 w-5 mr-3 text-neutral" />
            <span>{dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="border-t border-base-300 my-2"></div>
        <div className="flex items-center text-sm">
            <UserIcon className="h-5 w-5 mr-3 text-neutral" />
            <span className="font-semibold">{customer.name}</span>
        </div>
        <div className="flex items-center text-sm">
            <MailIcon className="h-5 w-5 mr-3 text-neutral" />
            <span>{customer.email}</span>
        </div>
        <div className="flex items-center text-sm">
            <PhoneIcon className="h-5 w-5 mr-3 text-neutral" />
            <span>{customer.phone}</span>
        </div>
         <div className="flex items-start text-sm">
            <LocationMarkerIcon className="h-5 w-5 mr-3 text-neutral flex-shrink-0 mt-0.5" />
            <span>{customer.address}</span>
        </div>
      </div>
    </div>
  );
};

const AdminView: React.FC<AdminViewProps> = ({ bookings, onExit }) => {
  return (
    <main className="w-full max-w-5xl bg-base-100 rounded-2xl shadow-2xl p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6 border-b border-base-300 pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Booking Log</h2>
        <span className="text-lg font-semibold bg-primary text-primary-content px-3 py-1 rounded-full">
          {bookings.length} Total
        </span>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral text-lg">There are no bookings yet.</p>
          <p className="text-neutral mt-2">Complete a booking in the user view to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...bookings].reverse().map(booking => (
            <BookingCard key={booking.confirmationId} booking={booking} />
          ))}
        </div>
      )}
    </main>
  );
};

export default AdminView;
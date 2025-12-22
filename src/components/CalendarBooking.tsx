

import React, { useState, useMemo } from 'react';
import type { Service } from '../types';
import { BUSINESS_HOURS, MOCKED_BOOKED_SLOTS } from '../constants';
// FIX: Replaced CalendarIcon with CalendarDaysIcon and imported missing icons.
// FIX: The missing icons 'ClockIcon' and 'PriceTagIcon' were added to IconComponents.tsx to resolve the import error.
import { ClockIcon, PriceTagIcon, CalendarDaysIcon } from './IconComponents';

interface CalendarBookingProps {
  service: Service;
  onDateTimeSelect: (date: Date) => void;
}

const CalendarBooking: React.FC<CalendarBookingProps> = ({ service, onDateTimeSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);
  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(), [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (clickedDate < new Date(new Date().toDateString())) return; // Disable past dates
    setSelectedDate(clickedDate);
    setSelectedTime(null);
  };
  
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    
    const slots = [];
    const bufferMinutes = 30;
    const totalDuration = service.duration + bufferMinutes;

    for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const slotStart = new Date(selectedDate);
            slotStart.setHours(hour, minute, 0, 0);

            const slotEnd = new Date(slotStart.getTime() + totalDuration * 60000);
            
            if (slotEnd.getHours() > BUSINESS_HOURS.end || (slotEnd.getHours() === BUSINESS_HOURS.end && slotEnd.getMinutes() > 0)) {
                continue;
            }

            const isBooked = MOCKED_BOOKED_SLOTS.has(`${slotStart.toISOString().slice(0, 10)}-${String(hour).padStart(2, '0')}`);
            const isPast = slotStart < new Date();

            if (!isPast) {
                 slots.push({ time: slotStart, isBooked });
            }
        }
    }
    return slots;
  }, [selectedDate, service.duration]);

  const isToday = (day: number) => {
    const today = new Date();
    return currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear() &&
           day === today.getDate();
  };
  
  const isPastDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 text-center">Pick a Date & Time</h2>
      <div className="flex flex-col lg:flex-row gap-8">
        
        <div className="lg:w-1/2 bg-white p-4 sm:p-6 rounded-lg shadow-md border border-base-200">
           <div className="border-b border-base-300 pb-4 mb-4">
              {/* FIX: Changed property 'name' to 'title' to match the 'Service' type definition. */}
              <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
              <div className="flex items-center text-neutral text-sm mt-2">
                <div className="flex items-center mr-4"><ClockIcon className="h-4 w-4 mr-1"/>{service.duration} mins</div>
                <div className="flex items-center"><PriceTagIcon className="h-4 w-4 mr-1"/>${service.reservationFee} Reservation Fee</div>
              </div>
           </div>
           
           <div>
              <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-base-200 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h4 className="font-semibold text-lg text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-base-200 transition">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm text-neutral">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-medium">{day}</div>)}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                  const dayNumber = day + 1;
                  const isSelected = selectedDate?.getDate() === dayNumber && selectedDate?.getMonth() === currentDate.getMonth();
                  const isPast = isPastDate(dayNumber);
                  
                  return (
                    <div key={dayNumber} className="py-1 flex justify-center">
                      <button
                        onClick={() => handleDateClick(dayNumber)}
                        disabled={isPast}
                        className={`w-8 h-8 rounded-full transition-colors ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-primary hover:text-white'} ${isSelected ? 'bg-primary text-white' : ''} ${isToday(dayNumber) && !isSelected ? 'text-primary font-bold border border-primary' : ''}`}
                      >
                        {dayNumber}
                      </button>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        <div className="lg:w-1/2">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-base-200 h-full">
            <h3 className="font-bold text-lg mb-4 text-center">
              Available Slots for {selectedDate ? selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' }) : "your selected day"}
            </h3>
            {!selectedDate ? (
                <div className="flex flex-col items-center justify-center h-64 text-neutral">
                    <CalendarDaysIcon className="h-12 w-12 mb-4" />
                    <p>Please select a date from the calendar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-80 overflow-y-auto pr-2">
                {timeSlots.map(({ time, isBooked }) => {
                    const isSelected = selectedTime?.getTime() === time.getTime();
                    return (
                        <button
                            key={time.toISOString()}
                            onClick={() => setSelectedTime(time)}
                            disabled={isBooked}
                            className={`p-2 sm:p-3 rounded-lg text-sm font-semibold transition-all duration-200 w-full ${
                                isBooked ? 'bg-base-200 text-gray-400 cursor-not-allowed line-through' :
                                isSelected ? 'bg-primary text-white ring-2 ring-primary-focus' :
                                'bg-white border border-primary text-primary hover:bg-primary/10'
                            }`}
                        >
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </button>
                    );
                })}
                {timeSlots.length === 0 && <p className="col-span-full text-center text-neutral">No available slots for this day.</p>}
                </div>
            )}
            </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onDateTimeSelect(selectedTime!)}
          disabled={!selectedTime}
          className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-focus disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default CalendarBooking;

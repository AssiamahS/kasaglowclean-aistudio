import React, { useState } from 'react';
import type { Service, BookingDetails, Customer } from './types';
import ServiceSelection from './components/ServiceSelection';
import CalendarBooking from './components/CalendarBooking';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import ProgressBar from './components/ProgressBar';
import Payment from './components/Payment';
import AdminView from './components/AdminView';
import Login from './components/Login';
import { LogoIcon, UserShieldIcon, ArrowLeftOnRectangleIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState<Partial<BookingDetails>>({});
  const [allBookings, setAllBookings] = useState<BookingDetails[]>([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleServiceSelect = (service: Service) => {
    setBookingDetails({ service });
    setStep(2);
  };

  const handleDateTimeSelect = (date: Date) => {
    setBookingDetails(prev => ({ ...prev, dateTime: date }));
    setStep(3);
  };
  
  const handleDetailsSubmit = (customerDetails: Customer) => {
    setBookingDetails(prev => ({ ...prev, customer: customerDetails }));
    setStep(4);
  };

  const handlePaymentSuccess = () => {
    const finalBookingDetails = { 
      ...bookingDetails, 
      confirmationId: `KSG-${Date.now()}`.slice(0, 12) 
    } as BookingDetails;

    setBookingDetails(finalBookingDetails);
    setAllBookings(prev => [...prev, finalBookingDetails]);
    
    console.log("Final Booking Details:", finalBookingDetails);
    console.log("All Bookings Log:", [...allBookings, finalBookingDetails]);
    
    setStep(5);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleReset = () => {
    setBookingDetails({});
    setStep(1);
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminView(false);
  };

  const toggleAdminView = () => {
    if (isAdminView) {
      handleLogout();
    } else {
      setIsAdminView(true);
    }
  };

  const steps = ['Select Service', 'Pick Date & Time', 'Your Details', 'Payment', 'Confirmation'];

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ServiceSelection onServiceSelect={handleServiceSelect} />;
      case 2:
        return <CalendarBooking service={bookingDetails.service!} onDateTimeSelect={handleDateTimeSelect} />;
      case 3:
        return <BookingForm service={bookingDetails.service!} dateTime={bookingDetails.dateTime!} onConfirm={handleDetailsSubmit} />;
      case 4:
        return <Payment details={bookingDetails as Required<Pick<BookingDetails, 'service' | 'dateTime' | 'customer'>>} onConfirm={handlePaymentSuccess} />;
      case 5:
        return <BookingConfirmation details={bookingDetails as BookingDetails} onReset={handleReset} />;
      default:
        return <ServiceSelection onServiceSelect={handleServiceSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-200 font-sans text-gray-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl mx-auto mb-6 text-center">
         <div className="flex items-center justify-center gap-3 mb-2">
            <LogoIcon className="h-10 w-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">KasaGlowClean</h1>
        </div>
        <p className="text-lg text-neutral mb-4">Your trusted partner for a spotless space.</p>
        <button 
          onClick={toggleAdminView}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
        >
          {isAdminView ? (
            <>
              <ArrowLeftOnRectangleIcon className="h-5 w-5"/>
              <span>Exit Admin</span>
            </>
          ) : (
            <>
              <UserShieldIcon className="h-5 w-5"/>
              <span>Admin View</span>
            </>
          )}
        </button>
      </header>

      {isAdminView ? (
        isAdminLoggedIn ? (
          <AdminView bookings={allBookings} onExit={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onCancel={() => setIsAdminView(false)} />
        )
      ) : (
        <main className="w-full max-w-5xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
          {step < 5 && (
            <div className="p-6 sm:p-8 border-b border-base-300">
              <ProgressBar steps={steps} currentStep={step - 1} />
              <h2 className="text-center text-lg font-bold text-gray-800 mt-4 sm:hidden">{steps[step-1]}</h2>
            </div>
          )}
          
          <div className="p-6 sm:p-8 relative">
            {step > 1 && step < 5 && (
              <button
                onClick={handleBack}
                className="absolute top-6 left-6 flex items-center text-sm font-semibold text-primary hover:text-primary-focus transition-colors z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back
              </button>
            )}
            {renderStep()}
          </div>
        </main>
      )}

      <footer className="w-full max-w-5xl mx-auto mt-8 text-center text-neutral text-sm">
        <p>&copy; {new Date().getFullYear()} KasaGlowClean Services. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
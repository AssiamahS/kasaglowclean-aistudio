import React, { useState } from 'react';
import type { BookingDetails } from '../types';
import { CalendarIcon, MailIcon, CreditCardIcon, LockClosedIcon } from './IconComponents';

interface PaymentProps {
  details: Required<Pick<BookingDetails, 'service' | 'dateTime' | 'customer'>>;
  onConfirm: () => void;
}

const Payment: React.FC<PaymentProps> = ({ details, onConfirm }) => {
  const { service, dateTime, customer } = details;
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState<Partial<typeof cardDetails>>({});
  const [paymentError, setPaymentError] = useState('');

  const validateCardDetails = () => {
    setPaymentError(''); // Clear previous payment error on new attempt
    const newErrors: Partial<typeof cardDetails> = {};
    if (!cardDetails.name) newErrors.name = 'Name is required';
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 15) newErrors.number = 'Invalid card number';
    if (!cardDetails.expiry || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardDetails.expiry)) newErrors.expiry = 'Invalid expiry date (MM/YY)';
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) newErrors.cvc = 'Invalid CVC';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleCardPayment = () => {
    if (validateCardDetails()) {
      setIsProcessing(true);
      const sanitizedCardNumber = cardDetails.number.replace(/\s/g, '');
      
      // Demo logic: A specific card number will fail to simulate a debit card rejection.
      if (sanitizedCardNumber === '4242424242424242') {
        setTimeout(() => {
          setPaymentError('This debit card is not supported. Please use a different card.');
          setIsProcessing(false);
        }, 1500);
      } else {
        // All other cards will be processed successfully.
        setTimeout(() => {
          onConfirm();
          setIsProcessing(false); // Good practice, though component will unmount.
        }, 2000);
      }
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setCardDetails(prev => ({...prev, [name]: value}));
    setPaymentError(''); // Clear payment error when user types
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 text-center">Confirm and Pay</h2>
      
      <div className="bg-base-200/50 rounded-lg p-6 border border-base-300 mb-8">
        <h3 className="text-xl font-bold mb-4">Review Your Booking</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Service</p>
            <p className="text-lg font-bold text-gray-800">{service.name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Contact</p>
            <div className="flex items-center text-gray-800 truncate">
              <MailIcon className="h-5 w-5 mr-2 text-neutral flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          </div>
          <div className="col-span-full">
            <p className="text-sm font-semibold text-gray-600">Date & Time</p>
            <div className="flex items-center text-gray-800">
              <CalendarIcon className="h-5 w-5 mr-2 text-neutral" />
              <span>{dateTime.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}, {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-base-300 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Reservation Fee Due</span>
            <span className="text-2xl font-bold text-primary">${service.reservationFee.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-base-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCardIcon className="h-6 w-6 text-neutral"/>
            <h3 className="text-lg font-semibold">Pay with Credit/Debit Card</h3>
          </div>
          <div className="space-y-4">
              <InputField label="Cardholder Name" name="name" value={cardDetails.name} onChange={handleCardChange} error={errors.name} />
              <InputField label="Card Number" name="number" value={cardDetails.number} onChange={handleCardChange} error={errors.number} icon={<LockClosedIcon className="h-5 w-5"/>} placeholder="•••• •••• •••• ••••" />
              <div className="grid grid-cols-2 gap-4">
                  <InputField label="Expiry (MM/YY)" name="expiry" value={cardDetails.expiry} onChange={handleCardChange} error={errors.expiry} placeholder="MM/YY" />
                  <InputField label="CVC" name="cvc" value={cardDetails.cvc} onChange={handleCardChange} error={errors.cvc} placeholder="123" />
              </div>

              {paymentError && (
                  <div className="rounded-md bg-error/10 p-3 text-center">
                      <p className="text-sm font-semibold text-error">{paymentError}</p>
                  </div>
              )}

              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => onConfirm()}
                    className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    Skip Payment (Demo)
                  </button>
                  <button
                    onClick={handleCardPayment}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-focus disabled:bg-gray-400 flex items-center justify-center transition-colors"
                  >
                    {isProcessing ? 'Processing...' : `Pay $${service.reservationFee.toFixed(2)}`}
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    value: string;
    error?: string;
    icon?: React.ReactNode;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, error, icon, onChange, ...rest }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative">
            <input
                id={name}
                name={name}
                type="text"
                value={value}
                onChange={onChange}
                className={`block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm ${error ? 'border-error' : 'border-gray-300 focus:ring-primary focus:border-primary'} ${icon ? 'pl-10' : ''}`}
                {...rest}
            />
            {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div>}
        </div>
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
)

export default Payment;
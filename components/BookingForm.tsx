

import React, { useState } from 'react';
import type { Service, Customer } from '../types';
// FIX: Replaced CalendarIcon with CalendarDaysIcon and imported missing icons
// FIX: The missing icons 'ClockIcon', 'PriceTagIcon', and 'LocationMarkerIcon' were added to IconComponents.tsx to resolve the import error.
import { ClockIcon, PriceTagIcon, CalendarDaysIcon, UserIcon, MailIcon, PhoneIcon, LocationMarkerIcon } from './IconComponents';

interface BookingFormProps {
  service: Service;
  dateTime: Date;
  onConfirm: (customerDetails: Customer) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ service, dateTime, onConfirm }) => {
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name) newErrors.name = 'Full Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Service Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        onConfirm(formData);
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 text-center">Enter Your Details</h2>
      <div className="flex flex-col lg:flex-row gap-8">

        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} icon={<UserIcon/>} required />
            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} icon={<MailIcon/>} required />
            <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} icon={<PhoneIcon/>} required />
            <InputField label="Service Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} icon={<LocationMarkerIcon/>} required />
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Special Instructions (optional)</label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., focus on the kitchen, pets in the house, etc."
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-focus disabled:bg-gray-400 flex items-center justify-center transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : 'Go to Payment'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-base-200 p-6 rounded-lg sticky top-8">
            <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
            <div className="space-y-3 text-gray-700">
              {/* FIX: Changed property 'name' to 'title' to match the 'Service' type definition. */}
              <p className="font-semibold text-lg">{service.title}</p>
              <div className="flex items-start text-sm">
                <CalendarDaysIcon className="h-5 w-5 mr-2 text-neutral flex-shrink-0 mt-0.5" />
                <span>{dateTime.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center text-sm">
                <ClockIcon className="h-5 w-5 mr-2 text-neutral" />
                <span>{dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
              </div>
              <div className="border-t border-base-300 my-3"></div>
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Reservation Fee</span>
                <div className="flex items-center">
                  <PriceTagIcon className="h-5 w-5 mr-2" />
                  <span>${service.reservationFee}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, error, icon, required, ...rest }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-error">*</span>}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <input
                id={name as string}
                name={name}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none sm:text-sm ${error ? 'border-error focus:ring-error focus:border-error' : 'border-gray-300 focus:ring-primary focus:border-primary'}`}
                {...rest}
            />
        </div>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
);

export default BookingForm;

import React, { useState } from 'react';
import { UserIcon, MailIcon, PhoneIcon } from './IconComponents';
import CalendarBooking from './CalendarBooking';
import { SERVICES } from '../constants';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  icon?: React.ReactNode;
  as?: 'input' | 'select' | 'textarea';
  children?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, as = 'input', icon, children, ...rest }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div>}
      {as === 'input' && <input id={id} className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary ${icon ? 'pl-10' : ''}`} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />}
      {as === 'select' && <select id={id} className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary ${icon ? 'pl-10' : ''}`} {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}>{children}</select>}
      {as === 'textarea' && <textarea id={id} rows={4} className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />}
    </div>
  </div>
);

const LeadCapture: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending...');

    const form = new FormData(e.currentTarget);
    const submittedData = {
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      service: form.get('service'),
      message: form.get('message'),
    };
    setFormData(submittedData);

    try {
      // Submit to backend API
      const response = await fetch('/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowCalendar(true);
        setStatus('✅ Great! Now select your preferred date and time.');
      } else {
        setStatus(`❌ ${result.error || 'Something went wrong. Please try again.'}`);
      }
    } catch (error) {
      setStatus('❌ Network error. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateTimeSelect = (dateTime: Date) => {
    console.log('Selected date/time:', dateTime, 'for service:', formData?.service);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="contact" className="py-20 bg-base-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Booking Confirmed!</h2>
            <p className="text-lg text-neutral">Thank you {formData?.name}! We'll send a confirmation email to {formData?.email}.</p>
            <p className="text-neutral mt-4">Our team will reach out shortly to confirm your appointment.</p>
        </div>
      </section>
    )
  }

  if (showCalendar && formData) {
    const selectedService = SERVICES.find(s => s.title === formData.service) || SERVICES[0];

    return (
      <section id="contact" className="py-20 bg-base-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Select Your Preferred Time
            </h2>
            <p className="text-lg text-neutral">
              Service: <span className="font-semibold text-primary">{formData.service}</span>
            </p>
          </div>
          <CalendarBooking service={selectedService} onDateTimeSelect={handleDateTimeSelect} />
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Get Your Free Estimate Today</h2>
            <p className="text-lg text-neutral">
              Ready for a cleaner home? Fill out the form and a KasaGlow representative will get in touch with you to provide a free, no-obligation estimate tailored to your needs.
            </p>
            <div className="space-y-4 pt-4">
              <a href="tel:9084175388" className="flex items-center gap-4 text-lg text-neutral hover:text-primary transition-colors">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><PhoneIcon className="h-6 w-6 text-primary" /></span>
                <span className="font-semibold">(908) 417-5388</span>
              </a>
              <a href="mailto:info@kasaglowclean.com" className="flex items-center gap-4 text-lg text-neutral hover:text-primary transition-colors">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><MailIcon className="h-6 w-6 text-primary" /></span>
                <span className="font-semibold">info@kasaglowclean.com</span>
              </a>
            </div>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-xl border border-base-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField id="name" name="name" label="Full Name" icon={<UserIcon className="h-5 w-5"/>} required />
              <InputField id="email" name="email" type="email" label="Email Address" icon={<MailIcon className="h-5 w-5"/>} required />
              <InputField id="phone" name="phone" type="tel" label="Phone Number" icon={<PhoneIcon className="h-5 w-5"/>} required />
              <InputField id="service" name="service" label="Service of Interest" as="select">
                <option>Select a service</option>
                <option>Residential Cleaning</option>
                <option>Deep Cleaning</option>
                <option>Move In/Out Cleaning</option>
                <option>Commercial Cleaning</option>
              </InputField>
              <InputField id="message" name="message" label="Message" as="textarea" placeholder="Tell us about your cleaning needs..."/>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-primary text-primary-content font-bold rounded-lg shadow-md hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Submit Request'}
              </button>
              {status && <p className="text-sm text-center mt-2">{status}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadCapture;

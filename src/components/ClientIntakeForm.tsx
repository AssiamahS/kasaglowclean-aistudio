import React, { useState } from 'react';

const serviceOptions = [
  'Standard Cleaning',
  'Deep Cleaning',
  'Move-In / Move-Out Cleaning',
  'Post-Construction Cleaning',
  'Office Cleaning',
  'Carpet / Floor Care',
  'Window Cleaning',
];

const frequencyOptions = [
  'One-Time Cleaning',
  'Weekly',
  'Bi-Weekly',
  'Monthly',
  'Custom Schedule',
];

const ClientIntakeForm: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    cityStateZip: '',
    phone: '',
    email: '',
    propertyType: 'Residential',
    services: [] as string[],
    otherService: '',
    frequency: 'One-Time Cleaning',
    customFrequency: '',
    preferredDates: '',
    specialInstructions: '',
    rateQuoted: '',
    depositAmount: '',
    paymentMethod: '',
    balanceDue: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setForm(prev => {
      const exists = prev.services.includes(service);
      if (exists) {
        return { ...prev, services: prev.services.filter(s => s !== service) };
      }
      return { ...prev, services: [...prev.services, service] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/clients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tier: 'New' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
      setForm({
        name: '',
        address: '',
        cityStateZip: '',
        phone: '',
        email: '',
        propertyType: 'Residential',
        services: [],
        otherService: '',
        frequency: 'One-Time Cleaning',
        customFrequency: '',
        preferredDates: '',
        specialInstructions: '',
        rateQuoted: '',
        depositAmount: '',
        paymentMethod: '',
        balanceDue: '',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Kasaglow Cleaning Services
      </h1>
      <p className="text-gray-600 mb-6">
        Client Information Form
      </p>

      <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
        {submitted && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm">
            Thank you! Your information has been submitted. We'll contact you to confirm your appointment details.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Info */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City, State, ZIP
                </label>
                <input
                  type="text"
                  name="cityStateZip"
                  value={form.cityStateZip}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
          </section>

          {/* Service Details */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Service Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Type of Property
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Residential', 'Commercial'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, propertyType: type }))}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        form.propertyType === type
                          ? 'bg-primary text-white border-primary'
                          : 'bg-gray-50 text-gray-700 border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Type of Service (check all that apply)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {serviceOptions.map(opt => (
                    <label key={opt} className="inline-flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={form.services.includes(opt)}
                        onChange={() => handleServiceToggle(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other (please specify)
                  </label>
                  <input
                    type="text"
                    name="otherService"
                    value={form.otherService}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Frequency of Service
                </p>
                <div className="flex flex-wrap gap-2">
                  {frequencyOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, frequency: opt }))}
                      className={`px-3 py-1 rounded-full border text-sm ${
                        form.frequency === opt
                          ? 'bg-primary text-white border-primary'
                          : 'bg-gray-50 text-gray-700 border-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {form.frequency === 'Custom Schedule' && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Schedule
                    </label>
                    <input
                      type="text"
                      name="customFrequency"
                      value={form.customFrequency}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Cleaning Date(s) / Time(s)
                </label>
                <textarea
                  name="preferredDates"
                  value={form.preferredDates}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </section>

          {/* Special Instructions */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Special Instructions</h2>
            <textarea
              name="specialInstructions"
              value={form.specialInstructions}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Any special requests, cleaning preferences, or areas to focus on."
            />
          </section>

          {/* Payment (optional, no accounting logic) */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Payment & Deposit (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quoted Cleaning Rate
                </label>
                <input
                  type="text"
                  name="rateQuoted"
                  value={form.rateQuoted}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="$"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Amount
                </label>
                <input
                  type="text"
                  name="depositAmount"
                  value={form.depositAmount}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="$"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Cash, Zelle, Credit Card, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance Due on Completion
                </label>
                <input
                  type="text"
                  name="balanceDue"
                  value={form.balanceDue}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="$"
                />
              </div>
            </div>
          </section>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientIntakeForm;

import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <section className="py-20 bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using KasaGlow Cleaning Services ("Service"), you agree to be bound by
                these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Service Description</h2>
              <p>
                KasaGlow Cleaning Services provides professional residential and commercial cleaning
                services. Service details, pricing, and availability may vary based on location and specific requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Booking and Payment</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All bookings must be confirmed in advance</li>
                <li>Payment is due upon completion of service unless otherwise arranged</li>
                <li>We accept cash, credit cards, and digital payments</li>
                <li>Prices are subject to change with advance notice</li>
                <li>Additional charges may apply for services beyond the initial scope</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Cancellation and Rescheduling</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cancellations must be made at least 24 hours in advance</li>
                <li>Late cancellations (less than 24 hours) may incur a cancellation fee</li>
                <li>Rescheduling is subject to availability</li>
                <li>We reserve the right to cancel services due to extreme weather or emergencies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Client Responsibilities</h2>
              <p className="mb-2">As a client, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide access to the property at the scheduled time</li>
                <li>Ensure the safety of our cleaning staff</li>
                <li>Secure valuables and personal items</li>
                <li>Notify us of any pets, allergies, or special requirements</li>
                <li>Provide necessary utilities (water, electricity) for cleaning</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Liability and Insurance</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>KasaGlow Cleaning Services is fully insured and bonded</li>
                <li>We are not liable for pre-existing damage to property</li>
                <li>Any damages caused by our staff will be reported and addressed promptly</li>
                <li>Claims must be reported within 24 hours of service completion</li>
                <li>We are not responsible for items not properly secured</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Service Guarantee</h2>
              <p>
                We strive for 100% customer satisfaction. If you are not satisfied with our service,
                please contact us within 24 hours and we will address your concerns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we
                collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p>
                KasaGlow Cleaning Services shall not be liable for any indirect, incidental, special, or
                consequential damages arising from the use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Governing Law</h2>
              <p>
                These Terms of Service are governed by the laws of the State of New Jersey, without
                regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-3 space-y-1">
                <p><strong>Email:</strong> info@kasaglowclean.com</p>
                <p><strong>Phone:</strong> (908) 417-5388</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective
                immediately upon posting. Continued use of our services constitutes acceptance of the
                modified terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;

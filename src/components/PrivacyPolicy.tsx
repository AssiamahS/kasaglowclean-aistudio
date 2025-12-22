import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <section className="py-20 bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                KasaGlow Cleaning Services ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="mb-2">We may collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and address when you request a quote or book our services.</li>
                <li><strong>Payment Information:</strong> Credit card details and billing information for processing payments.</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, including IP address, browser type, and pages visited.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and manage our cleaning services</li>
                <li>Process payments and send invoices</li>
                <li>Communicate with you about appointments and services</li>
                <li>Send promotional materials and updates (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your
                information with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                <li>Service providers who assist us in operating our business</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to processing of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Cookies</h2>
              <p>
                Our website uses cookies to enhance your experience. You can choose to disable cookies
                through your browser settings, though this may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-3 space-y-1">
                <p><strong>Email:</strong> info@kasaglowclean.com</p>
                <p><strong>Phone:</strong> (908) 417-5388</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by
                posting the new policy on this page with an updated "Last Updated" date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;

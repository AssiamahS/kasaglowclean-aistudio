import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What areas do you service?",
    answer: "We proudly serve Hillsborough, Toms River, Somerville, and surrounding areas in New Jersey. Contact us to confirm we service your location."
  },
  {
    question: "How do I get a quote?",
    answer: "You can get a free estimate by filling out our contact form on the website, calling us at (908) 417-5388, or emailing us at info@kasaglowclean.com. We'll provide a customized quote based on your specific needs."
  },
  {
    question: "What cleaning services do you offer?",
    answer: "We offer Residential Cleaning, Deep Cleaning, Move In/Out Cleaning, and Commercial Cleaning services. Each service is customizable to meet your specific requirements."
  },
  {
    question: "Do I need to provide cleaning supplies?",
    answer: "No! We bring all necessary cleaning supplies and equipment. However, if you have specific products you'd like us to use, we're happy to accommodate."
  },
  {
    question: "How long does a typical cleaning take?",
    answer: "The duration depends on the size of your space and the type of cleaning. A standard home cleaning typically takes 2-4 hours, while deep cleaning can take 4-8 hours. We'll provide an estimated time with your quote."
  },
  {
    question: "Are you insured and bonded?",
    answer: "Yes, KasaGlow Cleaning Services is fully insured and bonded for your peace of mind and protection."
  },
  {
    question: "What if I need to reschedule or cancel?",
    answer: "We understand that plans change. Please give us at least 24 hours notice if you need to reschedule or cancel your appointment."
  },
  {
    question: "Do you offer recurring cleaning services?",
    answer: "Yes! We offer weekly, bi-weekly, and monthly recurring cleaning services at discounted rates."
  },
  {
    question: "How do I prepare for a cleaning service?",
    answer: "We recommend picking up clutter and personal items so our team can focus on cleaning. Secure any valuables and let us know about any areas requiring special attention."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cash, credit cards, and digital payments for your convenience. Payment is due upon completion of service."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our cleaning services
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-primary transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-primary/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-700 mb-6">
            We're here to help! Contact us and we'll be happy to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:9084175388"
              className="px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-focus transition-colors"
            >
              Call (908) 417-5388
            </a>
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-primary font-bold rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

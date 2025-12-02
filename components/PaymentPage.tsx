import React, { useEffect } from 'react';
import { loadScript } from '@paypal/paypal-js';

const PaymentPage: React.FC = () => {
  useEffect(() => {
    loadScript({ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }).then((paypal) => {
      if (!paypal) return;
      paypal.Buttons({
        createOrder: async () => {
          const res = await fetch('/api/payments/paypal-order', { method: 'POST' });
          const data = await res.json();
          return data.id;
        },
        onApprove: async (data) => {
          await fetch('/api/payments/paypal-capture?orderID=' + data.orderID, { method: 'POST' });
          alert('Payment Successful via PayPal');
        }
      }).render('#paypal-button');
    });
  }, []);

  const handleStripe = async () => {
    const res = await fetch('/api/payments/stripe-checkout', { method: 'POST' });
    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">Complete Your $35 Deposit</h2>
      <div id="paypal-button" className="mb-8"></div>
      <button onClick={handleStripe} className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg">
        Pay with Stripe
      </button>
    </div>
  );
};

export default PaymentPage;

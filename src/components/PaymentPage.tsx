import React, { useEffect } from "react";
import { loadScript } from "@paypal/paypal-js";

const PaymentPage: React.FC = () => {
  // PAYPAL BUTTON
  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.error("Missing VITE_PAYPAL_CLIENT_ID");
      return;
    }

    // Check if container exists before loading PayPal
    const container = document.getElementById("paypal-button");
    if (!container) {
      console.warn("PayPal button container not found");
      return;
    }

    loadScript({ clientId }).then((paypal) => {
      if (!paypal) return;

      // Ensure container still exists and is empty
      if (!document.getElementById("paypal-button")) return;

      paypal.Buttons({
        createOrder: async () => {
          const res = await fetch("/payments/paypal-order", {
            method: "POST",
          });
          const data = await res.json();
          return data.id;
        },
        onApprove: async (data) => {
          await fetch(
            "/payments/paypal-capture?orderID=" + data.orderID,
            { method: "POST" }
          );
          alert("Payment Successful (PayPal)");
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          alert('Payment failed. Please try again.');
        }
      }).render("#paypal-button");
    }).catch((error) => {
      console.error("Failed to load PayPal SDK:", error);
    });
  }, []);

  // STRIPE BUTTON
  const handleStripe = async () => {
    const res = await fetch("/payments/stripe-checkout", {
      method: "POST"
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">Complete Your $35 Deposit</h2>

      <div id="paypal-button" className="mb-8"></div>

      <button
        onClick={handleStripe}
        className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg"
      >
        Pay with Stripe
      </button>
    </div>
  );
};

export default PaymentPage;

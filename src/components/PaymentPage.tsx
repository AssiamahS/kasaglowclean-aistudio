import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loadScript } from "@paypal/paypal-js";

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const clientId = params.get("clientId");
  const appointmentId = params.get("appointmentId");
  const [depositCents, setDepositCents] = useState(3500);
  const [error, setError] = useState<string | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string | null>(
    import.meta.env.VITE_PAYPAL_CLIENT_ID || null
  );

  const ids = { clientId, appointmentId };
  const deposit = `$${(depositCents / 100).toFixed(2).replace(/\.00$/, "")}`;

  useEffect(() => {
    fetch("/payments/config")
      .then((r) => r.json())
      .then((d) => {
        if (d?.depositCents) setDepositCents(d.depositCents);
        if (d?.paypalClientId) setPaypalClientId(d.paypalClientId);
      })
      .catch(() => {});
  }, []);

  // PAYPAL BUTTON
  useEffect(() => {
    const clientIdKey = paypalClientId;
    if (!clientIdKey) return;

    const container = document.getElementById("paypal-button");
    if (!container) return;

    loadScript({ clientId: clientIdKey }).then((paypal) => {
      if (!paypal) return;
      if (!document.getElementById("paypal-button")) return;

      paypal.Buttons({
        createOrder: async () => {
          const res = await fetch("/payments/paypal-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ids),
          });
          const data = await res.json();
          if (!res.ok || !data.id) throw new Error(data.error || "PayPal unavailable");
          return data.id;
        },
        onApprove: async (data) => {
          const res = await fetch(
            "/payments/paypal-capture?orderID=" + data.orderID,
            { method: "POST" }
          );
          const capture = await res.json();
          if (res.ok && capture.status === "COMPLETED") {
            navigate("/payment-success?provider=paypal");
          } else {
            setError("Payment could not be completed. Please try again or contact us.");
          }
        },
        onError: (err) => {
          console.error("PayPal error:", err);
          setError("PayPal payment failed. Please try the card option below or contact us.");
        },
      }).render("#paypal-button");
    }).catch((error) => {
      console.error("Failed to load PayPal SDK:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paypalClientId]);

  // STRIPE (card) BUTTON
  const handleStripe = async () => {
    setError(null);
    const res = await fetch("/payments/stripe-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || "Card payments are temporarily unavailable. Please use PayPal.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-2">Complete Your {deposit} Deposit</h2>
      <p className="text-gray-600 mb-6">
        Your deposit secures your appointment and is applied to your final bill.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm mb-6">
          {error}
        </div>
      )}

      <div id="paypal-button" className="mb-8"></div>

      <button
        onClick={handleStripe}
        className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg"
      >
        Pay {deposit} with Card
      </button>
    </div>
  );
};

export default PaymentPage;

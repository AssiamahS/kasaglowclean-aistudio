import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export const PaymentSuccess: React.FC = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"verifying" | "paid" | "failed">(
    sessionId ? "verifying" : "paid"
  );

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/payments/stripe-verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d) => setState(d.paid ? "paid" : "failed"))
      .catch(() => setState("failed"));
  }, [sessionId]);

  return (
    <div className="p-6 max-w-xl mx-auto text-center py-20">
      {state === "verifying" && <p className="text-lg">Confirming your payment…</p>}
      {state === "paid" && (
        <>
          <h2 className="text-3xl font-bold mb-4 text-green-700">Deposit Received — You're Booked!</h2>
          <p className="text-gray-600 mb-8">
            Thank you! Your appointment is confirmed and your deposit will be
            applied to your final bill. A confirmation email is on its way.
          </p>
          <Link to="/" className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg">
            Back to Home
          </Link>
        </>
      )}
      {state === "failed" && (
        <>
          <h2 className="text-3xl font-bold mb-4 text-red-700">Payment Not Confirmed</h2>
          <p className="text-gray-600 mb-8">
            We couldn't confirm your payment. If you were charged, don't worry —
            contact us and we'll sort it out right away.
          </p>
          <Link to="/pay" className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg">
            Try Again
          </Link>
        </>
      )}
    </div>
  );
};

export const PaymentCancel: React.FC = () => (
  <div className="p-6 max-w-xl mx-auto text-center py-20">
    <h2 className="text-3xl font-bold mb-4">Payment Cancelled</h2>
    <p className="text-gray-600 mb-8">
      No charge was made. Your appointment request is still saved — you can pay
      your deposit any time, or we'll collect it when we confirm by phone.
    </p>
    <Link to="/pay" className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg">
      Back to Payment
    </Link>
  </div>
);

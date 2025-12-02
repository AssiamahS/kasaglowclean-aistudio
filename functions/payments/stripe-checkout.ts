import Stripe from 'stripe';

export const onRequestPost: PagesFunction = async ({ env }) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'USD',
          product_data: { name: 'Booking Fee' },
          unit_amount: 3500
        },
        quantity: 1
      }
    ],
    success_url: 'https://kasaglowclean.com/payment-success',
    cancel_url: 'https://kasaglowclean.com/payment-cancel'
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

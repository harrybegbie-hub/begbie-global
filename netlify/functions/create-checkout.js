exports.handler = async function(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  // Load Stripe inside handler so env var is guaranteed to be available
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }
 
  const stripe = require('stripe')(stripeKey);
 
  try {
    const { total, orderSummary } = JSON.parse(event.body);
 
    // Validate total is a sensible number (£50–£2000)
    if (!total || total < 50 || total > 2000) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid total amount' }) };
    }
 
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Begbie Global — Student Arrival Package',
              description: orderSummary || 'Student Arrival Package with selected add-ons',
            },
            unit_amount: total * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://begbieglobal.co.uk?payment=success',
      cancel_url:  'https://begbieglobal.co.uk?payment=cancelled',
    });
 
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: session.url }),
    };
 
  } catch (err) {
    console.error('Stripe error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

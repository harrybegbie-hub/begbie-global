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
    const { total, orderSummary, shortDesc } = JSON.parse(event.body);
 
    // Validate total is a sensible number (£50–£2000)
    if (!total || total < 50 || total > 2000) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid total amount' }) };
    }
 
    // Clean one-line description shown to customer on Stripe checkout page
    // e.g. "The Complete Arrival Package · Bedding Pack, Laundry Pack · James Smith"
    const displayDescription = shortDesc
      ? shortDesc.substring(0, 500)
      : 'Student Arrival Package';
 
    // Full order detail goes into metadata — visible to you in the Stripe dashboard
    // under each payment, but never shown to the customer.
    // Stripe metadata values are capped at 500 chars each, so split across two fields.
    const metaDetail1 = orderSummary ? orderSummary.substring(0, 500) : '';
    const metaDetail2 = orderSummary && orderSummary.length > 500
      ? orderSummary.substring(500, 1000)
      : '';
 
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Begbie Global — Student Arrival Package',
              description: displayDescription,
            },
            unit_amount: total * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://begbieglobal.co.uk?payment=success',
      cancel_url:  'https://begbieglobal.co.uk?payment=cancelled',
      metadata: {
        order_detail:   metaDetail1,
        order_detail_2: metaDetail2,
      },
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
 

import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Create checkout session request received');

    // Validate Stripe key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Stripe is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    const { planId } = await req.json();
    console.log('Creating checkout for plan:', planId);

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }
    console.log('User profile:', profile?.email);

    // Check if customer exists
    let customerId: string | undefined;
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
      console.log('Existing Stripe customer:', customerId);
    } else {
      // Create new customer
      console.log('Creating new Stripe customer');
      try {
        const customer = await stripe.customers.create({
          email: profile?.email || user.email,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        console.log('Created Stripe customer:', customerId);
      } catch (stripeError: any) {
        console.error('Stripe customer creation error:', stripeError.message);
        throw new Error(`Stripe Error: ${stripeError.message}`);
      }
    }

    // Get price ID from plan mapping
    const priceMap: Record<string, string> = {
      'pro': 'price_1ShK60E0VkO7z1VnHAKICksq', // Replace with actual Stripe price ID
      'enterprise': 'price_enterprise_monthly', // Replace with actual Stripe price ID
    };

    const priceId = priceMap[planId];
    if (!priceId) {
      console.error('Invalid plan ID:', planId);
      return new Response(
        JSON.stringify({ error: 'Invalid plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating checkout session with price:', priceId);

    // Create checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${req.headers.get('origin')}/upgrade?success=true`,
        cancel_url: `${req.headers.get('origin')}/upgrade?canceled=true`,
        metadata: {
          userId: user.id,
          planId,
        },
      });
      console.log('Checkout session created:', session.id);
    } catch (stripeError: any) {
      console.error('Stripe checkout session error:', stripeError.message);
      throw new Error(`Stripe Error: ${stripeError.message}`);
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { supabase } from './supabase';
import { Subscription, PaymentMethod, Invoice, Plan } from '@/types/subscription';
import { FunctionsHttpError } from '@supabase/supabase-js';

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '1 AI model (Sonnet 4.5)',
      'Basic projects',
      'Standard support',
    ],
    stripePriceId: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 20,
    interval: 'month',
    features: [
      '8 AI models',
      'Unlimited projects',
      'Priority support',
      'Custom domains',
      'Advanced analytics',
    ],
    stripePriceId: 'price_1ShK60E0VkO7z1VnHAKICksq', // Replace with actual Stripe price ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 100,
    interval: 'month',
    features: [
      'All Pro features',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Team collaboration',
    ],
    stripePriceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
  },
];

export class StripeService {
  async createCheckoutSession(planId: string): Promise<{ url: string; error?: string }> {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { planId },
    });

    if (error) {
      let errorMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const statusCode = error.context?.status ?? 500;
          const textContent = await error.context?.text();
          errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
        } catch {
          errorMessage = `${error.message || 'Failed to create checkout session'}`;
        }
      }
      return { url: '', error: errorMessage };
    }

    return { url: data.url };
  }

  async createBillingPortalSession(): Promise<{ url: string; error?: string }> {
    const { data, error } = await supabase.functions.invoke('create-portal-session');

    if (error) {
      let errorMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const statusCode = error.context?.status ?? 500;
          const textContent = await error.context?.text();
          errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
        } catch {
          errorMessage = `${error.message || 'Failed to create portal session'}`;
        }
      }
      return { url: '', error: errorMessage };
    }

    return { url: data.url };
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }

    return data || [];
  }

  async getInvoices(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }

    return data || [];
  }

  async cancelSubscription(): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.functions.invoke('cancel-subscription');

    if (error) {
      let errorMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const statusCode = error.context?.status ?? 500;
          const textContent = await error.context?.text();
          errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
        } catch {
          errorMessage = `${error.message || 'Failed to cancel subscription'}`;
        }
      }
      return { success: false, error: errorMessage };
    }

    return { success: true };
  }
}

export const stripeService = new StripeService();

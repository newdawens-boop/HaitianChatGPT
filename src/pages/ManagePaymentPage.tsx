import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { stripeService, PLANS } from '@/lib/stripeService';
import { Subscription } from '@/types/subscription';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ManagePaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    const sub = await stripeService.getSubscription(user.id);
    setSubscription(sub);
    setLoading(false);
  };

  const handleManageBilling = async () => {
    setLoading(true);

    const { url, error } = await stripeService.createBillingPortalSession();

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    window.location.href = url;
  };

  const handleUpgrade = async (planId: string) => {
    setLoading(true);

    const { url, error } = await stripeService.createCheckoutSession(planId);

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    window.location.href = url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-bold mb-2">Manage Payment</h1>
        <p className="text-muted-foreground mb-8">
          Manage your subscription and billing information
        </p>

        {subscription && subscription.status === 'active' ? (
          <div className="bg-card p-8 rounded-lg border mb-8">
            <h2 className="text-2xl font-semibold mb-4">Current Plan: {subscription.plan_name}</h2>
            <p className="text-muted-foreground mb-4">
              Status: <span className="text-green-600 font-medium capitalize">{subscription.status}</span>
            </p>
            <p className="text-muted-foreground mb-6">
              Renewal date: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>

            <button
              onClick={handleManageBilling}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Manage Billing
            </button>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Choose a Plan</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-lg border-2 ${
                    plan.id === 'pro'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id !== 'free' && (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full py-3 rounded-lg font-medium ${
                        plan.id === 'pro'
                          ? 'bg-primary text-primary-foreground hover:opacity-90'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      Choose {plan.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by <strong>Stripe</strong></p>
          <p className="mt-2">
            <a href="#" className="hover:underline">Terms</a>
            {' · '}
            <a href="#" className="hover:underline">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

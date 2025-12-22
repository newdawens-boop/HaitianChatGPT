import { useState } from 'react';
import { X, Check, Sparkles, Zap, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UpgradePage() {
  const [planType, setPlanType] = useState<'personal' | 'business'>('personal');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Upgrade your plan</h1>
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Plan Type Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          <button
            onClick={() => setPlanType('personal')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              planType === 'personal'
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setPlanType('business')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              planType === 'business'
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Business
          </button>
        </div>

        {/* Personal Plans */}
        {planType === 'personal' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Plus Plan */}
            <div className="border-2 border-primary rounded-3xl p-6 bg-card relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                  POPULAR
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-2">Plus</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">$20</span>
                <span className="text-muted-foreground"> USD / month</span>
              </div>

              <p className="text-muted-foreground mb-6">Unlock the full experience</p>

              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full font-medium transition-colors mb-6">
                Get Plus
              </button>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Solve complex problems</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Have long chats over multiple sessions</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Create more images, faster</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Remember goals and past conversations</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Plan travel and tasks with agent mode</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Organize projects and customize GPTs</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Produce and share videos on Sora</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Write code and build apps with Codex</span>
                </div>
              </div>

              <button className="text-sm text-primary hover:underline mt-4">
                Limits apply
              </button>
            </div>

            {/* Pro Plan */}
            <div className="border border-border rounded-3xl p-6 bg-card">
              <h2 className="text-2xl font-bold mb-2">Pro</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">$200</span>
                <span className="text-muted-foreground"> USD / month</span>
              </div>

              <p className="text-muted-foreground mb-6">For power users</p>

              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded-full font-medium transition-colors mb-6">
                Get Pro
              </button>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Plus</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited access to advanced models</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">5x more messages with advanced tools</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority access to new features</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Enhanced data analysis capabilities</span>
                </div>
              </div>

              <button className="text-sm text-primary hover:underline mt-4">
                Limits apply
              </button>
            </div>
          </div>
        )}

        {/* Business Plans */}
        {planType === 'business' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Team Plan */}
            <div className="border border-border rounded-3xl p-6 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Team</h2>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$30</span>
                <span className="text-muted-foreground"> USD / user / month</span>
              </div>

              <p className="text-muted-foreground mb-6">For small teams and businesses</p>

              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full font-medium transition-colors mb-6">
                Get Team
              </button>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Plus for your team</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Admin console for team management</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Shared workspace for collaboration</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Team billing and usage analytics</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="border-2 border-primary rounded-3xl p-6 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Enterprise</h2>
              </div>
              <div className="mb-6">
                <span className="text-2xl font-bold">Custom pricing</span>
              </div>

              <p className="text-muted-foreground mb-6">For large organizations</p>

              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded-full font-medium transition-colors mb-6">
                Contact Sales
              </button>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Team</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited usage with advanced models</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced security and compliance</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Dedicated account manager</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom integrations and API access</span>
                </div>
                <div className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">SSO and advanced user management</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

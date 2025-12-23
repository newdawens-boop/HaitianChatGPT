import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { stripeService } from '@/lib/stripeService';
import { Github, Linkedin, Globe, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [domains, setDomains] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAccountData();
    }
  }, [user]);

  const loadAccountData = async () => {
    if (!user) return;

    // Load user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setGithubUsername(profile.github_username || '');
      setLinkedinUrl(profile.linkedin_url || '');
    }

    // Load custom domains
    const { data: domainsData } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('user_id', user.id);

    setDomains(domainsData || []);

    // Load subscription
    const sub = await stripeService.getSubscription(user.id);
    setSubscription(sub);

    setLoading(false);
  };

  const handleSaveGithub = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ github_username: githubUsername })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to save GitHub');
    } else {
      toast.success('GitHub linked successfully');
    }
  };

  const handleRemoveGithub = async () => {
    if (!user || !confirm('Remove GitHub profile?')) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ github_username: null })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to remove GitHub');
    } else {
      setGithubUsername('');
      toast.success('GitHub removed');
    }
  };

  const handleSaveLinkedIn = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ linkedin_url: linkedinUrl })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to save LinkedIn');
    } else {
      toast.success('LinkedIn linked successfully');
    }
  };

  const handleRemoveLinkedIn = async () => {
    if (!user || !confirm('Remove LinkedIn profile?')) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ linkedin_url: null })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to remove LinkedIn');
    } else {
      setLinkedinUrl('');
      toast.success('LinkedIn removed');
    }
  };

  const handleAddDomain = async () => {
    if (!user || !customDomain) return;

    const { error } = await supabase
      .from('custom_domains')
      .insert({
        user_id: user.id,
        domain: customDomain,
        verification_token: crypto.randomUUID(),
      });

    if (error) {
      toast.error('Failed to add domain');
    } else {
      toast.success('Domain added. Please verify ownership.');
      setCustomDomain('');
      loadAccountData();
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    if (!confirm('Remove this domain?')) return;

    const { error } = await supabase
      .from('custom_domains')
      .delete()
      .eq('id', domainId);

    if (error) {
      toast.error('Failed to remove domain');
    } else {
      toast.success('Domain removed');
      loadAccountData();
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.'
    );

    if (!confirmed) return;

    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion');

    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    try {
      // Delete user data
      await supabase.from('user_profiles').delete().eq('id', user.id);

      // Sign out
      await logout();

      toast.success('Account deleted successfully');
      navigate('/welcome');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleManagePayment = () => {
    navigate('/manage-payment');
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Account</h3>

        {/* Payment Section */}
        <div className="py-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Payment</div>
            <button
              onClick={handleManagePayment}
              className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors"
            >
              Manage
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {subscription?.status === 'active'
              ? `Current plan: ${subscription.plan_name}`
              : 'No active subscription'}
          </p>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Need help with billing?
          </a>
        </div>

        {/* Delete Account */}
        <div className="py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="font-medium">Delete account</div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 border-2 border-destructive text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Builder Profile */}
        <div className="py-6">
          <h4 className="font-semibold mb-2">GPT builder profile</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Personalize your builder profile to connect with users of your GPTs. These settings apply to publicly shared GPTs.
          </p>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">HC</span>
              </div>
              <div>
                <p className="font-medium">HaitianChatGPT</p>
                <p className="text-sm text-muted-foreground">By community builder</p>
              </div>
            </div>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Preview
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 dark:text-blue-400 mt-1">ℹ️</div>
              <div className="text-sm">
                <p className="font-medium mb-1">Complete verification to publish GPTs to everyone.</p>
                <p className="text-muted-foreground">
                  Verify your identity by adding billing details or verifying ownership of a public domain name.
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h5 className="font-semibold">Links</h5>

            {/* Domain Selector */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Domain</span>
              </div>
              <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                Select a domain
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">LinkedIn</span>
              </div>
              {linkedinUrl ? (
                <div className="flex items-center gap-2">
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleRemoveLinkedIn}
                    className="text-sm text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="LinkedIn URL"
                    className="px-3 py-1 text-sm bg-background border rounded"
                  />
                  <button
                    onClick={handleSaveLinkedIn}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">GitHub</span>
              </div>
              {githubUsername ? (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://github.com/${githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    @{githubUsername} <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleRemoveGithub}
                    className="text-sm text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="GitHub username"
                    className="px-3 py-1 text-sm bg-background border rounded"
                  />
                  <button
                    onClick={handleSaveGithub}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:opacity-90"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mt-6">
            <h5 className="font-semibold mb-2">Email</h5>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{user?.email}</span>
            </div>
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input type="checkbox" className="rounded" />
              <span>Receive feedback emails</span>
            </label>
          </div>

          {/* Custom Domain Management */}
          {subscription?.plan_id !== 'free' && (
            <div className="mt-6">
              <h5 className="font-semibold mb-2">Custom Domains</h5>
              <div className="space-y-2 mb-4">
                {domains.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <p className="font-medium">{domain.domain}</p>
                      <p className="text-xs text-muted-foreground">
                        {domain.verified ? '✓ Verified' : '⚠ Not verified'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveDomain(domain.id)}
                      className="text-destructive hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="flex-1 px-3 py-2 bg-background border rounded"
                />
                <button
                  onClick={handleAddDomain}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
                >
                  Add Domain
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { COUNTRIES } from '@/constants/countries';

type AuthMethod = 'email' | 'phone' | 'oauth';
type OAuthProvider = 'google' | 'apple' | 'microsoft';

export function AuthPage() {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'microsoft' ? 'azure' : provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast.error(error.message || 'OAuth login failed');
      setLoading(false);
    }
  };

  const handleEmailContinue = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        // Existing user - send OTP for login
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
          },
        });

        if (error) throw error;

        navigate('/verify', {
          state: { email, type: 'login' },
        });
        toast.success('Verification code sent to your email');
      } else {
        // New user - go to password creation
        navigate('/create-password', {
          state: { email, method: 'email' },
        });
      }
    } catch (error: any) {
      console.error('Email error:', error);
      toast.error(error.message || 'Failed to process email');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneContinue = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    const fullPhone = `${countryCode}${phone}`;
    setLoading(true);

    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('email')
        .ilike('email', `%${phone}%`)
        .single();

      if (existingUser) {
        // Existing user - send SMS OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone: fullPhone,
          options: {
            shouldCreateUser: false,
          },
        });

        if (error) throw error;

        navigate('/verify', {
          state: { phone: fullPhone, type: 'login' },
        });
        toast.success('Verification code sent via SMS');
      } else {
        // New user - go to password creation
        navigate('/create-password', {
          state: { phone: fullPhone, method: 'phone' },
        });
      }
    } catch (error: any) {
      console.error('Phone error:', error);
      toast.error(error.message || 'Failed to process phone number');
    } finally {
      setLoading(false);
    }
  };

  if (authMethod === 'email') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button
              onClick={() => setAuthMethod(null)}
              className="mb-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold mb-2">Log in or sign up</h1>
            <p className="text-gray-600 dark:text-gray-400">
              You'll get smarter responses and can upload files, images, and more.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>

            <button
              onClick={handleEmailContinue}
              disabled={loading || !email}
              className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            <a href="#" className="hover:underline">Terms of Use</a>
            {' | '}
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    );
  }

  if (authMethod === 'phone') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button
              onClick={() => setAuthMethod(null)}
              className="mb-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold mb-2">Log in or sign up</h1>
            <p className="text-gray-600 dark:text-gray-400">
              You'll get smarter responses and can upload files, images, and more.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm text-gray-500 mb-2">Phone number</label>
              <button
                onClick={() => setShowCountrySelector(!showCountrySelector)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-left flex items-center justify-between mb-2"
              >
                <span>{COUNTRIES.find(c => c.code === countryCode)?.name || 'Select country'} {countryCode}</span>
                <span>▼</span>
              </button>

              {showCountrySelector && (
                <div className="absolute z-10 w-full max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setCountryCode(country.code);
                        setShowCountrySelector(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {country.name} {country.code}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Phone number"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handlePhoneContinue}
              disabled={loading || !phone}
              className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            <a href="#" className="hover:underline">Terms of Use</a>
            {' | '}
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/welcome')}
            className="mb-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold mb-2">Log in or sign up</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You'll get smarter responses and can upload files, images, and more.
          </p>
        </div>

        <div className="space-y-3">
          {/* OAuth Providers */}
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="w-full px-6 py-3 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 font-medium disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuthLogin('apple')}
            disabled={loading}
            className="w-full px-6 py-3 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 font-medium disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>

          <button
            onClick={() => handleOAuthLogin('microsoft')}
            disabled={loading}
            className="w-full px-6 py-3 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 font-medium disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" d="M13 1h10v10H13z"/>
              <path fill="#7FBA00" d="M1 13h10v10H1z"/>
              <path fill="#FFB900" d="M13 13h10v10H13z"/>
            </svg>
            Continue with Microsoft
          </button>

          <button
            onClick={() => setAuthMethod('phone')}
            className="w-full px-6 py-3 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            Continue with phone
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">OR</span>
            </div>
          </div>

          <button
            onClick={() => setAuthMethod('email')}
            className="w-full px-6 py-3 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Continue with email
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <a href="#" className="hover:underline">Terms of Use</a>
          {' | '}
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { X, Search, ChevronDown, Mail, Phone } from 'lucide-react';
import { countries } from '@/constants/countries';

export function LoginPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | null>(null);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    navigate('/');
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) toast.error(error.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEmailContinue = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      // Check if user exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .limit(1);

      if (checkError) throw checkError;

      if (existingUsers && existingUsers.length > 0) {
        // User exists - go to password login
        toast.info('Account found! Please enter your password.');
        // Here you would navigate to a password entry page
        // For now, we'll use the signup flow
      } else {
        // New user - go to signup
        navigate('/signup', { state: { email } });
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneContinue = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${selectedCountry.code}${phoneNumber}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) throw error;
      
      toast.success('Verification code sent!');
      navigate('/verify-email', { state: { phone: fullPhone } });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between rounded-t-3xl">
          <div />
          <h2 className="text-xl font-bold">Log in or sign up</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!authMethod ? (
            <>
              {/* Description */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                You'll get smarter responses and can upload files, images, and more.
              </p>

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor"/>
                  </svg>
                  Continue with Apple
                </button>

                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z"/>
                    <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                    <path fill="#7fba00" d="M1 13h10v10H1z"/>
                    <path fill="#ffb900" d="M13 13h10v10H13z"/>
                  </svg>
                  Continue with Microsoft
                </button>

                <button
                  onClick={() => setAuthMethod('phone')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  <Phone className="w-5 h-5" />
                  Continue with phone
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white dark:bg-gray-800 text-sm text-gray-500">OR</span>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleEmailContinue}
                  disabled={isLoading}
                  className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Continue'}
                </button>
              </div>
            </>
          ) : authMethod === 'phone' ? (
            <>
              {/* Phone Number Input */}
              <button
                onClick={() => setAuthMethod(null)}
                className="text-purple-600 hover:underline mb-4 text-sm"
              >
                ← Back
              </button>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Phone number
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCountrySelector(!showCountrySelector)}
                      className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[120px]"
                    >
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <span className="text-sm font-mono">{selectedCountry.code}</span>
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    </button>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Phone number"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {showCountrySelector && (
                  <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                    <div className="p-3 border-b border-gray-300 dark:border-gray-600">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search countries..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredCountries.map((country, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountrySelector(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <span className="text-xl">{country.flag}</span>
                          <span className="flex-1">{country.name}</span>
                          <span className="text-sm font-mono text-gray-500">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePhoneContinue}
                  disabled={isLoading || !phoneNumber}
                  className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isLoading ? 'Sending code...' : 'Continue'}
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 text-center text-xs text-gray-600 dark:text-gray-400">
          By continuing, you agree to our{' '}
          <a href="#" className="underline">Terms</a>
          {' '}and have read our{' '}
          <a href="#" className="underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}

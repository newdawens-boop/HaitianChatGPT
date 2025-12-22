import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const email = (location.state as any)?.email || '';
  const phone = (location.state as any)?.phone || '';
  const isExisting = (location.state as any)?.isExisting || false;
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isPhone = phone !== '';

  useEffect(() => {
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast.success('Successfully verified!');
        
        // Map user and login
        const authUser = {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata?.username || 
                   session.user.user_metadata?.full_name || 
                   session.user.email!.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url || 
                 session.user.user_metadata?.picture,
        };
        
        login(authUser);
        
        // Auto-redirect to home
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, login]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      if (isPhone) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        });
        if (error) throw error;
      }
      
      toast.success('Verification code resent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length < 6) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      if (isPhone) {
        const { error } = await supabase.auth.verifyOtp({
          phone: phone,
          token: code,
          type: 'sms',
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.verifyOtp({
          email: email,
          token: code,
          type: 'email',
        });
        if (error) throw error;
      }
      
      // Auth listener will handle the redirect
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {isPhone ? (
              <Phone className="w-8 h-8 text-white" />
            ) : (
              <Mail className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold">Check your {isPhone ? 'phone' : 'inbox'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter the verification code we just sent to
          </p>
          <p className="text-purple-600 dark:text-purple-400 font-medium mt-1">
            {email || phone}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-500 bg-white dark:bg-gray-800 focus:border-purple-600 focus:outline-none text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? 'Verifying...' : 'Continue'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="w-full text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium disabled:opacity-50"
          >
            {isResending ? 'Sending...' : `Resend ${isPhone ? 'SMS' : 'email'}`}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <a href="#" className="hover:underline">Terms of Use</a>
          {' | '}
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

export function VerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { email, phone, password, type } = location.state || {};

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email && !phone) {
      navigate('/auth');
    }
  }, [email, phone, navigate]);

  const handleVerify = async () => {
    if (!code || code.length < 4) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      if (email) {
        // Verify email OTP
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'email',
        });

        if (error) throw error;

        // If this is a signup, set the password
        if (type === 'signup' && password && data.user) {
          const { error: updateError } = await supabase.auth.updateUser({
            password,
            data: {
              username: email.split('@')[0],
            },
          });

          if (updateError) throw updateError;
        }

        if (data.user) {
          const authUser = {
            id: data.user.id,
            email: data.user.email!,
            username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
            avatar: data.user.user_metadata?.avatar_url,
          };
          login(authUser);
          navigate('/');
          toast.success('Successfully logged in!');
        }
      } else if (phone) {
        // Verify phone OTP
        const { data, error } = await supabase.auth.verifyOtp({
          phone,
          token: code,
          type: 'sms',
        });

        if (error) throw error;

        // If this is a signup, set the password
        if (type === 'signup' && password && data.user) {
          const { error: updateError } = await supabase.auth.updateUser({
            password,
            data: {
              username: phone.replace(/\D/g, '').slice(-10),
            },
          });

          if (updateError) throw updateError;
        }

        if (data.user) {
          const authUser = {
            id: data.user.id,
            email: data.user.email || phone,
            username: data.user.user_metadata?.username || phone.replace(/\D/g, '').slice(-10),
            avatar: data.user.user_metadata?.avatar_url,
          };
          login(authUser);
          navigate('/');
          toast.success('Successfully logged in!');
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (email) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: type === 'signup',
          },
        });

        if (error) throw error;
        toast.success('New verification code sent to your email');
      } else if (phone) {
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: {
            shouldCreateUser: type === 'signup',
          },
        });

        if (error) throw error;
        toast.success('New verification code sent via SMS');
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Haitian ChatGPT</h1>
          <h2 className="text-2xl font-semibold mb-2">Check your {email ? 'inbox' : 'phone'}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the verification code we just sent to {email || phone}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter code"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-purple-500 text-center text-2xl tracking-widest"
              autoFocus
              maxLength={6}
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || code.length < 4}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full text-gray-600 dark:text-gray-400 hover:underline"
          >
            {resending ? 'Sending...' : 'Resend code'}
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

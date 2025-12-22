import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function CreatePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, phone, method } = location.state || {};

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    if (!email && !phone) {
      navigate('/auth');
    }
  }, [email, phone, navigate]);

  useEffect(() => {
    setPasswordChecks({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleContinue = async () => {
    if (!isPasswordValid) {
      toast.error('Password does not meet all requirements');
      return;
    }

    setLoading(true);
    try {
      if (method === 'email') {
        // Send OTP to email
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            data: {
              password_to_set: password,
            },
          },
        });

        if (error) throw error;

        navigate('/verify', {
          state: { email, password, type: 'signup' },
        });
        toast.success('Verification code sent to your email');
      } else if (method === 'phone') {
        // Send SMS OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: {
            shouldCreateUser: true,
            data: {
              password_to_set: password,
            },
          },
        });

        if (error) throw error;

        navigate('/verify', {
          state: { phone, password, type: 'signup' },
        });
        toast.success('Verification code sent via SMS');
      }
    } catch (error: any) {
      console.error('Password creation error:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Haitian ChatGPT</h1>
          <h2 className="text-2xl font-semibold mb-2">Create a password</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You'll use this password to log in to Haitian ChatGPT
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-2">
              {method === 'email' ? 'Email address' : 'Phone number'}
            </label>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <span>{email || phone}</span>
              <button
                onClick={() => navigate('/auth')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Edit
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-purple-500"
                autoFocus
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {password && (
            <div className="p-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl">
              <p className="text-sm font-medium mb-2">Your password must contain:</p>
              <div className="space-y-1">
                <PasswordCheck
                  label="At least 12 characters"
                  met={passwordChecks.length}
                />
                <PasswordCheck
                  label="At least one uppercase letter"
                  met={passwordChecks.uppercase}
                />
                <PasswordCheck
                  label="At least one lowercase letter"
                  met={passwordChecks.lowercase}
                />
                <PasswordCheck
                  label="At least one number"
                  met={passwordChecks.number}
                />
                <PasswordCheck
                  label="At least one special character"
                  met={passwordChecks.special}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={loading || !isPasswordValid}
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

function PasswordCheck({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      )}
      <span className={met ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}>
        {label}
      </span>
    </div>
  );
}

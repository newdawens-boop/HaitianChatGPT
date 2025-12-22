import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';
  
  const [formData, setFormData] = useState({
    email: email,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules
  const passwordRules = [
    {
      text: 'At least 12 characters',
      test: (pwd: string) => pwd.length >= 12,
    },
    {
      text: 'Contains uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      text: 'Contains lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      text: 'Contains a number',
      test: (pwd: string) => /[0-9]/.test(pwd),
    },
    {
      text: 'Contains special character',
      test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
    },
  ];

  const getPasswordStrength = () => {
    const passedRules = passwordRules.filter((rule) => rule.test(formData.password)).length;
    if (passedRules <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
    if (passedRules <= 3) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (passedRules <= 4) return { label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allRulesPassed = passwordRules.every((rule) => rule.test(formData.password));
    if (!allRulesPassed) {
      toast.error('Please meet all password requirements');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success('Verification email sent!');
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">HC</span>
          </div>
          <h1 className="text-2xl font-bold">Create a password</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You'll use this password to log in to Haitian ChatGPT
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none pr-16"
                required
              />
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 font-medium text-sm"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-500 bg-white dark:bg-gray-800 focus:border-purple-600 focus:outline-none pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Password strength:
                  </span>
                  <span className={`text-sm font-medium ${
                    strength.label === 'Weak' ? 'text-red-600' :
                    strength.label === 'Fair' ? 'text-yellow-600' :
                    strength.label === 'Good' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: strength.width }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Password Requirements */}
          {formData.password && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium mb-3">Your password must contain:</p>
              <ul className="space-y-2">
                {passwordRules.map((rule, index) => {
                  const passed = rule.test(formData.password);
                  return (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      {passed ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={passed ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}>
                        {rule.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !passwordRules.every((rule) => rule.test(formData.password))}
            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? 'Creating account...' : 'Continue'}
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

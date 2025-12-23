import { supabase } from './supabase';

export const authService = {
  /**
   * Check if email exists in user_profiles table
   */
  async checkEmailExists(email: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    return !!data;
  },

  /**
   * Auto login with email only (for existing users)
   * Sends OTP and returns success/error
   */
  async autoLoginWithEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user exists
      const userExists = await this.checkEmailExists(email);

      if (!userExists) {
        return { success: false, error: 'User not found. Please sign up first.' };
      }

      // Send OTP for verification
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new user
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    return !!data;
  },

  /**
   * Check if user is admin by email
   */
  async isAdminByEmail(email: string): Promise<boolean> {
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    return !!data;
  },
};

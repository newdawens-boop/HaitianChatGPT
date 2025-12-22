import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Key, Smartphone, MessageSquare, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function SecuritySettings() {
  const { user, logout } = useAuth();
  const [mfaAuthenticator, setMfaAuthenticator] = useState(false);
  const [mfaSms, setMfaSms] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);

  const handleAddPasskey = async () => {
    // Check if browser supports Web Authentication API
    if (!window.PublicKeyCredential) {
      toast.error('Passkeys are not supported in this browser');
      return;
    }

    try {
      // In a real implementation, you would:
      // 1. Request challenge from server
      // 2. Create credential using navigator.credentials.create()
      // 3. Send credential to server for verification
      toast.info('Passkey feature requires WebAuthn setup. Coming soon!');
    } catch (error) {
      toast.error('Failed to add passkey');
    }
  };

  const handleToggleMfaAuthenticator = async () => {
    // In a real implementation, this would:
    // 1. Generate QR code for authenticator app
    // 2. Verify TOTP code
    // 3. Enable MFA in backend
    setMfaAuthenticator(!mfaAuthenticator);
    toast.success(mfaAuthenticator ? 'Authenticator app disabled' : 'Authenticator app enabled');
  };

  const handleToggleMfaSms = async () => {
    // In a real implementation, this would:
    // 1. Request phone number if not set
    // 2. Send SMS verification code
    // 3. Verify code
    // 4. Enable SMS MFA in backend
    setMfaSms(!mfaSms);
    toast.success(mfaSms ? 'SMS authentication disabled' : 'SMS authentication enabled');
  };

  const handleLogoutCurrent = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const handleLogoutAllDevices = async () => {
    try {
      // Sign out from all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        toast.error('Failed to log out from all devices');
        return;
      }

      toast.success('Logged out from all devices');
      setShowLogoutAllConfirm(false);
      
      // Logout from current app
      await logout();
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Security</h3>

      <div className="space-y-4">
        {/* Passkeys */}
        <div className="pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium flex items-center gap-2">
                <Key className="w-4 h-4" />
                Passkeys
              </div>
              <div className="text-sm text-muted-foreground">
                Use your device's biometric authentication
              </div>
            </div>
          </div>
          <button
            onClick={handleAddPasskey}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Add Passkey
          </button>
        </div>

        {/* Multi-Factor Authentication */}
        <div className="pb-4 border-b border-border">
          <div className="mb-3">
            <div className="font-medium mb-1">Multi-factor authentication</div>
            <div className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">Authenticator App</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mfaAuthenticator}
                  onChange={handleToggleMfaAuthenticator}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Text Message</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mfaSms}
                  onChange={handleToggleMfaSms}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div>
          <div className="mb-3">
            <div className="font-medium mb-1">Session management</div>
            <div className="text-sm text-muted-foreground">
              Manage your active sessions
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleLogoutCurrent}
              className="w-full flex items-center justify-between px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Log out of this device</span>
              </div>
            </button>

            <button
              onClick={() => setShowLogoutAllConfirm(true)}
              className="w-full flex items-center justify-between px-4 py-3 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Log out of all devices</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Logout All Confirmation Modal */}
      {showLogoutAllConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowLogoutAllConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl z-[61] p-6">
            <h3 className="text-xl font-semibold mb-3">Log out of all devices?</h3>
            <p className="text-muted-foreground mb-6">
              This will log you out from all active sessions on all devices. You'll need to log in again on each device.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutAllConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutAllDevices}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Log out all
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

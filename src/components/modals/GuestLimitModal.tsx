import { useNavigate } from 'react-router-dom';

interface GuestLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuestLimitModal({ isOpen, onClose }: GuestLimitModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/auth');
  };

  const handleSignup = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-center mb-3">Message limit reached</h2>
        <p className="text-center text-muted-foreground mb-6">
          You've reached the 10-message limit for guest mode. Log in or sign up to continue chatting.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Log in
          </button>

          <button
            onClick={handleSignup}
            className="w-full py-3 bg-background text-foreground border-2 border-border rounded-full font-medium hover:bg-muted transition-colors"
          >
            Sign up for free
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

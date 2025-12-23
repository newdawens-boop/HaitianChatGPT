import { useNavigate } from 'react-router-dom';
import { useGuestStore } from '@/stores/guestStore';
import { X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const navigate = useNavigate();
  const { setGuestMode, setHasSeenWelcome } = useGuestStore();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/auth');
  };

  const handleSignup = () => {
    onClose();
    navigate('/auth');
  };

  const handleStayLoggedOut = () => {
    setGuestMode(true);
    setHasSeenWelcome(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-bold text-center mb-3">Welcome back</h2>
        <p className="text-center text-muted-foreground mb-8">
          Log in or sign up to get smarter responses, upload files and images, and more.
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
            onClick={handleStayLoggedOut}
            className="w-full py-2 text-muted-foreground hover:text-foreground underline text-sm transition-colors"
          >
            Stay logged out
          </button>
        </div>
      </div>
    </div>
  );
}

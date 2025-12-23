import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, HelpCircle, Paperclip, Globe, BookOpen, Image as ImageIcon, ArrowUp } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { useGuestStore } from '@/stores/guestStore';
import { WelcomeModal } from '@/components/modals/WelcomeModal';

export function WelcomePage() {
  const navigate = useNavigate();
  const { openUserMenu } = useModalStore();
  const { hasSeenWelcome, setHasSeenWelcome } = useGuestStore();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, [hasSeenWelcome]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => {
          setShowWelcomeModal(false);
          setHasSeenWelcome(true);
        }}
      />

      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={openUserMenu}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">ChatGPT</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-2 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Log in
          </button>
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-medium text-muted-foreground mb-12">Ready when you are.</h2>
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask anything"
              onClick={() => setShowWelcomeModal(true)}
              readOnly
              className="w-full px-16 py-4 pr-14 bg-muted rounded-full outline-none cursor-pointer hover:bg-accent transition-colors text-center"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground pointer-events-none">
              <button className="w-8 h-8 hover:bg-accent rounded-full flex items-center justify-center transition-colors opacity-50">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 hover:bg-accent rounded-full flex items-center justify-center transition-colors opacity-50">
                <Globe className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 hover:bg-accent rounded-full flex items-center justify-center transition-colors opacity-50">
                <BookOpen className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 hover:bg-accent rounded-full flex items-center justify-center transition-colors opacity-50">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-muted-foreground/20 text-muted-foreground rounded-full flex items-center justify-center transition-colors">
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            By messaging ChatGPT, an AI chatbot, you agree to our{' '}
            <a href="#" className="underline">Terms</a> and have read our{' '}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

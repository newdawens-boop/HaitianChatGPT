import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Mic, ArrowUp } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { useGuestStore } from '@/stores/guestStore';
import { useAuth } from '@/lib/auth';
import { WelcomeModal } from '@/components/modals/WelcomeModal';
import { AttachmentModal } from '@/components/modals/AttachmentModal';
import { UserMenu } from '@/components/modals/UserMenu';
import { ChatMessage } from '@/components/features/ChatMessage';
import { Message } from '@/types/chat';
import { chatService } from '@/lib/chatService';
import { toast } from 'sonner';

export function WelcomePage() {
  const navigate = useNavigate();
  const { setUserMenuOpen } = useModalStore();
  const { user } = useAuth();
  const { hasSeenWelcome, setHasSeenWelcome, messageCount, incrementMessageCount, isLimitReached } = useGuestStore();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, [hasSeenWelcome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check 20 message limit for guests
    if (isLimitReached()) {
      toast.error('You have reached the 20 message limit. Please log in to continue.');
      navigate('/auth');
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    incrementMessageCount();

    try {
      const conversationMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userMessage.content },
      ];

      const { message, error } = await chatService.sendMessage(conversationMessages);

      if (error) {
        toast.error(error);
        return;
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: message,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCall = () => {
    navigate('/voice');
  };

  const handlePickMedia = (files: File[]) => {
    console.log('Selected files:', files);
    toast.success(`Selected ${files.length} file(s)`);
  };

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

      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        onPickMedia={handlePickMedia}
      />

      {/* User Menu */}
      <UserMenu />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <button
          onClick={() => navigate('/chat')}
          className="p-2 hover:bg-accent/50 rounded-lg transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setUserMenuOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent/50 rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">{user?.username || 'Dawinix'}</span>
        </button>
        
        <div className="flex items-center gap-1">
          <button
            className="p-2 hover:bg-accent/50 rounded-lg transition-colors opacity-40 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-accent/50 rounded-lg transition-colors opacity-40 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <h2 className="text-4xl md:text-5xl font-normal text-foreground/80">
              Ready when you are.
            </h2>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
            {isLoading && (
              <div className="py-6 px-4 bg-muted/30">
                <div className="max-w-3xl mx-auto flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">HC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background border-t border-border/40">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-1 sm:gap-2 bg-card border border-border/60 rounded-[22px] sm:rounded-[26px] shadow-sm hover:shadow-md transition-shadow p-1.5 sm:p-2">
              <button
                type="button"
                onClick={() => setShowAttachmentModal(true)}
                className="flex-shrink-0 p-2 sm:p-2.5 hover:bg-accent/80 rounded-full transition-colors"
                aria-label="Attach file"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask anything"
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none py-2 sm:py-2.5 px-1 sm:px-2 max-h-[150px] sm:max-h-[200px] overflow-y-auto text-sm sm:text-[15px]"
                style={{ fieldSizing: 'content' } as any}
              />

              <button
                type="button"
                onClick={handleVoiceCall}
                className="flex-shrink-0 p-2 sm:p-2.5 hover:bg-accent/80 rounded-full transition-colors"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                type="submit"
                disabled={!input.trim() || isLoading || (!user && isLimitReached())}
                className={`flex-shrink-0 p-2 sm:p-2.5 rounded-full transition-all ${
                  input.trim() && !isLoading && (user || !isLimitReached())
                    ? 'bg-foreground text-background hover:opacity-90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>

          <div className="mt-2 sm:mt-3 text-center px-2">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {!user && `${20 - messageCount} free messages remaining. `}
              Dawinix can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
after 20 free message auto send to login for more or kick them out and put a login button if they want to login to dont stay in free user
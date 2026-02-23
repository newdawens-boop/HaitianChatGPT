import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Phone, Settings, ArrowUp } from 'lucide-react';
import { useModalStore } from '@/stores/modalStore';
import { useGuestStore } from '@/stores/guestStore';
import { WelcomeModal } from '@/components/modals/WelcomeModal';
import { ChatMessage } from '@/components/features/ChatMessage';
import { Message } from '@/types/chat';
import { chatService } from '@/lib/chatService';
import { toast } from 'sonner';

export function WelcomePage() {
  const navigate = useNavigate();
  const { openUserMenu, setAttachmentMenuOpen } = useModalStore();
  const { hasSeenWelcome, setHasSeenWelcome, messageCount, incrementMessageCount, isLimitReached } = useGuestStore();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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
    toast.info('Connecting to voice mode...');
    navigate('/voice');
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

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={openUserMenu}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-semibold">Dawinix</h1>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceCall}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            title="Voice call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-3xl md:text-4xl font-medium text-muted-foreground">
                Ready when you are.
              </h2>
              <p className="text-sm text-muted-foreground">
                {20 - messageCount} free messages remaining
              </p>
            </div>
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
      <div className="sticky bottom-0 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2 bg-card border border-border rounded-3xl shadow-lg p-2">
              <button
                type="button"
                onClick={() => setAttachmentMenuOpen(true)}
                className="flex-shrink-0 p-2.5 hover:bg-accent rounded-full transition-colors"
              >
                <Plus className="w-5 h-5" />
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
                className="flex-1 resize-none bg-transparent outline-none py-2.5 px-2 max-h-[200px] scrollbar-hide"
                style={{ fieldSizing: 'content' } as any}
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading || isLimitReached()}
                className={`flex-shrink-0 p-2.5 rounded-full transition-all ${
                  input.trim() && !isLoading && !isLimitReached()
                    ? 'bg-foreground text-background hover:opacity-90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Dawinix can make mistakes. Check important info. {20 - messageCount} messages left.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

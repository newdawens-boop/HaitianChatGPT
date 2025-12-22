import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shareService } from '@/lib/shareService';
import { Chat, Message } from '@/types/chat';
import { MessageContent } from '@/components/features/MessageContent';
import { Loader2, AlertCircle } from 'lucide-react';

export function SharedConversationPage() {
  const { token } = useParams<{ token: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSharedConversation(token);
    }
  }, [token]);

  const loadSharedConversation = async (token: string) => {
    setLoading(true);
    const result = await shareService.getSharedConversation(token);
    
    if (result) {
      setChat(result.chat);
      setMessages(result.messages);
    } else {
      setError('This conversation is not available or has been removed.');
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Conversation Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {error || 'This shared conversation does not exist or is no longer available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{chat.title}</h1>
          <p className="text-muted-foreground">
            Shared conversation from Haitian ChatGPT
          </p>
        </div>

        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-foreground text-background'
                    : 'bg-accent text-foreground'
                }`}
              >
                <MessageContent
                  content={message.content}
                  attachments={message.attachments as any}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Try Haitian ChatGPT for free
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Start Chatting
          </a>
        </div>
      </div>
    </div>
  );
}

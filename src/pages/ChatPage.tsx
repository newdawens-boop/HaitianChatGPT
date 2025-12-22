import { ChatHeader } from '@/components/features/ChatHeader';
import { ChatMessage } from '@/components/features/ChatMessage';
import { ChatInput } from '@/components/features/ChatInput';
import { useChatStore } from '@/stores/chatStore';
import { Sparkles } from 'lucide-react';

export function ChatPage() {
  const { messages, currentChatId } = useChatStore();
  const showEmptyState = messages.length === 0 && !currentChatId;

  return (
    <div className="flex flex-col h-screen">
      {!showEmptyState && <ChatHeader />}
      
      <div className="flex-1 overflow-y-auto">
        {showEmptyState ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-center">
              What are you working on?
            </h1>
          </div>
        ) : (
          <div className="pb-32">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  );
}

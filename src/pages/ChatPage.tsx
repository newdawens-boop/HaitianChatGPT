import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from '@/components/features/ChatHeader';
import { ChatMessage } from '@/components/features/ChatMessage';
import { ChatInput } from '@/components/features/ChatInput';
import { ImagePlaceholder } from '@/components/features/ImagePlaceholder';
import { GuestLimitModal } from '@/components/modals/GuestLimitModal';
import { useChatStore } from '@/stores/chatStore';
import { useGuestStore } from '@/stores/guestStore';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { chatService } from '@/lib/chatService';

export function ChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, currentChatId, isLoading, loadingStatus } = useChatStore();
  const { isGuestMode, isLimitReached } = useGuestStore();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState("What are you working on?");
  const showEmptyState = messages.length === 0 && !currentChatId;

  // Chanje mesaj o aza lè konpozan an monte
  useEffect(() => {
    const messagesArray = [
  "What are you working on?",
  "Share your thoughts!",
  "Type something interesting...",
  "What's happening today?",
  "Let's get productive!",
  "Any ideas you want to explore?",
  "Tell me something new!",
  "What's on your mind?",
  "Start typing your story...",
  "Share your latest project!",
  "What are you thinking about?",
  "Got any goals for today?",
  "Express yourself here!",
  "What's your next move?",
  "Write something amazing!",
  "Your thoughts matter!",
  "Start a conversation!",
  "What's exciting you lately?",
  "Let's create something!",
  "Your ideas go here...",
  "What's inspiring you today?",
  "Drop a message!",
  "Let's collaborate!",
  "What challenge are you facing?",
  "Time to brainstorm!"
];

    const randomMessage = messagesArray[Math.floor(Math.random() * messagesArray.length)];
    setEmptyMessage(randomMessage);
  }, []); // [] = sèlman lè konpozan monte

  // Check guest limit
  if (isGuestMode && isLimitReached() && !showLimitModal) {
    setShowLimitModal(true);
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Guest Limit Modal */}
      <GuestLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
      {!showEmptyState && <ChatHeader />}
      
      <div className="flex-1 overflow-y-auto">
        {showEmptyState ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-center">
              {emptyMessage}
            </h1>
          </div>
        ) : (
          <div className="pb-32">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Loading status */}
            {isLoading && loadingStatus && (
              <div className="py-6 px-4 bg-muted/30">
                <div className="max-w-3xl mx-auto flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">HC</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    {loadingStatus.includes('image') ? (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{loadingStatus}</p>
                        <ImagePlaceholder />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">{loadingStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  );
}

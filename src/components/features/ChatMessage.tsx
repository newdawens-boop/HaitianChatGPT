import { Message } from '@/types/chat';
import { Copy, ThumbsUp, ThumbsDown, Share2, RotateCw, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { MessageActionsMenu } from '../modals/MessageActionsMenu';
import { useModalStore } from '@/stores/modalStore';
import { useChatStore } from '@/stores/chatStore';
import { chatService } from '@/lib/chatService';
import { useAuth } from '@/lib/auth';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
  messageIndex?: number;
  totalMessages?: number;
}

export function ChatMessage({ message, isLatest = false, messageIndex = 1, totalMessages = 1 }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const { isMessageActionsOpen, setMessageActionsOpen } = useModalStore();
  const { messages, setMessages, currentChatId, setIsLoading } = useChatStore();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Copied to clipboard');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: message.content,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    toast.success(isLiked ? 'Feedback removed' : 'Thanks for your feedback!');
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    toast.success(isDisliked ? 'Feedback removed' : 'Thanks for your feedback!');
  };

  const handleMoreOptions = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left,
      y: rect.bottom + 8,
    });
    setMessageActionsOpen(true);
  };

  const handleTryAgain = async () => {
    if (!currentChatId || !user) return;

    // Get the user message that prompted this response
    const messageIdx = messages.findIndex((m) => m.id === message.id);
    if (messageIdx <= 0) return;

    const userMessage = messages[messageIdx - 1];
    if (userMessage.role !== 'user') return;

    // Remove the current AI response
    const updatedMessages = messages.slice(0, messageIdx);
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const conversationMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));
      const { message: newResponse, error } = await chatService.sendMessage(conversationMessages, currentChatId);

      if (error) {
        toast.error(error);
        return;
      }

      const newMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: newResponse,
        created_at: new Date().toISOString(),
      };

      setMessages([...updatedMessages, newMessage]);

      // Reload from database
      const dbMessages = await chatService.getChatMessages(currentChatId);
      setMessages(dbMessages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDetails = async () => {
    if (!currentChatId || !user) return;

    const messageIdx = messages.findIndex((m) => m.id === message.id);
    if (messageIdx <= 0) return;

    const userMessage = messages[messageIdx - 1];
    if (userMessage.role !== 'user') return;

    const updatedMessages = messages.slice(0, messageIdx);
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const conversationMessages = [
        ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: `${userMessage.content}\n\nPlease provide more details in your response.` },
      ];

      const { message: newResponse, error } = await chatService.sendMessage(conversationMessages, currentChatId);

      if (error) {
        toast.error(error);
        return;
      }

      const newMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: newResponse,
        created_at: new Date().toISOString(),
      };

      setMessages([...updatedMessages, newMessage]);

      const dbMessages = await chatService.getChatMessages(currentChatId);
      setMessages(dbMessages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoreConcise = async () => {
    if (!currentChatId || !user) return;

    const messageIdx = messages.findIndex((m) => m.id === message.id);
    if (messageIdx <= 0) return;

    const userMessage = messages[messageIdx - 1];
    if (userMessage.role !== 'user') return;

    const updatedMessages = messages.slice(0, messageIdx);
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const conversationMessages = [
        ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: `${userMessage.content}\n\nPlease make your response more concise.` },
      ];

      const { message: newResponse, error } = await chatService.sendMessage(conversationMessages, currentChatId);

      if (error) {
        toast.error(error);
        return;
      }

      const newMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: newResponse,
        created_at: new Date().toISOString(),
      };

      setMessages([...updatedMessages, newMessage]);

      const dbMessages = await chatService.getChatMessages(currentChatId);
      setMessages(dbMessages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message.content);
      window.speechSynthesis.speak(utterance);
      toast.success('Reading message...');
    } else {
      toast.error('Text-to-speech not supported');
    }
  };

  return (
    <div className={`group py-6 px-4 ${!isUser ? 'bg-muted/30' : ''}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {isUser ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                U
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">HC</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {/* Actions */}
            {!isUser && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Pagination for long messages */}
                {totalMessages > 1 && (
                  <div className="flex items-center gap-1 mr-2">
                    <button className="p-1.5 hover:bg-accent rounded transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {messageIndex}/{totalMessages}
                    </span>
                    <button className="p-1.5 hover:bg-accent rounded transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-accent rounded transition-colors"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLike}
                  className={`p-1.5 hover:bg-accent rounded transition-colors ${
                    isLiked ? 'text-primary' : ''
                  }`}
                  title="Good response"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDislike}
                  className={`p-1.5 hover:bg-accent rounded transition-colors ${
                    isDisliked ? 'text-destructive' : ''
                  }`}
                  title="Bad response"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-1.5 hover:bg-accent rounded transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleTryAgain}
                  className="p-1.5 hover:bg-accent rounded transition-colors"
                  title="Regenerate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleMoreOptions}
                  className="p-1.5 hover:bg-accent rounded transition-colors"
                  title="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            )}

            {isUser && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-accent rounded transition-colors"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Actions Menu */}
      {isMessageActionsOpen && !isUser && (
        <MessageActionsMenu
          messageId={message.id}
          onTryAgain={handleTryAgain}
          onAddDetails={handleAddDetails}
          onMoreConcise={handleMoreConcise}
          onReadAloud={handleReadAloud}
          position={menuPosition}
        />
      )}
    </div>
  );
}

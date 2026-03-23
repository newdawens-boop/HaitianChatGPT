// components/ChatInput.tsx
import { useState, useCallback, useEffect } from 'react';
import { Mic, Plus, ArrowUp, Edit2, X, FileText } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useGuestStore } from '@/stores/guestStore';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AttachmentMenu } from '../modals/AttachmentMenu';
import { AttachmentMenu } from '../modals/AttachmentModal';
import { useModalStore } from '@/stores/modalStore';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useAutoResize } from '@/hooks/useAutoResize';
import { useChatSubmission } from '@/hooks/useChatSubmission';
import { cn } from '@/lib/utils';

interface FileAttachment {
  file: File;
  id: string;
  previewUrl?: string;
}

export function ChatInput() {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const navigate = useNavigate();
  const { setAttachmentMenuOpen } = useModalStore();
  
  const { 
    currentChatId, 
    setCurrentChatId, 
    messages, 
    addMessage, 
    isLoading, 
    setMessages,
    setLoadingStatus,
    editingMessageId,
    setEditingMessageId,
    updateMessage,
    removeMessagesFrom,
    setIsStreaming,
    setStreamingMessageId,
    setSources,
    setShowSourcesSidebar,
    setSearchQuery,
  } = useChatStore();
  
  const { isGuestMode, isLimitReached, incrementMessageCount } = useGuestStore();
  const { user } = useAuth();
  
  const isGuest = isGuestMode || !user;
  const canSendMessage = !isGuest || !isLimitReached();

  const { textareaRef, resize } = useAutoResize({ maxRows: 10 });
  
  const { submitMessage, isSubmitting } = useChatSubmission({
    currentChatId,
    userId: user?.id || null,
    isGuest,
    isLimitReached,
    onError: (error) => {
      if (error.message === 'GUEST_LIMIT_REACHED') {
        toast.error('Message limit reached. Please log in to continue.');
        navigate('/auth');
      } else {
        toast.error(error.message || 'Failed to send message');
      }
    }
  });

  const handleTranscript = useCallback((text: string) => {
    setInput(prev => {
      const newValue = prev ? `${prev} ${text}` : text;
      // Trigger resize after state update
      setTimeout(resize, 0);
      return newValue;
    });
  }, [resize]);

  const { isListening, isSupported: isSpeechSupported, start: startListening, stop: stopListening } = useSpeechToText({
    lang: 'en-US',
    continuous: false,
    interimResults: true,
    onTranscript: handleTranscript,
    onError: (error) => {
      toast.error(`Speech recognition error: ${error}`);
    }
  });

  // Handle editing mode
  useEffect(() => {
    if (!editingMessageId) {
      setInput('');
      return;
    }

    const message = messages.find(m => m.id === editingMessageId);
    if (message) {
      setInput(message.content);
      resize();
      textareaRef.current?.focus();
    }
  }, [editingMessageId, messages, resize, textareaRef]);

  // Auto-resize when input changes
  useEffect(() => {
    resize();
  }, [input, resize]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [input, files, isLoading, isSubmitting]);

  const handleVoiceToggle = useCallback(() => {
    if (isGuest) {
      toast.error('Voice input requires login');
      navigate('/auth');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
      toast.success('Listening... Speak now');
    }
  }, [isGuest, isListening, startListening, stopListening, navigate]);

  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    if (isGuest) {
      toast.error('File uploads require login');
      navigate('/auth');
      return;
    }

    const newAttachments: FileAttachment[] = selectedFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setFiles(prev => [...prev, ...newAttachments]);
    toast.success(`${selectedFiles.length} file(s) attached`);
  }, [isGuest, navigate]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
  }, [files]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setInput('');
    clearFiles();
  }, [setEditingMessageId, clearFiles]);

  const handleSubmit = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || isSubmitting) return;

    // Guest chat creation
    if (isGuest && !currentChatId) {
      setCurrentChatId(crypto.randomUUID());
    }

    if (!user && !isGuest) {
      navigate('/auth');
      return;
    }

    const fileList = files.map(f => f.file);
    
    try {
      if (editingMessageId) {
        // Handle edit mode
        const messageIndex = messages.findIndex(m => m.id === editingMessageId);
        if (messageIndex === -1) return;

        updateMessage(editingMessageId, { content: trimmedInput });
        
        const nextMessage = messages[messageIndex + 1];
        if (nextMessage) {
          removeMessagesFrom(nextMessage.id);
        }
        
        setEditingMessageId(null);
        setInput('');
        
        const conversationMessages = messages
          .slice(0, messageIndex + 1)
          .map(m => ({ 
            role: m.role, 
            content: m.id === editingMessageId ? trimmedInput : m.content 
          }));

        await submitMessage(trimmedInput, fileList, conversationMessages, {
          addMessage,
          updateMessage,
          removeMessagesFrom,
          setLoadingStatus,
          setIsStreaming,
          setStreamingMessageId,
          setSources,
          setShowSourcesSidebar,
          setSearchQuery,
        });

        if (user && currentChatId) {
          const updated = await chatService.getChatMessages(currentChatId);
          setMessages(updated);
        }
      } else {
        // Handle new message
        const userMessage = {
          id: crypto.randomUUID(),
          role: 'user' as const,
          content: trimmedInput,
          created_at: new Date().toISOString(),
          attachments: files.map(f => ({
            name: f.file.name,
            type: f.file.type,
            url: f.previewUrl || '',
          })),
        };

        // Create chat for authenticated users
        let chatId = currentChatId;
        if (!chatId && user) {
          const newChat = await chatService.createChat(
            trimmedInput.slice(0, 50), 
            user.id, 
            true
          );
          if (!newChat) {
            toast.error('Failed to create chat');
            return;
          }
          chatId = newChat.id;
          setCurrentChatId(chatId);
        }

        addMessage(userMessage);
        setInput('');
        clearFiles();
        
        if (isGuest) incrementMessageCount();

        const conversationMessages = [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: trimmedInput },
        ];

        await submitMessage(trimmedInput, fileList, conversationMessages, {
          addMessage,
          updateMessage,
          removeMessagesFrom,
          setLoadingStatus,
          setIsStreaming,
          setStreamingMessageId,
          setSources,
          setShowSourcesSidebar,
          setSearchQuery,
        });

        if (user && chatId) {
          const updated = await chatService.getChatMessages(chatId);
          setMessages(updated);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  }, [
    input, files, isLoading, isSubmitting, isGuest, currentChatId, user, 
    editingMessageId, messages, submitMessage, addMessage, updateMessage, 
    removeMessagesFrom, setLoadingStatus, setIsStreaming, setStreamingMessageId,
    setSources, setShowSourcesSidebar, setSearchQuery, setCurrentChatId, 
    setMessages, setEditingMessageId, incrementMessageCount, clearFiles, navigate
  ]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isGuest) {
      toast.error('File uploads require login');
      return;
    }
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  }, [isGuest, handleFileSelect]);

  const isProcessing = isLoading || isSubmitting;
  const hasContent = input.trim().length > 0 || files.length > 0;

  return (
    <div 
      className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg m-2 flex items-center justify-center z-50 pointer-events-none">
          <span className="text-primary font-medium">Drop files here</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Edit Mode Banner */}
        {editingMessageId && (
          <div className="mb-3 flex items-center justify-between bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
              <Edit2 className="w-4 h-4" />
              <span>Editing message</span>
            </div>
            <button
              onClick={handleCancelEdit}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* File Attachments Preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((attachment) => (
              <div
                key={attachment.id}
                className="group flex items-center gap-2 bg-accent hover:bg-accent/80 px-3 py-1.5 rounded-full text-sm border border-border transition-colors"
              >
                {attachment.previewUrl ? (
                  <img 
                    src={attachment.previewUrl} 
                    alt="" 
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  <FileText className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="truncate max-w-[120px]">{attachment.file.name}</span>
                <button
                  onClick={() => removeFile(attachment.id)}
                  className="opacity-60 hover:opacity-100 hover:text-destructive transition-opacity"
                  aria-label={`Remove ${attachment.file.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="relative"
        >
          <div className={cn(
            "flex items-end gap-2 bg-card border rounded-3xl shadow-lg p-2 transition-all duration-200",
            isDragging ? "border-primary ring-2 ring-primary/20" : "border-border",
            isProcessing && "opacity-80"
          )}>
            {/* Attachment Button */}
            {!editingMessageId && !isGuest && (
              <button
                type="button"
                onClick={() => setAttachmentMenuOpen(true)}
                disabled={isProcessing}
                className="flex-shrink-0 p-2.5 hover:bg-accent rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add attachment"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isGuest && isLimitReached() 
                ? "Message limit reached. Log in to continue..." 
                : "Ask anything..."
              }
              disabled={isProcessing || (isGuest && isLimitReached())}
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none py-2.5 px-2 min-h-[44px] max-h-[240px] overflow-y-auto scrollbar-hide disabled:cursor-not-allowed"
              style={{ lineHeight: '1.5' }}
            />

            {/* Voice Input Button */}
            {!editingMessageId && !isGuest && isSpeechSupported && (
              <button
                type="button"
                onClick={handleVoiceToggle}
                disabled={isProcessing}
                className={cn(
                  "flex-shrink-0 p-2.5 rounded-full transition-all duration-200 disabled:opacity-50",
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                <Mic className="w-5 h-5" />
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!hasContent || isProcessing || !canSendMessage}
              className={cn(
                "flex-shrink-0 p-2.5 rounded-full transition-all duration-200 disabled:cursor-not-allowed",
                hasContent && !isProcessing && canSendMessage
                  ? "bg-foreground text-background hover:opacity-90 hover:scale-105 active:scale-95"
                  : "bg-muted text-muted-foreground"
              )}
              aria-label="Send message"
            >
              <ArrowUp className={cn("w-5 h-5", isProcessing && "animate-bounce")} />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>AI can make mistakes. Verify important information.</span>
          {isGuest && (
            <span className="text-amber-600 dark:text-amber-400">
              Guest mode • Limited messages
            </span>
          )}
        </div>
      </div>

      <AttachmentMenu onFileSelect={handleFileSelect} />
    </div>
  );
}

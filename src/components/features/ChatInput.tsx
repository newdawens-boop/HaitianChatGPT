import { useState, useRef, useEffect } from 'react';
import { Mic, Plus, ArrowUp, Edit2 } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useAuth } from '@/lib/auth';
import { chatService } from '@/lib/chatService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AttachmentMenu } from '../modals/AttachmentMenu';
import { useModalStore } from '@/stores/modalStore';


export function ChatInput() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { 
    currentChatId, 
    setCurrentChatId, 
    messages, 
    addMessage, 
    setIsLoading, 
    isLoading, 
    setMessages,
    setLoadingStatus,
    editingMessageId,
    setEditingMessageId,
    updateMessage,
    removeMessagesFrom,
  } = useChatStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setAttachmentMenuOpen } = useModalStore();

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Speech recognition is available
    }
  }, []);

  // Set input when editing
  useEffect(() => {
    if (editingMessageId) {
      const message = messages.find(m => m.id === editingMessageId);
      if (message) {
        setInput(message.content);
      }
    }
  }, [editingMessageId, messages]);

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Use Web Speech API for voice to text
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast.success('Listening...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      toast.success('Voice input captured');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Failed to recognize speech');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    toast.success(`${files.length} file(s) attached`);
  };

  const determineLoadingStatus = (text: string, hasFiles: boolean): string => {
    const lowerText = text.toLowerCase();
    
    if (hasFiles) {
      const hasImage = selectedFiles.some(f => f.type.startsWith('image/'));
      if (hasImage) return 'Analyzing...';
      return 'Processing file...';
    }
    
    if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('look up')) {
      return 'Searching the web...';
    }
    
    if (lowerText.includes('create image') || lowerText.includes('generate image') || 
        lowerText.includes('create logo') || lowerText.includes('make a logo') ||
        lowerText.includes('design a') || lowerText.includes('draw')) {
      return 'Creating image...';
    }
    
    return 'Thinking...';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (editingMessageId) {
      // Edit existing message
      const messageIndex = messages.findIndex(m => m.id === editingMessageId);
      if (messageIndex >= 0) {
        // Update the user message
        updateMessage(editingMessageId, { content: input.trim() });
        
        // Remove all messages after this one (including AI response)
        const nextMessages = messages.slice(messageIndex + 1);
        if (nextMessages.length > 0) {
          removeMessagesFrom(nextMessages[0].id);
        }
        
        setEditingMessageId(null);
        setInput('');
        setIsLoading(true);
        
        // Determine loading status
        const status = determineLoadingStatus(input.trim(), selectedFiles.length > 0);
        setLoadingStatus(status);

        try {
          const conversationMessages = messages
            .slice(0, messageIndex + 1)
            .map((m) => ({ role: m.role, content: m.id === editingMessageId ? input.trim() : m.content }));

          const { message, error } = await chatService.sendMessage(conversationMessages, currentChatId || undefined);

          if (error) {
            toast.error(error);
            return;
          }

          const assistantMessage = {
            id: crypto.randomUUID(),
            role: 'assistant' as const,
            content: message,
            created_at: new Date().toISOString(),
          };

          addMessage(assistantMessage);

          // Reload messages from database
          if (currentChatId) {
            const updatedMessages = await chatService.getChatMessages(currentChatId);
            setMessages(updatedMessages);
          }
          
          setSelectedFiles([]);
        } catch (error: any) {
          toast.error(error.message || 'Failed to send message');
        } finally {
          setIsLoading(false);
          setLoadingStatus(null);
        }
        return;
      }
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input.trim(),
      created_at: new Date().toISOString(),
      attachments: selectedFiles.map(f => ({
        name: f.name,
        type: f.type,
        url: URL.createObjectURL(f),
      })),
    };

    // Create new chat if needed
    let chatId = currentChatId;
    if (!chatId) {
      const newChat = await chatService.createChat(input.trim().slice(0, 50), user.id, true);
      if (newChat) {
        chatId = newChat.id;
        setCurrentChatId(chatId);
      } else {
        toast.error('Failed to create chat');
        setIsLoading(false);
        return;
      }
    }

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    
    // Determine loading status
    const status = determineLoadingStatus(userMessage.content, selectedFiles.length > 0);
    setLoadingStatus(status);

    try {
      const conversationMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content },
      ];

      const { message, error } = await chatService.sendMessage(conversationMessages, chatId || undefined);

      if (error) {
        toast.error(error);
        return;
      }

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: message,
        created_at: new Date().toISOString(),
      };

      addMessage(assistantMessage);

      // Reload messages from database to ensure sync
      if (chatId) {
        const updatedMessages = await chatService.getChatMessages(chatId);
        setMessages(updatedMessages);
      }
      
      setSelectedFiles([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
      setLoadingStatus(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInput('');
  };

  return (
    <div className="sticky bottom-0 bg-background border-t border-border">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 bg-card border border-border rounded-3xl shadow-lg p-2">
            {editingMessageId && (
              <div className="absolute -top-10 left-0 right-0 flex items-center justify-between bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-t-xl">
                <div className="flex items-center gap-2 text-sm">
                  <Edit2 className="w-4 h-4" />
                  <span>Editing message</span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {!editingMessageId && (
              <button
                type="button"
                onClick={() => setAttachmentMenuOpen(true)}
                className="flex-shrink-0 p-2.5 hover:bg-accent rounded-full transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}

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

            {!editingMessageId && (
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`flex-shrink-0 p-2.5 rounded-full transition-colors ${
                  isRecording ? 'bg-destructive text-destructive-foreground' : 'hover:bg-accent'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
            )}

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`flex-shrink-0 p-2.5 rounded-full transition-all ${
                input.trim() && !isLoading
                  ? 'bg-foreground text-background hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </form>

        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-accent px-3 py-1.5 rounded-full text-sm"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                  className="hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Haitian ChatGPT can make mistakes. Check important info.
          </p>
        </div>
      </div>

      <AttachmentMenu onFileSelect={handleFileSelect} />
    </div>
  );
}

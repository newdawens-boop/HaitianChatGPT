import { useState, useRef, useEffect } from 'react';
import { Mic, Plus, ArrowUp } from 'lucide-react';
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
  const { currentChatId, setCurrentChatId, messages, addMessage, setIsLoading, isLoading, setMessages } = useChatStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setAttachmentMenuOpen } = useModalStore();

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Speech recognition is available
    }
  }, []);

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
    recognition.lang = 'en-US'; // You can change this to support other languages

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    // Create new chat if needed
    let chatId = currentChatId;
    if (!chatId) {
      // Pass hasMessages=true since we're about to send a message
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              type="button"
              onClick={handleVoiceInput}
              className={`flex-shrink-0 p-2.5 rounded-full transition-colors ${
                isRecording ? 'bg-destructive text-destructive-foreground' : 'hover:bg-accent'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>

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

        <p className="text-center text-xs text-muted-foreground mt-3">
          Haitian ChatGPT can make mistakes. Check important info.
        </p>
      </div>

      <AttachmentMenu onFileSelect={handleFileSelect} />
    </div>
  );
}

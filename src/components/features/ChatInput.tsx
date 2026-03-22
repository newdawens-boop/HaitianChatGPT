import { useState, useRef, useEffect } from 'react';
import { Mic, Plus, ArrowUp, Edit2 } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useGuestStore } from '@/stores/guestStore';
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
    selectedModel,
  } = useChatStore();
  const { isGuestMode, isLimitReached, incrementMessageCount } = useGuestStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setAttachmentMenuOpen } = useModalStore();

  // Disable features for guests
  const isGuest = isGuestMode || !user;
  const canSendMessage = !isGuest || !isLimitReached();

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
    if (isGuest) {
      toast.error('Voice input is available after logging in');
      navigate('/auth');
      return;
    }

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
    if (isGuest) {
      toast.error('File uploads are available after logging in');
      navigate('/auth');
      return;
    }
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

    // Check guest limit
    if (isGuest && isLimitReached()) {
      toast.error('Message limit reached. Please log in to continue.');
      navigate('/auth');
      return;
    }

    // Create guest chat if needed
    if (isGuest && !currentChatId) {
      const guestChatId = crypto.randomUUID();
      setCurrentChatId(guestChatId);
    }

    if (!user && !isGuest) {
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

          const isImageRequest = chatService.isImageRequest(input.trim());

          const response = await chatService.sendMessage(
            conversationMessages, 
            currentChatId || undefined, 
            selectedModel,
            isImageRequest ? 'image' : 'text'
          );

          const { message, images, error } = response;

          if (error) {
            toast.error(error);
            return;
          }

          const assistantMessage = {
            id: crypto.randomUUID(),
            role: 'assistant' as const,
            content: message || 'Images created',
            created_at: new Date().toISOString(),
            generatedImages: images,
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

    // Create new chat if needed (only for authenticated users)
    let chatId = currentChatId;
    if (!chatId && user) {
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
    
    // Increment guest message count
    if (isGuest) {
      incrementMessageCount();
    }
    
    // Determine loading status
    const status = determineLoadingStatus(userMessage.content, selectedFiles.length > 0);
    setLoadingStatus(status);

    try {
      const conversationMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content },
      ];

      // Detect if user wants image generation
      const isImageRequest = chatService.isImageRequest(userMessage.content);

      // Only pass chatId if user is authenticated
      const response = await chatService.sendMessage(
        conversationMessages, 
        user && chatId ? chatId : undefined, 
        selectedModel,
        isImageRequest ? 'image' : 'text'
      );

      const { message, images, error } = response;

      if (error) {
        toast.error(error);
        return;
      }

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: message || 'Images created',
        created_at: new Date().toISOString(),
        generatedImages: images,
      };

      addMessage(assistantMessage);

      // Reload messages from database to ensure sync (only for authenticated users)
      if (user && chatId) {
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

            {!editingMessageId && !isGuest && (
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
              className="flex-1 resize-none bg-transparent outline-none py-2.5 px-2 max-h-[200px] overflow-y-auto scrollbar-hide"
              style={{ fieldSizing: 'content' } as any}
            />

            {!editingMessageId && !isGuest && (
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
              disabled={!input.trim() || isLoading || !canSendMessage}
              className={`flex-shrink-0 p-2.5 rounded-full transition-all ${
                input.trim() && !isLoading && canSendMessage
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
            Dawinix can make mistakes. Check important info.
          </p>
        </div>
      </div>

      <AttachmentMenu onFileSelect={handleFileSelect} />
    </div>
  );
}
Hello AI,

Please fix all my messages and never paste code directly in the chat. Instead, put it in a proper code block. The AI should be able to send multiple types of code, including HTML, TypeScript, Python, and Bash, and fix the formatting so it works correctly.

Make it better like in these examples:

https://files.catbox.moe/helt03.jpeg
https://files.catbox.moe/j5fhkl.jpeg
https://files.catbox.moe/2p3cco.jpeg
https://files.catbox.moe/2wjmw0.jpeg
https://files.catbox.moe/ohocas.jpeg

Also, improve the AI so that it sends functional, real code, and messages are clean and easy to read. If the AI needs to search a link for you, allow it to provide clickable links that actually work, instead of just thinking or pretending. Make it beautiful and functional, like in these examples:

https://files.catbox.moe/kf4x4n.jpeg
https://files.catbox.moe/0y6nns.jpeg in this import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'plaintext' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const isHTML = language?.toLowerCase() === 'html' || code.trim().startsWith('<!DOCTYPE') || code.trim().startsWith('<html');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Professional syntax highlighting colors
  const highlightCode = (code: string, lang: string) => {
    const lines = code.split('\n');
    
    return lines.map((line, i) => {
      let highlighted = line;
      
      // Keywords (purple)
      highlighted = highlighted.replace(
        /\b(function|const|let|var|if|else|return|import|export|from|class|extends|async|await|try|catch|for|while|do|switch|case|break|continue|default|new|this|super|typeof|instanceof)\b/g,
        '<span style="color: #C678DD;">$1</span>'
      );
      
      // Strings (green)
      highlighted = highlighted.replace(
        /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        '<span style="color: #98C379;">$&</span>'
      );
      
      // Numbers (orange)
      highlighted = highlighted.replace(
        /\b(\d+\.?\d*)\b/g,
        '<span style="color: #D19A66;">$1</span>'
      );
      
      // Functions (blue)
      highlighted = highlighted.replace(
        /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
        '<span style="color: #61AFEF;">$1</span>('
      );
      
      // Comments (gray)
      highlighted = highlighted.replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/)/g,
        '<span style="color: #5C6370; font-style: italic;">$1</span>'
      );
      
      // HTML Tags (red)
      highlighted = highlighted.replace(
        /(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)(.*?)(&gt;)/g,
        '<span style="color: #E06C75;">$1$2</span>$3<span style="color: #E06C75;">$4</span>'
      );
      
      // Object properties (cyan)
      highlighted = highlighted.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*):/g,
        '<span style="color: #56B6C2;">$1</span>:'
      );
      
      return (
        <div key={i} className="hover:bg-white/5 px-4 -mx-4 transition-colors">
          <span className="select-none text-gray-600 dark:text-gray-500 inline-block w-8 text-right mr-4">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      );
    });
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden bg-[#282C34] shadow-lg border border-gray-700">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#21252B] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">{language}</span>
          {isHTML && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setShowPreview(true)}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  showPreview ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  !showPreview ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Code
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors rounded-md"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500 hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy code</span>
            </>
          )}
        </button>
      </div>
      
      {isHTML && showPreview ? (
        <div className="bg-white p-4 min-h-[200px] max-h-[600px] overflow-auto">
          <iframe
            srcDoc={code}
            className="w-full min-h-[200px] h-full border-0"
            sandbox="allow-scripts"
            title="HTML Preview"
            style={{ height: '500px' }}
          />
        </div>
      ) : (
        <pre className="p-3 sm:p-4 overflow-x-auto max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          <code className="text-xs sm:text-sm font-mono leading-relaxed text-[#ABB2BF]">
            {highlightCode(code, language)}
          </code>
        </pre>
      )}
    </div>
  );
}
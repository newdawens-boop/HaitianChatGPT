// hooks/useSpeechToText.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => ISpeechRecognition;
    SpeechRecognition: new () => ISpeechRecognition;
  }
}

interface UseSpeechToTextOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { 
    lang = 'en-US', 
    continuous = false, 
    interimResults = true,
    onTranscript,
    onError 
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onTranscript?.(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError?.(event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang, continuous, interimResults, onTranscript, onError]);

  const start = useCallback(() => {
    recognitionRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isListening, isSupported, start, stop };
}

// hooks/useAutoResize.ts
import { useCallback, useRef, useEffect } from 'react';

interface UseAutoResizeOptions {
  minRows?: number;
  maxRows?: number;
  lineHeight?: number;
}

export function useAutoResize(options: UseAutoResizeOptions = {}) {
  const { minRows = 1, maxRows = 10, lineHeight = 24 } = options;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialHeightRef = useRef<number>(0);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Store initial height on first call
    if (initialHeightRef.current === 0) {
      initialHeightRef.current = textarea.scrollHeight;
    }

    // Reset to auto to get correct scrollHeight
    textarea.style.height = 'auto';
    
    const minHeight = minRows * lineHeight;
    const maxHeight = maxRows * lineHeight;
    const scrollHeight = Math.max(textarea.scrollHeight, minHeight);
    const newHeight = Math.min(scrollHeight, maxHeight);
    
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [minRows, maxRows, lineHeight]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Initial resize
    resize();

    // Handle window resize
    const handleWindowResize = () => resize();
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [resize]);

  return { textareaRef, resize };
}

// hooks/useChatSubmission.ts
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { chatService } from '@/lib/chatService';
import type { Message } from '@/stores/chatStore';

interface UseChatSubmissionOptions {
  currentChatId: string | null;
  userId: string | null;
  isGuest: boolean;
  isLimitReached: () => boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface SubmissionResult {
  message: string;
  images?: string[];
  sources?: Array<{
    id: string;
    title: string;
    url: string;
    domain: string;
    snippet: string;
  }>;
}

export function useChatSubmission(options: UseChatSubmissionOptions) {
  const { 
    currentChatId, 
    userId, 
    isGuest, 
    isLimitReached,
    onSuccess,
    onError 
  } = options;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const determineLoadingStatus = (content: string, hasFiles: boolean): string => {
    const lower = content.toLowerCase();
    
    if (hasFiles) {
      return /image|photo|picture/i.test(content) ? 'Analyzing image...' : 'Processing file...';
    }
    if (/\b(search|find|look up|google)\b/i.test(lower)) return 'Searching the web...';
    if (/\b(create|generate|make|draw|design)\b.*\b(image|logo|picture|art)\b/i.test(lower)) {
      return 'Creating image...';
    }
    return 'Thinking...';
  };

  const submitMessage = useCallback(async (
    content: string,
    files: File[],
    conversationHistory: Message[],
    callbacks: {
      addMessage: (msg: Message) => void;
      updateMessage: (id: string, updates: Partial<Message>) => void;
      removeMessagesFrom: (id: string) => void;
      setLoadingStatus: (status: string | null) => void;
      setIsStreaming: (streaming: boolean) => void;
      setStreamingMessageId: (id: string | null) => void;
      setSources: (sources: any[]) => void;
      setShowSourcesSidebar: (show: boolean) => void;
      setSearchQuery: (query: string) => void;
    }
  ): Promise<SubmissionResult | null> => {
    if (!content.trim() || isSubmitting) return null;

    if (isGuest && isLimitReached()) {
      throw new Error('GUEST_LIMIT_REACHED');
    }

    setIsSubmitting(true);
    const status = determineLoadingStatus(content, files.length > 0);
    callbacks.setLoadingStatus(status);

    try {
      const isImageRequest = chatService.isImageRequest?.(content) ?? false;
      const isSearchRequest = /\b(search|find|look up|google)\b/i.test(content);

      // Create assistant message placeholder
      const assistantId = crypto.randomUUID();
      callbacks.addMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      });
      
      callbacks.setIsStreaming(true);
      callbacks.setStreamingMessageId(assistantId);

      let fullContent = '';
      const response = await chatService.sendMessage(
        conversationHistory.map(m => ({ role: m.role, content: m.content })),
        currentChatId || undefined,
        undefined, // selectedModel - pass from outside if needed
        isImageRequest ? 'image' : 'text',
        (chunk) => {
          fullContent += chunk;
          callbacks.updateMessage(assistantId, { content: fullContent });
        }
      );

      callbacks.setIsStreaming(false);
      callbacks.setStreamingMessageId(null);

      if (response.error) {
        throw new Error(response.error);
      }

      callbacks.updateMessage(assistantId, {
        content: response.message || fullContent,
        generatedImages: response.images,
      });

      // Handle search sources
      if (isSearchRequest && response.message) {
        const mockSources = [{
          id: crypto.randomUUID(),
          title: `Search results for "${content.slice(0, 30)}..."`,
          url: 'https://example.com',
          domain: 'example.com',
          snippet: 'Relevant search result snippet...',
        }];
        callbacks.setSources(mockSources);
        callbacks.setSearchQuery(content);
        callbacks.setShowSourcesSidebar(true);
      }

      onSuccess?.();
      
      return {
        message: response.message || fullContent,
        images: response.images,
        sources: isSearchRequest ? [] : undefined,
      };

    } catch (error) {
      onError?.(error as Error);
      throw error;
    } finally {
      setIsSubmitting(false);
      callbacks.setLoadingStatus(null);
    }
  }, [currentChatId, isGuest, isLimitReached, isSubmitting, onSuccess, onError]);

  return {
    isSubmitting,
    submitMessage,
    determineLoadingStatus,
  };
}

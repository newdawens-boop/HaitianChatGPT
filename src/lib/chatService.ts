import { supabase } from './supabase';
import { Chat, Message } from '@/types/chat';
import { FunctionsHttpError } from '@supabase/supabase-js';

export class ChatService {
  async createChat(title: string, userId: string, hasMessages: boolean = false): Promise<Chat | null> {
    // Only create chat if it will have messages
    if (!hasMessages) {
      return null;
    }

    const { data, error } = await supabase
      .from('chats')
      .insert({ title, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }

    return data;
  }

  async getChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return [];
    }

    return data || [];
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  }

  async sendMessage(
    messages: any[], 
    chatId?: string, 
    model?: string, 
    mode?: 'text' | 'image',
    onStream?: (chunk: string) => void
  ): Promise<{ message: string; images?: Array<{ url: string; revised_prompt?: string }>; generatedImage?: { url: string; prompt: string }; generatedFile?: { name: string; content: string; type: string }; error?: string }> {
    // Get the current session to pass the auth token (optional for guest users)
    const { data: { session } } = await supabase.auth.getSession();
    
    // Use streaming if callback provided
    if (onStream && mode !== 'image') {
      try {
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({ messages, chatId, model, mode, stream: true }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return { message: '', error: `[Code: ${response.status}] ${errorText}` };
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullMessage = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullMessage += content;
                    onStream(content);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        return { message: fullMessage };
      } catch (error: any) {
        return { message: '', error: error.message };
      }
    }

    // Non-streaming request
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { messages, chatId, model, mode },
      headers: session?.access_token ? {
        Authorization: `Bearer ${session.access_token}`,
      } : {},
    });

    if (error) {
      let errorMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const statusCode = error.context?.status ?? 500;
          const textContent = await error.context?.text();
          errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
        } catch {
          errorMessage = `${error.message || 'Failed to read response'}`;
        }
      }
      return { message: '', error: errorMessage };
    }

    // Parse response for special content types
    let result: any = { message: data.message };

    // Check if the response contains multiple images
    if (data.images && Array.isArray(data.images)) {
      result.images = data.images;
      result.message = data.message || 'Images created';
    }

    // Check if the response contains an image generation result
    if (data.generatedImage) {
      result.generatedImage = data.generatedImage;
      // Don't include the raw JSON in the message
      result.message = '';
    }

    // Check if the response contains a file creation result
    if (data.generatedFile) {
      result.generatedFile = data.generatedFile;
    }

    return result;
  }

  isImageRequest(text: string): boolean {
    const imageKeywords = [
      'create image', 'create logo', 'design logo', 'photo design',
      'create a logo', 'create an image', 'design a logo', 'make a logo',
      'make an image', 'generate image', 'generate logo', 'draw', 'design'
    ];
    const lowerText = text.toLowerCase();
    return imageKeywords.some(keyword => lowerText.includes(keyword));
  }

  isFileRequest(text: string): boolean {
    const fileKeywords = [
      'create file', 'create a file', 'make file', 'generate file',
      'create html', 'create python', 'create js', 'create javascript',
      'create txt', 'create csv'
    ];
    const lowerText = text.toLowerCase();
    return fileKeywords.some(keyword => lowerText.includes(keyword));
  }

  getLoadingStatus(text: string): string {
    if (this.isImageRequest(text)) {
      return 'Creating image...';
    }
    if (this.isFileRequest(text)) {
      return 'Analyzing...';
    }
    return 'Thinking...';
  }

  async updateChat(chatId: string, updates: Partial<Chat>): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .update(updates)
      .eq('id', chatId);

    if (error) {
      console.error('Error updating chat:', error);
      return false;
    }

    return true;
  }

  async deleteChat(chatId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      return false;
    }

    return true;
  }
}

export const chatService = new ChatService();

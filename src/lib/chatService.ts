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

  async sendMessage(messages: any[], chatId?: string): Promise<{ message: string; generatedImage?: { url: string; prompt: string }; generatedFile?: { name: string; content: string; type: string }; error?: string }> {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { messages, chatId },
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

    // Check if the response contains an image generation result
    if (data.generatedImage) {
      result.generatedImage = data.generatedImage;
      // Don't include the raw JSON in the message
      result.message = '';
    }

    // Check if the response contains a file creation result
    if (data.generatedFile) {
      result.generatedFile = data.generatedFile;
      // Don't include raw output in message
      result.message = '';
    }

    // Clean any JSON/internal debugging output from the message
    if (result.message && typeof result.message === 'string') {
      // Remove JSON blocks that look like internal actions
      result.message = result.message.replace(/\{\s*"action":[^}]+\}/g, '');
      result.message = result.message.replace(/\{\s*"thought":[^}]+\}/g, '');
      result.message = result.message.replace(/\{\s*"action_input":[\s\S]*?\}/g, '');
      result.message = result.message.trim();
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

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

  async sendMessage(messages: any[], chatId?: string, model?: string): Promise<{ message: string; error?: string }> {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { messages, chatId, model },
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

    return { message: data.message };
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

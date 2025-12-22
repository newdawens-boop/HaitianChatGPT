import { supabase } from './supabase';
import { Chat, Message } from '@/types/chat';

interface SharedConversation {
  id: string;
  chat_id: string;
  share_token: string;
  is_public: boolean;
  created_at: string;
  expires_at: string | null;
}

export class ShareService {
  async createShareLink(chatId: string): Promise<string | null> {
    try {
      const shareToken = this.generateToken();
      
      const { data, error } = await supabase
        .from('shared_conversations')
        .insert({
          chat_id: chatId,
          share_token: shareToken,
          is_public: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating share link:', error);
        return null;
      }

      return shareToken;
    } catch (error) {
      console.error('Failed to create share link:', error);
      return null;
    }
  }

  async getSharedConversation(token: string): Promise<{ chat: Chat; messages: Message[] } | null> {
    try {
      // Get share record
      const { data: shareData, error: shareError } = await supabase
        .from('shared_conversations')
        .select('chat_id')
        .eq('share_token', token)
        .single();

      if (shareError || !shareData) {
        console.error('Share not found:', shareError);
        return null;
      }

      // Get chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', shareData.chat_id)
        .single();

      if (chatError || !chatData) {
        console.error('Chat not found:', chatError);
        return null;
      }

      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', shareData.chat_id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Messages not found:', messagesError);
        return null;
      }

      return {
        chat: chatData,
        messages: messagesData || [],
      };
    } catch (error) {
      console.error('Failed to get shared conversation:', error);
      return null;
    }
  }

  async deleteShareLink(chatId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shared_conversations')
        .delete()
        .eq('chat_id', chatId);

      if (error) {
        console.error('Error deleting share link:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete share link:', error);
      return false;
    }
  }

  private generateToken(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 36).toString(36)
    ).join('');
  }

  getShareUrl(token: string): string {
    return `${window.location.origin}/share/${token}`;
  }
}

export const shareService = new ShareService();

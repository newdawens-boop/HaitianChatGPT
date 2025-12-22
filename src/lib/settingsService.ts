import { supabase } from './supabase';
import { UserPreferences, FamilyMember, Order } from '@/types/settings';

export class SettingsService {
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', error);
      return null;
    }

    // If no preferences exist, create default ones
    if (!data) {
      return await this.createDefaultPreferences(userId);
    }

    return data;
  }

  async createDefaultPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error creating preferences:', error);
      return null;
    }

    return data;
  }

  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<boolean> {
    const { error } = await supabase
      .from('user_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating preferences:', error);
      return false;
    }

    return true;
  }

  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching family members:', error);
      return [];
    }

    return data || [];
  }

  async addFamilyMember(
    userId: string,
    member: { email?: string; phone?: string; role: 'parent' | 'child' }
  ): Promise<FamilyMember | null> {
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        user_id: userId,
        email: member.email,
        phone: member.phone,
        role: member.role,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding family member:', error);
      return null;
    }

    return data;
  }

  async removeFamilyMember(memberId: string): Promise<boolean> {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing family member:', error);
      return false;
    }

    return true;
  }

  async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data || [];
  }

  async exportData(userId: string): Promise<Blob | null> {
    try {
      // Fetch all user data
      const [chats, messages, preferences] = await Promise.all([
        supabase.from('chats').select('*').eq('user_id', userId),
        supabase.from('messages').select('*, chats!inner(user_id)').eq('chats.user_id', userId),
        this.getUserPreferences(userId),
      ]);

      const exportData = {
        chats: chats.data || [],
        messages: messages.data || [],
        preferences,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      return blob;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  async archiveAllChats(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .update({ is_archived: true })
      .eq('user_id', userId)
      .eq('is_archived', false);

    if (error) {
      console.error('Error archiving chats:', error);
      return false;
    }

    return true;
  }

  async deleteAllChats(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting chats:', error);
      return false;
    }

    return true;
  }
}

export const settingsService = new SettingsService();

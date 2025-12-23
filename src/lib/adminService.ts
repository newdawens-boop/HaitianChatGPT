import { supabase } from './supabase';
import { Role, Permission, UserRole, AdminUser } from '@/types/admin';

export class AdminService {
  async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }

    return data || [];
  }

  async addAdmin(email: string, addedBy: string): Promise<{ success: boolean; error?: string }> {
    // First get the user_id for this email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found with this email' };
    }

    const { error } = await supabase
      .from('admin_users')
      .insert({ email, user_id: user.id, created_by: addedBy });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async removeAdmin(adminId: string): Promise<boolean> {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', adminId);

    return !error;
  }

  async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return data || [];
  }

  async createRole(name: string, description: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('roles')
      .insert({ name, description });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async deleteRole(roleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    return !error;
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*, role:roles(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data || [];
  }

  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId, assigned_by: assignedBy });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async removeRole(userRoleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', userRoleId);

    return !error;
  }

  async getPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }

    return data || [];
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission:permissions(*)')
      .eq('role_id', roleId);

    if (error) {
      console.error('Error fetching role permissions:', error);
      return [];
    }

    return data?.map((rp: any) => rp.permission) || [];
  }

  async assignPermission(roleId: string, permissionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('role_permissions')
      .insert({ role_id: roleId, permission_id: permissionId });

    return !error;
  }

  async removePermission(roleId: string, permissionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);

    return !error;
  }
}

export const adminService = new AdminService();

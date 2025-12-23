import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { adminService } from '@/lib/adminService';
import { AdminUser, Role, Permission } from '@/types/admin';
import { Users, Shield, Key, Settings, BarChart } from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admins' | 'roles' | 'permissions' | 'users' | 'analytics'>('admins');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    const adminStatus = await adminService.isAdmin(user.id);
    setIsAdmin(adminStatus);

    if (!adminStatus) {
      toast.error('Access denied: Admin privileges required');
      navigate('/');
      return;
    }

    loadData();
    setLoading(false);
  };

  const loadData = async () => {
    const [adminsData, rolesData, permissionsData] = await Promise.all([
      adminService.getAdminUsers(),
      adminService.getRoles(),
      adminService.getPermissions(),
    ]);

    setAdmins(adminsData);
    setRoles(rolesData);
    setPermissions(permissionsData);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !user) return;

    const { success, error } = await adminService.addAdmin(newAdminEmail, user.id);

    if (success) {
      toast.success('Admin added successfully');
      setNewAdminEmail('');
      loadData();
    } else {
      toast.error(error || 'Failed to add admin');
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm('Remove this admin?')) return;

    const success = await adminService.removeAdmin(adminId);

    if (success) {
      toast.success('Admin removed');
      loadData();
    } else {
      toast.error('Failed to remove admin');
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;

    const { success, error } = await adminService.createRole(newRoleName, newRoleDesc);

    if (success) {
      toast.success('Role created');
      setNewRoleName('');
      setNewRoleDesc('');
      loadData();
    } else {
      toast.error(error || 'Failed to create role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Delete this role?')) return;

    const success = await adminService.deleteRole(roleId);

    if (success) {
      toast.success('Role deleted');
      loadData();
    } else {
      toast.error('Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'admins'
                ? 'border-primary text-primary'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admins
            </div>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'roles'
                ? 'border-primary text-primary'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Roles
            </div>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'permissions'
                ? 'border-primary text-primary'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Permissions
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-primary text-primary'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Analytics
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">Add New Admin</h2>
              <form onSubmit={handleAddAdmin} className="flex gap-4">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Admin email address"
                  className="flex-1 px-4 py-2 border rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  Add Admin
                </button>
              </form>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">Current Admins</h2>
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{admin.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveAdmin(admin.id)}
                      className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">Create New Role</h2>
              <form onSubmit={handleAddRole} className="space-y-4">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Role name"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <textarea
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Role description"
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  Create Role
                </button>
              </form>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">Existing Roles</h2>
              <div className="grid gap-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {!['Admin', 'User', 'Moderator', 'Contributor'].includes(role.name) && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">System Permissions</h2>
            <div className="grid gap-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{permission.name}</p>
                  <p className="text-sm text-muted-foreground">{permission.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Resource: {permission.resource} | Action: {permission.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>
            <p className="text-muted-foreground">User management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Platform Analytics</h2>
            <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

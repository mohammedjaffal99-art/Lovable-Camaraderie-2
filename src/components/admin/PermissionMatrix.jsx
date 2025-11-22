import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Shield, Plus, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_CONFIGS = {
  customer: {
    name: 'Viewer',
    color: '#4A90E2'
  },
  broadcaster: {
    name: 'Broadcaster',
    color: '#00BFFF'
  },
  moderator: {
    name: 'Moderator',
    color: '#FF6B9D'
  },
  admin: {
    name: 'Admin',
    color: '#0055A4'
  }
};

const PERMISSION_DEFINITIONS = {
  'view_admin_panel': { label: 'View Admin Panel', category: 'Admin', description: 'Access admin panel interface' },
  'manage_users': { label: 'Manage Users', category: 'Admin', description: 'Edit user accounts and roles' },
  'approve_broadcasters': { label: 'Approve Broadcasters', category: 'Admin', description: 'Approve/reject broadcaster applications' },
  'manage_transactions': { label: 'Manage Transactions', category: 'Financial', description: 'Approve/reject balance requests' },
  'view_reports': { label: 'View Reports', category: 'Moderation', description: 'View user reports' },
  'resolve_reports': { label: 'Resolve Reports', category: 'Moderation', description: 'Take action on reports' },
  'manage_content': { label: 'Manage Content', category: 'Moderation', description: 'Delete/moderate content' },
  'delete_sessions': { label: 'Delete Sessions', category: 'Admin', description: 'Delete session records' },
  'ban_users': { label: 'Ban Users', category: 'Moderation', description: 'Ban/suspend user accounts' },
  'manage_platform_settings': { label: 'Platform Settings', category: 'Admin', description: 'Edit platform configuration' },
  'view_analytics': { label: 'View Analytics', category: 'Admin', description: 'Access analytics dashboard' },
  'export_data': { label: 'Export Data', category: 'Admin', description: 'Export platform data' },
  'manage_withdrawals': { label: 'Manage Withdrawals', category: 'Financial', description: 'Process withdrawal requests' },
  'moderate_content': { label: 'Moderate Content', category: 'Moderation', description: 'Review moderation events' },
  'view_moderation_events': { label: 'View Moderation Events', category: 'Moderation', description: 'View AI moderation logs' },
  'send_notifications': { label: 'Send Notifications', category: 'Admin', description: 'Send platform notifications' },
  'manage_pricing': { label: 'Manage Pricing', category: 'Financial', description: 'Edit pricing settings' },
  'view_earnings': { label: 'View Earnings', category: 'Financial', description: 'View broadcaster earnings' },
  'delete_content': { label: 'Delete Content', category: 'Moderation', description: 'Delete user content' }
};

export default function PermissionMatrix() {
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['allPermissions'],
    queryFn: () => base44.entities.Permission.list(),
    initialData: []
  });

  const grantPermissionMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Permission.create({
        user_id: selectedUser.id,
        permission_key: selectedPermission,
        granted_by: currentUser.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allPermissions']);
      setSelectedPermission('');
      toast.success('Permission granted!');
    }
  });

  const revokePermissionMutation = useMutation({
    mutationFn: async (permissionId) => {
      await base44.entities.Permission.delete(permissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allPermissions']);
      toast.success('Permission revoked!');
    }
  });

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserPermissions = (userId) => {
    return permissions.filter(p => p.user_id === userId);
  };

  const categories = [...new Set(Object.values(PERMISSION_DEFINITIONS).map(p => p.category))];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
        <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
          <CardTitle className="text-xl font-extrabold text-white">Select User</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => {
              const roleConfig = ROLE_CONFIGS[user.role] || ROLE_CONFIGS.customer;
              const isSelected = selectedUser?.id === user.id;

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {user.photo_1 ? (
                      <img src={user.photo_1} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: roleConfig.color }}>
                        {user.full_name?.[0] || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{user.full_name}</p>
                        <Badge className="text-xs" style={{ backgroundColor: roleConfig.color }}>
                          {roleConfig.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
        <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
          <CardTitle className="text-xl font-extrabold text-white">
            {selectedUser ? `Permissions for ${selectedUser.full_name}` : 'Select a user'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {selectedUser ? (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border-2" style={{ borderColor: '#00BFFF' }}>
                <p className="font-bold mb-2" style={{ color: '#0055A4' }}>Grant New Permission</p>
                <div className="flex gap-2">
                  <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choose permission" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <React.Fragment key={category}>
                          <div className="px-2 py-1.5 text-xs font-bold text-gray-500">{category}</div>
                          {Object.entries(PERMISSION_DEFINITIONS)
                            .filter(([_, def]) => def.category === category)
                            .map(([key, def]) => (
                              <SelectItem key={key} value={key}>
                                {def.label}
                              </SelectItem>
                            ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => grantPermissionMutation.mutate()}
                    disabled={!selectedPermission || grantPermissionMutation.isPending}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="font-bold mb-3" style={{ color: '#0055A4' }}>Current Permissions</p>
                
                {categories.map(category => {
                  const userPerms = getUserPermissions(selectedUser.id).filter(p => 
                    PERMISSION_DEFINITIONS[p.permission_key]?.category === category
                  );
                  
                  if (userPerms.length === 0) return null;

                  return (
                    <div key={category} className="mb-4">
                      <p className="text-xs font-bold text-gray-500 mb-2">{category}</p>
                      <div className="space-y-2">
                        {userPerms.map((perm) => {
                          const def = PERMISSION_DEFINITIONS[perm.permission_key];
                          return (
                            <div key={perm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                              <div>
                                <p className="font-semibold text-sm">{def?.label || perm.permission_key}</p>
                                <p className="text-xs text-gray-600">{def?.description}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => revokePermissionMutation.mutate(perm.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {getUserPermissions(selectedUser.id).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No extra permissions granted
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#87CEEB' }} />
              <p className="font-bold" style={{ color: '#4A90E2' }}>
                Select a user to manage their permissions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
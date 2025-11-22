import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, Edit, Save, X, CheckCircle2, AlertCircle } from 'lucide-react';
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
    color: '#4A90E2',
    permissions: ['view_content', 'book_sessions', 'chat', 'favorite_broadcasters']
  },
  broadcaster: {
    name: 'Broadcaster',
    color: '#00BFFF',
    permissions: ['stream', 'accept_calls', 'manage_own_profile', 'view_earnings', 'withdraw_earnings']
  },
  moderator: {
    name: 'Moderator',
    color: '#FF6B9D',
    permissions: ['moderate_content', 'view_moderation_events', 'view_reports', 'resolve_reports', 'ban_users']
  },
  admin: {
    name: 'Admin',
    color: '#0055A4',
    permissions: ['view_admin_panel', 'manage_users', 'approve_broadcasters', 'manage_transactions', 'view_reports', 'resolve_reports', 'manage_content', 'delete_sessions', 'ban_users', 'manage_platform_settings', 'view_analytics', 'export_data', 'manage_withdrawals', 'moderate_content', 'view_moderation_events', 'send_notifications', 'manage_pricing']
  }
};

export default function RoleManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
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

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      await base44.entities.User.update(userId, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      setEditingUser(null);
      toast.success('Role updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update role');
    }
  });

  const grantPermissionMutation = useMutation({
    mutationFn: async ({ userId, permissionKey, grantedBy }) => {
      await base44.entities.Permission.create({
        user_id: userId,
        permission_key: permissionKey,
        granted_by: grantedBy
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allPermissions']);
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

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserPermissions = (userId) => {
    return permissions.filter(p => p.user_id === userId);
  };

  const handleSaveRole = (userId) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ userId, newRole: selectedRole });
    }
  };

  return (
    <Card className="shadow-xl border-2" style={{ borderColor: '#00BFFF' }}>
      <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
        <CardTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Role & Permission Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 font-semibold"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const roleConfig = ROLE_CONFIGS[user.role] || ROLE_CONFIGS.customer;
            const userPermissions = getUserPermissions(user.id);
            const isEditing = editingUser === user.id;

            return (
              <Card key={user.id} className="border-2" style={{ borderColor: '#E0F4FF' }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {user.photo_1 ? (
                        <img src={user.photo_1} alt={user.full_name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: roleConfig.color }}>
                          {user.full_name?.[0] || '?'}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold" style={{ color: '#0055A4' }}>{user.full_name}</p>
                          <Badge className="font-bold text-xs" style={{ backgroundColor: roleConfig.color }}>
                            {roleConfig.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        
                        {isEditing ? (
                          <div className="mt-3 flex items-center gap-2">
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Viewer</SelectItem>
                                <SelectItem value="broadcaster">Broadcaster</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleSaveRole(user.id)}
                              disabled={!selectedRole || updateRoleMutation.isPending}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingUser(null);
                                setSelectedRole('');
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingUser(user.id);
                                setSelectedRole(user.role);
                              }}
                              className="text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Change Role
                            </Button>
                          </div>
                        )}

                        {userPermissions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-bold mb-1" style={{ color: '#4A90E2' }}>
                              Extra Permissions:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {userPermissions.map((perm) => (
                                <Badge
                                  key={perm.id}
                                  variant="outline"
                                  className="text-xs cursor-pointer hover:bg-red-50"
                                  onClick={() => revokePermissionMutation.mutate(perm.id)}
                                >
                                  {perm.permission_key}
                                  <X className="w-3 h-3 ml-1" />
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#87CEEB' }} />
            <p className="font-bold" style={{ color: '#4A90E2' }}>No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
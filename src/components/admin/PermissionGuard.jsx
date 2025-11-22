import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/AuthContext';

export function usePermissions() {
  const { user } = useAuth();

  const { data: userPermissions = [] } = useQuery({
    queryKey: ['userPermissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Permission.filter({ user_id: user.id });
    },
    enabled: !!user?.id,
    initialData: []
  });

  const hasPermission = (permissionKey) => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check if user has specific permission granted
    return userPermissions.some(p => p.permission_key === permissionKey);
  };

  const hasAnyPermission = (permissionKeys) => {
    return permissionKeys.some(key => hasPermission(key));
  };

  const hasAllPermissions = (permissionKeys) => {
    return permissionKeys.every(key => hasPermission(key));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: userPermissions,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator' || hasPermission('moderate_content'),
    isBroadcaster: user?.role === 'broadcaster',
    isViewer: user?.role === 'customer'
  };
}

export function PermissionGuard({ children, requires, fallback = null }) {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const isAllowed = Array.isArray(requires) 
    ? hasAnyPermission(requires)
    : hasPermission(requires);

  if (!isAllowed) {
    return fallback;
  }

  return children;
}
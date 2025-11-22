import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/components/ui/toast-utils';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const queryClient = useQueryClient();

  const checkAuth = async (force = false) => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      
      console.log("DEBUG_ROLE", { 
        location: "AuthContext.checkAuth", 
        userId: currentUser?.id, 
        email: currentUser?.email, 
        rawUser: currentUser, 
        role: currentUser?.role, 
        typeofRole: typeof currentUser?.role,
        user_role: currentUser?.user_role,
        typeofUserRole: typeof currentUser?.user_role,
        pathname: window.location.pathname 
      });
      
      setUser(currentUser);
      setGuestMode(false);
      localStorage.removeItem('guestMode');
      return currentUser;
    } catch (error) {
      console.log("DEBUG_ROLE", { 
        location: "AuthContext.checkAuth.error", 
        error: error.message,
        pathname: window.location.pathname 
      });
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && !guestMode) {
      const shownWarnings = JSON.parse(localStorage.getItem('shownWarnings') || '[]');
      
      base44.entities.Notification.filter({
        user_id: user.id,
        type: 'warning',
        read: false
      }).then(warnings => {
        warnings.forEach(warning => {
          if (!shownWarnings.includes(warning.id)) {
            toast.error(warning.message, {
              duration: 10000,
              style: {
                background: '#FEE2E2',
                border: '2px solid #DC2626',
                color: '#7F1D1D',
                fontWeight: 'bold'
              }
            });
            shownWarnings.push(warning.id);
          }
        });
        localStorage.setItem('shownWarnings', JSON.stringify(shownWarnings));
      }).catch(err => {
        console.log('Failed to fetch warnings:', err);
      });
    }
  }, [user, guestMode]);

  const login = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  const logout = async () => {
    const confirmed = confirm(
      'Are you sure you want to logout?\n\n' +
      'You will be signed out and redirected to the home page.'
    );
    
    if (confirmed) {
      const toastId = showToast.loading('Logging out...');
      
      try {
        localStorage.removeItem('guestMode');
        setUser(null);
        setGuestMode(false);
        queryClient.clear();
        await base44.auth.logout('/');
        showToast.success('Logged out successfully', { id: toastId });
      } catch (error) {
        console.error('Logout error:', error);
        showToast.error('Logout failed. Redirecting...', { id: toastId });
        window.location.href = '/';
      }
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    
    const warningMessage = user.role === 'broadcaster'
      ? '⚠️ WARNING: Delete Broadcaster Account?\n\n' +
        'This action CANNOT be undone!\n\n' +
        'You will lose:\n' +
        '• All profile data and photos\n' +
        '• Your earnings history\n' +
        '• All pending sessions\n' +
        '• Your account permanently\n\n' +
        'Type DELETE to confirm:'
      : '⚠️ WARNING: Delete Account?\n\n' +
        'This action CANNOT be undone!\n\n' +
        'You will lose:\n' +
        '• All profile data and photos\n' +
        '• Your session history\n' +
        '• Any remaining balance\n' +
        '• Your account permanently\n\n' +
        'Type DELETE to confirm:';
    
    const userInput = prompt(warningMessage);
    
    if (userInput === 'DELETE') {
      const toastId = showToast.loading('Submitting deletion request...');
      
      try {
        const adminUsers = await base44.entities.User.filter({ role: 'admin' });
        
        for (const admin of adminUsers) {
          await base44.entities.Notification.create({
            user_id: admin.id,
            type: 'admin_message',
            title: '🗑️ Account Deletion Request',
            message: `${user.full_name} (${user.email}) requested account deletion. Role: ${user.role}`,
            link: '/AdminPanel'
          });
        }
        
        showToast.accountDeleted();
        showToast.info('Your account will be deleted within 24-48 hours.', { duration: 5000 });
        
        setTimeout(() => {
          logout();
        }, 2000);
      } catch (error) {
        showToast.error('Failed to submit deletion request. Please contact support.', { id: toastId });
        console.error('Delete account error:', error);
      }
    } else if (userInput !== null) {
      showToast.error('Account deletion cancelled. You must type DELETE exactly.');
    }
  };

  const toggleGuestMode = () => {
    const newGuestMode = !guestMode;
    setGuestMode(newGuestMode);
    localStorage.setItem('guestMode', newGuestMode.toString());
    
    if (newGuestMode) {
      console.log('👻 Entering guest mode');
      showToast.info('Entering guest mode - Features limited');
    } else {
      console.log('👤 Exiting guest mode');
      showToast.success('Exited guest mode');
      checkAuth();
    }
    
    setTimeout(() => window.location.reload(), 1000);
  };

  const refreshAuth = () => {
    return checkAuth(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      guestMode,
      isAuthenticated: !guestMode && !!user,
      login,
      logout,
      deleteAccount,
      toggleGuestMode,
      refreshAuth,
      checkAuth,
      restoreSession: async (token) => {
        // Attempt to restore session by checking auth immediately
        console.log("Attempting to restore session with token");
        // If the SDK allows setting the token, we would do it here.
        // Since we don't have an explicit setToken method in the standard context,
        // we trigger a refresh which might pick up the cookie/storage if it persists.
        // Also we can assume the token passed is just for logging or if we had a way to inject it.
        // For now, we just ensure we re-fetch the user.
        await checkAuth(true);
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { createPageUrl } from '@/utils';
import { AlertTriangle } from 'lucide-react';

export default function RequireClientRole({ allowedRoles, children, fallbackUrl = 'Home' }) {
  const { user, loading } = useAuth();

  console.log("DEBUG_ROLE", {
    location: "RequireClientRole",
    userId: user?.id,
    email: user?.email,
    rawUser: user,
    role: user?.role,
    typeofRole: typeof user?.role,
    user_role: user?.user_role,
    typeofUserRole: typeof user?.user_role,
    allowedRoles,
    loading,
    pathname: window.location.pathname
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#00BFFF' }}></div>
      </div>
    );
  }

  const userRole = user?.user_role || 'guest';

  if (!allowedRoles.includes(userRole)) {
    console.log("DEBUG_ROLE", {
      location: "RequireClientRole.BLOCKED",
      userId: user?.id,
      email: user?.email,
      rawUser: user,
      role: user?.role,
      user_role: user?.user_role,
      allowedRoles,
      actualRole: userRole,
      pathname: window.location.pathname
    });

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center border-4" style={{ borderColor: '#FF6B6B' }}>
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-extrabold mb-3" style={{ color: '#0055A4' }}>Access Denied</h1>
          <p className="text-gray-700 font-semibold mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Required role: <span className="font-bold">{allowedRoles.join(', ')}</span>
            <br />
            Your role: <span className="font-bold">{userRole}</span>
          </p>
          <button
            onClick={() => window.location.href = createPageUrl(fallbackUrl)}
            className="px-6 py-2 rounded-lg font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#0055A4' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log("DEBUG_ROLE", {
    location: "RequireClientRole.ALLOWED",
    userId: user?.id,
    email: user?.email,
    user_role: userRole,
    allowedRoles,
    pathname: window.location.pathname
  });

  return <>{children}</>;
}
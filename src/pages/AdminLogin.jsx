
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Lock, Shield } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (user.role === 'admin') {
          navigate(createPageUrl('AdminPanel'));
        } else {
          setError('Access denied. Admin privileges required.');
          setChecking(false);
        }
      })
      .catch(() => {
        setChecking(false);
      });
  }, [navigate]);

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('AdminLogin'));
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0055A4 0%, #4A90E2 25%, #00BFFF 50%, #87CEEB 75%, #A8D8EA 100%)' }}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6 shadow-xl"></div>
          <p className="text-lg font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0055A4 0%, #4A90E2 25%, #00BFFF 50%, #87CEEB 75%, #A8D8EA 100%)' }}>
      <Card className="w-full max-w-md shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: '#0055A4' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold" style={{ color: '#0055A4' }}>
            Admin Control Panel
          </CardTitle>
          <p className="text-base font-semibold mt-2" style={{ color: '#4A90E2' }}>
            Secure access to administration
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-xl px-6 py-4 mb-6 border-2 shadow-lg" style={{ backgroundColor: '#FFF5F5', borderColor: '#ef4444', color: '#dc2626' }}>
              <p className="font-bold text-lg">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-2xl p-6 border-2 mb-6 shadow-lg" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
              <p className="text-base font-extrabold mb-2" style={{ color: '#0055A4' }}>
                <Lock className="w-5 h-5 inline mr-2" />
                <strong>Admin Login</strong>
              </p>
              <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>
                Click the button below to sign in with your Base44 account. Only accounts with admin privileges can access the control panel.
              </p>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full h-14 text-lg font-extrabold shadow-xl"
              style={{ backgroundColor: '#0055A4' }}
            >
              <Lock className="w-5 h-5 mr-2" />
              Sign In as Admin
            </Button>

            {error && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => base44.auth.logout()}
                  className="text-base font-bold border-2"
                  style={{ borderColor: '#87CEEB', color: '#4A90E2' }}
                >
                  Sign Out & Try Different Account
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t-2" style={{ borderColor: '#E0F4FF' }}>
            <p className="text-sm text-center font-bold" style={{ color: '#87CEEB' }}>
              <Lock className="w-4 h-4 inline mr-1" />
              Protected by Base44 authentication
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

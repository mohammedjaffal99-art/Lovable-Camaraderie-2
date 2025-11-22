import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugUser() {
  const [email, setEmail] = useState('mohammedjaffal111@gmail.com');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkUser = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('debugUser', { email });
      setUserData(response.data);
    } catch (error) {
      setUserData({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Debug User Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@email.com"
              />
            </div>
            <Button onClick={checkUser} disabled={loading}>
              {loading ? 'Checking...' : 'Check User'}
            </Button>

            {userData && (
              <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
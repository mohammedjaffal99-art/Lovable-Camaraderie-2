import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Mic, MicOff, UserX, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

export default function ModeratorControls({ session, broadcaster }) {
  const { user } = useAuth();
  const userRole = user?.user_role || 'guest';
  
  const isModerator = ['moderator', 'admin'].includes(userRole);

  if (!isModerator) return null;

  const handleMuteParticipant = async (participantId) => {
    console.log('Mute participant:', participantId);
  };

  const handleRemoveParticipant = async (participantId) => {
    console.log('Remove participant:', participantId);
  };

  return (
    <Card className="shadow-lg border-2" style={{ borderColor: '#FF6B9D' }}>
      <CardHeader className="bg-pink-50">
        <CardTitle className="text-lg font-extrabold flex items-center gap-2" style={{ color: '#FF6B9D' }}>
          <Shield className="w-5 h-5" />
          Moderator Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FFF5F8' }}>
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-600 text-white">Monitoring</Badge>
              <span className="text-sm font-bold" style={{ color: '#0055A4' }}>
                {broadcaster?.full_name || 'Broadcaster'}
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-600">
            <p className="mb-2">🛡️ Moderation Actions Available:</p>
            <ul className="ml-4 space-y-1 list-disc">
              <li>Monitor session content</li>
              <li>View participant list</li>
              <li>Access session logs</li>
            </ul>
          </div>

          <div className="pt-2 border-t-2" style={{ borderColor: '#FFE5F0' }}>
            <p className="text-xs font-bold text-gray-500 text-center">
              Role: {userRole.toUpperCase()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
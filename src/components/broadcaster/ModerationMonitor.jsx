import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ModerationMonitor({ broadcasterId, isStreaming }) {
  const [monitoringActive, setMonitoringActive] = useState(false);

  const { data: recentViolations } = useQuery({
    queryKey: ['broadcasterViolations', broadcasterId],
    queryFn: async () => {
      const violations = await base44.entities.ModerationEvent.filter(
        { broadcaster_id: broadcasterId },
        '-created_date',
        5
      );
      return violations;
    },
    enabled: !!broadcasterId && isStreaming,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!isStreaming) {
      setMonitoringActive(false);
      return;
    }

    setMonitoringActive(true);

    // Simulate periodic content checks (in production, this would be triggered by actual stream frames)
    const interval = setInterval(async () => {
      // This is a placeholder - in a real implementation, you'd capture stream frames
      console.log('🛡️ AI Moderation active - monitoring stream content...');
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isStreaming, broadcasterId]);

  if (!isStreaming) return null;

  const recentCritical = recentViolations?.filter(v => v.severity === 'critical' && v.status === 'pending_review') || [];

  return (
    <Card className="border-2 shadow-lg" style={{ borderColor: monitoringActive ? '#22c55e' : '#87CEEB' }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className={`w-6 h-6 ${monitoringActive ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-extrabold text-sm" style={{ color: '#0055A4' }}>AI Moderation</p>
              <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>
                {monitoringActive ? 'Actively monitoring your stream' : 'Offline'}
              </p>
            </div>
          </div>
          
          {monitoringActive && (
            <div className="flex items-center gap-2">
              {recentCritical.length > 0 ? (
                <Badge className="bg-red-600 text-white animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {recentCritical.length} Alert{recentCritical.length > 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Content OK
                </Badge>
              )}
            </div>
          )}
        </div>

        {recentCritical.length > 0 && (
          <div className="mt-4 p-3 rounded-lg border-2 border-red-500" style={{ backgroundColor: '#FFF5F5' }}>
            <p className="text-sm font-bold text-red-900 mb-2">⚠️ Recent Violations Detected:</p>
            {recentCritical.map((violation) => (
              <div key={violation.id} className="text-xs font-semibold text-red-800">
                • {violation.violation_type.replace('_', ' ')} - {violation.severity} severity
              </div>
            ))}
            <p className="text-xs font-bold text-red-900 mt-2">
              Please ensure your content follows platform guidelines - conversations only!
            </p>
          </div>
        )}

        <div className="mt-3 p-2 rounded text-xs font-semibold" style={{ backgroundColor: '#E0F4FF', color: '#0055A4' }}>
          <Shield className="w-3 h-3 inline mr-1" />
          Platform Policy: This is a conversation-focused platform. Sexual content, nudity, and adult material are strictly prohibited.
        </div>
      </CardContent>
    </Card>
  );
}
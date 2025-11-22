import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Shield, Eye, CheckCircle2, XCircle, Ban, AlertCircle, Image, Volume2, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ModerationPanel() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionToTake, setActionToTake] = useState('none');
  const queryClient = useQueryClient();

  const { data: moderationEvents, isLoading } = useQuery({
    queryKey: ['moderationEvents'],
    queryFn: async () => {
      const events = await base44.entities.ModerationEvent.list('-created_date', 100);
      return events;
    },
    refetchInterval: 5000,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ eventId, status, action, notes }) => {
      await base44.entities.ModerationEvent.update(eventId, {
        status,
        action_taken: action,
        admin_notes: notes
      });

      const event = moderationEvents.find(e => e.id === eventId);
      if (!event) return;

      // Take action on broadcaster if needed
      if (action === 'temporary_suspension') {
        await base44.entities.User.update(event.broadcaster_id, {
          status: 'offline',
          suspension_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

        await base44.entities.Notification.create({
          user_id: event.broadcaster_id,
          type: 'account_suspended',
          title: '24-Hour Suspension',
          message: 'Your account has been temporarily suspended due to policy violations. You can resume streaming after 24 hours.',
          metadata: { moderation_event_id: eventId }
        });
      } else if (action === 'permanent_ban') {
        await base44.entities.User.update(event.broadcaster_id, {
          broadcaster_approved: false,
          status: 'offline'
        });

        await base44.entities.Notification.create({
          user_id: event.broadcaster_id,
          type: 'account_suspended',
          title: 'Account Permanently Banned',
          message: 'Your broadcaster account has been permanently banned due to severe policy violations.',
          metadata: { moderation_event_id: eventId }
        });
      } else if (action === 'warning') {
        await base44.entities.Notification.create({
          user_id: event.broadcaster_id,
          type: 'warning',
          title: 'Official Warning',
          message: 'You have received an official warning for policy violations. Further violations may result in suspension or ban.',
          metadata: { moderation_event_id: eventId }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moderationEvents']);
      setSelectedEvent(null);
      setAdminNotes('');
      setActionToTake('none');
      alert('Moderation event reviewed successfully');
    },
  });

  const getSeverityBadge = (severity) => {
    const config = {
      low: { color: 'bg-yellow-100 text-yellow-800', label: 'Low' },
      medium: { color: 'bg-orange-100 text-orange-800', label: 'Medium' },
      high: { color: 'bg-red-100 text-red-800', label: 'High' },
      critical: { color: 'bg-red-600 text-white', label: 'CRITICAL' }
    };
    return <Badge className={config[severity].color}>{config[severity].label}</Badge>;
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'visual_content': return <Image className="w-5 h-5" />;
      case 'audio_content': return <Volume2 className="w-5 h-5" />;
      case 'chat_message': return <MessageSquare className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const pendingEvents = moderationEvents?.filter(e => e.status === 'pending_review') || [];
  const criticalEvents = pendingEvents.filter(e => e.severity === 'critical');

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-lg border-2" style={{ borderColor: '#0055A4' }}>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2" style={{ color: '#0055A4' }} />
            <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>{pendingEvents.length}</p>
            <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>Pending Review</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-red-500">
          <CardContent className="p-6 text-center">
            <Ban className="w-10 h-10 mx-auto mb-2 text-red-600" />
            <p className="text-3xl font-extrabold text-red-600">{criticalEvents.length}</p>
            <p className="text-sm font-bold text-red-500">Critical Violations</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2" style={{ borderColor: '#00BFFF' }}>
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2" style={{ color: '#00BFFF' }} />
            <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>
              {moderationEvents?.filter(e => e.status === 'confirmed').length || 0}
            </p>
            <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>Confirmed</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2" style={{ borderColor: '#87CEEB' }}>
          <CardContent className="p-6 text-center">
            <Shield className="w-10 h-10 mx-auto mb-2" style={{ color: '#87CEEB' }} />
            <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>
              {moderationEvents?.filter(e => e.auto_action_taken).length || 0}
            </p>
            <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>Auto-Actions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold flex items-center gap-2" style={{ color: '#0055A4' }}>
            <Shield className="w-7 h-7" />
            Moderation Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto" style={{ borderColor: '#0055A4' }}></div>
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#87CEEB' }} />
              <p className="text-xl font-bold" style={{ color: '#4A90E2' }}>No pending moderation events</p>
              <p className="text-sm font-semibold mt-2" style={{ color: '#87CEEB' }}>All content is currently within guidelines</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <Card key={event.id} className={`border-2 shadow-lg ${event.severity === 'critical' ? 'border-red-500' : 'border-orange-300'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getEventIcon(event.event_type)}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getSeverityBadge(event.severity)}
                            <Badge variant="outline">{event.violation_type.replace('_', ' ')}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {event.confidence_score}% confidence
                            </Badge>
                          </div>
                          <p className="font-bold text-sm" style={{ color: '#0055A4' }}>
                            Broadcaster ID: {event.broadcaster_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs font-semibold mt-1" style={{ color: '#4A90E2' }}>
                            Detected: {new Date(event.created_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {event.auto_action_taken && (
                        <Badge className="bg-red-600 text-white">Auto-Terminated</Badge>
                      )}
                    </div>

                    <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#FFF5F5' }}>
                      <p className="text-sm font-bold mb-2 text-red-900">AI Analysis:</p>
                      <p className="text-sm font-semibold text-red-800">{event.ai_analysis}</p>
                      {event.detected_keywords?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-red-900 mb-1">Detected Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {event.detected_keywords.map((keyword, idx) => (
                              <Badge key={idx} className="bg-red-100 text-red-800 text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setSelectedEvent(event);
                            setAdminNotes(event.admin_notes || '');
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review & Take Action
                        </Button>
                      </DialogTrigger>
                      {event.content_snapshot && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(event.content_snapshot, '_blank')}
                        >
                          <Image className="w-4 h-4 mr-2" />
                          View Evidence
                        </Button>
                      )}

                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>
                            Review Moderation Event
                          </DialogTitle>
                        </DialogHeader>

                        {selectedEvent?.id === event.id && (
                          <div className="space-y-4">
                            {event.content_snapshot && (
                              <div>
                                <p className="font-bold mb-2" style={{ color: '#0055A4' }}>Evidence:</p>
                                <img 
                                  src={event.content_snapshot} 
                                  alt="Content snapshot" 
                                  className="w-full rounded-lg border-2"
                                  style={{ borderColor: '#00BFFF' }}
                                />
                              </div>
                            )}

                            <div>
                              <p className="font-bold mb-2" style={{ color: '#0055A4' }}>Action to Take:</p>
                              <Select value={actionToTake} onValueChange={setActionToTake}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No Action</SelectItem>
                                  <SelectItem value="warning">Send Warning</SelectItem>
                                  <SelectItem value="session_terminated">Terminate Session</SelectItem>
                                  <SelectItem value="temporary_suspension">24-Hour Suspension</SelectItem>
                                  <SelectItem value="permanent_ban">Permanent Ban</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <p className="font-bold mb-2" style={{ color: '#0055A4' }}>Admin Notes:</p>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes about your decision..."
                                className="h-24"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => reviewMutation.mutate({
                                  eventId: event.id,
                                  status: 'confirmed',
                                  action: actionToTake,
                                  notes: adminNotes
                                })}
                                disabled={reviewMutation.isPending}
                                className="flex-1"
                                style={{ backgroundColor: '#0055A4' }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Confirm Violation
                              </Button>
                              <Button
                                onClick={() => reviewMutation.mutate({
                                  eventId: event.id,
                                  status: 'false_positive',
                                  action: 'none',
                                  notes: adminNotes
                                })}
                                disabled={reviewMutation.isPending}
                                variant="outline"
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Mark as False Positive
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl border-2" style={{ borderColor: '#0055A4' }}>
        <CardHeader>
          <CardTitle className="text-xl font-extrabold" style={{ color: '#0055A4' }}>
            Recent Moderation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {moderationEvents?.filter(e => e.status !== 'pending_review').slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-lg border-2" style={{ borderColor: '#87CEEB', backgroundColor: '#F0F9FF' }}>
                <div className="flex items-center gap-3">
                  {getEventIcon(event.event_type)}
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#0055A4' }}>
                      {event.violation_type.replace('_', ' ')} - {getSeverityBadge(event.severity)}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: '#4A90E2' }}>
                      {new Date(event.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={
                    event.status === 'confirmed' ? 'bg-red-100 text-red-800' :
                    event.status === 'false_positive' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {event.status.replace('_', ' ')}
                  </Badge>
                  {event.action_taken && event.action_taken !== 'none' && (
                    <p className="text-xs font-bold mt-1" style={{ color: '#4A90E2' }}>
                      Action: {event.action_taken.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Users, Send, Check } from 'lucide-react';

export default function AnnouncementManagement() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [specificUserId, setSpecificUserId] = useState('');
  const [sending, setSending] = useState(false);

  const { data: users } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const sendAnnouncementMutation = useMutation({
    mutationFn: async () => {
      let targetUsers = [];

      if (audience === 'specific' && specificUserId) {
        targetUsers = users.filter(u => u.id === specificUserId);
      } else if (audience === 'all') {
        targetUsers = users;
      } else if (audience === 'customers') {
        targetUsers = users.filter(u => u.role === 'customer');
      } else if (audience === 'broadcasters') {
        targetUsers = users.filter(u => u.role === 'broadcaster');
      } else if (audience === 'guests') {
        // For guests, we'd need a different approach since they're not registered
        // For now, we'll just not send to anyone
        targetUsers = [];
      }

      // Create notifications for all target users
      const notifications = targetUsers.map(user => ({
        user_id: user.id,
        type: 'admin_message',
        title: title || 'Platform Announcement',
        message: message,
      }));

      await Promise.all(
        notifications.map(notif => base44.entities.Notification.create(notif))
      );

      return targetUsers.length;
    },
    onSuccess: (count) => {
      setSending(false);
      alert(`Announcement sent to ${count} user(s)!`);
      setTitle('');
      setMessage('');
      setAudience('all');
      setSpecificUserId('');
    },
    onError: () => {
      setSending(false);
      alert('Failed to send announcement. Please try again.');
    },
  });

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (audience === 'specific' && !specificUserId) {
      alert('Please select a specific user');
      return;
    }

    if (audience === 'guests') {
      alert('Guest announcements are not yet implemented. Guests are not registered users.');
      return;
    }

    setSending(true);
    sendAnnouncementMutation.mutate();
  };

  const customerCount = users.filter(u => u.role === 'customer').length;
  const broadcasterCount = users.filter(u => u.role === 'broadcaster').length;

  return (
    <div className="space-y-6">
      <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Send Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <Label htmlFor="audience">Target Audience *</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      All Members ({users.length})
                    </div>
                  </SelectItem>
                  <SelectItem value="customers">
                    Followers Only ({customerCount})
                  </SelectItem>
                  <SelectItem value="broadcasters">
                    Models Only ({broadcasterCount})
                  </SelectItem>
                  <SelectItem value="specific">
                    Specific User
                  </SelectItem>
                  <SelectItem value="guests" disabled>
                    Guests (Coming Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {audience === 'specific' && (
              <div>
                <Label htmlFor="specificUser">Select User *</Label>
                <Select value={specificUserId} onValueChange={setSpecificUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email}) - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title..."
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement message here..."
                rows={6}
                maxLength={1000}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/1000 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={sending || !message.trim()}
              className="w-full"
              style={{ backgroundColor: '#11009E' }}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2" style={{ borderColor: '#E0F4FF' }}>
        <CardHeader>
          <CardTitle className="text-sm">Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>Announcements are sent as notifications to users' notification centers</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>Use specific targeting for individual issues (e.g., photo verification requests)</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>Keep messages clear, concise, and professional</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>All announcements are permanent and cannot be recalled once sent</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
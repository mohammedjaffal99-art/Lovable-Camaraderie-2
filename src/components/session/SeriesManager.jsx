import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Video, Phone, MessageSquare, TrendingUp, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function SeriesManager({ broadcasterId, viewerId, broadcasterName }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    series_name: '',
    description: '',
    frequency: 'weekly',
    preferred_session_type: 'video'
  });

  const { data: series, isLoading } = useQuery({
    queryKey: ['recurringSeries', broadcasterId, viewerId],
    queryFn: async () => {
      if (!broadcasterId || !viewerId) return [];
      return await base44.entities.RecurringSeries.filter({
        broadcaster_id: broadcasterId,
        viewer_id: viewerId,
        status: 'active'
      });
    },
    enabled: !!broadcasterId && !!viewerId,
    initialData: [],
  });

  const createSeriesMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.RecurringSeries.create({
        broadcaster_id: broadcasterId,
        viewer_id: viewerId,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recurringSeries']);
      setShowDialog(false);
      setFormData({
        series_name: '',
        description: '',
        frequency: 'weekly',
        preferred_session_type: 'video'
      });
      toast.success('Recurring series created! You\'ll get reminders for future sessions.');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.series_name.trim()) {
      toast.error('Please enter a series name');
      return;
    }
    createSeriesMutation.mutate(formData);
  };

  const sessionTypeIcons = {
    video: Video,
    audio: Phone,
    text: MessageSquare
  };

  if (!viewerId) return null;

  return (
    <div className="space-y-4">
      {series.length > 0 && (
        <Card className="shadow-lg border-2" style={{ borderColor: '#00BFFF' }}>
          <CardContent className="p-4">
            {series.map((s) => {
              const Icon = sessionTypeIcons[s.preferred_session_type];
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#E0F4FF' }}>
                  <Icon className="w-5 h-5" style={{ color: '#0055A4' }} />
                  <div className="flex-1">
                    <p className="font-extrabold" style={{ color: '#0055A4' }}>{s.series_name}</p>
                    <p className="text-xs font-semibold" style={{ color: '#4A90E2' }}>
                      {s.session_count} sessions • {s.frequency}
                    </p>
                  </div>
                  <Badge className="font-bold" style={{ backgroundColor: '#00BFFF' }}>Active</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full font-bold border-2" style={{ borderColor: '#00BFFF', color: '#0055A4' }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Recurring Series
          </Button>
        </DialogTrigger>
        <DialogContent className="border-4" style={{ borderColor: '#00BFFF' }}>
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold" style={{ color: '#0055A4' }}>
              Start a Recurring Series
            </DialogTitle>
            <DialogDescription className="font-semibold" style={{ color: '#4A90E2' }}>
              Book regular sessions with {broadcasterName} and build a lasting connection
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-bold" style={{ color: '#0055A4' }}>Series Name *</Label>
              <Input
                value={formData.series_name}
                onChange={(e) => setFormData({ ...formData, series_name: e.target.value })}
                placeholder="e.g., Weekly Spanish Lessons, Gaming Hangouts"
                className="font-semibold"
                required
              />
            </div>

            <div>
              <Label className="font-bold" style={{ color: '#0055A4' }}>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will you do in these sessions?"
                className="h-20 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Frequency *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Session Type *</Label>
                <Select
                  value={formData.preferred_session_type}
                  onValueChange={(value) => setFormData({ ...formData, preferred_session_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video
                      </div>
                    </SelectItem>
                    <SelectItem value="audio">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Audio
                      </div>
                    </SelectItem>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Text
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg p-4" style={{ backgroundColor: '#E0F4FF' }}>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="text-sm font-bold mb-2" style={{ color: '#0055A4' }}>Benefits of Recurring Series:</p>
                  <ul className="text-xs font-semibold space-y-1 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                    <li>Build deeper connections over time</li>
                    <li>Get reminders for your next session</li>
                    <li>Track progress in your ongoing journey</li>
                    <li>Preferred booking for regular times</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSeriesMutation.isPending}
                className="flex-1 font-bold shadow-lg"
                style={{ backgroundColor: '#0055A4' }}
              >
                Create Series
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
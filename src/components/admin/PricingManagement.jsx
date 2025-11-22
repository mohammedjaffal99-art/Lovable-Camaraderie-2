import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Video, Phone, MessageSquare, Link as LinkIcon, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PricingManagement() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSettings.list(),
    initialData: [],
  });

  const [prices, setPrices] = useState({
    video: '0.70',
    audio: '0.50',
    text: '0.30',
    social_link: '9.99'
  });

  React.useEffect(() => {
    if (settings.length > 0) {
      const priceMap = {};
      settings.forEach(s => {
        if (s.setting_key === 'pricing_video') priceMap.video = s.setting_value;
        if (s.setting_key === 'pricing_audio') priceMap.audio = s.setting_value;
        if (s.setting_key === 'pricing_text') priceMap.text = s.setting_value;
        if (s.setting_key === 'pricing_social_link') priceMap.social_link = s.setting_value;
      });
      setPrices(prev => ({ ...prev, ...priceMap }));
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (newPrices) => {
      const updates = [
        { key: 'pricing_video', value: newPrices.video },
        { key: 'pricing_audio', value: newPrices.audio },
        { key: 'pricing_text', value: newPrices.text },
        { key: 'pricing_social_link', value: newPrices.social_link }
      ];

      for (const update of updates) {
        const existing = settings.find(s => s.setting_key === update.key);
        if (existing) {
          await base44.entities.PlatformSettings.update(existing.id, {
            setting_value: update.value
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      setEditing(false);
      toast.success('Pricing updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update pricing. Please try again.');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(prices);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#11009E' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#11009E' }}>Platform Pricing</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)} style={{ backgroundColor: '#11009E' }}>
            Edit Pricing
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} style={{ backgroundColor: '#11009E' }}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" />
              Video Call Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Price per Minute (USD)</Label>
            <div className="flex items-center gap-2 mt-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={prices.video}
                onChange={(e) => setPrices({...prices, video: e.target.value})}
                disabled={!editing}
                className="text-lg font-semibold"
              />
              <span className="text-gray-600">per min</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              Audio Call Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Price per Minute (USD)</Label>
            <div className="flex items-center gap-2 mt-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={prices.audio}
                onChange={(e) => setPrices({...prices, audio: e.target.value})}
                disabled={!editing}
                className="text-lg font-semibold"
              />
              <span className="text-gray-600">per min</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Text Chat Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Price per Minute (USD)</Label>
            <div className="flex items-center gap-2 mt-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={prices.text}
                onChange={(e) => setPrices({...prices, text: e.target.value})}
                disabled={!editing}
                className="text-lg font-semibold"
              />
              <span className="text-gray-600">per min</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-orange-500" />
              Social Media Link Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Price per Social Link (USD)</Label>
            <div className="flex items-center gap-2 mt-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={prices.social_link}
                onChange={(e) => setPrices({...prices, social_link: e.target.value})}
                disabled={!editing}
                className="text-lg font-semibold"
              />
              <span className="text-gray-600">per link</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200 border-2">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2 text-blue-900">Note:</h3>
          <p className="text-sm text-blue-800">
            Changes to pricing will apply to all new sessions booked after saving. Existing sessions and packages will use the pricing at the time they were created.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
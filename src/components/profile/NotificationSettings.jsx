
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Save, Check, X } from 'lucide-react';
import { showToast } from '@/components/ui/toast-utils';

const NOTIFICATION_CATEGORIES = {
  sessions: {
    title: 'Session Notifications',
    description: 'Get notified about session activities',
    settings: [
      { key: 'session_booked', label: 'New Session Booked', description: 'When someone books a private session with you' },
      { key: 'session_started', label: 'Session Started', description: 'When your booked session starts' },
      { key: 'session_completed', label: 'Session Completed', description: 'When a session is completed' },
    ]
  },
  social: {
    title: 'Social Notifications',
    description: 'Stay connected with your audience',
    settings: [
      { key: 'favorite_live', label: 'Favorite Goes Live', description: 'When a favorited broadcaster starts streaming' },
      { key: 'new_follower', label: 'New Follower', description: 'When someone adds you to favorites' },
      { key: 'message_received', label: 'New Messages', description: 'When you receive a new message' },
      { key: 'profile_viewed', label: 'Profile Views', description: 'When someone views your profile' },
    ]
  },
  financial: {
    title: 'Financial Notifications',
    description: 'Manage balance and earnings alerts',
    settings: [
      { key: 'balance_low', label: 'Low Balance Warning', description: 'When your balance is running low' },
      { key: 'balance_added', label: 'Balance Added', description: 'When credits are added to your account' },
      { key: 'transaction_approved', label: 'Transaction Approved', description: 'When your purchase is approved' },
      { key: 'transaction_rejected', label: 'Transaction Rejected', description: 'When your purchase is rejected' },
      { key: 'earnings_milestone', label: 'Earnings Milestones', description: 'When you reach earnings milestones' },
    ]
  },
  achievements: {
    title: 'Achievement Notifications',
    description: 'Celebrate your progress',
    settings: [
      { key: 'level_up', label: 'Level Up', description: 'When you advance to a new level' },
      { key: 'approval_status', label: 'Approval Status', description: 'Updates on your account approval' },
    ]
  },
  system: {
    title: 'System Notifications',
    description: 'Important platform updates',
    settings: [
      { key: 'admin_message', label: 'Admin Messages', description: 'Important messages from administrators' },
      { key: 'system_update', label: 'System Updates', description: 'Platform updates and maintenance notices' },
      { key: 'report_update', label: 'Report Updates', description: 'Updates on reports you\'ve filed' },
      { key: 'warning', label: 'Warnings', description: 'Important warnings about your account' },
    ]
  }
};

export default function NotificationSettings({ user, onSave }) {
  const [preferences, setPreferences] = useState(
    user?.notification_preferences || {
      favorite_live: true,
      session_booked: true,
      session_started: true,
      session_completed: true,
      message_received: true,
      balance_low: true,
      balance_added: true,
      new_follower: true,
      profile_viewed: true,
      admin_message: true,
      system_update: true,
      approval_status: true,
      transaction_approved: true,
      transaction_rejected: true,
      report_update: true,
      level_up: true,
      earnings_milestone: true
    }
  );
  const [saving, setSaving] = useState(false);

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAll = (enabled) => {
    const newPreferences = {};
    Object.keys(preferences).forEach(key => {
      newPreferences[key] = enabled;
    });
    setPreferences(newPreferences);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ notification_preferences: preferences });
      showToast.settingsSaved();
    } catch (error) {
      showToast.error('Failed to update preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
            Enable All
          </Button>
          <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
            Disable All
          </Button>
        </div>
      </div>

      {Object.entries(NOTIFICATION_CATEGORIES).map(([categoryKey, category]) => {
        // Filter settings based on user role
        const visibleSettings = category.settings.filter(setting => {
          if (user?.role === 'customer' && ['session_booked', 'new_follower', 'profile_viewed', 'earnings_milestone'].includes(setting.key)) {
            return false;
          }
          return true;
        });

        if (visibleSettings.length === 0) return null;

        return (
          <Card key={categoryKey}>
            <CardHeader>
              <CardTitle className="text-lg">{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {visibleSettings.map(setting => {
                const isEnabled = preferences[setting.key];
                return (
                  <div key={setting.key} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 pr-4">
                      <Label htmlFor={setting.key} className="text-sm font-semibold cursor-pointer block mb-1">
                        {setting.label}
                      </Label>
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span 
                          className={`text-xs font-semibold transition-colors ${
                            isEnabled ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {isEnabled ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" /> ON
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <X className="w-3 h-3" /> OFF
                            </span>
                          )}
                        </span>
                      </div>
                      <Switch
                        id={setting.key}
                        checked={isEnabled}
                        onCheckedChange={() => togglePreference(setting.key)}
                        className={isEnabled ? 'data-[state=checked]:bg-green-500' : ''}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex items-start gap-2">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Understanding Notification Status</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-green-600 font-semibold">
                  <Check className="w-3 h-3" /> ON
                </span>
                <span>= You will receive notifications for this event</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-gray-600 font-semibold">
                  <X className="w-3 h-3" /> OFF
                </span>
                <span>= You will NOT receive notifications for this event</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: '#0055A4' }}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}

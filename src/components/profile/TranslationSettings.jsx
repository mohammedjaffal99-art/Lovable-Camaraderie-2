import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Languages, Save, Check, X, Globe } from 'lucide-react';
import { showToast } from '@/components/ui/toast-utils';

export default function TranslationSettings({ user, onSave }) {
  const [translationEnabled, setTranslationEnabled] = useState(
    user?.auto_translate_enabled !== false
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ auto_translate_enabled: translationEnabled });
      showToast.settingsSaved();
    } catch (error) {
      showToast.error('Failed to update preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#0055A4' }}>
            <Languages className="w-5 h-5" />
            Real-time Translation
          </CardTitle>
          <CardDescription>Control automatic translation of messages across the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between py-4 border-b border-gray-100">
            <div className="flex-1 pr-4">
              <Label htmlFor="auto_translate" className="text-base font-semibold cursor-pointer block mb-2">
                Auto-translate Messages
              </Label>
              <p className="text-sm text-gray-600 leading-relaxed">
                When enabled, all chat messages (public chats, private sessions, and AI support) will be automatically translated to your selected language in real-time.
              </p>
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#E0F4FF' }}>
                <p className="text-xs font-semibold" style={{ color: '#0055A4' }}>
                  <Globe className="w-3 h-3 inline mr-1" />
                  Your current language preference is controlled by the language selector in the top navigation bar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span 
                  className={`text-sm font-bold transition-colors ${
                    translationEnabled ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {translationEnabled ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" /> ON
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <X className="w-4 h-4" /> OFF
                    </span>
                  )}
                </span>
              </div>
              <Switch
                id="auto_translate"
                checked={translationEnabled}
                onCheckedChange={setTranslationEnabled}
                className={translationEnabled ? 'data-[state=checked]:bg-green-500' : ''}
              />
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <div className="flex items-start gap-2">
              <Languages className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-2">How Translation Works:</p>
                <ul className="space-y-1 text-xs ml-4 list-disc">
                  <li>Messages are translated in real-time using AI</li>
                  <li>Works in public chat rooms, private sessions, and AI support</li>
                  <li>Translation quality may vary depending on language pairs</li>
                  <li>You can still see the original message by hovering (future feature)</li>
                  <li>When you send a message, others will see it in their chosen language</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: '#0055A4' }}
          className="shadow-lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Translation Preferences'}
        </Button>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Subtitles, Volume2, Eye, Save, Info, Languages, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { showToast } from '@/components/ui/toast-utils';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';

export default function AccessibilitySettings() {
  const { user, refreshAuth } = useAuth();
  const { languages } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    captions_enabled: false,
    transcription_enabled: false,
    audio_descriptions_enabled: false,
    caption_language: 'auto',
    caption_size: 'medium'
  });

  useEffect(() => {
    if (user) {
      setSettings({
        captions_enabled: user.captions_enabled || false,
        transcription_enabled: user.transcription_enabled || false,
        audio_descriptions_enabled: user.audio_descriptions_enabled || false,
        caption_language: user.caption_language || 'auto',
        caption_size: user.caption_size || 'medium'
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(settings);
      await refreshAuth();
      showToast.settingsSaved();
    } catch (error) {
      showToast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = user && (
    settings.captions_enabled !== (user.captions_enabled || false) ||
    settings.transcription_enabled !== (user.transcription_enabled || false) ||
    settings.audio_descriptions_enabled !== (user.audio_descriptions_enabled || false) ||
    settings.caption_language !== (user.caption_language || 'auto') ||
    settings.caption_size !== (user.caption_size || 'medium')
  );

  return (
    <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
      <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-7 h-7 text-white" />
            <div>
              <CardTitle className="text-2xl font-extrabold text-white">Accessibility Settings</CardTitle>
              <p className="text-sm font-semibold text-white/90 mt-1">AI-powered features for better accessibility</p>
            </div>
          </div>
          {hasChanges && (
            <Badge className="bg-yellow-500 text-white font-bold animate-pulse">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="rounded-xl p-4 border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#87CEEB' }}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#4A90E2' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#0055A4' }}>
                These settings enhance your experience with AI-powered accessibility features across live streams, private sessions, and chat.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 border-2 shadow-lg" style={{ borderColor: '#FFD700', backgroundColor: '#FFFBF0' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: '#FFD700' }}>
                <Subtitles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold mb-2" style={{ color: '#0055A4' }}>
                  Real-Time Captions
                </h3>
                <p className="text-sm font-semibold mb-3" style={{ color: '#4A90E2' }}>
                  Display AI-generated live captions during streams and video sessions
                </p>
                <Badge className="font-bold" style={{ backgroundColor: '#FFD700', color: '#0055A4' }}>
                  For Live Streams & Sessions
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {settings.captions_enabled && (
                <span className="text-sm font-bold text-green-600">ON</span>
              )}
              <Switch
                checked={settings.captions_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, captions_enabled: checked })}
                className="mt-1 data-[state=checked]:bg-green-500"
              />
            </div>
          </div>

          {settings.captions_enabled && (
            <div className="mt-4 space-y-4 pl-15">
              <div>
                <label className="text-sm font-bold block mb-2" style={{ color: '#0055A4' }}>
                  Caption Language
                </label>
                <select
                  value={settings.caption_language}
                  onChange={(e) => setSettings({ ...settings, caption_language: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 font-semibold"
                  style={{ borderColor: '#87CEEB' }}
                >
                  <option value="auto">Auto (Your Native Language)</option>
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold block mb-2" style={{ color: '#0055A4' }}>
                  Caption Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSettings({ ...settings, caption_size: size })}
                      className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
                        settings.caption_size === size
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl p-6 border-2 shadow-lg" style={{ borderColor: '#00BFFF', backgroundColor: '#F0F9FF' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: '#00BFFF' }}>
                <Languages className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold mb-2" style={{ color: '#0055A4' }}>
                  Auto-Transcription
                </h3>
                <p className="text-sm font-semibold mb-3" style={{ color: '#4A90E2' }}>
                  Automatically transcribe audio in voice calls and display as text in real-time
                </p>
                <Badge className="font-bold" style={{ backgroundColor: '#00BFFF', color: 'white' }}>
                  For Audio & Video Sessions
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {settings.transcription_enabled && (
                <span className="text-sm font-bold text-green-600">ON</span>
              )}
              <Switch
                checked={settings.transcription_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, transcription_enabled: checked })}
                className="mt-1 data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 border-2 shadow-lg" style={{ borderColor: '#FF6B9D', backgroundColor: '#FFF5F9' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: '#FF6B9D' }}>
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold mb-2" style={{ color: '#0055A4' }}>
                  Audio Descriptions
                </h3>
                <p className="text-sm font-semibold mb-3" style={{ color: '#4A90E2' }}>
                  AI-powered audio narration of visual content and on-screen actions
                </p>
                <Badge className="font-bold" style={{ backgroundColor: '#FF6B9D', color: 'white' }}>
                  For Visually Impaired Users
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {settings.audio_descriptions_enabled && (
                <span className="text-sm font-bold text-green-600">ON</span>
              )}
              <Switch
                checked={settings.audio_descriptions_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, audio_descriptions_enabled: checked })}
                className="mt-1 data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="font-bold px-8 h-12 shadow-lg"
            style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {(settings.captions_enabled || settings.transcription_enabled || settings.audio_descriptions_enabled) && (
          <div className="rounded-xl p-4 border-2" style={{ backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: '#16A34A' }}>
                  Active Accessibility Features:
                </p>
                <ul className="text-xs font-semibold space-y-1" style={{ color: '#4A90E2' }}>
                  {settings.captions_enabled && <li>✓ Real-time captions in {settings.caption_language === 'auto' ? 'your native language' : languages.find(l => l.code === settings.caption_language)?.name}</li>}
                  {settings.transcription_enabled && <li>✓ Auto-transcription for audio/video sessions</li>}
                  {settings.audio_descriptions_enabled && <li>✓ AI audio descriptions for visual content</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
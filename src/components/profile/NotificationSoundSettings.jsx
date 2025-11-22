import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX } from "lucide-react";
import { getNotificationSoundsEnabled, toggleNotificationSounds, showToast } from "@/components/ui/toast-utils";

export default function NotificationSoundSettings() {
  const [soundsEnabled, setSoundsEnabled] = useState(getNotificationSoundsEnabled());

  const handleToggle = (enabled) => {
    setSoundsEnabled(enabled);
    toggleNotificationSounds(enabled);
    
    if (enabled) {
      showToast.success('🔊 Notification sounds enabled');
    } else {
      showToast.info('🔇 Notification sounds disabled', { duration: 2000 });
    }
  };

  return (
    <Card className="shadow-xl border-2" style={{ borderColor: '#00BFFF' }}>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2" style={{ color: '#0055A4' }}>
          {soundsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          Notification Sounds
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-medium">
            Play sound effects when notifications appear
          </p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleToggle(true)}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all shadow-md ${
                soundsEnabled 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Volume2 className="w-5 h-5 inline mr-2" />
              ON
            </button>
            
            <button
              onClick={() => handleToggle(false)}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all shadow-md ${
                !soundsEnabled 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <VolumeX className="w-5 h-5 inline mr-2" />
              OFF
            </button>
          </div>

          <div className="rounded-lg p-4 mt-4" style={{ backgroundColor: '#E0F4FF' }}>
            <p className="text-sm font-semibold" style={{ color: '#0055A4' }}>
              Sound Types:
            </p>
            <ul className="text-sm mt-2 space-y-1 ml-4 list-disc" style={{ color: '#4A90E2' }}>
              <li>✅ Success: Profile updates, payments, approvals</li>
              <li>❌ Error: Failed actions, missing fields</li>
              <li>⚠️ Warning: Important alerts, account actions</li>
              <li>ℹ️ Info: General notifications, stream events</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
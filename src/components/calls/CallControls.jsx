import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, Video as VideoIcon, VideoOff, Volume2, VolumeX, Pause, Play, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

export default function CallControls({ session, onEndCall }) {
  const queryClient = useQueryClient();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSoundOff, setIsSoundOff] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  if (!session) return null;

  const holdCallMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Session.update(session.id, {
        status: isOnHold ? 'active' : 'on_hold'
      });
    },
    onSuccess: () => {
      setIsOnHold(!isOnHold);
      queryClient.invalidateQueries(['session']);
      toast.info(isOnHold ? 'Call resumed' : 'Call on hold');
    }
  });

  const endCallMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Session.update(session.id, {
        status: 'completed',
        ended_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Call ended');
      if (onEndCall) onEndCall();
    }
  });

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-xl rounded-full px-6 py-4 shadow-2xl border-2 border-white/20">
        <div className="flex items-center gap-4">
          {session.session_type !== 'text' && (
            <Button
              onClick={() => setIsMuted(!isMuted)}
              size="icon"
              className={`w-14 h-14 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
          )}

          {session.session_type === 'video' && (
            <Button
              onClick={() => setIsVideoOff(!isVideoOff)}
              size="icon"
              className={`w-14 h-14 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'}`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
            </Button>
          )}

          {session.session_type !== 'text' && (
            <Button
              onClick={() => setIsSoundOff(!isSoundOff)}
              size="icon"
              className={`w-14 h-14 rounded-full ${isSoundOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'}`}
            >
              {isSoundOff ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </Button>
          )}

          <Button
            onClick={() => holdCallMutation.mutate()}
            disabled={holdCallMutation.isPending}
            size="icon"
            className={`w-14 h-14 rounded-full ${isOnHold ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-white/20 hover:bg-white/30'}`}
          >
            {isOnHold ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </Button>

          <Button
            onClick={() => endCallMutation.mutate()}
            disabled={endCallMutation.isPending}
            size="icon"
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-xl"
          >
            <PhoneOff className="w-8 h-8" />
          </Button>
        </div>
      </div>

      {isOnHold && (
        <div className="text-center mt-4">
          <div className="bg-yellow-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
            Call On Hold
          </div>
        </div>
      )}
    </div>
  );
}
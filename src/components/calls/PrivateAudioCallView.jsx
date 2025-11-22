import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export default function PrivateAudioCallView({ userId, partnerId, roomId }) {
  const [joined, setJoined] = useState(false);
  const vdoSrc = `https://vdo.ninja/?room=${roomId}&push=${userId}&view=${partnerId}&audio&novideo`;

  console.log('🎤 AUDIO CALL:', { roomId, userId, partnerId, joined });

  const handleJoinCall = () => {
    console.log('🎤 User clicked Join Audio Call - loading VDO.Ninja iframe');
    setJoined(true);
  };

  if (!joined) {
    return (
      <div className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl overflow-hidden flex flex-col items-center justify-center p-8" style={{ height: '550px' }}>
        <Badge className="absolute top-4 right-4 z-30 px-4 py-2 text-sm font-bold bg-purple-600 text-white shadow-xl">
          🎤 AUDIO CALL
        </Badge>

        <Phone className="w-24 h-24 text-white mb-6 animate-pulse" />
        
        <h2 className="text-3xl font-bold text-white mb-4">Join Audio Call</h2>
        <p className="text-white/80 text-center mb-8 max-w-md">
          Click below to enable your microphone for this private audio call.
        </p>

        <Button
          onClick={handleJoinCall}
          size="lg"
          className="bg-white hover:bg-gray-100 text-purple-600 font-bold text-lg px-8 py-6 rounded-xl shadow-2xl flex items-center gap-3"
        >
          <Phone className="w-6 h-6" />
          Join Audio Call
        </Button>

        <p className="text-white/60 text-sm mt-6 text-center max-w-md">
          Your browser will request microphone permissions. Please allow them to join the call.
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl overflow-hidden flex items-center justify-center" style={{ height: '550px' }}>
      <iframe
        src={vdoSrc}
        allow="microphone; autoplay"
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0 }}
      />
      
      <div className="text-center text-white z-10">
        <div className="relative inline-block mb-6">
          <Phone className="w-24 h-24 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-purple-400 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Audio Call Active</h2>
        <p className="text-purple-200">Voice connection established</p>
      </div>

      <Badge className="absolute top-4 right-4 z-30 px-4 py-2 text-sm font-bold bg-purple-600 text-white shadow-xl">
        🎤 IN CALL
      </Badge>

      <div className="absolute top-4 left-4 z-30">
        <div className="relative">
          <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg" />
          <div className="absolute inset-0 w-3 h-3 bg-purple-500 rounded-full animate-ping opacity-75" />
        </div>
      </div>
    </div>
  );
}
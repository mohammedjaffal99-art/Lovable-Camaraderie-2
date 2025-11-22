import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Radio } from "lucide-react";

export default function StreamHostView({ streamerId, roomId }) {
  const [joined, setJoined] = useState(false);
  const vdoSrc = `https://vdo.ninja/?room=${roomId}&push=${streamerId}&webcam&hd=1&bitrate=4000`;

  console.log('🔴 HOST MODE:', { streamerId, roomId, joined });

  const handleJoinStream = () => {
    console.log('🎥 User clicked Join Stream - loading VDO.Ninja iframe');
    setJoined(true);
  };

  if (!joined) {
    return (
      <div className="relative bg-gradient-to-br from-red-900 to-orange-900 rounded-xl overflow-hidden flex flex-col items-center justify-center p-8" style={{ height: '550px' }}>
        <Badge className="absolute top-4 right-4 z-30 px-4 py-2 text-sm font-bold bg-red-600 text-white shadow-xl">
          🎥 BROADCASTER MODE
        </Badge>

        <Video className="w-24 h-24 text-white mb-6 animate-pulse" />
        
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Go Live?</h2>
        <p className="text-white/80 text-center mb-8 max-w-md">
          Click the button below to enable your camera and microphone and start broadcasting to your viewers.
        </p>

        <Button
          onClick={handleJoinStream}
          size="lg"
          className="bg-white hover:bg-gray-100 text-red-600 font-bold text-lg px-8 py-6 rounded-xl shadow-2xl flex items-center gap-3"
        >
          <Radio className="w-6 h-6" />
          Join Stream
        </Button>

        <p className="text-white/60 text-sm mt-6 text-center max-w-md">
          Your browser will request camera and microphone permissions. Please allow them to start streaming.
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ height: '550px' }}>
      <iframe
        src={vdoSrc}
        allow="camera; microphone; autoplay; fullscreen; display-capture"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: '0' }}
      />
      
      <Badge className="absolute top-4 right-4 z-30 px-4 py-2 text-sm font-bold bg-red-600 text-white shadow-xl">
        🔴 LIVE
      </Badge>

      <div className="absolute top-4 left-4 z-30">
        <div className="relative">
          <div className="w-3 h-3 bg-red-600 rounded-full shadow-lg" />
          <div className="absolute inset-0 w-3 h-3 bg-red-600 rounded-full animate-ping opacity-75" />
        </div>
      </div>
    </div>
  );
}
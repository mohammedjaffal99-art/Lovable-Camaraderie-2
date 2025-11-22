import React from "react";
import { Badge } from "@/components/ui/badge";

export default function StreamViewerView({ streamerId, roomId }) {
  const vdoSrc = `https://vdo.ninja/?room=${roomId}&view=${streamerId}&autoplay&mute=0`;
  
  console.log('👁️ VIEWER MODE:', { streamerId, roomId });

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ height: '550px' }}>
      <iframe
        src={vdoSrc}
        allow="autoplay; fullscreen"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: '0' }}
      />
      
      <Badge className="absolute top-4 right-4 z-30 px-4 py-2 text-sm font-bold bg-blue-600 text-white shadow-xl">
        👁️ WATCHING
      </Badge>

      <div className="absolute top-4 left-4 z-30">
        <div className="relative">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" />
          <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
        </div>
      </div>
    </div>
  );
}
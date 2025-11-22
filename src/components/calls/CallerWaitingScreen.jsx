import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, User } from 'lucide-react';
import { usePhoneRingtone } from './PhoneRingtone';

export default function CallerWaitingScreen({ broadcasterName, broadcasterPhoto, callType, onCancel }) {
  const [dots, setDots] = useState('');
  const [pulseCount, setPulseCount] = useState(0);
  
  usePhoneRingtone(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
      setPulseCount(prev => prev + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const firstName = broadcasterName ? broadcasterName.split(' ')[0] : 'Broadcaster';

  return (
    <div className="fixed inset-0 z-[9999] animate-in fade-in duration-300">
      {/* Android-style calling screen */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-green-700">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Top status */}
        <div className="absolute top-0 left-0 right-0 p-6 text-center text-white z-10">
          <p className="font-bold text-sm uppercase tracking-wide opacity-90">
            {callType || 'Video'} Call
          </p>
        </div>

        {/* Main content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          {/* Broadcaster photo with animated rings */}
          <div className="relative mb-8">
            <div className="absolute inset-0 -m-20">
              <div 
                className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" 
                style={{ animationDuration: '2s' }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping delay-500" 
                style={{ animationDuration: '2s', animationDelay: '0.5s' }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping delay-1000" 
                style={{ animationDuration: '2s', animationDelay: '1s' }}
              ></div>
            </div>
            
            {broadcasterPhoto ? (
              <img
                src={broadcasterPhoto}
                alt={broadcasterName || 'Broadcaster'}
                className="w-40 h-40 rounded-full object-cover border-8 border-white/40 shadow-2xl relative z-10"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-8 border-white/40 shadow-2xl relative z-10">
                <User className="w-20 h-20 text-white" />
              </div>
            )}
          </div>

          {/* Broadcaster name */}
          <h1 className="text-4xl font-bold text-white mb-4 text-center drop-shadow-lg">
            {broadcasterName || 'Broadcaster'}
          </h1>

          {/* Calling status */}
          <div className="flex flex-col items-center gap-4 mb-12">
            <p className="text-2xl font-semibold text-white/90">
              Calling{dots}
            </p>
            
            {/* Animated phone icon */}
            <div className="relative">
              <Phone className="w-16 h-16 text-white animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <Phone className="w-16 h-16 text-white opacity-50" />
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 max-w-md w-full mb-8">
            <div className="text-center">
              <p className="text-white font-bold text-lg mb-2">
                🔔 Waiting for {firstName} to answer
              </p>
              <p className="text-white/80 text-sm">
                They will see your call request and can accept or decline
              </p>
            </div>
          </div>

          {/* Pulse counter (subtle) */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full bg-white transition-opacity ${
                  pulseCount % 3 === i ? 'opacity-100' : 'opacity-30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom cancel button - Android style */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex flex-col items-center">
            <button
              onClick={onCancel}
              className="flex flex-col items-center group"
            >
              <div className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95">
                <PhoneOff className="w-10 h-10 text-white" style={{ transform: 'rotate(135deg)' }} />
              </div>
              <span className="text-white font-bold text-sm mt-3">End Call</span>
            </button>

            <p className="text-center text-white/70 text-xs font-medium mt-6">
              💡 Session will start automatically when accepted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
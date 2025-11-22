
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Video, Phone, MessageSquare, PhoneOff, Ban, Clock, User } from 'lucide-react';
import { showToast } from '@/components/ui/toast-utils';
import { usePhoneRingtone } from './PhoneRingtone';

export default function IncomingCallNotification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [ringingCall, setRingingCall] = useState(null);

  const { data: incomingCalls, isLoading: loadingCalls, refetch: refetchCalls } = useQuery({
    queryKey: ['incomingCalls', user?.id],
    queryFn: async () => {
      if (!user?.id || !user.broadcaster_approved) return [];
      
      const calls = await base44.entities.CallRequest.filter(
        { broadcaster_id: user.id, status: 'ringing' },
        '-created_date',
        10
      );
      return calls;
    },
    enabled: !!user?.id && !!user.broadcaster_approved,
    refetchInterval: 2000,
    initialData: [],
  });

  usePhoneRingtone(!!ringingCall);

  useEffect(() => {
    if (incomingCalls && incomingCalls.length > 0) {
      const latestCall = incomingCalls[0];
      
      if (!ringingCall || ringingCall.id !== latestCall.id) {
        setRingingCall(latestCall);
      }
    } else if (ringingCall) {
      setRingingCall(null);
    }
  }, [incomingCalls]);

  const acceptCallMutation = useMutation({
    mutationFn: async (callId) => {
      await base44.entities.CallRequest.update(callId, {
        status: 'accepted',
        answered_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      setRingingCall(null);
      queryClient.invalidateQueries(['incomingCalls']);
      showToast.success('Call accepted! Connecting...');
    }
  });

  const rejectCallMutation = useMutation({
    mutationFn: async (callId) => {
      await base44.entities.CallRequest.update(callId, {
        status: 'rejected',
        ended_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      setRingingCall(null);
      queryClient.invalidateQueries(['incomingCalls']);
    }
  });

  const banCallerMutation = useMutation({
    mutationFn: async (callId) => {
      const call = incomingCalls.find(c => c.id === callId);
      await base44.entities.CallRequest.update(callId, {
        status: 'banned',
        ended_at: new Date().toISOString()
      });
      
      await base44.entities.Report.create({
        reporter_id: user.id,
        reported_user_id: call.caller_id,
        reason: 'other',
        description: 'Caller banned during call request',
        status: 'pending'
      });
    },
    onSuccess: () => {
      setRingingCall(null);
      queryClient.invalidateQueries(['incomingCalls']);
      showToast.success('Caller banned');
    }
  });

  const getCallIcon = (type) => {
    switch(type) {
      case 'video': return Video;
      case 'audio': return Phone;
      case 'text': return MessageSquare;
      default: return Phone;
    }
  };

  if (!ringingCall) return null;

  const CallIcon = getCallIcon(ringingCall.call_type);

  return (
    <div className="fixed inset-0 z-[9999] animate-in fade-in duration-300">
      {/* Android-style incoming call screen */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Top status bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-2">
            <CallIcon className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wide">
              Incoming {ringingCall.call_type} call
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">{ringingCall.duration_minutes} min</span>
          </div>
        </div>

        {/* Main content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          {/* Caller photo with ripple effect */}
          <div className="relative mb-8">
            <div className="absolute inset-0 -m-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping delay-500" style={{ animationDuration: '2s' }}></div>
            </div>
            
            {ringingCall.caller_photo ? (
              <img
                src={ringingCall.caller_photo}
                alt={ringingCall.caller_name}
                className="w-40 h-40 rounded-full object-cover border-8 border-white/40 shadow-2xl relative z-10"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-8 border-white/40 shadow-2xl relative z-10">
                <User className="w-20 h-20 text-white" />
              </div>
            )}
          </div>

          {/* Caller name */}
          <h1 className="text-4xl font-bold text-white mb-2 text-center drop-shadow-lg">
            {ringingCall.caller_name}
          </h1>

          {/* Call type badge */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full mb-4">
            <CallIcon className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg capitalize">
              {ringingCall.call_type}
            </span>
          </div>

          {/* Session details */}
          <div className="flex items-center gap-4 text-white/90 text-sm font-semibold mb-8">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{ringingCall.duration_minutes} minutes</span>
            </div>
            <span className="text-white/60">•</span>
            <span className="text-lg font-bold">${ringingCall.total_price.toFixed(2)}</span>
          </div>

          {/* Animated ringing indicator */}
          <div className="relative mb-12">
            <Phone className="w-12 h-12 text-white animate-bounce" />
            <div className="absolute inset-0 animate-ping">
              <Phone className="w-12 h-12 text-white opacity-60" />
            </div>
          </div>
        </div>

        {/* Bottom action buttons - Android style */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          {/* Reject button (left) */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => rejectCallMutation.mutate(ringingCall.id)}
              disabled={rejectCallMutation.isPending}
              className="flex flex-col items-center group"
            >
              <div className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95">
                <PhoneOff className="w-10 h-10 text-white" style={{ transform: 'rotate(135deg)' }} />
              </div>
              <span className="text-white font-bold text-sm mt-3">Decline</span>
            </button>

            {/* Accept button (right) */}
            <button
              onClick={() => acceptCallMutation.mutate(ringingCall.id)}
              disabled={acceptCallMutation.isPending}
              className="flex flex-col items-center group animate-pulse"
            >
              <div className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <span className="text-white font-bold text-sm mt-3">Accept</span>
            </button>
          </div>

          {/* Additional options */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => banCallerMutation.mutate(ringingCall.id)}
              disabled={banCallerMutation.isPending}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all">
                <Ban className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/80 text-xs font-semibold mt-2">Block</span>
            </button>
          </div>

          {/* Info text */}
          <p className="text-center text-white/70 text-xs font-medium mt-6">
            Session will start immediately after you accept
          </p>
        </div>
      </div>
    </div>
  );
}

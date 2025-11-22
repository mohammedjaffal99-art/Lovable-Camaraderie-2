import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Phone, MessageSquare, AlertCircle, DollarSign, PhoneCall } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { showToast } from "@/components/ui/toast-utils";
import IcebreakerPrompts from '../session/IcebreakerPrompts';
import SeriesManager from '../session/SeriesManager';

const SESSION_TYPES = {
  video: { icon: Video, price: 0.70, color: '#0055A4' },
  audio: { icon: Phone, price: 0.50, color: '#00BFFF' },
  text: { icon: MessageSquare, price: 0.30, color: '#4A90E2' }
};

const DURATIONS = [15, 30, 45];

const scrollToElement = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export default function SessionBooking({ broadcaster, currentUser }) {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const queryClient = useQueryClient();

  const userRole = currentUser?.user_role || 'guest';
  const canBookSession = ['user', 'streamer', 'moderator', 'admin'].includes(userRole);

  const sessionConfig = selectedType ? SESSION_TYPES[selectedType] : null;
  const totalPrice = sessionConfig ? sessionConfig.price * selectedDuration : 0;
  const balanceField = selectedType ? `balance_${selectedType}` : null;
  const currentBalance = balanceField && currentUser?.[balanceField] ? currentUser[balanceField] : 0;
  const hasEnoughBalance = currentBalance >= selectedDuration;

  const validateBooking = () => {
    const errors = [];
    
    if (!selectedType) {
      errors.push({ field: 'sessionType', label: 'Please select a session type (Video, Audio, or Text)' });
    }
    if (!selectedDuration) {
      errors.push({ field: 'duration', label: 'Please select a session duration' });
    }
    
    const balanceFieldForValidation = `balance_${selectedType}`;
    const userBalanceForValidation = currentUser?.[balanceFieldForValidation] || 0;
    
    if (userBalanceForValidation < selectedDuration) {
      errors.push({ 
        field: 'balance', 
        label: `Insufficient ${selectedType} balance. You have ${userBalanceForValidation} min, but need ${selectedDuration} min` 
      });
    }

    if (broadcaster.status !== 'online') {
      errors.push({ field: 'broadcasterStatus', label: 'The broadcaster is currently offline.' });
    }
    
    return errors;
  };

  const bookSessionMutation = useMutation({
    mutationFn: async () => {
      const errors = validateBooking();
      if (errors.length > 0) {
        throw new Error('Validation failed');
      }
      
      const balanceFieldForMutation = `balance_${selectedType}`;
      const currentBalanceForMutation = currentUser[balanceFieldForMutation] || 0;
      const pricePerMinute = SESSION_TYPES[selectedType].price;
      const totalPriceForMutation = selectedDuration * pricePerMinute;

      await base44.auth.updateMe({
        [balanceFieldForMutation]: currentBalanceForMutation - selectedDuration
      });

      const vdoRoomId = `session${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

      const session = await base44.entities.Session.create({
        broadcaster_id: broadcaster.id,
        customer_id: currentUser.id,
        session_type: selectedType,
        duration_minutes: selectedDuration,
        price_per_minute: pricePerMinute,
        total_price: totalPriceForMutation,
        status: 'active',
        started_at: new Date().toISOString(),
        vdo_room_id: vdoRoomId,
        broadcaster_earnings: totalPriceForMutation * (30 + (broadcaster.level || 0) * 0.30) / 100,
        commission_rate: 30 + (broadcaster.level || 0) * 0.30
      });

      await base44.entities.Transaction.create({
        user_id: currentUser.id,
        type: 'session_deduction',
        balance_type: selectedType,
        amount: totalPriceForMutation,
        minutes: -selectedDuration,
        status: 'approved',
        session_id: session.id
      });

      await base44.entities.Notification.create({
        user_id: broadcaster.id,
        type: 'session_booked',
        title: 'New Session Booked!',
        message: `${currentUser.full_name} booked a ${selectedType} session (${selectedDuration} min)`,
        metadata: { session_id: session.id }
      });

      queryClient.invalidateQueries(['user']);

      return session;
    },
    onSuccess: (session) => {
      showToast.success('Session booked successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = `/PrivateSession?id=${session.id}`;
      }, 1500);
    },
    onError: (error) => {
      const errors = validateBooking();
      if (errors.length > 0) {
        showToast.error(`Please fix the following: ${errors.map(e => e.label).join(', ')}`);
        setTimeout(() => scrollToElement('session-booking-form'), 100);
      } else {
        showToast.error('Failed to book session. Please try again.');
      }
      console.error('Booking error:', error);
    }
  });

  const handleBookSession = () => {
    const errors = validateBooking();
    
    if (errors.length > 0) {
      showToast.error(`Please fix the following: ${errors.map(e => e.label).join(', ')}`);
      setTimeout(() => scrollToElement('session-booking-form'), 100);
      return;
    }
    
    bookSessionMutation.mutate();
  };

  if (!canBookSession) {
    return (
      <div className="text-center py-6 px-4 rounded-lg border-2" style={{ borderColor: '#E0F4FF', backgroundColor: '#F0F9FF' }}>
        <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#87CEEB' }} />
        <p className="text-base font-bold mb-3" style={{ color: '#0055A4' }}>Sign in to book sessions</p>
        <Button
          onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
          className="font-bold text-sm h-9"
          style={{ backgroundColor: '#0055A4' }}
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div id="session-booking-form">
      <div className="p-3 rounded-lg border-2" style={{ borderColor: '#E0F4FF', backgroundColor: '#F0F9FF' }}>
        {currentUser ? (
          broadcaster.status === 'online' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(SESSION_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  const typeLabels = {
                    video: 'Video Calls',
                    audio: 'Audio Calls',
                    text: 'Private Texting'
                  };

                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        selectedType === type ? 'ring-1' : ''
                      }`}
                      style={{
                        borderColor: selectedType === type ? config.color : '#E0F4FF',
                        ringColor: selectedType === type ? config.color : 'transparent',
                        backgroundColor: selectedType === type ? `${config.color}15` : 'white'
                      }}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: config.color }} />
                      <p className="font-bold text-xs" style={{ color: '#0055A4' }}>{typeLabels[type]}</p>
                    </button>
                  );
                })}
              </div>

              {selectedType && (
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration(duration)}
                      className={`p-1.5 rounded-lg border-2 transition-all ${
                        selectedDuration === duration ? 'ring-1' : ''
                      }`}
                      style={{
                        borderColor: selectedDuration === duration ? '#00BFFF' : '#E0F4FF',
                        ringColor: selectedDuration === duration ? '#00BFFF' : 'transparent',
                        backgroundColor: selectedDuration === duration ? '#E0F4FF' : 'white'
                      }}
                    >
                      <p className="text-lg font-bold" style={{ color: '#0055A4' }}>{duration}</p>
                      <p className="text-xs font-semibold" style={{ color: '#4A90E2' }}>min</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedType && (
                <>
                  <div className="rounded-lg p-2 border" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs" style={{ color: '#4A90E2' }}>Total</span>
                      <span className="text-lg font-bold" style={{ color: '#0055A4' }}>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs" style={{ color: '#4A90E2' }}>Balance</span>
                      <span className={`font-bold text-sm ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                        {currentBalance} min
                      </span>
                    </div>
                  </div>

                  {!hasEnoughBalance && (
                    <div className="rounded p-2 border-l-2" style={{ backgroundColor: '#FEF2F2', borderColor: '#EF4444' }}>
                      <p className="font-bold text-xs text-red-900">Need {selectedDuration - currentBalance} more min</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => window.location.href = '/Balance'}
                      variant="outline"
                      className="h-8 font-bold text-xs border-2"
                      style={{ borderColor: '#00BFFF', color: '#0055A4' }}
                    >
                      <DollarSign className="w-3.5 h-3.5 mr-1" />
                      Add Balance
                    </Button>
                    <Button
                      onClick={handleBookSession}
                      disabled={bookSessionMutation.isPending}
                      className="h-8 text-xs font-bold"
                      style={{ backgroundColor: '#0055A4' }}
                    >
                      {bookSessionMutation.isPending ? 'Calling...' : 'Call Now'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#87CEEB' }} />
              <p className="text-base font-bold mb-1" style={{ color: '#0055A4' }}>Broadcaster Offline</p>
              <p className="text-xs font-semibold" style={{ color: '#4A90E2' }}>Check back later</p>
            </div>
          )
        ) : (
          <div className="text-center py-6">
            <p className="text-base font-bold mb-3" style={{ color: '#0055A4' }}>Sign in to book sessions</p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="font-bold text-sm h-9"
              style={{ backgroundColor: '#0055A4' }}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children, className = '', ...props }) {
  return <label className={`text-sm font-medium ${className}`} {...props}>{children}</label>;
}
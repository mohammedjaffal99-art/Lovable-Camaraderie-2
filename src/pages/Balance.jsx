import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Phone, MessageSquare, DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { showToast } from "@/components/ui/toast-utils";

const VIDEO_PACKAGES = [
  { minutes: 15, price: 10.50, label: 'Starter' },
  { minutes: 30, price: 21.00, label: 'Popular' },
  { minutes: 45, price: 31.50, label: 'Best Value' },
  { minutes: 60, price: 42.00, label: 'Premium', featured: true }
];

const AUDIO_PACKAGES = [
  { minutes: 15, price: 7.50, label: 'Starter' },
  { minutes: 30, price: 15.00, label: 'Popular' },
  { minutes: 45, price: 22.50, label: 'Best Value' },
  { minutes: 60, price: 30.00, label: 'Premium', featured: true }
];

const TEXT_PACKAGES = [
  { minutes: 15, price: 4.50, label: 'Starter' },
  { minutes: 30, price: 9.00, label: 'Popular' },
  { minutes: 45, price: 13.50, label: 'Best Value' },
  { minutes: 60, price: 18.00, label: 'Premium', featured: true }
];

export default function Balance() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [purchasingPackage, setPurchasingPackage] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes premiumPulse {
        0%, 100% {
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.4), 0 0 40px rgba(0, 191, 255, 0.2);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 30px rgba(0, 191, 255, 0.6), 0 0 60px rgba(0, 191, 255, 0.3);
          transform: scale(1.02);
        }
      }
      .premium-card {
        animation: premiumPulse 2s ease-in-out infinite;
        transition: all 0.3s ease;
      }
      .premium-card:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 0 40px rgba(0, 191, 255, 0.8), 0 0 80px rgba(0, 191, 255, 0.4) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const { data: transactions } = useQuery({
    queryKey: ['myTransactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Transaction.filter({ user_id: user.id }, '-created_date', 20);
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const handlePurchase = async (balanceType, pkg) => {
    const packageKey = `${balanceType}-${pkg.minutes}`;
    
    if (purchasingPackage) {
      showToast.warning('Please wait for the current purchase to complete');
      return;
    }
    
    setPurchasingPackage(packageKey);

    try {
      // Map balanceType to purchaseType expected by backend
      // balanceType is 'video', 'audio', 'text'
      // purchaseType is 'video_call', 'audio_call', 'text_chat'
      let purchaseType = '';
      if (balanceType === 'video') purchaseType = 'video_call';
      else if (balanceType === 'audio') purchaseType = 'audio_call';
      else if (balanceType === 'text') purchaseType = 'text_chat';

      const amountCents = Math.round(pkg.price * 100);

      const response = await base44.functions.invoke('createCheckoutSession', {
        amount: amountCents,
        minutes: pkg.minutes,
        purchaseType: purchaseType
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const checkoutUrl = response.data.url || response.data.checkoutUrl;
      if (checkoutUrl) {
        // Save session token to localStorage before redirect
        const session = base44.auth.session; 
        const token = session?.access_token || session?.token; 
        if (token) {
          localStorage.setItem("authToken", token);
        }

        if (window.top) {
          window.top.location.href = checkoutUrl;
        } else {
          window.location.href = checkoutUrl;
        }
      } else {
        throw new Error('No checkout URL returned');
      }

    } catch (error) {
      console.error('Purchase error:', error);
      showToast.paymentFailed();
      setPurchasingPackage(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <Card className="shadow-2xl border-2 max-w-md" style={{ borderColor: '#00BFFF' }}>
          <CardContent className="p-12 text-center">
            <p className="text-2xl font-extrabold mb-6" style={{ color: '#0055A4' }}>{t('balance.signInRequired')}</p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="font-extrabold shadow-xl"
              style={{ backgroundColor: '#0055A4' }}
            >
              {t('balance.signIn')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center" style={{ color: '#0055A4' }}>
          {t('balance.title')}
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-2xl border-2" style={{ borderColor: '#0055A4' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-extrabold" style={{ color: '#0055A4' }}>
                <Video className="w-6 h-6" />
                {t('balance.videoBalance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-extrabold mb-2" style={{ color: '#0055A4' }}>{user.balance_video || 0}</p>
              <p className="text-base font-bold" style={{ color: '#4A90E2' }}>{t('common.minutes')}</p>
              <p className="text-sm font-semibold mt-2" style={{ color: '#87CEEB' }}>$0.70 {t('balance.perMinute')}</p>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-extrabold" style={{ color: '#0055A4' }}>
                <Phone className="w-6 h-6" />
                {t('balance.audioBalance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-extrabold mb-2" style={{ color: '#0055A4' }}>{user.balance_audio || 0}</p>
              <p className="text-base font-bold" style={{ color: '#4A90E2' }}>{t('common.minutes')}</p>
              <p className="text-sm font-semibold mt-2" style={{ color: '#87CEEB' }}>$0.50 {t('balance.perMinute')}</p>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-2" style={{ borderColor: '#87CEEB' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-extrabold" style={{ color: '#0055A4' }}>
                <MessageSquare className="w-6 h-6" />
                {t('balance.textBalance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-extrabold mb-2" style={{ color: '#0055A4' }}>{user.balance_text || 0}</p>
              <p className="text-base font-bold" style={{ color: '#4A90E2' }}>{t('common.minutes')}</p>
              <p className="text-sm font-semibold mt-2" style={{ color: '#87CEEB' }}>$0.30 {t('balance.perMinute')}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold flex items-center gap-2" style={{ color: '#0055A4' }}>
              <Video className="w-7 h-7" />
              {t('balance.addMinutes')} - Video Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {VIDEO_PACKAGES.map((pkg) => {
                const packageKey = `video-${pkg.minutes}`;
                const isPurchasing = purchasingPackage === packageKey;
                
                return (
                  <Card 
                    key={pkg.minutes}
                    className={`shadow-xl border-2 ${pkg.featured ? 'ring-4 ring-offset-2 premium-card' : ''}`}
                    style={{ 
                      borderColor: pkg.featured ? '#00BFFF' : '#87CEEB',
                      ringColor: pkg.featured ? '#00BFFF' : 'transparent'
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      {pkg.featured && (
                        <Badge className="mb-3 font-bold" style={{ backgroundColor: '#00BFFF' }}>
                          {t('balance.premium')}
                        </Badge>
                      )}
                      <p className="text-base font-extrabold mb-2" style={{ color: '#4A90E2' }}>{pkg.label}</p>
                      <p className="text-4xl font-extrabold mb-2" style={{ color: '#0055A4' }}>{pkg.minutes}</p>
                      <p className="text-sm font-bold mb-4" style={{ color: '#4A90E2' }}>{t('common.minutes')}</p>
                      <p className="text-3xl font-extrabold mb-4" style={{ color: '#00BFFF' }}>${pkg.price.toFixed(2)}</p>
                      <Button
                        onClick={() => handlePurchase('video', pkg)}
                        disabled={isPurchasing}
                        className="w-full font-extrabold shadow-lg"
                        style={{ backgroundColor: '#0055A4' }}
                      >
                        {isPurchasing ? 'Processing...' : t('balance.requestPurchase')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold flex items-center gap-2" style={{ color: '#0055A4' }}>
              <Phone className="w-7 h-7" />
              {t('balance.addMinutes')} - Audio Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {AUDIO_PACKAGES.map((pkg) => {
                const packageKey = `audio-${pkg.minutes}`;
                const isPurchasing = purchasingPackage === packageKey;
                
                return (
                  <Card 
                    key={pkg.minutes}
                    className={`shadow-xl border-2 ${pkg.featured ? 'ring-4 ring-offset-2 premium-card' : ''}`}
                    style={{ 
                      borderColor: pkg.featured ? '#00BFFF' : '#87CEEB',
                      ringColor: pkg.featured ? '#00BFFF' : 'transparent'
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      {pkg.featured && (
                        <Badge className="mb-3 font-bold" style={{ backgroundColor: '#00BFFF' }}>
                          {t('balance.premium')}
                        </Badge>
                      )}
                      <p className="text-base font-extrabold mb-2" style={{ color: '#4A90E2' }}>{pkg.label}</p>
                      <p className="text-4xl font-extrabold mb-2" style={{ color: '#0055A4' }}>{pkg.minutes}</p>
                      <p className="text-sm font-bold mb-4" style={{ color: '#4A90E2' }}>{t('common.minutes')}</p>
                      <p className="text-3xl font-extrabold mb-4" style={{ color: '#00BFFF' }}>${pkg.price.toFixed(2)}</p>
                      <Button
                        onClick={() => handlePurchase('audio', pkg)}
                        disabled={isPurchasing}
                        className="w-full font-extrabold shadow-lg"
                        style={{ backgroundColor: '#0055A4' }}
                      >
                        {isPurchasing ? 'Processing...' : t('balance.requestPurchase')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold flex items-center gap-2" style={{ color: '#0055A4' }}>
              <MessageSquare className="w-7 h-7" />
              {t('balance.addMinutes')} - Text Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {TEXT_PACKAGES.map((pkg) => {
                const packageKey = `text-${pkg.minutes}`;
                const isPurchasing = purchasingPackage === packageKey;
                
                return (
                  <Card 
                    key={pkg.minutes}
                    className={`shadow-xl border-2 ${pkg.featured ? 'ring-4 ring-offset-2 premium-card' : ''}`}
                    style={{ 
                      borderColor: pkg.featured ? '#00BFFF' : '#87CEEB',
                      ringColor: pkg.featured ? '#00BFFF' : 'transparent'
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      {pkg.featured && (
                        <Badge className="mb-3 font-bold" style={{ backgroundColor: '#00BFFF' }}>
                          {t('balance.premium')}
                        </Badge>
                      )}
                      <p className="text-base font-extrabold mb-2" style={{ color: '#4A90E2' }}>{pkg.label}</p>
                      <p className="text-4xl font-extrabold mb-2" style={{ color: '#0055A4' }}>{pkg.minutes}</p>
                      <p className="text-sm font-bold mb-4" style={{ color: '#4A90E2' }}>{t('common.minutes')}</p>
                      <p className="text-3xl font-extrabold mb-4" style={{ color: '#00BFFF' }}>${pkg.price.toFixed(2)}</p>
                      <Button
                        onClick={() => handlePurchase('text', pkg)}
                        disabled={isPurchasing}
                        className="w-full font-extrabold shadow-lg"
                        style={{ backgroundColor: '#0055A4' }}
                      >
                        {isPurchasing ? 'Processing...' : t('balance.requestPurchase')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>
              {t('balance.transactionHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4" style={{ color: '#87CEEB' }} />
                <p className="text-xl font-bold" style={{ color: '#4A90E2' }}>{t('balance.noTransactions')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-6 border-2 rounded-2xl shadow-lg"
                    style={{ borderColor: '#87CEEB' }}
                  >
                    <div className="flex items-center gap-4">
                      {transaction.type === 'purchase' ? (
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                      <div>
                        <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>
                          {transaction.type === 'purchase' ? t('balance.topUpRequest') : t('balance.sessionDeduction')}
                        </p>
                        <p className="text-base font-bold capitalize" style={{ color: '#4A90E2' }}>
                          {transaction.balance_type} {t('balance.balance')} • {Math.abs(transaction.minutes)} {t('balance.min')}
                        </p>
                        <p className="text-sm font-semibold" style={{ color: '#87CEEB' }}>
                          {new Date(transaction.created_date).toLocaleDateString()} at {new Date(transaction.created_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold" style={{ color: transaction.type === 'purchase' ? '#00BFFF' : '#EF4444' }}>
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <Badge 
                        className="mt-2 font-bold"
                        style={{ 
                          backgroundColor: transaction.status === 'approved' ? '#22c55e' : 
                                         transaction.status === 'rejected' ? '#ef4444' : '#f59e0b' 
                        }}
                      >
                        {t(`balance.${transaction.status}`)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
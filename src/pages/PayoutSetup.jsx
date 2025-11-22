import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, CheckCircle2, DollarSign, Shield, Globe, Loader2 } from "lucide-react";
import { showToast } from "@/components/ui/toast-utils";

export default function PayoutSetup() {
  const [user, setUser] = useState(null);
  const [mellowLink, setMellowLink] = useState('');
  const [verifying, setVerifying] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      window.location.href = '/';
    });
  }, []);

  const { data: onboarding, isLoading } = useQuery({
    queryKey: ['payoutOnboarding', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const records = await base44.entities.PayoutOnboarding.filter({ streamer_id: user.id });
      return records[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: contractorAccount } = useQuery({
    queryKey: ['contractorAccount', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const accounts = await base44.entities.ContractorAccount.filter({ streamer_id: user.id });
      return accounts[0] || null;
    },
    enabled: !!user?.id,
  });

  const verifyMellowLinkMutation = useMutation({
    mutationFn: async () => {
      if (!mellowLink.trim()) {
        throw new Error('Please enter your Mellow account link');
      }

      setVerifying(true);
      
      const response = await base44.functions.invoke('verifyMellowAccount', {
        mellowLink: mellowLink.trim(),
        userId: user.id
      });

      return response.data;
    },
    onSuccess: (data) => {
      setVerifying(false);
      if (data.verified) {
        queryClient.invalidateQueries(['payoutOnboarding']);
        queryClient.invalidateQueries(['contractorAccount']);
        showToast.success('Mellow account verified successfully!');
        setMellowLink('');
      } else {
        showToast.error(data.error || 'Invalid Mellow account link. Please check and try again.');
      }
    },
    onError: (error) => {
      setVerifying(false);
      showToast.error(error.message || 'Failed to verify Mellow account');
    }
  });

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #0055A4 0%, #00BFFF 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  const isCompleted = onboarding?.completed && contractorAccount?.contractor_id && contractorAccount?.onboarding_status === 'connected';

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl font-extrabold" style={{ color: '#0055A4' }}>
              <DollarSign className="w-8 h-8" />
              Payout Account Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isCompleted && (
              <div className="p-4 rounded-lg border-2 flex items-center gap-3" style={{ backgroundColor: '#F0FDF4', borderColor: '#16A34A' }}>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-800">Payout Account Ready!</p>
                  <p className="text-sm text-green-600">Your payout account is configured and ready to receive payments.</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-bold" style={{ color: '#0055A4' }}>What is Mellow.io?</h3>
              <p className="text-gray-700 leading-relaxed">
                Mellow.io is our trusted payout partner that enables fast, secure, and compliant payments to streamers worldwide. 
                With Mellow, you can receive your earnings in your preferred currency, no matter where you are.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#E0F4FF' }}>
                  <Globe className="w-8 h-8 mx-auto mb-2" style={{ color: '#0055A4' }} />
                  <p className="font-bold" style={{ color: '#0055A4' }}>Global Payments</p>
                  <p className="text-xs text-gray-600 mt-1">180+ countries supported</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#E0F4FF' }}>
                  <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: '#0055A4' }} />
                  <p className="font-bold" style={{ color: '#0055A4' }}>Secure & Compliant</p>
                  <p className="text-xs text-gray-600 mt-1">Bank-level security</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#E0F4FF' }}>
                  <DollarSign className="w-8 h-8 mx-auto mb-2" style={{ color: '#0055A4' }} />
                  <p className="font-bold" style={{ color: '#0055A4' }}>Fast Payouts</p>
                  <p className="text-xs text-gray-600 mt-1">Receive funds in 1-3 days</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t-2" style={{ borderColor: '#87CEEB' }}>
              <h3 className="text-xl font-bold" style={{ color: '#0055A4' }}>Setup Steps</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>If you don't have a Mellow account, click the button below to register</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Complete your Mellow profile and verify your identity</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Copy your Mellow profile link and paste it below for verification</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>Once verified, you'll be able to receive payouts</span>
                </li>
              </ol>
            </div>

            <div className="space-y-4 pt-6">
              {!isCompleted && (
                <>
                  <Button
                    onClick={() => window.open('https://my.mellow.io/registration/invite?_gl=1*1wuvkah*_gcl_aw*R0NMLjE3NjM2NDM3ODMuQ2p3S0NBaUFsZnZJQmhBNkVpd0FjRXJweVJKdzBLc3pnVkxJNnZKQ3lYdjFDbXlKMWt3TkhTOUV1dWt2RXlCdlpHcjRrTFJMSDBrQ1hCb0NGZlFRQXZEX0J3RQ..*_gcl_au*MzE2NzE5OTYwLjE3NjM2NDM3MDY.*_ga*NTQ4ODUzMjQuMTc2MzY0MzcwOQ..*_ga_EGX3VGGV3Q*czE3NjM2NDM3MDYkbzEkZzEkdDE3NjM2NDk5ODkkajkkbDAkaDA.&lang=en', '_blank')}
                    variant="outline"
                    className="w-full h-14 text-lg font-bold border-2 shadow-md"
                    style={{ borderColor: '#00BFFF', color: '#0055A4' }}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Register on Mellow.io
                  </Button>

                  <div className="space-y-3">
                    <Label className="text-base font-bold" style={{ color: '#0055A4' }}>
                      Paste Your Mellow Account Link
                    </Label>
                    <Input
                      type="text"
                      placeholder="https://my.mellow.io/profile/your-username"
                      value={mellowLink}
                      onChange={(e) => setMellowLink(e.target.value)}
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-gray-600">
                      Copy your Mellow profile link from your account and paste it here. We'll verify your account automatically.
                    </p>
                  </div>

                  <Button
                    onClick={() => verifyMellowLinkMutation.mutate()}
                    disabled={verifyMellowLinkMutation.isPending || !mellowLink.trim()}
                    className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: '#0055A4' }}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Verify Mellow Account
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            <div className="p-4 rounded-lg mt-6" style={{ backgroundColor: '#FEF3C7' }}>
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> You must complete your Mellow.io account setup to receive payouts. 
                If you need help, contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
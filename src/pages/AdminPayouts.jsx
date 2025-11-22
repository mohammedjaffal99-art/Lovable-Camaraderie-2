import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react";
import { showToast } from "@/components/ui/toast-utils";
import { Badge } from "@/components/ui/badge";

export default function AdminPayouts() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u.role !== 'admin') {
        window.location.href = '/';
      }
      setUser(u);
    }).catch(() => {
      window.location.href = '/';
    });
  }, []);

  const { data: payoutData, isLoading } = useQuery({
    queryKey: ['adminPayouts'],
    queryFn: async () => {
      const broadcasters = await base44.entities.User.filter({ broadcaster_approved: true });
      
      const results = [];
      
      for (const broadcaster of broadcasters) {
        const sessions = await base44.entities.Session.filter({
          broadcaster_id: broadcaster.id,
          status: 'completed'
        });
        
        let totalEarnings = 0;
        for (const session of sessions) {
          if (session.broadcaster_earnings) {
            totalEarnings += session.broadcaster_earnings;
          }
        }
        
        const withdrawals = await base44.entities.Withdrawal.filter({
          broadcaster_id: broadcaster.id,
          status: 'completed'
        });
        
        let totalWithdrawn = 0;
        for (const withdrawal of withdrawals) {
          totalWithdrawn += withdrawal.amount;
        }
        
        const amountAvailable = totalEarnings - totalWithdrawn;
        
        const onboardingRecords = await base44.entities.PayoutOnboarding.filter({
          streamer_id: broadcaster.id
        });
        const onboarding = onboardingRecords[0];
        
        if (amountAvailable > 0) {
          results.push({
            broadcaster,
            amountAvailable,
            totalEarnings,
            totalWithdrawn,
            onboarding: onboarding || { started: false, completed: false }
          });
        }
      }
      
      return results.sort((a, b) => b.amountAvailable - a.amountAvailable);
    },
    enabled: !!user,
    initialData: [],
  });

  const handleDownloadCSV = async () => {
    try {
      const response = await base44.functions.invoke('exportPayouts');
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mellow_payouts_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      showToast.success('✔️ CSV exported successfully — upload it in Mellow.io to send payouts.');
    } catch (error) {
      console.error('Download error:', error);
      showToast.error('Failed to export CSV. Please try again.');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #0055A4 0%, #00BFFF 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  const totalPending = payoutData.reduce((sum, item) => sum + item.amountAvailable, 0);

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-3xl font-extrabold" style={{ color: '#0055A4' }}>
                <DollarSign className="w-8 h-8" />
                Payout Management
              </CardTitle>
              <Button
                onClick={handleDownloadCSV}
                className="font-bold shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#0055A4' }}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Mellow CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#E0F4FF' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>Total Pending Payouts</p>
                  <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>${totalPending.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>Streamers with Balance</p>
                  <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>{payoutData.length}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {payoutData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl font-bold text-gray-500">No pending payouts</p>
                </div>
              ) : (
                payoutData.map((item) => (
                  <Card key={item.broadcaster.id} className="border-2" style={{ borderColor: '#87CEEB' }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {item.broadcaster.photo_1 && (
                            <img
                              src={item.broadcaster.photo_1}
                              alt={item.broadcaster.full_name}
                              className="w-12 h-12 rounded-full object-cover border-2"
                              style={{ borderColor: '#00BFFF' }}
                            />
                          )}
                          <div>
                            <p className="font-bold text-lg" style={{ color: '#0055A4' }}>
                              {item.broadcaster.full_name}
                            </p>
                            <p className="text-sm text-gray-600">{item.broadcaster.email}</p>
                            <p className="text-xs text-gray-500">{item.broadcaster.country || 'Unknown'}</p>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>Pending Payout</p>
                            <p className="text-2xl font-extrabold" style={{ color: '#16A34A' }}>
                              ${item.amountAvailable.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            {item.onboarding.completed ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Mellow Ready
                              </Badge>
                            ) : item.onboarding.started ? (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                <Clock className="w-3 h-3 mr-1" />
                                In Progress
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-red-300">
                                <XCircle className="w-3 h-3 mr-1" />
                                Not Started
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
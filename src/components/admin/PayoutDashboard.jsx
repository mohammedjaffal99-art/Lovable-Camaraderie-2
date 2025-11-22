import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { showToast } from "@/components/ui/toast-utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function PayoutDashboard() {
  const [selectedStreamers, setSelectedStreamers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: pendingPayouts, refetch: refetchPending } = useQuery({
    queryKey: ['pendingPayouts'],
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

        const contractorAccounts = await base44.entities.ContractorAccount.filter({
          streamer_id: broadcaster.id
        });
        const contractorAccount = contractorAccounts[0];

        if (amountAvailable > 0) {
          results.push({
            broadcaster,
            amountAvailable,
            contractorAccount: contractorAccount || null,
            status: contractorAccount?.contractor_id ? 'ready' : 'missing_account'
          });
        }
      }

      return results.sort((a, b) => b.amountAvailable - a.amountAvailable);
    },
    initialData: [],
  });

  const { data: completedPayouts } = useQuery({
    queryKey: ['completedPayouts'],
    queryFn: async () => {
      return await base44.entities.PayoutExport.filter({}, '-created_date', 100);
    },
    initialData: [],
  });

  const { data: allStreamers } = useQuery({
    queryKey: ['allStreamers'],
    queryFn: async () => {
      const broadcasters = await base44.entities.User.filter({ broadcaster_approved: true });
      const results = [];

      for (const broadcaster of broadcasters) {
        const contractorAccounts = await base44.entities.ContractorAccount.filter({
          streamer_id: broadcaster.id
        });
        const contractorAccount = contractorAccounts[0];

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

        results.push({
          broadcaster,
          contractorAccount,
          balance: amountAvailable
        });
      }

      return results;
    },
    initialData: [],
  });

  const { data: payoutLogs } = useQuery({
    queryKey: ['payoutLogs'],
    queryFn: async () => {
      return await base44.entities.PayoutLog.filter({}, '-created_date', 100);
    },
    initialData: [],
  });

  const { data: settings } = useQuery({
    queryKey: ['payoutSettings'],
    queryFn: async () => {
      const allSettings = await base44.entities.PayoutSettings.filter({});
      return allSettings[0] || {
        mode: 'sandbox',
        sandbox_invite_link: 'https://my.mellow.io/registration/invite?_gl=1*1wuvkah*_gcl_aw*R0NMLjE3NjM2NDM3ODMuQ2p3S0NBaUFsZnZJQmhBNkVpd0FjRXJweVJKdzBLc3pnVkxJNnZKQ3lYdjFDbXlKMWt3TkhTOUV1dWt2RXlCdlpHcjRrTFJMSDBrQ1hCb0NGZlFRQXZEX0J3RQ..*_gcl_au*MzE2NzE5OTYwLjE3NjM2NDM3MDY.*_ga*NTQ4ODUzMjQuMTc2MzY0MzcwOQ..*_ga_EGX3VGGV3Q*czE3NjM2NDM3MDYkbzEkZzEkdDE3NjM2NDk5ODkkajkkbDAkaDA.&lang=en',
        production_invite_link: 'https://my.mellow.io/registration/invite?_gl=1*1wuvkah*_gcl_aw*R0NMLjE3NjM2NDM3ODMuQ2p3S0NBaUFsZnZJQmhBNkVpd0FjRXJweVJKdzBLc3pnVkxJNnZKQ3lYdjFDbXlKMWt3TkhTOUV1dWt2RXlCdlpHcjRrTFJMSDBrQ1hCb0NGZlFRQXZEX0J3RQ..*_gcl_au*MzE2NzE5OTYwLjE3NjM2NDM3MDY.*_ga*NTQ4ODUzMjQuMTc2MzY0MzcwOQ..*_ga_EGX3VGGV3Q*czE3NjM2NDM3MDYkbzEkZzEkdDE3NjM2NDk5ODkkajkkbDAkaDA.&lang=en',
        notify_streamer_payouts: true,
        minimum_payout_amount: 50
      };
    },
  });

  const exportCSVMutation = useMutation({
    mutationFn: async () => {
      const missingAccounts = selectedStreamers.filter(id => {
        const payout = pendingPayouts.find(p => p.broadcaster.id === id);
        return !payout?.contractorAccount?.contractor_id;
      });

      if (missingAccounts.length > 0) {
        throw new Error('missing_accounts');
      }

      const response = await base44.functions.invoke('exportMellowCSV', {
        streamerIds: selectedStreamers
      });

      return response.data;
    },
    onSuccess: (csvData) => {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mellow_payouts_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      showToast.success('CSV generated!');
      setSelectedStreamers([]);
      queryClient.invalidateQueries(['completedPayouts']);
      queryClient.invalidateQueries(['payoutLogs']);
    },
    onError: (error) => {
      if (error.message === 'missing_accounts') {
        showToast.error('One or more selected streamers do not have a Mellow account. Please ask them to complete payout onboarding before exporting CSV.');
      } else {
        showToast.error('Failed to generate CSV');
      }
    }
  });

  const markReviewedMutation = useMutation({
    mutationFn: async (exportId) => {
      await base44.entities.PayoutExport.update(exportId, { reviewed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['completedPayouts']);
      showToast.success('Marked as reviewed');
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      if (settings?.id) {
        await base44.entities.PayoutSettings.update(settings.id, newSettings);
      } else {
        await base44.entities.PayoutSettings.create(newSettings);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payoutSettings']);
      showToast.success('Settings saved');
    }
  });

  const handleSelectAll = () => {
    if (selectedStreamers.length === pendingPayouts.length) {
      setSelectedStreamers([]);
    } else {
      setSelectedStreamers(pendingPayouts.map(p => p.broadcaster.id));
    }
  };

  const handleToggleStreamer = (id) => {
    if (selectedStreamers.includes(id)) {
      setSelectedStreamers(selectedStreamers.filter(s => s !== id));
    } else {
      setSelectedStreamers([...selectedStreamers, id]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Ready</Badge>;
      case 'missing_account':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Missing Account</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const filteredLogs = payoutLogs.filter(log => 
    log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid grid-cols-5 gap-2 p-1.5 rounded-xl shadow-xl w-full mb-6" style={{ backgroundColor: '#E0F4FF' }}>
        <TabsTrigger value="pending" className="font-bold text-sm py-3">Pending Payouts</TabsTrigger>
        <TabsTrigger value="completed" className="font-bold text-sm py-3">Completed Payouts</TabsTrigger>
        <TabsTrigger value="streamers" className="font-bold text-sm py-3">Streamer Accounts</TabsTrigger>
        <TabsTrigger value="logs" className="font-bold text-sm py-3">Payout Logs</TabsTrigger>
        <TabsTrigger value="settings" className="font-bold text-sm py-3">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        <Card className="shadow-xl border-2" style={{ borderColor: '#87CEEB' }}>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button onClick={handleSelectAll} variant="outline" size="sm">
                  {selectedStreamers.length === pendingPayouts.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button onClick={refetchPending} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={() => exportCSVMutation.mutate()}
                disabled={selectedStreamers.length === 0 || exportCSVMutation.isPending}
                className="font-bold"
                style={{ backgroundColor: '#0055A4' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Payout CSV ({selectedStreamers.length})
              </Button>
            </div>

            <div className="space-y-3">
              {pendingPayouts.map((payout) => (
                <div key={payout.broadcaster.id} className="flex items-center gap-4 p-4 rounded-lg border-2" style={{ borderColor: '#00BFFF' }}>
                  <Checkbox
                    checked={selectedStreamers.includes(payout.broadcaster.id)}
                    onCheckedChange={() => handleToggleStreamer(payout.broadcaster.id)}
                  />
                  {payout.broadcaster.photo_1 ? (
                    <img src={payout.broadcaster.photo_1} alt={payout.broadcaster.full_name} className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#0055A4' }}>
                      {payout.broadcaster.full_name?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: '#0055A4' }}>{payout.broadcaster.full_name}</p>
                    <p className="text-sm text-gray-600">{payout.broadcaster.email}</p>
                    <p className="text-xs text-gray-500">ID: {payout.broadcaster.id} • {payout.broadcaster.country}</p>
                    {payout.contractorAccount?.contractor_id && (
                      <p className="text-xs text-gray-500">Contractor: {payout.contractorAccount.contractor_id}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">${payout.amountAvailable.toFixed(2)}</p>
                    {getStatusBadge(payout.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        <Card className="shadow-xl border-2" style={{ borderColor: '#87CEEB' }}>
          <CardContent className="p-6">
            <div className="space-y-3">
              {completedPayouts.map((export_) => (
                <div key={export_.id} className="p-4 rounded-lg border-2" style={{ borderColor: '#00BFFF' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold" style={{ color: '#0055A4' }}>{export_.csv_filename}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(export_.created_date).toLocaleDateString()} • {export_.total_streamers} streamers • ${export_.total_amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Exported by: {export_.exported_by}</p>
                    </div>
                    <div className="flex gap-2">
                      {!export_.reviewed && (
                        <Button
                          onClick={() => markReviewedMutation.mutate(export_.id)}
                          size="sm"
                          variant="outline"
                        >
                          Mark as Reviewed
                        </Button>
                      )}
                      <Badge className={export_.mode === 'production' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {export_.mode}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="streamers" className="space-y-4">
        <Card className="shadow-xl border-2" style={{ borderColor: '#87CEEB' }}>
          <CardContent className="p-6">
            <div className="mb-4">
              <Button
                onClick={() => window.open(settings?.sandbox_invite_link, '_blank')}
                className="font-bold"
                style={{ backgroundColor: '#0055A4' }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Create Mellow Account
              </Button>
            </div>

            <div className="space-y-3">
              {allStreamers.map((streamer) => (
                <div key={streamer.broadcaster.id} className="p-4 rounded-lg border-2" style={{ borderColor: '#00BFFF' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold" style={{ color: '#0055A4' }}>{streamer.broadcaster.full_name}</p>
                      <p className="text-sm text-gray-600">{streamer.broadcaster.email} • {streamer.broadcaster.country}</p>
                      {streamer.contractorAccount?.contractor_id && (
                        <p className="text-xs text-gray-500">Contractor ID: {streamer.contractorAccount.contractor_id}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: '#0055A4' }}>${streamer.balance.toFixed(2)}</p>
                      <Badge className={streamer.contractorAccount?.contractor_id ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {streamer.contractorAccount?.contractor_id ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="logs" className="space-y-4">
        <Card className="shadow-xl border-2" style={{ borderColor: '#87CEEB' }}>
          <CardContent className="p-6">
            <div className="mb-4">
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border" style={{ borderColor: '#E0F4FF' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#0055A4' }}>{log.event}</p>
                      <p className="text-xs text-gray-600">{log.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(log.created_date).toLocaleString()}</p>
                      <Badge className="mt-1">{log.mode}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <Card className="shadow-xl border-2" style={{ borderColor: '#87CEEB' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold" style={{ color: '#0055A4' }}>Payout System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-bold">Mode</Label>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={settings?.mode === 'sandbox' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200'}>
                  Sandbox
                </Badge>
                <Badge className={settings?.mode === 'production' ? 'bg-green-100 text-green-800' : 'bg-gray-200'}>
                  Production
                </Badge>
              </div>
            </div>

            <div>
              <Label className="font-bold">Notify Streamer Payouts</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={settings?.notify_streamer_payouts}
                  onCheckedChange={(checked) => {
                    updateSettingsMutation.mutate({ ...settings, notify_streamer_payouts: checked });
                  }}
                  className="data-[state=checked]:bg-green-500"
                />
                <span className="text-sm font-semibold" style={{ color: settings?.notify_streamer_payouts ? '#16A34A' : '#6B7280' }}>
                  {settings?.notify_streamer_payouts ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div>
              <Label className="font-bold">Minimum Payout Amount (USD)</Label>
              <Input
                type="number"
                value={settings?.minimum_payout_amount || 50}
                onChange={(e) => {
                  updateSettingsMutation.mutate({ ...settings, minimum_payout_amount: parseFloat(e.target.value) });
                }}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="font-bold">CSV Encoding</Label>
              <Input value="UTF-8" disabled className="mt-2" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
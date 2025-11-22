import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Video, CheckCircle, XCircle, AlertTriangle, Download, ArrowLeft } from "lucide-react";
import UserApproval from "../components/admin/UserApproval";
import TransactionManagement from "../components/admin/TransactionManagement";
import UserManagement from "../components/admin/UserManagement";
import Reports from "../components/admin/Reports";
import PricingManagement from '../components/admin/PricingManagement';
import TargetManagement from '../components/admin/TargetManagement';
import AnnouncementManagement from '../components/admin/AnnouncementManagement';
import EventsManagement from '../components/admin/EventsManagement';
import WithdrawalManagement from "../components/admin/WithdrawalManagement";
import ModerationPanel from '../components/admin/ModerationPanel';
import ContentGuidelines from '../components/admin/ContentGuidelines';
import RoleManagement from "../components/admin/RoleManagement";
import PermissionMatrix from "../components/admin/PermissionMatrix";
import PayoutDashboard from "../components/admin/PayoutDashboard";
import GoalsManagement from "../components/admin/GoalsManagement";
import { useLanguage } from "@/components/LanguageContext";
import { useNavigate } from "react-router-dom";
import RequireClientRole from '../components/auth/RequireClientRole';

const createPageUrl = (pageName) => {
  switch (pageName) {
    case 'Home':
      return '/';
    default:
      return '/';
  }
};

export default function AdminPanel() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') {
        navigate('/');
      }
      setUser(u);
    }).catch(() => navigate('/'));
  }, [navigate]);

  const { data: adminStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [users, sessions, transactions, reports, pendingBroadcasters, pendingWithdrawals] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Session.filter({ status: 'completed' }),
        base44.entities.Transaction.list(),
        base44.entities.Report.filter({ status: 'pending' }),
        base44.entities.User.list().then(all => all.filter(u => u.requested_role === 'broadcaster' && !u.broadcaster_approved)),
        base44.entities.Withdrawal.filter({ status: 'pending' })
      ]);

      const broadcasters = users.filter(u => u.role === 'broadcaster');
      const customers = users.filter(u => u.role === 'customer');
      const liveBroadcasters = broadcasters.filter(u => u.status === 'online' || u.status === 'live');
      const totalRevenue = sessions.reduce((sum, s) => sum + (s.total_price || 0), 0);
      const pendingTransactions = transactions.filter(tx => tx.status === 'pending');

      return {
        totalUsers: users.length,
        broadcasters: broadcasters.length,
        customers: customers.length,
        liveNow: liveBroadcasters.length,
        sessionsCompleted: sessions.length,
        totalRevenue,
        pendingApprovals: pendingBroadcasters.length,
        pendingTransactions: pendingTransactions.length,
        pendingReports: reports.length,
        pendingWithdrawals: pendingWithdrawals.length
      };
    },
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
    initialData: {
      totalUsers: 0,
      broadcasters: 0,
      customers: 0,
      liveNow: 0,
      sessionsCompleted: 0,
      totalRevenue: 0,
      pendingApprovals: 0,
      pendingTransactions: 0,
      pendingReports: 0,
      pendingWithdrawals: 0
    }
  });

  const exportCommissions = async () => {
    try {
      const users = await base44.entities.User.list();
      const broadcasters = users.filter(u => u.role === 'broadcaster' && u.broadcaster_approved);
      
      if (broadcasters.length === 0) {
        alert(t('admin.noBroadcasters'));
        return;
      }
      
      const csvData = broadcasters.map(b => ({
        Name: b.full_name || '',
        Email: b.email || '',
        Level: b.level || 0,
        'Commission Rate': `${(30 + ((b.level || 0) * 0.33)).toFixed(2)}%`,
        'Monthly Earnings': `$${(b.monthly_earnings || 0).toFixed(2)}`,
        'Total Earnings': `$${(b.total_earnings || 0).toFixed(2)}`,
        'Sessions Completed': b.total_sessions || 0
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(h => JSON.stringify(row[h])).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert(t('admin.exportFailed'));
    }
  };

  const handleExitAdminPanel = () => {
    navigate(createPageUrl('Home'));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4" style={{ borderColor: '#0055A4' }}></div>
      </div>
    );
  }

  return (
    <RequireClientRole allowedRoles={["admin"]}>
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#0055A4', letterSpacing: '1px' }}>{t('admin.title')}</h1>
            <Button onClick={handleExitAdminPanel} className="font-bold shadow-lg" style={{ backgroundColor: 'white', color: '#0055A4', border: '2px solid #87CEEB' }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Admin Panel
            </Button>
          </div>

          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="grid w-full grid-cols-12 gap-2 p-2 rounded-xl shadow-xl mb-6" style={{ backgroundColor: '#E0F4FF' }}>
              <TabsTrigger value="overview" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>Overview</TabsTrigger>
              <TabsTrigger value="roles" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>Roles</TabsTrigger>
              <TabsTrigger value="moderation" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>Moderation</TabsTrigger>
              <TabsTrigger value="approvals" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>
                User Approvals
                {adminStats.pendingApprovals > 0 && (
                  <Badge className="ml-1 font-bold text-xs" style={{ backgroundColor: '#0055A4', color: 'white' }}>{adminStats.pendingApprovals}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="transactions" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>
                Transactions
                {adminStats.pendingTransactions > 0 && (
                  <Badge className="ml-1 font-bold text-xs" style={{ backgroundColor: '#0055A4', color: 'white' }}>{adminStats.pendingTransactions}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>Users</TabsTrigger>
              <TabsTrigger value="reports" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>
                Reports
                {adminStats.pendingReports > 0 && (
                  <Badge className="ml-1 font-bold text-xs" style={{ backgroundColor: '#0055A4', color: 'white' }}>{adminStats.pendingReports}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>
                Withdrawals
                {adminStats.pendingWithdrawals > 0 && (
                  <Badge className="ml-1 font-bold text-xs" style={{ backgroundColor: '#0055A4', color: 'white' }}>{adminStats.pendingWithdrawals}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="payouts" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#16A34A' }}>
                Payouts
              </TabsTrigger>
              <TabsTrigger value="pricing" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>Pricing</TabsTrigger>
              <TabsTrigger value="goals" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>Goals</TabsTrigger>
              <TabsTrigger value="content" className="font-extrabold text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg" style={{ color: '#0055A4' }}>Target</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2" style={{ color: '#4A90E2' }}>
                      <Users className="w-5 h-5" />
                      {t('admin.totalUsers')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold" style={{ color: '#0055A4' }}>{adminStats.totalUsers}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: '#4A90E2' }}>
                      {adminStats.broadcasters} streamers • {adminStats.customers} {t('admin.customers')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2" style={{ color: '#4A90E2' }}>
                      <Video className="w-5 h-5" />
                      {t('admin.liveNow')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold" style={{ color: '#0055A4' }}>{adminStats.liveNow}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: '#4A90E2' }}>
                      {adminStats.sessionsCompleted} {t('admin.sessionsCompleted')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2" style={{ color: '#4A90E2' }}>
                      <DollarSign className="w-5 h-5" />
                      {t('admin.totalRevenue')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold" style={{ color: '#0055A4' }}>${adminStats.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: '#4A90E2' }}>{t('admin.allTimeRevenue')}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2" style={{ color: '#4A90E2' }}>
                      <AlertTriangle className="w-5 h-5" />
                      {t('admin.pendingActions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span style={{ color: '#4A90E2' }}>User Approvals:</span>
                        <Badge className="font-bold text-xs" style={{ backgroundColor: '#0055A4', color: 'white' }}>{adminStats.pendingApprovals}</Badge>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span style={{ color: '#4A90E2' }}>{t('admin.transactions')}</span>
                        <Badge className="font-bold text-xs" style={{ backgroundColor: '#0055A4', color: 'white' }}>{adminStats.pendingTransactions}</Badge>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span style={{ color: '#4A90E2' }}>Withdrawals:</span>
                        <Badge className="font-bold text-xs" style={{ backgroundColor: '#0055A4', color: 'white' }}>{adminStats.pendingWithdrawals}</Badge>
                      </div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span style={{ color: '#4A90E2' }}>{t('admin.reports')}</span>
                        <Badge className="font-bold text-xs" style={{ backgroundColor: '#0055A4', color: 'white' }}>{adminStats.pendingReports}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="roles">
              <div className="space-y-6">
                <RoleManagement />
                <PermissionMatrix />
              </div>
            </TabsContent>

            <TabsContent value="moderation">
              <div className="space-y-6">
                <ModerationPanel />
                <ContentGuidelines />
              </div>
            </TabsContent>

            <TabsContent value="approvals">
              <UserApproval />
            </TabsContent>
            
            <TabsContent value="transactions">
              <TransactionManagement />
            </TabsContent>
            
            <TabsContent value="withdrawals">
              <WithdrawalManagement />
            </TabsContent>

            <TabsContent value="payouts">
              <PayoutDashboard />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="reports">
              <Reports />
            </TabsContent>

            <TabsContent value="pricing">
              <PricingManagement />
            </TabsContent>

            <TabsContent value="goals">
              <GoalsManagement />
            </TabsContent>

            <TabsContent value="content">
              <div className="space-y-6">
                <TargetManagement />
                <AnnouncementManagement />
                <EventsManagement />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RequireClientRole>
  );
}
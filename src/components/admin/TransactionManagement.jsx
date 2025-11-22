import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/components/LanguageContext";
import { showToast } from "@/components/ui/toast-utils";

export default function TransactionManagement() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: transactions } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      const txs = await base44.entities.Transaction.list('-created_date', 300);
      const userIds = [...new Set(txs.map(tx => tx.user_id))];
      const users = await base44.entities.User.list();
      const userMap = {};
      users.forEach(u => { userMap[u.id] = u; });
      
      return txs.map(tx => ({
        ...tx,
        user: userMap[tx.user_id]
      }));
    },
    refetchInterval: 5000,
    initialData: [],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ transactionId, userId, balanceType, minutes, amount }) => {
      await base44.entities.Transaction.update(transactionId, { status: 'approved' });

      if (balanceType && minutes) {
        const users = await base44.entities.User.list();
        const user = users.find(u => u.id === userId);
        
        if (user) {
          const balanceField = `balance_${balanceType}`;
          const currentBalance = user[balanceField] || 0;
          await base44.entities.User.update(userId, {
            [balanceField]: currentBalance + minutes
          });
        }
      }

      const users = await base44.entities.User.list();
      const user = users.find(u => u.id === userId);
      
      if (user) {
        await base44.entities.Notification.create({
          user_id: userId,
          type: 'transaction_approved',
          title: 'Payment Approved!',
          message: `Your payment has been approved. ${minutes || 'Your purchase'} has been processed.`
        });

        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Payment Confirmed - Camaraderie.tv',
          body: `Hi ${user.full_name},\n\nYour payment of $${amount} has been confirmed.\n\nThank you for using Camaraderie.tv!`
        });
      }
    },
    onSuccess: () => {
      showToast.success('Transaction approved! Balance updated.');
      queryClient.invalidateQueries(['allTransactions']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (error) => {
      showToast.error('Failed to approve transaction.');
      console.error('Transaction approval error:', error);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ transactionId, userId, amount }) => {
      await base44.entities.Transaction.update(transactionId, { status: 'rejected' });

      await base44.entities.Notification.create({
        user_id: userId,
        type: 'transaction_rejected',
        title: 'Payment Rejected',
        message: 'Your payment could not be processed. Please contact support.'
      });

      const users = await base44.entities.User.list();
      const user = users.find(u => u.id === userId);

      if (user) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Payment Issue - Camaraderie.tv',
          body: `Hi ${user.full_name},\n\nThere was an issue processing your payment of $${amount}. Please contact support.\n\nThank you.`
        });
      }
    },
    onSuccess: () => {
      showToast.warning('Transaction rejected');
      queryClient.invalidateQueries(['allTransactions']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (error) => {
      showToast.error('Failed to reject transaction.');
      console.error('Transaction rejection error:', error);
    }
  });

  const pendingTransactions = transactions?.filter(t => t.status === 'pending') || [];
  const completedTransactions = transactions?.filter(t => t.status !== 'pending') || [];

  return (
    <div className="space-y-6">
      <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-extrabold" style={{ color: '#0055A4' }}>
            <DollarSign className="w-7 h-7" />
            Pending Transactions ({pendingTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingTransactions.length === 0 ? (
            <div className="text-center p-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-xl font-semibold text-gray-900">{t('notifications.allCaughtUp')}</p>
              <p className="text-gray-600 mt-2">{t('transaction.noPending')}</p>
            </div>
          ) : (
            pendingTransactions.map((tx) => (
              <div key={tx.id} className="border-2 rounded-lg p-4" style={{ borderColor: '#87CEEB' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#0055A4' }}>
                      {tx.user?.full_name?.[0] || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold">{tx.user?.full_name}</h3>
                      <p className="text-sm text-gray-600">{tx.user?.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{t('balance.pending')}</Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">{t('transaction.topUpRequest')}</p>
                    <p className="font-bold text-lg" style={{ color: '#0055A4' }}>${tx.amount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{t('balance.minutes')}</p>
                    <p className="font-semibold">{tx.minutes ? `${tx.minutes} ${t('common.min')}` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-semibold capitalize">
                      {tx.type === 'social_link_purchase' ? 'Social Link' : 
                       tx.balance_type || tx.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Requested</p>
                    <p className="text-sm">{formatDistanceToNow(new Date(tx.created_date), { addSuffix: true })}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => approveMutation.mutate({ 
                      transactionId: tx.id, 
                      userId: tx.user_id, 
                      balanceType: tx.balance_type, 
                      minutes: tx.minutes,
                      amount: tx.amount 
                    })}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('transaction.approve')}
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate({ 
                      transactionId: tx.id, 
                      userId: tx.user_id,
                      amount: tx.amount 
                    })}
                    disabled={rejectMutation.isPending}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('transaction.reject')}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="shadow-2xl border-2" style={{ borderColor: '#87CEEB' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: '#0055A4' }}>
            Transaction History ({completedTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {completedTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-lg border-2"
              style={{ borderColor: '#E0F4FF', backgroundColor: '#FAFAFA' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{tx.user?.full_name || tx.user_id}</p>
                  <p className="text-sm text-gray-600">
                    {tx.type === 'purchase' ? '💰 Balance Purchase' : 
                     tx.type === 'social_link_purchase' ? '🔗 Social Link' : 
                     '📹 Session'}
                    {tx.minutes && ` - ${tx.minutes} min`}
                    {tx.balance_type && ` (${tx.balance_type})`}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(tx.created_date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: '#0055A4' }}>${tx.amount?.toFixed(2)}</p>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    tx.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
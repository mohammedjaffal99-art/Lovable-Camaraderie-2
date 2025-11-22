import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Clock, CheckCircle2, XCircle, AlertCircle, CreditCard, User, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/components/ui/toast-utils";

export default function WithdrawalManagement() {
  const queryClient = useQueryClient();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [processingData, setProcessingData] = useState({});
  const [processingErrors, setProcessingErrors] = useState({});

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const all = await base44.entities.Withdrawal.list('-created_date');
      return all;
    },
    initialData: [],
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
  });

  const { data: broadcasters } = useQuery({
    queryKey: ['broadcasters'],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ role: 'broadcaster' });
      return users;
    },
    initialData: [],
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
  });

  const updateProcessingData = (withdrawalId, field, value) => {
    setProcessingData(prev => ({
      ...prev,
      [withdrawalId]: {
        ...(prev[withdrawalId] || {}),
        [field]: value
      }
    }));
  };

  const resetProcessingData = (withdrawalId) => {
    setProcessingData(prev => {
      const newState = { ...prev };
      delete newState[withdrawalId];
      return newState;
    });
    setProcessingErrors(prev => {
      const newState = { ...prev };
      delete newState[withdrawalId];
      return newState;
    });
  };

  const validateProcessing = (withdrawalId, action) => {
    const errors = [];
    const currentData = processingData[withdrawalId] || {};

    if (action === 'approve') {
      if (!currentData.transaction_id || currentData.transaction_id.trim() === '') {
        errors.push({ field: 'transaction_id', label: 'Transaction ID is required.' });
      }
    } else if (action === 'reject') {
      if (!currentData.rejection_reason || currentData.rejection_reason.trim() === '') {
        errors.push({ field: 'rejection_reason', label: 'Rejection reason is required.' });
      }
    }
    return errors;
  };

  const handleApprove = (withdrawalId) => {
    const errors = validateProcessing(withdrawalId, 'approve');
    
    if (errors.length > 0) {
      setProcessingErrors(prev => ({ ...prev, [withdrawalId]: errors }));
      showToast.error(`Please fix: ${errors.map(e => e.label).join(', ')}`);
      return;
    }
    
    setProcessingErrors(prev => ({ ...prev, [withdrawalId]: [] }));
    processWithdrawalMutation.mutate({
      withdrawalId,
      action: 'approve',
      data: processingData[withdrawalId]
    });
  };

  const handleReject = (withdrawalId) => {
    const errors = validateProcessing(withdrawalId, 'reject');
    
    if (errors.length > 0) {
      setProcessingErrors(prev => ({ ...prev, [withdrawalId]: errors }));
      showToast.error(`Please fix: ${errors.map(e => e.label).join(', ')}`);
      return;
    }
    
    setProcessingErrors(prev => ({ ...prev, [withdrawalId]: [] }));
    processWithdrawalMutation.mutate({
      withdrawalId,
      action: 'reject',
      data: processingData[withdrawalId]
    });
  };

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, action, data }) => {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId);
      if (!withdrawal) {
        throw new Error("Withdrawal not found.");
      }

      if (action === 'approve') {
        await base44.entities.Withdrawal.update(withdrawalId, {
          status: 'approved',
          processed_at: new Date().toISOString(),
          admin_notes: data.admin_notes,
          transaction_id: data.transaction_id
        });

        await base44.entities.Notification.create({
          user_id: withdrawal.broadcaster_id,
          type: 'earnings_milestone',
          title: 'Withdrawal Approved',
          message: `Your withdrawal request of $${withdrawal.amount.toFixed(2)} has been approved and is being processed. Transaction ID: ${data.transaction_id}`,
          link: '/BroadcasterDashboard'
        });
      } else if (action === 'reject') {
        await base44.entities.Withdrawal.update(withdrawalId, {
          status: 'rejected',
          processed_at: new Date().toISOString(),
          rejection_reason: data.rejection_reason
        });

        await base44.entities.Notification.create({
          user_id: withdrawal.broadcaster_id,
          type: 'warning',
          title: 'Withdrawal Rejected',
          message: `Your withdrawal request of $${withdrawal.amount.toFixed(2)} has been rejected. Reason: ${data.rejection_reason}`,
          link: '/BroadcasterDashboard'
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['withdrawals']);
      resetProcessingData(variables.withdrawalId);
      setSelectedWithdrawal(null);
      if (variables.action === 'approve') {
        showToast.success('✅ Withdrawal approved and paid out!');
      } else {
        showToast.warning('Withdrawal rejected');
      }
    },
    onError: (error, variables) => {
      setProcessingErrors(prev => ({ ...prev, [variables.withdrawalId]: [{ field: 'general', label: `Failed to ${variables.action} withdrawal.` }] }));
      showToast.error('Failed to process withdrawal. Please try again.');
    },
  });

  const completeWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalId) => {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId);
      if (!withdrawal) {
        throw new Error("Withdrawal not found.");
      }

      await base44.entities.Withdrawal.update(withdrawalId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      const broadcaster = broadcasters.find(b => b.id === withdrawal.broadcaster_id);
      if (broadcaster) {
        await base44.entities.User.update(withdrawal.broadcaster_id, {
          total_earnings: (broadcaster.total_earnings || 0) - withdrawal.amount
        });
      }

      await base44.entities.Notification.create({
        user_id: withdrawal.broadcaster_id,
        type: 'earnings_milestone',
        title: 'Payout Completed',
        message: `Your payout of $${withdrawal.amount.toFixed(2)} has been successfully transferred!`,
        link: '/BroadcasterDashboard'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['withdrawals']);
      queryClient.invalidateQueries(['broadcasters']);
      showToast.success('✅ Payout completed successfully!');
    },
    onError: () => {
      showToast.error('Failed to mark withdrawal as completed. Please try again.');
    }
  });

  const getBroadcasterName = (broadcasterId) => {
    const broadcaster = broadcasters.find(b => b.id === broadcasterId);
    return broadcaster?.full_name || 'Unknown Broadcaster';
  };

  const getBroadcasterEmail = (broadcasterId) => {
    const broadcaster = broadcasters.find(b => b.id === broadcasterId);
    return broadcaster?.email || 'N/A';
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Approved (Processing)' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Completed' }
    };

    const { color, icon: Icon, label } = config[status] || config.pending;

    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved');
  const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
  const rejectedWithdrawals = withdrawals.filter(w => w.status === 'rejected');

  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalApprovedAmount = approvedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingWithdrawals.length}</p>
                <p className="text-xs text-gray-500">${totalPendingAmount.toFixed(2)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved (Processing)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{approvedWithdrawals.length}</p>
                <p className="text-xs text-gray-500">${totalApprovedAmount.toFixed(2)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{completedWithdrawals.length}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{rejectedWithdrawals.length}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Withdrawal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending withdrawal requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="border-2 rounded-lg p-4 hover:bg-gray-50" style={{ borderColor: '#00BFFF' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-semibold">{getBroadcasterName(withdrawal.broadcaster_id)}</p>
                          <p className="text-xs text-gray-500">{getBroadcasterEmail(withdrawal.broadcaster_id)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-bold text-lg text-green-600">${withdrawal.amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Payment Method</p>
                          <p className="font-medium capitalize">{withdrawal.payment_method.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Requested</p>
                          <p className="font-medium">
                            {new Date(withdrawal.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Earnings Snapshot</p>
                          <p className="font-medium">${(withdrawal.broadcaster_earnings_snapshot || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      {withdrawal.payment_details && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Payment Details:</p>
                          <pre className="text-xs text-blue-800 whitespace-pre-wrap">
                            {JSON.stringify(withdrawal.payment_details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Dialog onOpenChange={(open) => {
                      if (!open) resetProcessingData(withdrawal.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setProcessingData(prev => ({
                              ...prev,
                              [withdrawal.id]: {
                                transaction_id: '',
                                admin_notes: ''
                              }
                            }));
                            setProcessingErrors(prev => ({ ...prev, [withdrawal.id]: [] }));
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Withdrawal</DialogTitle>
                          <DialogDescription>
                            Confirm approval for ${withdrawal.amount.toFixed(2)} withdrawal to {getBroadcasterName(withdrawal.broadcaster_id)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`transaction_id-${withdrawal.id}`}>Transaction ID (from payment gateway)</Label>
                            <Input
                              id={`transaction_id-${withdrawal.id}`}
                              value={processingData[withdrawal.id]?.transaction_id || ''}
                              onChange={(e) => updateProcessingData(withdrawal.id, 'transaction_id', e.target.value)}
                              placeholder="e.g., TXN123456789"
                              className={processingErrors[withdrawal.id]?.some(err => err.field === 'transaction_id') ? 'border-red-500' : ''}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`admin_notes-${withdrawal.id}`}>Admin Notes (optional)</Label>
                            <Textarea
                              id={`admin_notes-${withdrawal.id}`}
                              value={processingData[withdrawal.id]?.admin_notes || ''}
                              onChange={(e) => updateProcessingData(withdrawal.id, 'admin_notes', e.target.value)}
                              placeholder="Add any notes about this approval..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(withdrawal.id)}
                              disabled={processWithdrawalMutation.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              Confirm Approval
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog onOpenChange={(open) => {
                      if (!open) resetProcessingData(withdrawal.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setProcessingData(prev => ({
                              ...prev,
                              [withdrawal.id]: {
                                rejection_reason: ''
                              }
                            }));
                            setProcessingErrors(prev => ({ ...prev, [withdrawal.id]: [] }));
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Withdrawal</DialogTitle>
                          <DialogDescription>
                            Provide a reason for rejecting this withdrawal request
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`rejection_reason-${withdrawal.id}`}>Rejection Reason *</Label>
                            <Textarea
                              id={`rejection_reason-${withdrawal.id}`}
                              value={processingData[withdrawal.id]?.rejection_reason || ''}
                              onChange={(e) => updateProcessingData(withdrawal.id, 'rejection_reason', e.target.value)}
                              placeholder="e.g., Insufficient account verification, incorrect payment details..."
                              rows={4}
                              className={processingErrors[withdrawal.id]?.some(err => err.field === 'rejection_reason') ? 'border-red-500' : ''}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleReject(withdrawal.id)}
                              disabled={processWithdrawalMutation.isPending}
                              variant="destructive"
                              className="flex-1"
                            >
                              Confirm Rejection
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {approvedWithdrawals.length > 0 && (
        <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Approved - Awaiting Transfer Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{getBroadcasterName(withdrawal.broadcaster_id)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        ${withdrawal.amount.toFixed(2)} • Transaction ID: {withdrawal.transaction_id}
                      </p>
                      {withdrawal.admin_notes && (
                        <p className="text-xs text-gray-500 mt-1">Notes: {withdrawal.admin_notes}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => completeWithdrawalMutation.mutate(withdrawal.id)}
                      disabled={completeWithdrawalMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Withdrawal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {[...completedWithdrawals, ...rejectedWithdrawals].slice(0, 10).map((withdrawal) => (
            <div key={withdrawal.id} className="border-b last:border-b-0 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{getBroadcasterName(withdrawal.broadcaster_id)}</p>
                <p className="text-sm text-gray-600">
                  ${withdrawal.amount.toFixed(2)} • {new Date(withdrawal.processed_at || withdrawal.created_date).toLocaleDateString()}
                </p>
                {withdrawal.rejection_reason && (
                  <p className="text-xs text-red-600 mt-1">Reason: {withdrawal.rejection_reason}</p>
                )}
              </div>
              {getStatusBadge(withdrawal.status)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Ban, AlertTriangle as AlertIcon, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/components/LanguageContext";
import { toast } from "sonner";

export default function Reports() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: reports } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const allReports = await base44.entities.Report.list('-created_date');
      const users = await base44.entities.User.list();
      
      return allReports.map(report => ({
        ...report,
        reporter: users.find(u => u.id === report.reporter_id),
        reported: users.find(u => u.id === report.reported_user_id)
      }));
    },
    initialData: [],
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, status, report }) => {
      await base44.entities.Report.update(reportId, {
        ...report,
        status: status
      });

      if (status === 'resolved') {
        await base44.entities.Notification.create({
          user_id: report.reporter_id,
          type: 'admin_message',
          title: 'Report Resolved',
          message: 'Your report has been reviewed and resolved. Thank you for helping keep our community safe.'
        });
      }
    },
    onSuccess: (_, variables) => {
      if (variables.status === 'resolved') {
        toast.success('Report resolved successfully!');
      } else if (variables.status === 'dismissed') {
        toast.success('Report dismissed.');
      }
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: () => {
      toast.error('Failed to update report.');
    }
  });

  const sendWarningMutation = useMutation({
    mutationFn: async ({ userId, reportId, reportReason }) => {
      await base44.entities.Notification.create({
        user_id: userId,
        type: 'warning',
        title: 'Warning: Content Policy Violation',
        message: `You have received a warning for: ${reportReason}. Please review our community guidelines. Repeated violations may result in account suspension or termination.`,
        read: false
      });
      await base44.entities.Report.update(reportId, { 
        status: 'resolved',
        admin_notes: 'Warning sent to user'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['adminStats']);
      toast.success('Warning sent successfully!');
    },
    onError: () => {
      toast.error('Failed to send warning.');
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reportId }) => {
      await base44.asServiceRole.entities.User.update(userId, { banned: true });
      await base44.entities.Report.update(reportId, { 
        status: 'resolved',
        admin_notes: 'User banned'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['adminStats']);
      toast.success('User banned successfully!');
    },
    onError: () => {
      toast.error('Failed to ban user.');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, reportId }) => {
      await base44.asServiceRole.entities.User.delete(userId);
      await base44.entities.Report.update(reportId, { 
        status: 'resolved',
        admin_notes: 'User account deleted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['adminStats']);
      toast.success('User deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete user.');
    }
  });

  const pendingReports = reports.filter(r => r.status === 'pending');

  const getReasonLabel = (reason) => {
    const labels = {
      sexual_content: 'Sexual Content',
      nudity: 'Nudity',
      fake_profile: 'Fake Profile',
      promoting_adult_websites: 'Promoting Adult Websites',
      underage_content: 'Underage Content',
      sexual_harassment: 'Sexual Harassment',
      predator_behavior: 'Predator Behavior',
      spam: 'Spam',
      inappropriate_content: 'Inappropriate Content',
      hate_speech: 'Hate Speech',
      violence: 'Violence',
      scam_fraud: 'Scam/Fraud',
      copyright_violation: 'Copyright Violation',
      other: 'Other'
    };
    return labels[reason] || reason.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-4">
      {pendingReports.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <p className="text-xl font-semibold text-gray-900">{t('notifications.allCaughtUp')}</p>
          <p className="text-gray-600 mt-2">{t('reports.noPending')}</p>
        </div>
      ) : (
        pendingReports.map((report) => (
          <div key={report.id} className="border rounded-lg p-6 border-l-4 border-l-red-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-lg">{getReasonLabel(report.reason)}</h3>
              </div>
              <Badge variant="destructive">{report.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('reports.reportedBy')}</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#11009E' }}>
                    {report.reporter?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{report.reporter?.full_name}</p>
                    <p className="text-sm text-gray-600">{report.reporter?.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('reports.reportedUser')}</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-red-500">
                    {report.reported?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium">{report.reported?.full_name}</p>
                    <p className="text-sm text-gray-600">{report.reported?.email}</p>
                    <Badge variant="outline" className="mt-1">{report.reported?.role}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">{t('reports.description')}</p>
              <p className="text-gray-700">{report.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Reported {formatDistanceToNow(new Date(report.created_date), { addSuffix: true })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => sendWarningMutation.mutate({ 
                    userId: report.reported_user_id,
                    reportId: report.id,
                    reportReason: getReasonLabel(report.reason)
                  })}
                  disabled={sendWarningMutation.isPending}
                  size="sm"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  <AlertIcon className="w-4 h-4 mr-1" />
                  Send Warning
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Are you sure you want to ban this user?')) {
                      banUserMutation.mutate({ 
                        userId: report.reported_user_id,
                        reportId: report.id
                      });
                    }
                  }}
                  disabled={banUserMutation.isPending}
                  size="sm"
                  style={{ backgroundColor: '#DC2626' }}
                >
                  <Ban className="w-4 h-4 mr-1" />
                  Ban User
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Are you sure you want to DELETE this user account? This cannot be undone.')) {
                      deleteUserMutation.mutate({ 
                        userId: report.reported_user_id,
                        reportId: report.id
                      });
                    }
                  }}
                  disabled={deleteUserMutation.isPending}
                  size="sm"
                  style={{ backgroundColor: '#7F1D1D' }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Account
                </Button>
                <Button
                  onClick={() => updateStatusMutation.mutate({ reportId: report.id, status: 'investigating', report })}
                  disabled={updateStatusMutation.isPending}
                  size="sm"
                  variant="outline"
                >
                  Investigating
                </Button>
                <Button
                  onClick={() => updateStatusMutation.mutate({ reportId: report.id, status: 'resolved', report })}
                  disabled={updateStatusMutation.isPending}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Resolve
                </Button>
                <Button
                  onClick={() => updateStatusMutation.mutate({ reportId: report.id, status: 'dismissed', report })}
                  disabled={updateStatusMutation.isPending}
                  size="sm"
                  variant="destructive"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* All Reports History */}
      {reports.filter(r => r.status !== 'pending').length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Report History</h3>
          <div className="space-y-2">
            {reports.filter(r => r.status !== 'pending').map(report => (
              <div key={report.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">{getReasonLabel(report.reason)}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {report.reporter?.full_name} → {report.reported?.full_name}
                  </span>
                </div>
                <Badge variant={
                  report.status === 'resolved' ? 'default' : 
                  report.status === 'investigating' ? 'secondary' : 'outline'
                }>
                  {report.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
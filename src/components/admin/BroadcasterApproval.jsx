
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ExternalLink, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/components/LanguageContext";
import { showToast } from "@/components/ui/toast-utils";

export default function BroadcasterApproval() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: pendingBroadcasters } = useQuery({
    queryKey: ['pendingBroadcasters'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      // Changed from u.role to u.requested_role
      return users.filter(u => u.requested_role === 'broadcaster' && !u.broadcaster_approved);
    },
    initialData: [],
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
  });

  const approveMutation = useMutation({
    mutationFn: async (broadcasterId) => {
      const users = await base44.entities.User.list();
      const broadcaster = users.find(u => u.id === broadcasterId);
      
      await base44.entities.User.update(broadcasterId, {
        // Added role: 'broadcaster'
        role: 'broadcaster',
        broadcaster_approved: true,
        status: 'offline'
      });

      await base44.entities.Notification.create({
        user_id: broadcasterId,
        type: 'approval_status',
        title: '🎉 Account Approved!',
        message: 'Congratulations! Your broadcaster account has been approved. You can now start streaming and earning!',
        link: '/BroadcasterDashboard'
      });

      await base44.integrations.Core.SendEmail({
        to: broadcaster.email,
        subject: '🎉 Your Camaraderie.tv Broadcaster Account is Approved!',
        body: `Hi ${broadcaster.full_name},\n\nGreat news! Your broadcaster account has been approved. You can now start streaming and earning on Camaraderie.tv.\n\nWhat's next?\n• Go to your Broadcaster Dashboard\n• Click "GO ONLINE" to start streaming\n• Start earning from private sessions (30-60% commission)\n\nBest regards,\nCamaraderie.tv Team`
      });
    },
    onSuccess: () => {
      showToast.broadcasterApproved();
      queryClient.invalidateQueries(['pendingBroadcasters']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (error) => {
      showToast.error('Failed to approve broadcaster. Please try again.');
      console.error('Approval error:', error);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (broadcasterId) => {
      const users = await base44.entities.User.list();
      const broadcaster = users.find(u => u.id === broadcasterId);
      
      await base44.entities.Notification.create({
        user_id: broadcasterId,
        type: 'warning',
        title: '❌ Application Rejected',
        message: 'Your broadcaster application has been rejected. Please update your profile and contact support for more information.'
      });

      await base44.integrations.Core.SendEmail({
        to: broadcaster.email,
        subject: 'Camaraderie.tv Application Status',
        body: `Hi ${broadcaster.full_name},\n\nWe regret to inform you that your broadcaster application could not be approved at this time.\n\nPossible reasons:\n• ID photos were unclear or didn't match requirements\n• Profile photos didn't meet guidelines\n• Missing information\n\nPlease update your profile and resubmit your application, or contact our support team for more information.\n\nBest regards,\nCamaraderie.tv Team`
      });
    },
    onSuccess: () => {
      showToast.warning('Broadcaster application rejected');
      queryClient.invalidateQueries(['pendingBroadcasters']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (error) => {
      showToast.error('Failed to reject application. Please try again.');
      console.error('Rejection error:', error);
    }
  });

  if (pendingBroadcasters.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <p className="text-xl font-semibold text-gray-900">{t('notifications.allCaughtUp')}</p>
        <p className="text-gray-600 mt-2">{t('approval.noPending')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingBroadcasters.map((broadcaster) => (
        <div key={broadcaster.id} className="border rounded-lg p-6">
          <div className="flex items-start gap-6">
            <img
              src={broadcaster.photo_1}
              alt={broadcaster.full_name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold">{broadcaster.full_name}</h3>
                  <p className="text-gray-600">{broadcaster.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>{broadcaster.country}</Badge>
                    <Badge variant="outline">{broadcaster.gender}</Badge>
                    <Badge variant="outline">{broadcaster.ethnicity}</Badge>
                  </div>
                </div>
                <Badge className="bg-yellow-500">{t('approval.pending')}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{t('broadcaster.languages')}</p>
                  <p className="text-sm text-gray-600">
                    {[broadcaster.native_language, broadcaster.language_2, broadcaster.language_3, broadcaster.language_4]
                      .filter(Boolean).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{t('broadcaster.categories')}</p>
                  <p className="text-sm text-gray-600">
                    {[broadcaster.category_1, broadcaster.category_2].filter(Boolean).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{t('broadcaster.goal')}</p>
                  <p className="text-sm text-gray-600">{broadcaster.goal}</p>
                </div>
              </div>

              {/* Photos */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('profile.photos')}</p>
                <div className="flex gap-2">
                  {[broadcaster.photo_1, broadcaster.photo_2, broadcaster.photo_3].filter(Boolean).map((photo, idx) => (
                    <Dialog key={idx}>
                      <DialogTrigger asChild>
                        <button className="relative group">
                          <img src={photo} alt={t('register.photoN', { index: idx + 1 })} className="w-20 h-20 object-cover rounded" />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <img src={photo} alt={t('register.photoN', { index: idx + 1 })} className="w-full" />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>

              {/* ID Photos */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('register.idVerificationRequired')}</p>
                <div className="flex gap-2">
                  {[broadcaster.id_photo_1, broadcaster.id_photo_2].filter(Boolean).map((photo, idx) => (
                    <Dialog key={idx}>
                      <DialogTrigger asChild>
                        <button className="relative group">
                          <img src={photo} alt={t('register.idPhotoN', { index: idx + 1 })} className="w-20 h-20 object-cover rounded border-2 border-yellow-400" />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t('register.idPhotoN', { index: idx + 1 })}</DialogTitle>
                        </DialogHeader>
                        <img src={photo} alt={t('register.idPhotoN', { index: idx + 1 })} className="w-full" />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => approveMutation.mutate(broadcaster.id)}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('approval.approve')}
                </Button>
                <Button
                  onClick={() => rejectMutation.mutate(broadcaster.id)}
                  disabled={rejectMutation.isPending}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('approval.reject')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

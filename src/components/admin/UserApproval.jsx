
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye, UserCheck, Users, AlertCircle, Shield, Bug } from "lucide-react";
import PhotoGalleryDialog from './PhotoGalleryDialog';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function UserApproval() {
  const queryClient = useQueryClient();
  const [showDebug, setShowDebug] = React.useState(true);
  const [adminNotes, setAdminNotes] = React.useState({});

  const { data: allUsers, isLoading, error } = useQuery({
    queryKey: ['allUsersForApproval'],
    queryFn: async () => {
      console.log('🔄 [UserApproval] Fetching all users...');
      const users = await base44.entities.User.list();
      console.log('✅ [UserApproval] Total users fetched:', users.length);
      
      users.forEach((u, idx) => {
        console.log(`👤 User ${idx + 1}:`, {
          email: u.email,
          role: u.role,
          requested_role: u.requested_role,
          broadcaster_approved: u.broadcaster_approved,
          profile_completed: u.profile_completed
        });
      });
      
      return users;
    },
    refetchInterval: 5000,
    initialData: [],
  });

  const pendingBroadcasters = React.useMemo(() => {
    const pending = allUsers.filter(u => {
      const hasRequestAndNotApproved = u.requested_role === 'broadcaster' && !u.broadcaster_approved;
      const hasBroadcasterRoleNotApproved = u.role === 'broadcaster' && !u.broadcaster_approved;
      const isAdminWantingBroadcaster = u.role === 'admin' && u.requested_role === 'broadcaster' && !u.broadcaster_approved;
      
      const shouldShow = hasRequestAndNotApproved || hasBroadcasterRoleNotApproved || isAdminWantingBroadcaster;
      
      if (u.requested_role === 'broadcaster' || u.role === 'broadcaster') {
        console.log(`🎬 [Broadcaster Filter] ${u.email}:`, {
          role: u.role || 'NO_ROLE',
          requested_role: u.requested_role,
          broadcaster_approved: u.broadcaster_approved,
          hasRequestAndNotApproved,
          hasBroadcasterRoleNotApproved,
          isAdminWantingBroadcaster,
          WILL_SHOW: shouldShow
        });
      }
      
      return shouldShow;
    });
    
    console.log('🎯 [UserApproval] Pending broadcasters found:', pending.length);
    console.log('📋 [UserApproval] Pending broadcasters list:', pending.map(p => p.email));
    return pending;
  }, [allUsers]);

  const pendingCustomers = React.useMemo(() => {
    const pending = allUsers.filter(u => {
      const isCustomerRequest = u.requested_role === 'customer' && (!u.role || u.role === 'customer');
      
      if (u.requested_role === 'customer') {
        console.log(`👥 [Customer Filter] ${u.email}:`, {
          isCustomerRequest,
          role: u.role,
          requested_role: u.requested_role
        });
      }
      
      return isCustomerRequest;
    });
    
    console.log('🎯 [UserApproval] Pending customers found:', pending.length);
    return pending;
  }, [allUsers]);

  const approveCustomerMutation = useMutation({
    mutationFn: async ({ userId, notes }) => {
      console.log('✅ Approving customer:', userId);
      const user = allUsers.find(u => u.id === userId);
      
      if (user.role === 'admin') {
        throw new Error('Cannot change the role of the app creator.');
      }
      
      await base44.entities.User.update(userId, {
        user_role: 'user',
        requested_role: null,
        admin_notes: notes || null,
        approval_date: new Date().toISOString()
      });

      await base44.entities.Notification.create({
        user_id: userId,
        type: 'approval_status',
        title: '✅ Account Approved!',
        message: 'Welcome to Camaraderie! Your account has been activated.',
        link: '/Balance'
      });

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: '🎉 Welcome to Camaraderie.tv - Account Activated!',
        body: `Hi ${user.full_name},

Great news! Your account has been activated and you're now a verified member of Camaraderie.tv!

You can now:
✓ Watch live streams from broadcasters worldwide
✓ Book private audio and video sessions
✓ Chat in public rooms
✓ Follow your favorite streamers

Get started: https://camaraderie.tv

Best regards,
The Camaraderie.tv Team

---
Need help? Contact us at support@camaraderie.tv`
      });
    },
    onSuccess: () => {
      toast.success('✅ Customer account approved successfully!');
      queryClient.invalidateQueries(['allUsersForApproval']);
      queryClient.invalidateQueries(['adminStats']);
      setAdminNotes({});
    },
    onError: (error) => {
      toast.error(`❌ ${error.message}`);
    }
  });

  const approveBroadcasterMutation = useMutation({
    mutationFn: async ({ userId, notes }) => {
      console.log('🎬 Approving broadcaster:', userId);
      const user = allUsers.find(u => u.id === userId);
      
      await base44.entities.User.update(userId, {
        user_role: 'streamer',
        broadcaster_approved: true,
        requested_role: null,
        status: 'offline',
        admin_notes: notes || null,
        approval_date: new Date().toISOString()
      });

      await base44.entities.Notification.create({
        user_id: userId,
        type: 'approval_status',
        title: '🎉 Congratulations! You\'re now a Streamer!',
        message: 'Your broadcaster application has been approved! You can now start streaming and earning.',
        link: '/BroadcasterDashboard'
      });

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: '🎉 Congratulations! Your Camaraderie.tv Streamer Account is Approved!',
        body: `Hi ${user.full_name},

🎊 CONGRATULATIONS! 🎊

We're thrilled to inform you that your broadcaster application has been APPROVED!

You are now an official streamer on Camaraderie.tv! 🎥✨

What's Next?
✓ Go to your Broadcaster Dashboard
✓ Set up your streaming profile
✓ Start your first live stream
✓ Accept private call requests
✓ Start earning from your sessions!

Your Commission Rate: 30% (increases with your level!)

Get Started Now: https://camaraderie.tv/BroadcasterDashboard

We're excited to have you as part of the Camaraderie family! 🚀

Best regards,
The Camaraderie.tv Team

---
Questions? Reach out at support@camaraderie.tv`
      });
    },
    onSuccess: () => {
      toast.success('🎉 Broadcaster approved successfully! Welcome email sent.');
      queryClient.invalidateQueries(['allUsersForApproval']);
      queryClient.invalidateQueries(['adminStats']);
      setAdminNotes({});
    },
    onError: (error) => {
      console.error('❌ Approval error:', error);
      toast.error(`❌ Failed: ${error.message}`);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, notes }) => {
      const user = allUsers.find(u => u.id === userId);
      
      await base44.entities.User.update(userId, {
        requested_role: null,
        admin_notes: notes || null,
        rejection_date: new Date().toISOString()
      });
      
      await base44.entities.Notification.create({
        user_id: userId,
        type: 'warning',
        title: '❌ Application Not Approved',
        message: notes || 'Your application could not be approved. You can re-apply after reviewing our guidelines.',
        link: '/Register'
      });

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Camaraderie.tv Application Update',
        body: `Hi ${user.full_name},

Thank you for your interest in becoming a ${user.requested_role === 'broadcaster' ? 'streamer' : 'member'} on Camaraderie.tv.

After careful review, we are unable to approve your application at this time.

${notes ? `\nReason:\n${notes}\n` : ''}

You are welcome to re-apply after addressing any concerns mentioned above.

Best regards,
The Camaraderie.tv Team

---
Questions? Contact us at support@camaraderie.tv`
      });
    },
    onSuccess: () => {
      toast.success('Application rejected - user notified via email');
      queryClient.invalidateQueries(['allUsersForApproval']);
      queryClient.invalidateQueries(['adminStats']);
      setAdminNotes({});
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <p className="text-xl font-semibold text-gray-900">Error Loading Approvals</p>
        <p className="text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  const usersWithRequests = allUsers.filter(u => u.requested_role);

  return (
    <div className="space-y-6">
      <Button
        onClick={() => setShowDebug(!showDebug)}
        variant="outline"
        className="mb-4"
      >
        <Bug className="w-4 h-4 mr-2" />
        {showDebug ? 'Hide' : 'Show'} Debug Info
      </Button>

      {showDebug && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Bug className="w-5 h-5" />
            🔍 Debug Information
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">📊 Statistics:</p>
                <p>• Total Users: {allUsers.length}</p>
                <p>• Users with requested_role: {usersWithRequests.length}</p>
                <p>• Pending Broadcasters: {pendingBroadcasters.length}</p>
                <p>• Pending Customers: {pendingCustomers.length}</p>
                <p>• Admins: {allUsers.filter(u => u.role === 'admin').length}</p>
              </div>
              
              <div>
                <p className="font-semibold">👥 All Requests:</p>
                {usersWithRequests.map((u, idx) => (
                  <div key={idx} className="ml-2 text-xs bg-white p-2 rounded mt-1">
                    <p className="font-semibold">{u.email}</p>
                    <p>Role: {u.role || 'none'}</p>
                    <p>Requested: {u.requested_role}</p>
                    <p>Approved: {String(u.broadcaster_approved)}</p>
                  </div>
                ))}
                {usersWithRequests.length === 0 && (
                  <p className="text-gray-500 ml-2">No pending requests</p>
                )}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="font-semibold text-blue-900">💡 Console Logs:</p>
              <p className="text-blue-800 text-xs">Open browser console (F12) for detailed filtering logs</p>
            </div>
          </div>
        </div>
      )}

      {pendingBroadcasters.length === 0 && pendingCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <p className="text-xl font-semibold text-gray-900">All caught up!</p>
          <p className="text-gray-600 mt-2">No pending user approvals</p>
        </div>
      )}

      {pendingBroadcasters.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#0055A4' }}>
            <UserCheck className="w-6 h-6" />
            Pending Broadcaster Approvals ({pendingBroadcasters.length})
          </h3>
          <div className="space-y-4">
            {pendingBroadcasters.map((broadcaster) => {
              const isAppCreator = broadcaster.role === 'admin';
              const profilePhotos = [broadcaster.photo_1, broadcaster.photo_2, broadcaster.photo_3].filter(Boolean);
              const idPhotos = [broadcaster.id_photo_1, broadcaster.id_photo_2].filter(Boolean);
              
              return (
                <div key={broadcaster.id} className={`border-2 rounded-xl p-6 shadow-lg ${isAppCreator ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-blue-200'}`}>
                  {isAppCreator && (
                    <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-yellow-700" />
                        <p className="text-sm font-semibold text-yellow-800">
                          App Creator - Admin role preserved
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-6">
                    {broadcaster.photo_1 && (
                      <img
                        src={broadcaster.photo_1}
                        alt={broadcaster.full_name}
                        className="w-24 h-24 rounded-lg object-cover border-2 border-blue-300"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold" style={{ color: '#0055A4' }}>{broadcaster.full_name}</h3>
                            {isAppCreator && <Shield className="w-5 h-5 text-yellow-600" />}
                          </div>
                          <p className="text-gray-600">{broadcaster.email}</p>
                          {broadcaster.application_id && (
                            <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                              ID: {broadcaster.application_id}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge style={{ backgroundColor: '#00BFFF', color: 'white' }}>Broadcaster Application</Badge>
                            {isAppCreator && <Badge className="bg-yellow-600">App Creator</Badge>}
                            {broadcaster.country && <Badge variant="outline">{broadcaster.country}</Badge>}
                            {broadcaster.gender && <Badge variant="outline">{broadcaster.gender}</Badge>}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Languages</p>
                          <p className="text-sm text-gray-600">
                            {[broadcaster.native_language, broadcaster.language_2, broadcaster.language_3, broadcaster.language_4]
                              .filter(Boolean).join(', ') || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Categories</p>
                          <p className="text-sm text-gray-600">
                            {[broadcaster.category_1, broadcaster.category_2].filter(Boolean).join(', ') || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      {profilePhotos.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Profile Photos</p>
                          <PhotoGalleryDialog
                            photos={profilePhotos}
                            title="Profile Photos"
                            trigger={
                              <div className="flex gap-2 cursor-pointer">
                                {profilePhotos.map((photo, idx) => (
                                  <div key={idx} className="relative group">
                                    <img src={photo} alt={`Photo ${idx + 1}`} className="w-20 h-20 object-cover rounded border-2 border-blue-300" />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                                      <Eye className="w-6 h-6 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            }
                          />
                        </div>
                      )}

                      {idPhotos.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">🆔 ID Verification</p>
                          <PhotoGalleryDialog
                            photos={idPhotos}
                            title="ID Verification Photos"
                            trigger={
                              <div className="flex gap-2 cursor-pointer">
                                {idPhotos.map((photo, idx) => (
                                  <div key={idx} className="relative group">
                                    <img src={photo} alt={`ID ${idx + 1}`} className="w-20 h-20 object-cover rounded border-2 border-yellow-400" />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                                      <Eye className="w-6 h-6 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            }
                          />
                        </div>
                      )}

                      <div className="mb-4">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">Admin Notes / Reason</Label>
                        <Textarea
                          value={adminNotes[broadcaster.id] || ''}
                          onChange={(e) => setAdminNotes(prev => ({ ...prev, [broadcaster.id]: e.target.value }))}
                          placeholder="Add notes about this application (optional for approval, recommended for rejection)"
                          className="text-sm"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => approveBroadcasterMutation.mutate({ 
                            userId: broadcaster.id, 
                            notes: adminNotes[broadcaster.id] 
                          })}
                          disabled={approveBroadcasterMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 font-bold"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {approveBroadcasterMutation.isPending ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => rejectMutation.mutate({ 
                            userId: broadcaster.id, 
                            notes: adminNotes[broadcaster.id] 
                          })}
                          disabled={rejectMutation.isPending}
                          variant="destructive"
                          className="font-bold"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingCustomers.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#0055A4' }}>
            <Users className="w-6 h-6" />
            Pending Customer Approvals ({pendingCustomers.length})
          </h3>
          <div className="space-y-4">
            {pendingCustomers.map((customer) => (
              <div key={customer.id} className="border-2 rounded-xl p-6 bg-white shadow-lg border-blue-200">
                <div className="flex items-start gap-6">
                  {customer.photo_1 && (
                    <img
                      src={customer.photo_1}
                      alt={customer.full_name}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-blue-300"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: '#0055A4' }}>{customer.full_name}</h3>
                        <p className="text-gray-600 text-sm">{customer.email}</p>
                        {customer.application_id && (
                          <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            ID: {customer.application_id}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge style={{ backgroundColor: '#4A90E2', color: 'white' }}>Customer Application</Badge>
                          {customer.country && <Badge variant="outline">{customer.country}</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Admin Notes / Reason</Label>
                      <Textarea
                        value={adminNotes[customer.id] || ''}
                        onChange={(e) => setAdminNotes(prev => ({ ...prev, [customer.id]: e.target.value }))}
                        placeholder="Add notes about this application (optional)"
                        className="text-sm"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => approveCustomerMutation.mutate({ 
                          userId: customer.id, 
                          notes: adminNotes[customer.id] 
                        })}
                        disabled={approveCustomerMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 font-bold"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {approveCustomerMutation.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => rejectMutation.mutate({ 
                          userId: customer.id, 
                          notes: adminNotes[customer.id] 
                        })}
                        disabled={rejectMutation.isPending}
                        variant="destructive"
                        className="font-bold"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

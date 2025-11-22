import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, Heart, Video, AlertTriangle, CheckCircle, 
  MessageSquare, Clock, ExternalLink, Trash2, Check, Settings
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageContext";

const NOTIFICATION_ICONS = {
  favorite_live: { icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  session_booked: { icon: Video, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  session_started: { icon: Video, color: 'text-green-600', bgColor: 'bg-green-100' },
  session_completed: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  session_cancelled: { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  message_received: { icon: MessageSquare, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  balance_low: { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  balance_added: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  new_follower: { icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  profile_viewed: { icon: Bell, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  admin_message: { icon: MessageSquare, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  system_update: { icon: Bell, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  approval_status: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  transaction_approved: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  transaction_rejected: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
  report_update: { icon: Bell, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  level_up: { icon: CheckCircle, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  earnings_milestone: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  warning: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
  account_suspended: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
};

export default function Notifications() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin(createPageUrl('Notifications'));
    });
  }, []);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Notification.filter(
        { user_id: user.id },
        '-created_date',
        100
      );
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
    initialData: [],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const notification = notifications.find(n => n.id === notificationId);
      await base44.entities.Notification.update(notificationId, {
        ...notification,
        read: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n =>
          base44.entities.Notification.update(n.id, { ...n, read: true })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      await base44.entities.Notification.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#11009E' }}></div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold" style={{ color: '#11009E' }}>
                {t('notifications.title')}
              </h1>
              {unreadCount > 0 && (
                <Badge className="px-3 py-1" style={{ backgroundColor: '#11009E' }}>
                  {unreadCount} {t('notifications.new')}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Link to={createPageUrl('Profile')}>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              {unreadCount > 0 && (
                <Button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  variant="outline"
                  size="sm">
                  <Check className="w-4 h-4 mr-2" />
                  {t('notifications.markAllRead')}
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              style={filter === 'all' ? { backgroundColor: '#11009E' } : {}}>
              {t('notifications.all')} ({notifications.length})
            </Button>
            <Button
              onClick={() => setFilter('unread')}
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              style={filter === 'unread' ? { backgroundColor: '#11009E' } : {}}>
              {t('notifications.unread')} ({unreadCount})
            </Button>
            <Button
              onClick={() => setFilter('read')}
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              style={filter === 'read' ? { backgroundColor: '#11009E' } : {}}>
              {t('notifications.read')} ({notifications.length - unreadCount})
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? t('notifications.allCaughtUp') : t('notifications.noNotifications')}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? t('notifications.noUnread')
                  : t('notifications.willSee')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.admin_message;
              const NotificationIcon = config.icon;
              
              return (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 bg-blue-50' : 'opacity-75'
                  }`}
                  style={!notification.read ? { borderLeftColor: '#11009E' } : {}}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                        <NotificationIcon className={`w-6 h-6 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title || t('notifications.defaultTitle')}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#11009E' }}></div>
                            )}
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-2">
                          {notification.link && (
                            <Button
                              onClick={() => handleNotificationClick(notification)}
                              size="sm"
                              variant="outline"
                              className="text-xs">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {t('notifications.viewDetails')}
                            </Button>
                          )}
                          
                          {!notification.read && (
                            <Button
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                              size="sm"
                              variant="ghost"
                              className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              {t('notifications.markAsRead')}
                            </Button>
                          )}

                          <Button
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                            disabled={deleteNotificationMutation.isPending}
                            size="sm"
                            variant="ghost"
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto">
                            <Trash2 className="w-3 h-3 mr-1" />
                            {t('notifications.delete')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">{t('notifications.about')}</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-pink-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Favorite Live & New Followers</p>
                <p className="text-xs text-gray-600">Social connections and live alerts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Session Notifications</p>
                <p className="text-xs text-gray-600">Bookings, starts, and completions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Messages & Admin</p>
                <p className="text-xs text-gray-600">New messages and admin communications</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Achievements & Approvals</p>
                <p className="text-xs text-gray-600">Level ups, approvals, and milestones</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Balance & Transactions</p>
                <p className="text-xs text-gray-600">Low balance warnings and transaction updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
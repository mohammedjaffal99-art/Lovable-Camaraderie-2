
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Video, User, Settings, BarChart3, Bell, ChevronDown, LogOut, UserCircle, Eye, Heart, Search, Radio, Trophy, TrendingUp, Newspaper, Flame, Calendar, UserPlus, Camera, Medal, Clock, MessageCircle, History, Lightbulb, AlignJustify, X, Shield, CheckCircle2, DollarSign, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LanguageProvider, useLanguage } from "@/components/LanguageContext";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import LanguageSelector from "@/components/LanguageSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import IncomingCallNotification from "@/components/calls/IncomingCallNotification";
import { Toaster } from "sonner";

function SideNavButton({ icon: Icon, label, to, isActive, badge, isLoading }) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="relative">
      <Link
        to={to}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative group block w-full h-10 flex items-center justify-center transition-all duration-200 hover:bg-white hover:bg-opacity-10 rounded-lg">

        <Icon
          strokeWidth={1}
          className={`w-7 h-7 transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'} ${isLoading ? 'animate-pulse' : ''}`}
        />

        {badge && badge > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg animate-pulse">
            {badge}
          </span>
        )}
      </Link>
      
      {showTooltip && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div
            className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-extrabold shadow-2xl relative text-white"
            style={{
              backgroundColor: '#00BFFF',
              animation: 'fadeInSlide 0.2s ease-out'
            }}>
            {label}
            <div
              className="absolute right-full top-1/2 -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid #00BFFF'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const { t } = useLanguage();
  const { user, loading: loadingAuth, guestMode, isAuthenticated, login, logout, deleteAccount, toggleGuestMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: notifications, isLoading: loadingNotifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['unreadNotifications', user?.id],
    queryFn: async () => {
      if (!user?.id || guestMode) return [];
      const unread = await base44.entities.Notification.filter({ user_id: user.id, read: false }, '-created_date', 100);
      return unread;
    },
    enabled: !!user?.id && !guestMode,
    refetchInterval: 5000,
    staleTime: 0,
    cacheTime: 0,
    initialData: []
  });

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id && !guestMode) {
        refetchNotifications();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, guestMode, refetchNotifications]);

  React.useEffect(() => {
    if (user && !user.profile_completed && !guestMode && !['Home', 'Register', 'About', 'Contact', 'Billing', 'PrivacyPolicy', 'TermsOfService', 'CSAMPolicy', 'NCCPolicy'].includes(currentPageName)) {
      window.location.href = createPageUrl('Register');
    }
  }, [user, currentPageName, guestMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = createPageUrl(`AdvancedSearch?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleHomeClick = () => {
    setSidebarOpen(false);
    window.location.href = createPageUrl('Home');
  };

  const isActivePage = (pageName) => location.pathname === createPageUrl(pageName);

  const userRole = user?.role || 'guest';

  const sideNavItems = [
    { icon: Heart, label: 'My Favorites', to: createPageUrl('MyFavorites'), roles: ['user', 'streamer', 'moderator', 'admin'] },
    { icon: Search, label: 'Advanced Search', to: createPageUrl('AdvancedSearch'), roles: ['guest', 'user', 'streamer', 'moderator', 'admin'] },
    { icon: Video, label: "Who's Live?", to: createPageUrl('WhosLive'), roles: ['guest', 'user', 'streamer', 'moderator', 'admin'] },
    { icon: Trophy, label: 'Rankings', to: createPageUrl('Rankings'), roles: ['guest', 'user', 'streamer', 'moderator', 'admin'] },
    { icon: Medal, label: 'Top Streamers', to: createPageUrl('TopStreamers'), roles: ['guest', 'user', 'streamer', 'moderator', 'admin'] },
    { icon: Calendar, label: 'News & Events', to: createPageUrl('News'), roles: ['guest', 'user', 'streamer', 'moderator', 'admin'] },
    { icon: History, label: 'Watch History', to: createPageUrl('WatchHistory'), roles: ['user', 'streamer', 'moderator', 'admin'] },
    { icon: Lightbulb, label: 'Report Bugs/Suggestions', to: createPageUrl('ReportBugs'), roles: ['user', 'streamer', 'moderator', 'admin'] },
    { icon: UserPlus, label: 'Become a Streamer', to: createPageUrl('BecomeAStreamer'), roles: ['guest', 'user'] },
    { icon: Shield, label: 'Admin Panel', to: createPageUrl('AdminLogin'), roles: ['admin'] }
  ].filter(item => item.roles.includes(userRole));

  const getUserStatusBadge = () => {
    if (!user || guestMode) return null;

    if (user.role === 'admin') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm" style={{ backgroundColor: '#0055A4', color: 'white' }}>
          <Shield className="w-3 h-3" />
          <span>Admin</span>
        </div>
      );
    }

    if (user.role === 'moderator') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm" style={{ backgroundColor: '#FF6B9D', color: 'white' }}>
          <Shield className="w-3 h-3" />
          <span>Moderator</span>
        </div>
      );
    }

    if (user.broadcaster_approved) {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm" style={{ backgroundColor: '#00BFFF', color: 'white' }}>
          <Camera className="w-3 h-3" />
          <span>Streamer</span>
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm" style={{ backgroundColor: '#4A90E2', color: 'white' }}>
        <User className="w-3 h-3" />
        <span>{user.role === 'admin' ? 'Admin' : 'Viewer'}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="top-right" richColors closeButton />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        :root {
          --primary: #0055A4;
          --primary-light: #4A90E2;
          --primary-dark: #003087;
          --accent: #00BFFF;
          --accent-light: #87CEEB;
          --accent-lighter: #A8D8EA;
        }
        
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(-10px) translateY(-50%);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(-50%);
          }
        }

        @keyframes attractAttention {
          0%, 100% {
            box-shadow: 
              0 0 15px rgba(255, 215, 0, 0.8), 
              0 0 30px rgba(255, 215, 0, 0.6),
              0 0 45px rgba(255, 69, 0, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 
              0 0 25px rgba(255, 215, 0, 1), 
              0 0 50px rgba(255, 215, 0, 0.8),
              0 0 75px rgba(255, 69, 0, 0.6);
            transform: scale(1.05);
          }
        }

        @keyframes premiumPulseBtn {
          0%, 100% {
            box-shadow: 0 0 10px rgba(0, 191, 255, 0.4), 0 0 20px rgba(0, 191, 255, 0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 15px rgba(0, 191, 255, 0.6), 0 0 30px rgba(0, 191, 255, 0.3);
            transform: scale(1.02);
          }
        }

        .premium-pulse-btn {
          animation: premiumPulseBtn 2s ease-in-out infinite;
        }

        .premium-pulse-btn:hover {
          transform: scale(1.03) !important;
          animation-play-state: paused;
        }

        @keyframes goldenShimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }



        .buy-balance-btn {
          position: relative;
          overflow: hidden;
          animation: attractAttention 1.5s infinite ease-in-out;
          transform: scale(1);
          transition: transform 0.3s;
        }

        .buy-balance-btn:hover {
          transform: scale(1.08) !important;
          animation: attractAttention 0.8s infinite ease-in-out;
        }

        .buy-balance-btn::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 20%,
            rgba(255, 255, 255, 0.8) 50%,
            transparent 80%
          );
          animation: goldenShimmer 2s infinite;
        }



        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .space-y-6 > * + * { margin-top: 1rem !important; }
        .space-y-4 > * + * { margin-top: 0.75rem !important; }
        .space-y-3 > * + * { margin-top: 0.5rem !important; }
        .space-y-2 > * + * { margin-top: 0.375rem !important; }
        
        .gap-6 { gap: 1rem !important; }
        .gap-4 { gap: 0.75rem !important; }
        .gap-3 { gap: 0.5rem !important; }
        .gap-2 { gap: 0.375rem !important; }

        .p-8 { padding: 1.25rem !important; }
        .p-6 { padding: 1rem !important; }
        .p-4 { padding: 0.75rem !important; }
        .p-3 { padding: 0.5rem !important; }

        .px-8 { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        .px-6 { padding-left: 1rem !important; padding-right: 1rem !important; }
        .px-4 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        .px-3 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }

        .py-8 { padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
        .py-6 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
        .py-4 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
        .py-3 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }

        [role="combobox"], select {
          padding: 0.375rem 0.75rem !important;
          height: 2.25rem !important;
        }

        button {
          padding: 0.375rem 0.875rem !important;
        }

        input, textarea {
          padding: 0.375rem 0.75rem !important;
        }

        .mb-8 { margin-bottom: 1.25rem !important; }
        .mb-6 { margin-bottom: 1rem !important; }
        .mb-4 { margin-bottom: 0.75rem !important; }
        .mb-3 { margin-bottom: 0.5rem !important; }
        .mb-2 { margin-bottom: 0.375rem !important; }

        .mt-8 { margin-top: 1.25rem !important; }
        .mt-6 { margin-top: 1rem !important; }
        .mt-4 { margin-top: 0.75rem !important; }
        .mt-3 { margin-top: 0.5rem !important; }
        .mt-2 { margin-top: 0.375rem !important; }
      `}</style>

      {guestMode && user && (
        <div className="py-2 px-4 text-center text-sm font-bold shadow-md" style={{ backgroundColor: '#00BFFF', color: 'white' }}>
          <Eye className="w-4 h-4 inline mr-2" />
          {t('nav.guestBrowsing')}
          <button
            onClick={toggleGuestMode}
            className="ml-4 underline hover:no-underline font-extrabold hover:opacity-80 transition-opacity">
            {t('nav.exitGuest')}
          </button>
        </div>
      )}

      <IncomingCallNotification />

      <aside
        className={`fixed left-0 top-16 bottom-0 w-16 z-40 flex flex-col pt-20 px-1.5 transition-transform duration-300 shadow-lg ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg, #0055A4 0%, #4A90E2 50%, #00BFFF 100%)'
        }}>
        <div className="flex flex-col gap-0.5">
          {sideNavItems.map((item) => (
            <SideNavButton
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={location.pathname === item.to}
            />
          ))}
          
          {user && !guestMode && (
            <SideNavButton
              icon={Bell}
              label={`Notifications${notifications?.length > 0 ? ` (${notifications.length})` : ''}`}
              to={createPageUrl('Notifications')}
              isActive={isActivePage('Notifications')}
              badge={notifications?.length || 0}
              isLoading={loadingNotifications}
            />
          )}
        </div>
      </aside>

      <div>
        <header className="bg-white border-b fixed top-0 left-0 right-0 z-50 shadow-md" style={{ borderColor: '#00BFFF' }}>
          <div className="px-4 w-full flex items-center h-16">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 shadow-md hover:shadow-xl"
                    style={{ backgroundColor: '#0055A4', color: 'white' }}>
                    {sidebarOpen ? (
                      <X style={{ width: '28px', height: '28px', strokeWidth: 1 }} />
                    ) : (
                      <AlignJustify style={{ width: '28px', height: '28px', strokeWidth: 1 }} />
                    )}
                  </button>
                  
                  {showTooltip && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                      <div
                        className="px-4 py-2 rounded-full whitespace-nowrap text-sm font-extrabold shadow-2xl relative text-white"
                        style={{ backgroundColor: '#00BFFF', animation: 'fadeInSlide 0.2s ease-out' }}>
                        {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
                        <div
                          className="absolute right-full top-1/2 -translate-y-1/2"
                          style={{
                            width: 0,
                            height: 0,
                            borderTop: '8px solid transparent',
                            borderBottom: '8px solid transparent',
                            borderRight: '8px solid #00BFFF'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleHomeClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690914f7fb70eda72d63d5e0/e3d55f81a_blue-crystal-earth-with-transparent-arrow-rotation_420555-214.jpg"
                    alt="Camaraderie Logo"
                    className="w-7 h-7 object-contain"
                  />
                  <h1 className="text-lg font-extrabold cursor-pointer" style={{ color: '#0055A4', letterSpacing: '0.5px' }}>
                    Camaraderie.tv
                  </h1>
                </button>
              </div>

              <form onSubmit={handleSearch} className="flex-1 flex justify-center px-6">
                <div className="relative w-full max-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4A90E2' }} />
                  <Input
                    type="text"
                    placeholder=""
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-3 py-1.5 w-full text-sm h-8 rounded-lg border-2 font-medium focus:ring-2 transition-all"
                    style={{ borderColor: '#87CEEB' }}
                  />
                </div>
              </form>

              <div className="flex items-center gap-2">
                <LanguageSelector />

                {loadingAuth ? (
                  <div className="w-24 h-8 animate-pulse rounded-lg" style={{ backgroundColor: '#A8D8EA' }}></div>
                ) : !isAuthenticated ? (
                  <Button
                    onClick={login}
                    className="px-4 py-1.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90 hover:shadow-xl shadow-lg"
                    style={{ backgroundColor: '#0055A4' }}>
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    {guestMode ? 'Sign In' : 'Join Now'}
                  </Button>
                ) : (
                  <>
                    <a
                      href={createPageUrl('Balance')}
                      className="buy-balance-btn premium-pulse-btn px-4 py-1.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90 flex items-center justify-center"
                      style={{ backgroundColor: '#00BFFF', textDecoration: 'none' }}
                    >
                      Buy Balance
                    </a>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-all border-2 shadow-sm hover:shadow-md" style={{ borderColor: '#87CEEB' }}>
                          {user.photo_1 ? (
                            <img src={user.photo_1} alt={user.full_name} className="w-7 h-7 rounded-full object-cover ring-2 ring-cyan-200" />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: '#0055A4' }}>
                              {user.full_name?.[0] || user.email?.[0] || '?'}
                            </div>
                          )}
                          <div className="text-left hidden md:block">
                            <div className="text-sm font-bold" style={{ color: '#0055A4' }}>
                              {user.full_name?.split(' ')[0] || 'User'}
                            </div>
                            <div className="text-xs capitalize font-medium" style={{ color: '#4A90E2' }}>
                              {user.broadcaster_approved ? 'Streamer' : user.role === 'admin' ? 'Admin' : 'Viewer'}
                            </div>
                          </div>
                          <ChevronDown className="w-3 h-3" style={{ color: '#4A90E2' }} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 shadow-xl border-2" style={{ borderColor: '#87CEEB' }}>
                        <DropdownMenuLabel>
                          <div className="flex items-center gap-2">
                            {user.photo_1 ? (
                              <img src={user.photo_1} alt={user.full_name} className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-200" />
                            ) : (
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: '#0055A4' }}>
                                {user.full_name?.[0] || user.email?.[0] || '?'}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-bold" style={{ color: '#0055A4' }}>{user.full_name || 'User'}</p>
                              <p className="text-xs font-medium" style={{ color: '#4A90E2' }}>{user.email}</p>
                              <div className="mt-1">
                                {getUserStatusBadge()}
                              </div>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator style={{ backgroundColor: '#87CEEB' }} />
                        
                        {(user.broadcaster_approved || user.role === 'admin' || user.role === 'moderator') && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('Profile')} className="flex items-center cursor-pointer font-medium" style={{ color: '#0055A4' }}>
                                <UserCircle className="w-4 h-4 mr-2" />
                                {t('nav.myProfile')}
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <a href={createPageUrl('Balance')} className="flex items-center cursor-pointer font-medium" style={{ color: '#00BFFF' }}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                {t('nav.balance')}
                              </a>
                            </DropdownMenuItem>

                            {(user.broadcaster_approved || user.role === 'admin') && (
                              <DropdownMenuItem asChild>
                                <Link to={createPageUrl('PayoutsHub')} className="flex items-center cursor-pointer font-medium" style={{ color: '#16A34A' }}>
                                  💰 Payouts
                                </Link>
                              </DropdownMenuItem>
                            )}
                          </>
                        )}

                        {user.broadcaster_approved && (
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('BroadcasterDashboard')} className="flex items-center cursor-pointer font-medium" style={{ color: '#00BFFF' }}>
                              <Video className="w-4 h-4 mr-2" />
                              {t('nav.myStream')}
                            </Link>
                          </DropdownMenuItem>
                        )}

                        {(user.role === 'admin' || user.role === 'moderator') && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('AdminPanel')} className="flex items-center cursor-pointer font-medium" style={{ color: '#0055A4' }}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                {t('nav.adminPanel')}
                              </Link>
                            </DropdownMenuItem>
                            {user.role === 'admin' && (
                              <DropdownMenuItem asChild>
                                <Link to={createPageUrl('ChangePassword')} className="flex items-center cursor-pointer font-medium" style={{ color: '#4A90E2' }}>
                                  <Settings className="w-4 h-4 mr-2" />
                                  Change Password
                                </Link>
                              </DropdownMenuItem>
                            )}
                          </>
                        )}

                        {!user.broadcaster_approved && user.role !== 'admin' && user.role !== 'moderator' && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('Profile')} className="flex items-center cursor-pointer font-medium" style={{ color: '#0055A4' }}>
                                <UserCircle className="w-4 h-4 mr-2" />
                                {t('nav.myProfile')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={createPageUrl('Balance')} className="flex items-center cursor-pointer font-medium" style={{ color: '#00BFFF' }}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                {t('nav.balance')}
                              </a>
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator style={{ backgroundColor: '#87CEEB' }} />
                        
                        {!guestMode && (
                          <DropdownMenuItem
                            onClick={toggleGuestMode}
                            className="flex items-start cursor-pointer font-medium hover:bg-blue-50"
                            style={{ color: '#4A90E2' }}>
                            <Eye className="w-4 h-4 mr-2 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="font-bold">{t('nav.browseGuest')}</span>
                              <span className="text-xs text-gray-500 font-normal">Browse anonymously</span>
                            </div>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator style={{ backgroundColor: '#87CEEB' }} />

                        <DropdownMenuItem
                          onClick={logout}
                          className="flex items-start cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50 font-bold">
                          <LogOut className="w-4 h-4 mr-2 mt-0.5" />
                          <div className="flex flex-col">
                            <span>Logout</span>
                            <span className="text-xs text-gray-500 font-normal">Sign out from your account</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={deleteAccount}
                          className="flex items-start cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 font-bold">
                          <Trash2 className="w-4 h-4 mr-2 mt-0.5" />
                          <div className="flex flex-col">
                            <span>Delete Account</span>
                            <span className="text-xs text-gray-500 font-normal">Permanently remove your account</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="pt-16">
          <main style={{ minHeight: 'calc(100vh - 4rem)' }}>
            {children}
          </main>

          <footer className="border-t-4 mt-16 shadow-2xl" style={{ backgroundColor: '#0055A4', borderColor: '#00BFFF' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
                <div>
                  <h3 className="font-extrabold text-xl mb-4" style={{ color: '#00BFFF' }}>{t('footer.title')}</h3>
                  <p className="text-sm text-gray-200 leading-relaxed font-medium">
                    Camaraderie.tv is the ultimate destination for live social streaming and global connections. Watch popular streamers worldwide, chat freely, and enjoy private video/audio/text sessions. Connect with people who share your interests and "Unite and Chill" your way. All models are 18+ age-verified.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-4" style={{ color: '#00BFFF' }}>{t('footer.quickLinks')}</h4>
                  <div className="space-y-2 text-sm font-medium">
                    <Link to={createPageUrl('About')} className="block text-gray-200 hover:text-white transition-colors">About Us</Link>
                    <Link to={createPageUrl('ForWhoThisPlatformIs')} className="block text-gray-200 hover:text-white transition-colors">For Who This Platform Is?</Link>
                    <Link to={createPageUrl('FAQs')} className="block text-gray-200 hover:text-white transition-colors">FAQs</Link>
                    <Link to={createPageUrl('Contact')} className="block text-gray-200 hover:text-white transition-colors">Contact</Link>
                    <Link to={createPageUrl('Billing')} className="block text-gray-200 hover:text-white transition-colors">Billing</Link>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-4" style={{ color: '#00BFFF' }}>For Streamers</h4>
                  <div className="space-y-2 text-sm font-medium">
                    <Link to={createPageUrl('BecomeAStreamer')} className="block text-gray-200 hover:text-white transition-colors">Become a Streamer</Link>
                    <Link to={createPageUrl('StreamingGuide')} className="block text-gray-200 hover:text-white transition-colors">Streaming Guide</Link>
                    <Link to={createPageUrl('StreamingDirectory')} className="block text-gray-200 hover:text-white transition-colors">Streaming Directory</Link>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-4" style={{ color: '#00BFFF' }}>Legal &amp; Community</h4>
                  <div className="space-y-2 text-sm font-medium">
                    <Link to={createPageUrl('PrivacyPolicy')} className="block text-gray-200 hover:text-white transition-colors">Privacy Policy</Link>
                    <Link to={createPageUrl('TermsOfService')} className="block text-gray-200 hover:text-white transition-colors">Terms of Service</Link>
                    <Link to={createPageUrl('CSAMPolicy')} className="block text-gray-200 hover:text-white transition-colors">CSAM Policy</Link>
                    <Link to={createPageUrl('NCCPolicy')} className="block text-gray-200 hover:text-white transition-colors">NCC Policy</Link>
                    <Link to={createPageUrl('DMCAPolicy')} className="block text-gray-200 hover:text-white transition-colors">DMCA Policy</Link>
                    <a href="https://reddit.com" target="_blank" rel="noopener noreferrer" className="block text-gray-200 hover:text-white transition-colors">Reddit Community</a>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t-2 text-center text-sm text-white font-semibold" style={{ borderColor: '#00BFFF' }}>
                {t('home.copyright')}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </AuthProvider>
    </LanguageProvider>
  );
}

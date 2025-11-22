import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Users, DollarSign, Settings, WifiOff, Calendar, Clock, TrendingUp, AlertCircle, CheckCircle2, XCircle, Instagram, Twitter, Hash, CreditCard, Radio, VolumeX, Volume2, Maximize, MessageSquare, Phone, ChevronLeft, ChevronRight, Sliders, Shield, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { formatDistanceToNow } from "date-fns";
import LevelProgress from '../components/broadcaster/LevelProgress';
import ContentSuggestions from '../components/broadcaster/ContentSuggestions';
import ModerationMonitor from '../components/broadcaster/ModerationMonitor';
import AIPerformanceCenter from '../components/broadcaster/AIPerformanceCenter';
import LiveAICoachingHints from '../components/broadcaster/LiveAICoachingHints';
import StreamerNationalityFlag from '../components/broadcaster/StreamerNationalityFlag';
import { useHiddenPerformanceMonitor } from '../components/ai/HiddenPerformanceMonitor';
import RequireClientRole from '../components/auth/RequireClientRole';
import { showToast } from "@/components/ui/toast-utils";
import IcebreakerPrompts from '../components/session/IcebreakerPrompts';

const validateSocialMediaLink = (platform, value) => {
  if (!value || !value.trim()) return { valid: true, message: '' };
  
  const patterns = {
    instagram: /(?:instagram\.com\/|@)([a-zA-Z0-9._]+)/i,
    tiktok: /(?:tiktok\.com\/@|@)([a-zA-Z0-9._]+)/i,
    twitter: /(?:twitter\.com\/|x\.com\/|@)([a-zA-Z0-9_]+)/i,
    snapchat: /^[a-zA-Z0-9._-]{3,15}$/
  };
  
  const pattern = patterns[platform];
  if (!pattern) return { valid: true, message: '' };
  
  if (value.startsWith('@') || (!value.includes('.com') && !value.includes('/'))) {
    const username = value.replace('@', '');
    if (platform === 'snapchat') {
      return { valid: pattern.test(username), message: `Invalid ${platform} username format` };
    }
    return { valid: true, message: '' };
  }
  
  const platformDomains = {
    instagram: 'instagram.com',
    tiktok: 'tiktok.com',
    twitter: ['twitter.com', 'x.com'],
  };
  
  if (platformDomains[platform]) {
    const domains = Array.isArray(platformDomains[platform]) ? platformDomains[platform] : [platformDomains[platform]];
    const containsPlatformDomain = domains.some(domain => value.toLowerCase().includes(domain));
    
    if (!containsPlatformDomain) {
      return {
        valid: false,
        message: `This link doesn't belong to ${platform.charAt(0).toUpperCase() + platform.slice(1)}. Please enter a valid ${platform} username or link.`
      };
    }
  }

  return { valid: pattern.test(value), message: pattern.test(value) ? '' : `Invalid ${platform} link format` };
};

export default function BroadcasterDashboard() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [vdoRoomId, setVdoRoomId] = useState('');
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    tiktok: '',
    twitter: '',
    snapchat: ''
  });
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showStreamControls, setShowStreamControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [videoQuality, setVideoQuality] = useState('medium');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatTab, setChatTab] = useState('messages');
  const [socialValidationErrors, setSocialValidationErrors] = useState([]);
  const [withdrawalValidationErrors, setWithdrawalValidationErrors] = useState([]);
  const [isStreamerIdle, setIsStreamerIdle] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u.broadcaster_approved) {
        window.location.href = '/';
        return;
      }
      
      const oldMessages = await base44.entities.ChatMessage.filter({
        broadcaster_id: u.id,
        is_private: false
      });
      
      for (const msg of oldMessages) {
        await base44.entities.ChatMessage.delete(msg.id);
      }
      
      setUser(u);
      setVdoRoomId(`camaraderie${u.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`);
      setIsStreaming(u.status === 'online');
      setSocialLinks({
        instagram: u.instagram || '',
        tiktok: u.tiktok || '',
        twitter: u.twitter || '',
        snapchat: u.snapchat || ''
      });
    }).catch(() => window.location.href = '/');
  }, []);

  const { data: sessions } = useQuery({
    queryKey: ['mySessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Session.filter({ broadcaster_id: user.id }, '-created_date', 50);
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: upcomingSessions } = useQuery({
    queryKey: ['upcomingSessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const all = await base44.entities.Session.filter({ 
        broadcaster_id: user.id,
        status: 'pending'
      }, 'created_date', 20);
      return all;
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: withdrawals } = useQuery({
    queryKey: ['myWithdrawals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Withdrawal.filter({ broadcaster_id: user.id }, '-created_date', 20);
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: chatMessages } = useQuery({
    queryKey: ['broadcasterChat', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.ChatMessage.filter(
        { broadcaster_id: user.id, is_private: false },
        '-created_date',
        50
      );
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
    initialData: [],
  });

  const handleSocialMediaChange = (platform, value) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  const validateSocialLinks = () => {
    const errors = [];
    const socialPlatforms = ['instagram', 'tiktok', 'twitter', 'snapchat'];
    const seenLinks = {};
    
    for (const platform of socialPlatforms) {
      const link = socialLinks[platform];
      if (!link || !link.trim()) continue;
      
      const normalized = link.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/i, '');
      
      if (seenLinks[normalized]) {
        errors.push({ 
          field: platform, 
          label: `This username/link is already used for ${seenLinks[normalized].charAt(0).toUpperCase() + seenLinks[normalized].slice(1)}. Please use a different one.` 
        });
      } else {
        seenLinks[normalized] = platform;
      }
      
      const validation = validateSocialMediaLink(platform, link);
      if (!validation.valid) {
        errors.push({ field: platform, label: validation.message || `${platform.charAt(0).toUpperCase() + platform.slice(1)} link is invalid` });
      }
    }
    
    return errors;
  };

  const validateWithdrawalForm = () => {
    const errors = [];
    const amount = parseFloat(withdrawalAmount);
    
    if (!amount || amount <= 0) {
      errors.push({ field: 'amount', label: 'Valid withdrawal amount required' });
    } else if (amount < 50) {
      errors.push({ field: 'amount', label: 'Minimum withdrawal is $50' });
    } else if (amount > availableForWithdrawal) {
      errors.push({ field: 'amount', label: 'Amount exceeds available balance' });
    }

    if (paymentMethod === 'bank_transfer') {
      if (!paymentDetails.bankName) errors.push({ field: 'bankName', label: 'Bank name required' });
      if (!paymentDetails.accountName) errors.push({ field: 'accountName', label: 'Account holder name required' });
      if (!paymentDetails.accountNumber) errors.push({ field: 'accountNumber', label: 'Account number required' });
      if (!paymentDetails.routingNumber) errors.push({ field: 'routingNumber', label: 'Routing/SWIFT code required' });
    } else if (['paypal', 'stripe', 'wise'].includes(paymentMethod)) {
      if (!paymentDetails.email) errors.push({ field: 'paymentEmail', label: `${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} email required` });
    } else if (paymentMethod === 'crypto') {
      if (!paymentDetails.currency) errors.push({ field: 'currency', label: 'Cryptocurrency type required' });
      if (!paymentDetails.address) errors.push({ field: 'address', label: 'Wallet address required' });
      if (!paymentDetails.network) errors.push({ field: 'network', label: 'Network type required' });
    }
    
    return errors;
  };

  const goLiveMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({ 
        status: 'online',
        isLive: true,
        liveRoomId: vdoRoomId,
        liveStartedAt: new Date().toISOString(),
        last_active: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      queryClient.invalidateQueries(['broadcasters']);
      queryClient.invalidateQueries(['liveBroadcasters']);
      base44.auth.me().then(u => {
        setUser(u);
        setIsStreaming(true);
      });
      showToast.streamStarted();
    },
    onError: (error) => {
      showToast.error('Failed to go live. Please check your connection and try again.');
      console.error('Go live error:', error);
    }
  });

  const stopLiveMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({ 
        status: 'offline',
        isLive: false,
        liveRoomId: null,
        liveStartedAt: null,
        last_active: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      queryClient.invalidateQueries(['broadcasters']);
      queryClient.invalidateQueries(['liveBroadcasters']);
      base44.auth.me().then(u => {
        setUser(u);
        setIsStreaming(false);
      });
      showToast.streamEnded();
    },
    onError: (error) => {
      showToast.error('Failed to stop stream. Please try again.');
      console.error('Stop stream error:', error);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !chatMessage.trim()) return;
      
      await base44.entities.ChatMessage.create({
        broadcaster_id: user.id,
        sender_id: user.id,
        sender_name: user.full_name,
        message: chatMessage.trim(),
        is_private: false
      });
    },
    onSuccess: () => {
      setChatMessage('');
      queryClient.invalidateQueries(['broadcasterChat']);
      showToast.success('Message sent!');
    },
    onError: (error) => {
      showToast.error('Failed to send message. Please try again.');
      console.error('Send message error:', error);
    }
  });

  const updateSocialMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      base44.auth.me().then(setUser);
      setEditingSocial(false);
      setSocialValidationErrors([]);
      showToast.settingsSaved();
    },
    onError: (error) => {
      showToast.error('Failed to update social links. Please try again.');
      console.error('Update social error:', error);
    }
  });

  const requestWithdrawalMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Withdrawal.create({
        broadcaster_id: user.id,
        amount: parseFloat(data.amount),
        payment_method: data.paymentMethod,
        payment_details: data.paymentDetails,
        requested_at: new Date().toISOString(),
        broadcaster_earnings_snapshot: user.total_earnings || 0,
        status: 'pending'
      });

      const adminUsers = await base44.entities.User.filter({ role: 'admin' });
      for (const admin of adminUsers) {
        await base44.entities.Notification.create({
          user_id: admin.id,
          type: 'admin_message',
          title: 'New Withdrawal Request',
          message: `${user.full_name} has requested a withdrawal of $${data.amount}`,
          link: '/AdminPanel'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myWithdrawals']);
      queryClient.invalidateQueries(['user']);
      base44.auth.me().then(setUser);
      setShowWithdrawalDialog(false);
      setWithdrawalAmount('');
      setPaymentDetails({});
      setWithdrawalValidationErrors([]);
      showToast.success('✅ Withdrawal request submitted successfully! You will be notified once it is processed.');
    },
    onError: (error) => {
      showToast.error('Failed to submit withdrawal request. Please try again.');
      console.error('Withdrawal error:', error);
    }
  });

  const scrollToElement = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveSocial = () => {
    const errors = validateSocialLinks();
    
    if (errors.length > 0) {
      setSocialValidationErrors(errors);
      showToast.error('Please fix social media link errors');
      setTimeout(() => scrollToElement('social-links-form'), 100);
      return;
    }
    
    updateSocialMutation.mutate(socialLinks);
  };

  const handleWithdrawalRequest = () => {
    const errors = validateWithdrawalForm();
    
    if (errors.length > 0) {
      setWithdrawalValidationErrors(errors);
      showToast.error('Please complete all withdrawal details');
      setTimeout(() => scrollToElement('withdrawal-form'), 100);
      return;
    }

    setWithdrawalValidationErrors([]);
    requestWithdrawalMutation.mutate({
      amount: withdrawalAmount,
      paymentMethod,
      paymentDetails
    });
  };

  const handleStartEditingSocial = () => {
    setEditingSocial(true);
    setSocialValidationErrors([]);
  };

  const handleCancelEditingSocial = () => {
    setEditingSocial(false);
    setSocialValidationErrors([]);
    if (user) {
      setSocialLinks({
        instagram: user.instagram || '',
        tiktok: user.tiktok || '',
        twitter: user.twitter || '',
        snapchat: user.snapchat || ''
      });
    }
    showToast.info('Changes cancelled');
  };

  const renderPaymentDetailsForm = () => {
    switch (paymentMethod) {
      case 'bank_transfer':
        return (
          <div className="space-y-3">
            <div>
              <Label>Bank Name</Label>
              <Input
                value={paymentDetails.bankName || ''}
                onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                placeholder="e.g., Chase Bank"
              />
            </div>
            <div>
              <Label>Account Holder Name</Label>
              <Input
                value={paymentDetails.accountName || ''}
                onChange={(e) => setPaymentDetails({...paymentDetails, accountName: e.target.value})}
                placeholder="Full name on account"
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input
                value={paymentDetails.accountNumber || ''}
                onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
                placeholder="Account number"
              />
            </div>
            <div>
              <Label>Routing Number / SWIFT</Label>
              <Input
                value={paymentDetails.routingNumber || ''}
                onChange={(e) => setPaymentDetails({...paymentDetails, routingNumber: e.target.value})}
                placeholder="Routing or SWIFT code"
              />
            </div>
          </div>
        );
      case 'paypal':
      case 'stripe':
      case 'wise':
        return (
          <div>
            <Label>{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Email</Label>
            <Input
              value={paymentDetails.email || ''}
              onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
              placeholder="your@email.com"
              type="email"
            />
          </div>
        );
      case 'crypto':
        return (
          <div className="space-y-3">
            <div>
              <Label>Cryptocurrency</Label>
              <Select
                value={paymentDetails.currency || 'USDT'}
                onValueChange={(value) => setPaymentDetails({...paymentDetails, currency: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">USDT (Tether)</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="BTC">Bitcoin</SelectItem>
                  <SelectItem value="ETH">Ethereum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Wallet Address</Label>
              <Input
                value={paymentDetails.address || ''}
                onChange={(e) => setPaymentDetails({...paymentDetails, address: e.target.value})}
                placeholder="Your crypto wallet address"
              />
            </div>
            <div>
              <Label>Network</Label>
              <Input
                value={paymentDetails.network || ''}
                onChange={(e) => setPaymentDetails({...paymentDetails, network: e.target.value})}
                placeholder="e.g., ERC20, TRC20, BEP20"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getWithdrawalStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' }
    };
    
    const { color, label } = config[status] || config.pending;
    return <Badge className={color}>{label}</Badge>;
  };

  const getQualityParams = (quality) => {
    switch (quality) {
      case 'low':
        return '&maxvideobitrate=500&maxaudiobitrate=32';
      case 'medium':
        return '&maxvideobitrate=1500&maxaudiobitrate=64';
      case 'high':
        return '&maxvideobitrate=3000&maxaudiobitrate=128';
      default:
        return '&maxvideobitrate=1500&maxaudiobitrate=64';
    }
  };

  const hostPushUrl = `https://vdo.ninja/?push=${vdoRoomId}&room=${vdoRoomId}&scene&autostart${getQualityParams(videoQuality)}`;

  const toggleFullscreen = () => {
    const element = document.getElementById('broadcaster-stream');
    if (!document.fullscreenElement) {
      element.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const createPageUrl = (path) => {
    return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const hasIncompleteProfile = user ? (!user.photo_1 || !user.native_language || !user.category_1 || !user.goal) : false;
  
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const todaySessions = completedSessions.filter(s => {
    const sessionDate = new Date(s.ended_at || s.created_date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const commissionRate = user ? 30 + ((user.level || 0) * 0.30) : 30;
  const todayEarnings = todaySessions.reduce((sum, s) => sum + (s.broadcaster_earnings || 0), 0);
  
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending' || w.status === 'processing' || w.status === 'approved');
  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const availableForWithdrawal = user ? Math.max(0, (user.total_earnings || 0) - totalPendingAmount) : 0;

  const reversedMessages = [...chatMessages].reverse();
  
  const uniqueMembers = React.useMemo(() => {
    const membersMap = new Map();
    
    if (user) {
      membersMap.set(user.id, {
        id: user.id,
        name: user.full_name,
        lastMessage: new Date(),
        isBroadcaster: true
      });
    }
    
    reversedMessages.forEach(msg => {
      if (!membersMap.has(msg.sender_id)) {
        membersMap.set(msg.sender_id, {
          id: msg.sender_id,
          name: msg.sender_name,
          lastMessage: new Date(msg.created_date),
          isBroadcaster: false
        });
      }
    });
    
    return Array.from(membersMap.values());
  }, [reversedMessages, user]);

  const viewerCount = uniqueMembers.length - 1;

  useHiddenPerformanceMonitor({
    broadcasterId: user?.id,
    viewerCount,
    isStreaming
  });


  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #0055A4 0%, #4A90E2 25%, #00BFFF 50%, #87CEEB 75%, #A8D8EA 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white shadow-xl"></div>
      </div>
    );
  }

  if (!user.broadcaster_approved) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl" style={{ backgroundColor: '#00BFFF' }}>
                <Clock className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold mb-6" style={{ color: '#0055A4' }}>
                Pending Approval
              </h2>
              <p className="text-xl mb-8 font-semibold" style={{ color: '#4A90E2' }}>
                Your broadcaster account is under review. Our team is verifying your ID photos and profile information.
              </p>
              
              <div className="rounded-2xl p-8 mb-8 shadow-lg border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                <h3 className="font-extrabold text-2xl mb-4" style={{ color: '#0055A4' }}>What happens next?</h3>
                <ul className="text-left text-base font-semibold space-y-3" style={{ color: '#4A90E2' }}>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                    <span>Admin reviews your ID photos and profile details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                    <span>You will receive an email notification (typically within 24-48 hours)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                    <span>Once approved, you can start streaming and earning immediately</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <RequireClientRole allowedRoles={["streamer", "admin"]}>
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="max-w-7xl mx-auto">
          {hasIncompleteProfile && (
            <Card className="mb-6 border-4 shadow-xl" style={{ borderColor: '#FF6B6B', backgroundColor: '#FFF5F5' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-extrabold text-xl text-red-900">⚠️ Complete Your Profile</p>
                    <p className="text-base text-red-700 mt-2 font-semibold">
                      Your profile is missing important information. Please go to <a href="/Profile" className="underline font-bold">Profile Settings</a> to:
                    </p>
                    <ul className="text-base text-red-700 mt-3 ml-4 list-disc font-semibold">
                      {!user.photo_1 && <li>Upload profile photos (required)</li>}
                      {!user.native_language && <li>Set your native language</li>}
                      {!user.category_1 && <li>Select streaming categories</li>}
                      {!user.goal && <li>Define your goal</li>}
                    </ul>
                    <Button 
                      onClick={() => window.location.href = '/Profile'}
                      className="mt-4 font-bold shadow-lg"
                      style={{ backgroundColor: '#0055A4' }}
                    >
                      Complete Profile Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6 border-4 shadow-2xl" style={{ borderColor: user.status === 'online' ? '#22c55e' : '#0055A4' }}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>
                    {t('dashboard.welcome', { name: user?.full_name || 'Broadcaster' })}
                  </h1>
                  <StreamerNationalityFlag country={user?.country} />
                </div>
              </div>
              {isStreaming ? (
                <div className="space-y-4">
                  <ModerationMonitor broadcasterId={user.id} isStreaming={isStreaming} />

                  <div className="grid lg:grid-cols-[70%,30%] gap-4">
                    <div 
                      id="broadcaster-stream"
                      className="relative bg-black rounded-xl overflow-hidden group transition-all duration-500"
                      style={{ 
                        height: '620px',
                        boxShadow: isStreamerIdle && (uniqueMembers.length - 1) >= 2 
                          ? '0 0 40px rgba(239, 68, 68, 0.6), 0 0 80px rgba(249, 115, 22, 0.4)' 
                          : 'none',
                        border: isStreamerIdle && (uniqueMembers.length - 1) >= 2 
                          ? '3px solid #f97316' 
                          : 'none'
                      }}
                      onMouseEnter={() => setShowStreamControls(true)}
                      onMouseLeave={() => setShowStreamControls(false)}
                    >
                      <LiveAICoachingHints 
                        viewerCount={viewerCount}
                        isStreaming={isStreaming}
                        broadcasterId={user.id}
                        onIdleStateChange={setIsStreamerIdle}
                      />
                      
                      <iframe
                        key={`${vdoRoomId}-${videoQuality}`}
                        src={hostPushUrl}
                        className="w-full h-full border-0"
                        allow="camera; microphone; fullscreen; display-capture; autoplay; picture-in-picture"
                        allowFullScreen
                        style={{ border: 'none' }}
                      />

                      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-green-600 px-4 py-2 rounded-full shadow-xl">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-sm font-bold">● ONLINE</span>
                      </div>

                      {showStreamControls && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pointer-events-auto transition-opacity z-30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={toggleMute}
                                className="bg-white/20 hover:bg-white/30 text-white h-10 w-10 p-0 rounded-full"
                              >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                              </Button>
                              
                              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                                <Volume2 className="w-4 h-4 text-white" />
                                <Slider
                                  value={volume}
                                  onValueChange={setVolume}
                                  max={100}
                                  step={1}
                                  className="w-24"
                                />
                                <span className="text-white text-sm font-bold w-8">{volume[0]}%</span>
                              </div>

                              <div className="relative">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                                  className="bg-white/20 hover:bg-white/30 text-white h-10 w-10 p-0 rounded-full"
                                >
                                  <Sliders className="w-5 h-5" />
                                </Button>
                                
                                {showQualityMenu && (
                                  <div className="absolute bottom-full mb-2 right-0 bg-black/95 rounded-lg shadow-2xl p-2 min-w-[140px]">
                                    <p className="text-white text-xs font-bold px-3 py-2 border-b border-gray-700">Video Quality</p>
                                    {['low', 'medium', 'high'].map((quality) => (
                                      <button
                                        key={quality}
                                        onClick={() => {
                                          setVideoQuality(quality);
                                          setShowQualityMenu(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                          videoQuality === quality
                                            ? 'bg-white/20 text-white font-bold'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                      >
                                        {quality === 'low' && '360p Low'}
                                        {quality === 'medium' && '720p Medium'}
                                        {quality === 'high' && '1080p High'}
                                        {videoQuality === quality && ' ✓'}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={toggleFullscreen}
                              className="bg-white/20 hover:bg-white/30 text-white h-10 w-10 p-0 rounded-full"
                            >
                              <Maximize className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
                      <CardContent className="p-0">
                        <Tabs value={chatTab} onValueChange={setChatTab} className="w-full">
                          <div className="flex items-center justify-between h-14 px-4" style={{ backgroundColor: '#E0F4FF' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const tabs = ['messages', 'members', 'icebreaker'];
                                const currentIndex = tabs.indexOf(chatTab);
                                const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                                setChatTab(tabs[prevIndex]);
                              }}
                              className="p-1 h-8 w-8 rounded-full hover:bg-white/50"
                            >
                              <ChevronLeft className="w-5 h-5" style={{ color: '#0055A4' }} />
                            </Button>
                            
                            <div className="flex items-center gap-2">
                              {chatTab === 'messages' ? (
                                <>
                                  <MessageSquare className="w-4 h-4" style={{ color: '#0055A4' }} />
                                  <span className="font-extrabold text-sm" style={{ color: '#0055A4' }}>Public Chat</span>
                                </>
                              ) : chatTab === 'members' ? (
                                <>
                                  <Users className="w-4 h-4" style={{ color: '#0055A4' }} />
                                  <span className="font-extrabold text-sm" style={{ color: '#0055A4' }}>Members ({uniqueMembers.length})</span>
                                </>
                              ) : (
                                <>
                                  <span className="font-extrabold text-sm" style={{ color: '#0055A4' }}>Icebreaker</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const refreshEvent = new CustomEvent('refreshIcebreaker');
                                      window.dispatchEvent(refreshEvent);
                                    }}
                                    className="hover:bg-blue-50 h-6 w-6 p-0 ml-1"
                                  >
                                    <RefreshCw className="w-4 h-4" style={{ color: '#00BFFF' }} />
                                  </Button>
                                </>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const tabs = ['messages', 'members', 'icebreaker'];
                                const currentIndex = tabs.indexOf(chatTab);
                                const nextIndex = (currentIndex + 1) % tabs.length;
                                setChatTab(tabs[nextIndex]);
                              }}
                              className="p-1 h-8 w-8 rounded-full hover:bg-white/50"
                            >
                              <ChevronRight className="w-5 h-5" style={{ color: '#0055A4' }} />
                            </Button>
                          </div>

                          <TabsContent value="messages" className="m-0">
                            <div className="h-[528px] overflow-y-auto p-4 space-y-3 bg-gray-50">
                              {reversedMessages.length === 0 ? (
                                <p className="text-center text-gray-500 py-8 text-sm">No messages yet. Start the conversation!</p>
                              ) : (
                                reversedMessages.map((msg) => (
                                  <div key={msg.id} className="flex justify-start">
                                    <div className="max-w-[85%]">
                                      <div className="flex items-center justify-start gap-1 mb-0.5">
                                        <span className="text-xs font-bold truncate" style={{ color: '#0055A4' }}>
                                          {msg.sender_name}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-sm break-words font-medium" style={{ color: '#000000' }}>{msg.message}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="p-3 border-t-2" style={{ borderColor: '#87CEEB' }}>
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  sendMessageMutation.mutate();
                                }}
                                className="flex gap-2"
                              >
                                <Input
                                  value={chatMessage}
                                  onChange={(e) => setChatMessage(e.target.value)}
                                  placeholder="Chat..."
                                  className="flex-1 text-sm"
                                  maxLength={200}
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={!chatMessage.trim() || sendMessageMutation.isPending}
                                  className="px-4"
                                  style={{ backgroundColor: '#0055A4' }}
                                >
                                  Send
                                </Button>
                              </form>
                            </div>
                          </TabsContent>

                          <TabsContent value="members" className="m-0">
                            <div className="h-[528px] overflow-y-auto p-4 space-y-2 bg-gray-50">
                              {uniqueMembers.length === 0 ? (
                                <div className="text-center py-12">
                                  <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#87CEEB' }} />
                                  <p className="text-gray-500 text-sm">No members yet</p>
                                </div>
                              ) : (
                                uniqueMembers.map((member) => {
                                  const url = member.isBroadcaster 
                                    ? createPageUrl('Profile')
                                    : createPageUrl(`BroadcasterProfile?id=${member.id}`);
                                  return (
                                    <a
                                      key={member.id}
                                      href={url}
                                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border-2 block"
                                      style={{ borderColor: '#E0F4FF' }}
                                    >
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: member.isBroadcaster ? '#ef4444' : '#0055A4' }}>
                                        {member.name?.[0] || '?'}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-bold flex items-center gap-2" style={{ color: '#0055A4' }}>
                                          {member.name}
                                          {member.isBroadcaster && (
                                            <Badge className="text-xs" style={{ backgroundColor: '#ef4444' }}>Host</Badge>
                                          )}
                                        </p>
                                        {!member.isBroadcaster && (
                                          <p className="text-xs text-gray-500">
                                            Last active: {member.lastMessage.toLocaleTimeString()}
                                          </p>
                                        )}
                                      </div>
                                    </a>
                                  );
                                })
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="icebreaker" className="m-0">
                            <div className="p-4">
                              <IcebreakerPrompts broadcaster={user} sessionType="video" />
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={() => stopLiveMutation.mutate()}
                      disabled={stopLiveMutation.isPending}
                      className="w-full h-14 text-xl font-extrabold bg-gray-600 hover:bg-gray-700 shadow-xl"
                    >
                      <WifiOff className="w-6 h-6 mr-3" />
                      🛑 STOP STREAMING
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#1a1d29', height: '480px' }}>
                      {user.photo_1 && (
                        <>
                          <img
                            src={user.photo_1}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                            style={{ filter: 'brightness(0.3)' }}
                          />
                          <div className="absolute inset-0 bg-black/40"></div>
                        </>
                      )}

                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <Badge className="mb-2 px-4 py-1 text-sm font-bold bg-gray-500 text-white">
                          OFFLINE
                        </Badge>
                        {user.last_active && (
                          <p className="text-gray-400 text-xs font-semibold">
                            Was online {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => goLiveMutation.mutate()}
                        disabled={goLiveMutation.isPending || hasIncompleteProfile}
                        className="h-12 text-base font-extrabold shadow-xl hover:shadow-2xl"
                        style={{ backgroundColor: '#22c55e' }}
                      >
                        <Radio className="w-5 h-5 mr-2" />
                        GO ONLINE
                      </Button>
                      <Button
                        onClick={() => window.location.href = '/Profile'}
                        className="h-12 text-base font-extrabold shadow-xl hover:shadow-2xl"
                        style={{ backgroundColor: '#0055A4' }}
                      >
                        My Profile
                      </Button>
                    </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center mb-6">
            <Tabs defaultValue="overview" className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-9 gap-1 p-1.5 rounded-xl shadow-xl w-full max-w-6xl mt-2" style={{ backgroundColor: '#E0F4FF' }}>
                <TabsTrigger value="overview" className="font-extrabold text-base py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all" style={{ color: '#0055A4' }}>Overview</TabsTrigger>
                <TabsTrigger value="coach" className="font-extrabold text-base py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all" style={{ color: '#FF6B9D' }}><Sparkles className="w-4 h-4 mr-1" />AI Performance</TabsTrigger>
                <TabsTrigger value="goals" className="font-extrabold text-base py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all" style={{ color: '#0055A4' }}>Goals</TabsTrigger>
                <TabsTrigger value="sessions" className="font-extrabold text-base py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all" style={{ color: '#0055A4' }}>Sessions</TabsTrigger>
                <TabsTrigger value="earnings" className="font-extrabold text-base py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all" style={{ color: '#0055A4' }}>Earnings</TabsTrigger>
                <TabsTrigger value="payouts" className="font-extrabold text-base py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all" style={{ color: '#16A34A' }}><DollarSign className="w-4 h-4 mr-1" />Payouts</TabsTrigger>
                <TabsTrigger value="settings" className="font-extrabold text-base py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all" style={{ color: '#0055A4' }}>Settings</TabsTrigger>
                <TabsTrigger value="guides" className="font-extrabold text-base py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all" style={{ color: '#0055A4' }}>Guides</TabsTrigger>
                <TabsTrigger value="rules" className="font-extrabold text-base py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all" style={{ color: '#dc2626' }}><Shield className="w-4 h-4 mr-1" />RULES</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="shadow-2xl border-4 hover:shadow-3xl transition-shadow" style={{ borderColor: '#0055A4' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold flex items-center gap-2" style={{ color: '#4A90E2' }}>
                        <TrendingUp className="w-6 h-6" />
                        {t('dashboard.currentLevel')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-extrabold" style={{ color: '#0055A4' }}>{user.level || 0}</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm font-bold mb-2" style={{ color: '#4A90E2' }}>
                          <span>{t('dashboard.commissionRate')}</span>
                          <span className="text-xl" style={{ color: '#00BFFF' }}>{commissionRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                          <div 
                            className="h-4 rounded-full shadow-md" 
                            style={{ 
                              width: `${(user.level || 0) / 90 * 100}%`,
                              background: 'linear-gradient(90deg, #0055A4, #00BFFF)'
                            }}
                          />
                        </div>
                        <p className="text-sm font-extrabold mt-2" style={{ color: '#4A90E2' }}>Level {user.level || 0} / 90</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-2xl border-4 hover:shadow-3xl transition-shadow" style={{ borderColor: '#00BFFF' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold flex items-center gap-2" style={{ color: '#4A90E2' }}>
                        <DollarSign className="w-6 h-6" />
                        {t('dashboard.todayEarnings')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-extrabold" style={{ color: '#0055A4' }}>${todayEarnings.toFixed(2)}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#4A90E2' }}>{todaySessions.length} {t('dashboard.sessionsToday')}</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-2xl border-4 hover:shadow-3xl transition-shadow" style={{ borderColor: '#00BFFF' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold flex items-center gap-2" style={{ color: '#4A90E2' }}>
                        <DollarSign className="w-6 h-6" />
                        {t('dashboard.monthlyEarnings')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-extrabold" style={{ color: '#0055A4' }}>${(user.monthly_earnings || 0).toFixed(2)}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#4A90E2' }}>{t('profile.thisMonth')}</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-2xl border-4 hover:shadow-3xl transition-shadow" style={{ borderColor: '#0055A4' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold flex items-center gap-2" style={{ color: '#4A90E2' }}>
                        <Video className="w-6 h-6" />
                        {t('dashboard.totalSessions')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-extrabold" style={{ color: '#0055A4' }}>{user.total_sessions || 0}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#00BFFF' }}>${(user.total_earnings || 0).toFixed(2)} earned</p>
                    </CardContent>
                  </Card>
                </div>

                <ContentSuggestions broadcaster={user} />

                <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Earnings This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72 flex items-center justify-center rounded-2xl shadow-inner" style={{ background: 'linear-gradient(135deg, #E0F4FF 0%, #F0F9FF 100%)' }}>
                      <div className="text-center">
                        <DollarSign className="w-20 h-20 mx-auto mb-6" style={{ color: '#00BFFF' }} />
                        <p className="text-2xl font-bold mb-6" style={{ color: '#4A90E2' }}>Earnings chart visualization</p>
                        <p className="text-6xl font-extrabold" style={{ color: '#0055A4' }}>
                          ${(user.monthly_earnings || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coach" className="space-y-6">
                <AIPerformanceCenter broadcasterId={user.id} />
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                <LevelProgress broadcasterId={user.id} isOwner={true} />
              </TabsContent>

              <TabsContent value="sessions" className="space-y-6">
                <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>{t('dashboard.recentSessions')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sessions.length === 0 ? (
                      <div className="text-center py-16">
                        <Video className="w-20 h-20 mx-auto mb-6" style={{ color: '#87CEEB' }} />
                        <p className="text-2xl font-bold" style={{ color: '#4A90E2' }}>{t('dashboard.noSessions')}</p>
                        <p className="text-base font-semibold mt-3" style={{ color: '#87CEEB' }}>Sessions will appear here once customers book with you</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-6 border-2 rounded-2xl hover:bg-blue-50 transition-all shadow-lg" style={{ borderColor: '#87CEEB' }}>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className="font-bold" variant={
                                  session.status === 'completed' ? 'default' : 
                                  session.status === 'active' ? 'secondary' : 
                                  'outline'
                                }>
                                  {session.status}
                                </Badge>
                                <span className="font-extrabold capitalize text-lg" style={{ color: '#0055A4' }}>{session.session_type} Session</span>
                              </div>
                              <p className="text-base font-bold" style={{ color: '#4A90E2' }}>
                                {session.duration_minutes} minutes • Total: ${session.total_price?.toFixed(2)}
                              </p>
                              <p className="text-sm font-semibold mt-1" style={{ color: '#87CEEB' }}>
                                {new Date(session.created_date).toLocaleDateString()} at {new Date(session.created_date).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-extrabold text-green-600">
                                +${(session.broadcaster_earnings || 0).toFixed(2)}
                              </p>
                              <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>{commissionRate.toFixed(1)}% commission</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payouts" className="space-y-6">
                <Card className="shadow-2xl border-4" style={{ borderColor: '#16A34A' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold flex items-center gap-2" style={{ color: '#16A34A' }}>
                      <DollarSign className="w-7 h-7" />
                      Payout Account Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
                        Set up your payout account with Mellow.io to receive your earnings quickly and securely.
                      </p>
                      <Button
                        onClick={() => window.location.href = createPageUrl('PayoutSetup')}
                        className="w-full h-14 text-lg font-bold shadow-xl"
                        style={{ backgroundColor: '#16A34A' }}
                      >
                        <DollarSign className="w-6 h-6 mr-2" />
                        Setup Payout Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="earnings" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="shadow-2xl border-4" style={{ borderColor: '#0055A4' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold" style={{ color: '#4A90E2' }}>Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-extrabold" style={{ color: '#0055A4' }}>${(user.total_earnings || 0).toFixed(2)}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#4A90E2' }}>Lifetime earnings</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold" style={{ color: '#4A90E2' }}>Pending Withdrawals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-extrabold" style={{ color: '#4A90E2' }}>${totalPendingAmount.toFixed(2)}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#4A90E2' }}>{pendingWithdrawals.length} requests</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-2xl border-4" style={{ borderColor: '#0055A4' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-extrabold" style={{ color: '#4A90E2' }}>Available to Withdraw</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-extrabold" style={{ color: '#0055A4' }}>${availableForWithdrawal.toFixed(2)}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#4A90E2' }}>Min: $50</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Request Withdrawal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl p-6 mb-6 border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                      <p className="text-base font-bold mb-3" style={{ color: '#0055A4' }}>
                        How withdrawals work:
                      </p>
                      <ul className="text-sm font-semibold space-y-2 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                        <li>Minimum withdrawal amount: $50 USD</li>
                        <li>Requests are processed within 2-5 business days</li>
                        <li>You will receive email notifications about status updates</li>
                        <li>Payment methods: Bank transfer, PayPal, Stripe, Wise, Crypto</li>
                      </ul>
                    </div>

                    <Dialog open={showWithdrawalDialog} onOpenChange={(open) => {
                      setShowWithdrawalDialog(open);
                      if (!open) {
                        setWithdrawalValidationErrors([]);
                        setWithdrawalAmount('');
                        setPaymentDetails({});
                        setPaymentMethod('bank_transfer');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full h-14 font-extrabold text-lg shadow-xl"
                          style={{ backgroundColor: '#0055A4' }}
                          disabled={availableForWithdrawal < 50}
                        >
                          <CreditCard className="w-6 h-6 mr-2" />
                          Request Withdrawal
                        </Button>
                      </DialogTrigger>
                      <DialogContent id="withdrawal-form" className="max-w-md max-h-[90vh] overflow-y-auto border-4" style={{ borderColor: '#00BFFF' }}>
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Request Withdrawal</DialogTitle>
                          <DialogDescription className="text-base font-bold" style={{ color: '#4A90E2' }}>
                            Available balance: ${availableForWithdrawal.toFixed(2)}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="font-bold">Withdrawal Amount (USD) *</Label>
                            <Input
                              type="number"
                              min="50"
                              max={availableForWithdrawal}
                              step="0.01"
                              value={withdrawalAmount}
                              onChange={(e) => setWithdrawalAmount(e.target.value)}
                              placeholder="Minimum $50"
                              className="mt-1 font-bold"
                            />
                            <p className="text-xs font-semibold mt-1" style={{ color: '#4A90E2' }}>
                              You can withdraw up to ${availableForWithdrawal.toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <Label className="font-bold">Payment Method *</Label>
                            <Select value={paymentMethod} onValueChange={(value) => {
                              setPaymentMethod(value);
                              setPaymentDetails({});
                            }}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="stripe">Stripe</SelectItem>
                                <SelectItem value="wise">Wise (TransferWise)</SelectItem>
                                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {renderPaymentDetailsForm()}

                          <Button
                            onClick={handleWithdrawalRequest}
                            disabled={requestWithdrawalMutation.isPending}
                            className="w-full h-12 font-extrabold shadow-lg"
                            style={{ backgroundColor: '#0055A4' }}
                          >
                            {requestWithdrawalMutation.isPending ? 'Submitting...' : 'Submit Request'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Withdrawal History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {withdrawals.length === 0 ? (
                      <div className="text-center py-12">
                        <DollarSign className="w-16 h-16 mx-auto mb-4" style={{ color: '#87CEEB' }} />
                        <p className="text-xl font-bold" style={{ color: '#4A90E2' }}>No withdrawal requests yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {withdrawals.map((withdrawal) => (
                          <div key={withdrawal.id} className="border-2 rounded-xl p-6 shadow-lg" style={{ borderColor: '#87CEEB' }}>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-extrabold text-2xl" style={{ color: '#0055A4' }}>${withdrawal.amount.toFixed(2)}</p>
                                <p className="text-base font-bold capitalize" style={{ color: '#4A90E2' }}>
                                  {withdrawal.payment_method.replace('_', ' ')}
                                </p>
                              </div>
                              {getWithdrawalStatusBadge(withdrawal.status)}
                            </div>
                            <div className="text-sm font-semibold space-y-1" style={{ color: '#4A90E2' }}>
                              <p>Requested: {new Date(withdrawal.created_date).toLocaleDateString()}</p>
                              {withdrawal.transaction_id && (
                                <p>Transaction ID: {withdrawal.transaction_id}</p>
                              )}
                              {withdrawal.admin_notes && (
                                <p className="text-blue-600">Admin Note: {withdrawal.admin_notes}</p>
                              )}
                              {withdrawal.rejection_reason && (
                                <p className="text-red-600">Rejected: {withdrawal.rejection_reason}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card id="social-links-form" className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>{t('dashboard.socialLinks')}</CardTitle>
                      {!editingSocial && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleStartEditingSocial}
                          className="font-bold border-2"
                          style={{ borderColor: '#00BFFF', color: '#0055A4' }}
                        >
                          Edit Links
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingSocial ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="flex items-center gap-2 font-bold" style={{ color: '#0055A4' }}>
                            <Instagram className="w-5 h-5" />
                            Instagram
                          </Label>
                          <Input
                            value={socialLinks.instagram}
                            onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                            placeholder="@username or instagram.com/username"
                            className="mt-1 font-semibold"
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter your Instagram username or full profile link.</p>
                        </div>
                        <div>
                          <Label className="flex items-center gap-2 font-bold" style={{ color: '#0055A4' }}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                            </svg>
                            TikTok
                          </Label>
                          <Input
                            value={socialLinks.tiktok}
                            onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                            placeholder="@username or tiktok.com/@username"
                            className="mt-1 font-semibold"
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter your TikTok username or full profile link.</p>
                        </div>
                        <div>
                          <Label className="flex items-center gap-2 font-bold" style={{ color: '#0055A4' }}>
                            <Twitter className="w-5 h-5" />
                            X (Twitter)
                          </Label>
                          <Input
                            value={socialLinks.twitter}
                            onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                            placeholder="@username or x.com/username"
                            className="mt-1 font-semibold"
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter your X/Twitter username or full profile link.</p>
                        </div>
                        <div>
                          <Label className="flex items-center gap-2 font-bold" style={{ color: '#0055A4' }}>
                            <svg className="w-5 h-5" style={{ color: '#FFFC00' }} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.206 2.175c-1.728.004-5.033.093-6.809 1.065C4.275 3.972 3.468 5.56 3.272 7.898c-.096 1.13-.103 2.262-.108 3.396v.224c.005 1.134.012 2.266.108 3.396.196 2.338 1.003 3.926 2.125 4.658 1.776.972 5.081 1.061 6.809 1.065h.13c1.728-.004 5.033-.093 6.809-1.065 1.122-.732 1.929-2.32 2.125-4.658.096-1.13.103-2.262.108-3.396v-.224c-.005-1.134-.012-2.266-.108-3.396-.196-2.338-1.003-3.926-2.125-4.658C17.369 2.268 14.064 2.179 12.336 2.175h-.13zM12 0c6.623 0 12 1.342 12 3v18c0 1.658-5.377 3-12 3S0 22.658 0 21V3C0 1.342 5.377 0 12 0z"/>
                            </svg>
                            Snapchat
                          </Label>
                          <Input
                            value={socialLinks.snapchat}
                            onChange={(e) => handleSocialMediaChange('snapchat', e.target.value)}
                            placeholder="username"
                            className="mt-1 font-semibold"
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter your Snapchat username (e.g., yourusername).</p>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={handleSaveSocial}
                            disabled={updateSocialMutation.isPending}
                            className="font-extrabold shadow-lg"
                            style={{ backgroundColor: '#0055A4' }}
                          >
                            {updateSocialMutation.isPending ? 'Saving...' : t('dashboard.saveLinks')}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={handleCancelEditingSocial}
                            className="font-bold border-2"
                            style={{ borderColor: '#87CEEB', color: '#4A90E2' }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                          <Instagram className="w-6 h-6 text-pink-600" />
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Instagram</p>
                            <p className="font-extrabold" style={{ color: '#0055A4' }}>{user.instagram || 'Not set'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>TikTok</p>
                            <p className="font-extrabold" style={{ color: '#0055A4' }}>{user.tiktok || 'Not set'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                          <Twitter className="w-6 h-6 text-blue-600" />
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>X (Twitter)</p>
                            <p className="font-extrabold" style={{ color: '#0055A4' }}>{user.twitter || 'Not set'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                          <Hash className="w-6 h-6 text-yellow-500" />
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Snapchat</p>
                            <p className="font-extrabold" style={{ color: '#0055A4' }}>{user.snapchat || 'Not set'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                        <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Full Name</p>
                        <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>{user.full_name}</p>
                      </div>
                      <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                        <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Email</p>
                        <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>{user.email}</p>
                      </div>
                      <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                        <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Country</p>
                        <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>{user.country || 'Not set'}</p>
                      </div>
                      <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                        <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Languages</p>
                        <p className="font-bold text-base" style={{ color: '#0055A4' }}>
                          {[user.native_language, user.language_2, user.language_3, user.language_4]
                            .filter(Boolean)
                            .join(', ') || 'Not set'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                        <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Categories</p>
                        <p className="font-bold text-base" style={{ color: '#0055A4' }}>
                          {[user.category_1, user.category_2].filter(Boolean).join(', ') || 'Not set'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                        <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Goal</p>
                        <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>{user.goal || 'Not set'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guides" className="space-y-6">
                <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>How to Stream</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#87CEEB' }}>
                        <p className="text-base font-bold mb-4" style={{ color: '#0055A4' }}>Streaming Setup Steps:</p>
                        <ol className="text-sm font-semibold space-y-3 ml-4 list-decimal" style={{ color: '#4A90E2' }}>
                          <li>Click GO ONLINE button in the Streaming Studio</li>
                          <li>Your browser will ask about camera and microphone permissions</li>
                          <li>Click Allow to grant access to your camera and microphone</li>
                          <li>Your camera feed will appear in the streaming window</li>
                          <li>Viewers can watch your stream from your profile page</li>
                          <li>Click STOP STREAMING when you are done</li>
                        </ol>
                      </div>
                      
                      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                        <p className="text-base font-bold mb-3" style={{ color: '#0055A4' }}>Troubleshooting:</p>
                        <ul className="text-sm font-semibold space-y-2 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                          <li>If you see a black screen, your browser blocked camera access</li>
                          <li>Look for the camera icon in browser address bar and click Allow</li>
                          <li>Try refreshing the page after granting permissions</li>
                          <li>Make sure no other app is using your camera</li>
                          <li>If you receive an error, contact support with your room ID for assistance</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border-4" style={{ borderColor: '#0055A4' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Commission & Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#87CEEB' }}>
                        <p className="text-base font-bold mb-4" style={{ color: '#0055A4' }}>Commission Structure:</p>
                        <ul className="text-sm font-semibold space-y-3 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                          <li><strong>Starting Rate:</strong> 30% commission at Level 0</li>
                          <li><strong>Max Rate:</strong> 60% commission at Level 90</li>
                          <li><strong>Growth:</strong> Commission increases by 0.30% per level</li>
                          <li><strong>Your Current Rate:</strong> <span style={{ color: '#0055A4' }} className="font-extrabold">{commissionRate.toFixed(1)}%</span></li>
                        </ul>
                      </div>

                      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                        <p className="text-base font-bold mb-3" style={{ color: '#0055A4' }}>Session Pricing:</p>
                        <div className="space-y-2 text-sm font-semibold" style={{ color: '#4A90E2' }}>
                          <p>Video Sessions: $0.70 per minute</p>
                          <p>Audio Sessions: $0.50 per minute</p>
                          <p>Text Sessions: $0.30 per minute</p>
                          <p style={{ color: '#0055A4' }} className="font-bold mt-3">You keep your percentage every session!</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Tips to Increase Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-base font-bold" style={{ color: '#4A90E2' }}>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                        <span>Stay online regularly - consistent availability builds trust with customers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                        <span>Complete more sessions to level up and increase your commission rate (up to 60%)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                        <span>Add social media links to build credibility and attract more followers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                        <span>Upload high-quality profile photos - clear face photos get more bookings</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                        <span>Go Online to attract more viewers and potential private session bookings</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                        <span>You are automatically online when logged in - customers can book anytime</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                        <span>Complete your profile with all required information</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border-4" style={{ borderColor: '#0055A4' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Broadcaster Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#87CEEB' }}>
                        <p className="text-base font-bold mb-4" style={{ color: '#0055A4' }}>Your Duties:</p>
                        <ul className="text-sm font-semibold space-y-3 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                          <li>Provide quality content and engage with your audience professionally</li>
                          <li>Honor all booked private sessions and arrive on time</li>
                          <li>Maintain appropriate content - follow platform guidelines</li>
                          <li>Keep your profile information up-to-date and accurate</li>
                          <li>Respond to messages and notifications promptly</li>
                          <li>Treat all users with respect and courtesy</li>
                          <li>Report any issues or inappropriate behavior to admins</li>
                        </ul>
                      </div>

                      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                        <p className="text-base font-bold mb-3" style={{ color: '#0055A4' }}>Platform Rules:</p>
                        <ul className="text-sm font-semibold space-y-2 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                          <li>No inappropriate or explicit content outside private sessions</li>
                          <li>No harassment or discrimination of any kind</li>
                          <li>No sharing personal contact information publicly</li>
                          <li>No soliciting payments outside the platform</li>
                          <li>Violations may result in account suspension</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Profile Setup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#87CEEB' }}>
                      <p className="text-base font-bold mb-4" style={{ color: '#0055A4' }}>Essential Profile Elements:</p>
                      <ul className="text-sm font-semibold space-y-3 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                        <li><strong>Profile Photos:</strong> Upload 3 clear face photos (no filters)</li>
                        <li><strong>Languages:</strong> Set your native language and any additional languages</li>
                        <li><strong>Categories:</strong> Choose streaming categories that match your content</li>
                        <li><strong>Goal:</strong> Define your streaming goal/objective</li>
                        <li><strong>Social Media:</strong> Link your Instagram, TikTok, Twitter, and Snapchat</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules" className="space-y-6">
                <Card className="shadow-2xl border-4 border-red-500" style={{ backgroundColor: '#FFF5F5' }}>
                  <CardHeader className="rounded-t-lg bg-red-600">
                    <CardTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
                      <Shield className="w-7 h-7" />
                      Platform Content Rules - READ CAREFULLY
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="rounded-xl p-6 border-2 border-red-500" style={{ backgroundColor: '#FFF5F5' }}>
                        <div className="flex items-start gap-3 mb-4">
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-lg text-red-900 mb-3">STRICTLY PROHIBITED CONTENT</p>
                            <p className="text-sm font-bold text-red-800 mb-3">
                              This platform is for CONVERSATIONS, TALKING, and ONLINE HANGOUTS ONLY.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 ml-9">
                          <div className="rounded-lg p-3 bg-white border-l-4 border-red-600">
                            <p className="font-bold text-red-900 mb-2">Visual Violations:</p>
                            <ul className="text-sm font-semibold text-red-800 space-y-1 ml-4 list-disc">
                              <li>Nudity of any kind (exposed breasts, nipples, genitals, buttocks)</li>
                              <li>Sexual content or suggestive poses</li>
                              <li>Sex toys visible on camera (dildos, vibrators, any adult toys)</li>
                              <li>Inappropriate clothing (underwear, lingerie shown intentionally)</li>
                              <li>Any visual content that is sexual in nature</li>
                            </ul>
                          </div>

                          <div className="rounded-lg p-3 bg-white border-l-4 border-red-600">
                            <p className="font-bold text-red-900 mb-2">Audio Violations:</p>
                            <ul className="text-sm font-semibold text-red-800 space-y-1 ml-4 list-disc">
                              <li>Sexual moaning, groaning, or sounds suggesting sexual activity</li>
                              <li>Explicit sexual language or dirty talk</li>
                              <li>Sounds that indicate the presence of sex toys being used</li>
                              <li>Inappropriate breathing or vocal tones with sexual intent</li>
                            </ul>
                          </div>

                          <div className="rounded-lg p-3 bg-white border-l-4 border-red-600">
                            <p className="font-bold text-red-900 mb-2">Language Violations:</p>
                            <ul className="text-sm font-semibold text-red-800 space-y-1 ml-4 list-disc">
                              <li>Explicit sexual terms (dick, penis, pussy, boobs, breasts in sexual context, ass in sexual context)</li>
                              <li>Sexual references, innuendos, or propositions</li>
                              <li>Solicitation of sexual content or services</li>
                              <li>Harassment or inappropriate requests</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                        <div className="flex items-start gap-3 mb-4">
                          <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                          <div>
                            <p className="font-extrabold text-lg mb-3" style={{ color: '#0055A4' }}>ALLOWED CONTENT</p>
                          </div>
                        </div>

                        <ul className="text-sm font-semibold space-y-2 ml-9 list-disc" style={{ color: '#4A90E2' }}>
                          <li>Regular conversations and discussions</li>
                          <li>Educational content and tutorials</li>
                          <li>Music, art, and creative content</li>
                          <li>Gaming and entertainment</li>
                          <li>Language exchange and cultural sharing</li>
                          <li>Casual hangouts and social interaction</li>
                          <li>Appropriate clothing (casual, formal, cultural attire)</li>
                        </ul>
                      </div>

                      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#FFF9E5', borderColor: '#FFA500' }}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-lg mb-3 text-orange-900">Consequences of Violations:</p>
                            <ul className="text-sm font-semibold text-orange-800 space-y-2 ml-4 list-disc">
                              <li><strong>First Offense:</strong> Warning + 24-hour suspension</li>
                              <li><strong>Second Offense:</strong> 7-day suspension</li>
                              <li><strong>Third Offense:</strong> Permanent ban from platform</li>
                              <li><strong>Critical Violations:</strong> Immediate permanent ban (no warnings)</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#87CEEB' }}>
                        <p className="font-extrabold text-lg mb-3" style={{ color: '#0055A4' }}>AI Moderation System:</p>
                        <ul className="text-sm font-semibold space-y-2 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                          <li>Real-time AI analysis of video, audio, and chat content</li>
                          <li>Automatic detection of nudity, sexual content, and inappropriate language</li>
                          <li>Immediate termination for critical violations (85%+ confidence)</li>
                          <li>Warning notifications for medium/high severity violations</li>
                          <li>Admin review for all flagged content</li>
                          <li>Confidence scoring to minimize false positives</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </RequireClientRole>
  );
}
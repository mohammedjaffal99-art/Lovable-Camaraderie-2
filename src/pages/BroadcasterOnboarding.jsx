import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Camera, DollarSign, Video, CheckCircle2, ArrowRight, ArrowLeft,
  TrendingUp, Users, Clock, Star, AlertCircle, Globe, Heart, Shield,
  Radio, Volume2, Maximize, MessageSquare, Phone
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function BroadcasterOnboarding() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTutorialMode, setIsTutorialMode] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u || (u.role !== 'broadcaster' && u.role !== 'admin')) {
        window.location.href = createPageUrl('Home');
        return;
      }
      
      // Allow access regardless of onboarding_completed status
      setUser(u);
      setIsTutorialMode(u.onboarding_completed === true);
      setLoading(false);
    }).catch(() => {
      window.location.href = createPageUrl('Home');
    });
  }, []);

  const handleComplete = async () => {
    await base44.auth.updateMe({ onboarding_completed: true });
    window.location.href = createPageUrl('BroadcasterDashboard');
  };

  const handleBackToDashboard = () => {
    window.location.href = createPageUrl('BroadcasterDashboard');
  };

  const steps = [
    {
      title: 'Welcome to Camaraderie.tv!',
      icon: Sparkles,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, #0055A4, #00BFFF)' }}>
              <Sparkles className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4" style={{ color: '#0055A4' }}>Welcome, {user?.full_name}!</h2>
            <p className="text-xl font-bold" style={{ color: '#4A90E2' }}>Let's get you started as a broadcaster</p>
          </div>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF', backgroundColor: '#E0F4FF' }}>
            <CardContent className="p-8">
              <h3 className="text-2xl font-extrabold mb-6" style={{ color: '#0055A4' }}>What You'll Learn:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: '#0055A4' }}>
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Complete Your Profile</p>
                    <p className="font-semibold" style={{ color: '#4A90E2' }}>Set up photos, languages, and categories to attract viewers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: '#00BFFF' }}>
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Understand Earnings</p>
                    <p className="font-semibold" style={{ color: '#4A90E2' }}>Learn how commission rates work and how to maximize income</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: '#4A90E2' }}>
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Streaming Best Practices</p>
                    <p className="font-semibold" style={{ color: '#4A90E2' }}>Tips for your first stream and building your audience</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl p-6 shadow-lg border-2" style={{ backgroundColor: '#FFF5F0', borderColor: '#FF6B6B' }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-lg text-orange-900 mb-2">Important Note</p>
                <p className="text-base font-semibold text-orange-800">
                  This tutorial will take about 5 minutes. You can skip it, but we highly recommend completing it to understand how to succeed on the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Setting Up Your Profile',
      icon: Camera,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg, #0055A4, #00BFFF)' }}>
              <Camera className="w-11 h-11 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: '#0055A4' }}>Your Profile is Your Storefront</h2>
            <p className="text-lg font-bold" style={{ color: '#4A90E2' }}>Make a great first impression!</p>
          </div>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-xl font-extrabold" style={{ color: '#0055A4' }}>Essential Profile Elements</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Profile Photos (Required: 3)</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Clear face photos without filters. First photo is your main profile picture that viewers see everywhere.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Languages (Required: Native Language)</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>List all languages you can communicate in. More languages = more potential viewers!</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Streaming Categories (Required: 1)</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Choose categories that match your content (Gaming, Music, Education, etc.)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Goal (Required)</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Define your purpose (Language Exchange, Make Friends, or Open to All Possibilities)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Social Media Links (Optional)</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Link Instagram, TikTok, Twitter/X, and Snapchat to build credibility and attract followers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF', backgroundColor: '#FFF5F0' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-lg text-orange-900 mb-2">Profile Quality Tips</p>
                  <ul className="text-base font-semibold text-orange-800 space-y-2 ml-4 list-disc">
                    <li>Use well-lit, high-quality photos showing your face clearly</li>
                    <li>NO filters, snapchat lenses, or heavy editing - natural photos only</li>
                    <li>Choose accurate categories - this helps viewers find you</li>
                    <li>Complete ALL optional fields to increase discoverability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: 'Understanding Your Earnings',
      icon: DollarSign,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg, #00BFFF, #0055A4)' }}>
              <DollarSign className="w-11 h-11 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: '#0055A4' }}>How You Earn Money</h2>
            <p className="text-lg font-bold" style={{ color: '#4A90E2' }}>Every private session generates income for you!</p>
          </div>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Commission Rate System</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="rounded-xl p-6 shadow-lg border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#87CEEB' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-extrabold" style={{ color: '#0055A4' }}>Starting Commission:</span>
                  <span className="text-4xl font-extrabold" style={{ color: '#00BFFF' }}>30%</span>
                </div>
                <p className="font-semibold" style={{ color: '#4A90E2' }}>You start at Level 0 and keep 30% of every private session</p>
              </div>

              <div className="rounded-xl p-6 shadow-lg border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-extrabold" style={{ color: '#0055A4' }}>Maximum Commission:</span>
                  <span className="text-4xl font-extrabold text-green-600">60%</span>
                </div>
                <p className="font-semibold" style={{ color: '#4A90E2' }}>Reach Level 90 to unlock the maximum 60% commission rate</p>
              </div>

              <div className="flex items-center gap-3 p-5 rounded-xl shadow-md" style={{ backgroundColor: '#FFF5F0' }}>
                <TrendingUp className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>How to Level Up</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Complete sessions to gain experience. Each level increases your commission by 0.30%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-4" style={{ borderColor: '#0055A4' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Session Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl shadow-lg border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#00BFFF' }}>
                  <Video className="w-8 h-8 mb-3" style={{ color: '#0055A4' }} />
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Video Calls</p>
                  <p className="text-3xl font-extrabold my-2" style={{ color: '#00BFFF' }}>$0.70</p>
                  <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>per minute</p>
                </div>
                <div className="p-5 rounded-xl shadow-lg border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#00BFFF' }}>
                  <Phone className="w-8 h-8 mb-3" style={{ color: '#0055A4' }} />
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Audio Calls</p>
                  <p className="text-3xl font-extrabold my-2" style={{ color: '#00BFFF' }}>$0.50</p>
                  <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>per minute</p>
                </div>
                <div className="p-5 rounded-xl shadow-lg border-2" style={{ backgroundColor: '#F0F9FF', borderColor: '#00BFFF' }}>
                  <MessageSquare className="w-8 h-8 mb-3" style={{ color: '#0055A4' }} />
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Text Chat</p>
                  <p className="text-3xl font-extrabold my-2" style={{ color: '#00BFFF' }}>$0.30</p>
                  <p className="text-sm font-bold" style={{ color: '#4A90E2' }}>per minute</p>
                </div>
              </div>

              <div className="mt-6 p-6 rounded-xl shadow-lg" style={{ backgroundColor: '#E0F4FF' }}>
                <p className="font-extrabold text-xl mb-3" style={{ color: '#0055A4' }}>Example Earnings (30% commission):</p>
                <div className="space-y-2 text-base font-bold" style={{ color: '#4A90E2' }}>
                  <p>• 30-minute video call = $21 total → <span className="text-green-600 font-extrabold">You earn $6.30</span></p>
                  <p>• 45-minute audio call = $22.50 total → <span className="text-green-600 font-extrabold">You earn $6.75</span></p>
                  <p>• 60-minute text chat = $18 total → <span className="text-green-600 font-extrabold">You earn $5.40</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: 'Your First Stream',
      icon: Video,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg, #0055A4, #00BFFF)' }}>
              <Video className="w-11 h-11 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: '#0055A4' }}>Ready to Go Live?</h2>
            <p className="text-lg font-bold" style={{ color: '#4A90E2' }}>Follow these steps for a successful first stream</p>
          </div>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Pre-Stream Checklist</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md text-white font-extrabold" style={{ backgroundColor: '#0055A4' }}>1</div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Test Your Equipment</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Make sure your camera, microphone, and lighting work properly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md text-white font-extrabold" style={{ backgroundColor: '#00BFFF' }}>2</div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Choose a Quiet Location</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Find a space with good lighting, minimal background noise, and privacy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md text-white font-extrabold" style={{ backgroundColor: '#4A90E2' }}>3</div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Allow Browser Permissions</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>When prompted, click "Allow" for camera and microphone access</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md text-white font-extrabold" style={{ backgroundColor: '#87CEEB' }}>4</div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Click "GO ONLINE"</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>This makes you visible to all viewers and allows them to book sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-4" style={{ borderColor: '#0055A4' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Stream Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-5 h-5" style={{ color: '#0055A4' }} />
                    <p className="font-extrabold" style={{ color: '#0055A4' }}>Audio Controls</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>Mute/unmute and adjust volume using the controls that appear when you hover over the stream</p>
                </div>
                <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Maximize className="w-5 h-5" style={{ color: '#0055A4' }} />
                    <p className="font-extrabold" style={{ color: '#0055A4' }}>Fullscreen Mode</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>Click fullscreen button for an immersive streaming view</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF', backgroundColor: '#E0F4FF' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Star className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-extrabold text-xl mb-3" style={{ color: '#0055A4' }}>Pro Tips for Success:</p>
                  <ul className="text-base font-semibold space-y-2 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                    <li>Greet viewers by name when they enter your chat</li>
                    <li>Engage with public chat to build rapport before private sessions</li>
                    <li>Maintain a consistent streaming schedule so followers know when to find you</li>
                    <li>Be authentic and professional - viewers appreciate genuine connections</li>
                    <li>Use good lighting - it makes a huge difference in video quality</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: 'Private Sessions',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg, #0055A4, #00BFFF)' }}>
              <Users className="w-11 h-11 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: '#0055A4' }}>Private Session Guide</h2>
            <p className="text-lg font-bold" style={{ color: '#4A90E2' }}>Your main source of income</p>
          </div>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>How Sessions Work</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-white font-extrabold" style={{ backgroundColor: '#0055A4' }}>1</div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Customer Books Session</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Viewers can book video, audio, or text sessions with you anytime you're online</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-white font-extrabold" style={{ backgroundColor: '#00BFFF' }}>2</div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Session Starts Automatically</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>The session begins immediately and timer starts counting down</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-white font-extrabold" style={{ backgroundColor: '#4A90E2' }}>3</div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Provide Great Experience</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Be friendly, professional, and engaging to build repeat customers</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-white font-extrabold" style={{ backgroundColor: '#87CEEB' }}>4</div>
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Earn Your Commission</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>When session ends, your earnings are automatically calculated and added</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Session Duration Options</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                  <span className="font-bold" style={{ color: '#0055A4' }}>15 Minutes</span>
                  <Badge className="font-bold" style={{ backgroundColor: '#00BFFF' }}>Quick Session</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                  <span className="font-bold" style={{ color: '#0055A4' }}>30 Minutes</span>
                  <Badge className="font-bold" style={{ backgroundColor: '#4A90E2' }}>Most Popular</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                  <span className="font-bold" style={{ color: '#0055A4' }}>45 Minutes</span>
                  <Badge className="font-bold" style={{ backgroundColor: '#0055A4' }}>Extended Session</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl p-6 shadow-lg border-2" style={{ backgroundColor: '#FFF5F0', borderColor: '#FF6B6B' }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-lg text-orange-900 mb-2">Important Reminders:</p>
                <ul className="text-base font-semibold text-orange-800 space-y-2 ml-4 list-disc">
                  <li>Always be respectful and professional with customers</li>
                  <li>Honor all booked sessions - reliability builds your reputation</li>
                  <li>Keep session content appropriate and consensual</li>
                  <li>Report any inappropriate behavior to admins immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Building Your Audience',
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg, #0055A4, #00BFFF)' }}>
              <TrendingUp className="w-11 h-11 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: '#0055A4' }}>Grow Your Following</h2>
            <p className="text-lg font-bold" style={{ color: '#4A90E2' }}>More followers = more sessions = more earnings</p>
          </div>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>How to Attract Viewers</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Be Consistent</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Stream regularly at the same times so followers know when to find you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Engage in Public Chat</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Respond to messages, ask questions, and create a welcoming atmosphere</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Provide Quality Content</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Be entertaining, educational, or conversational based on your categories</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Link Social Media</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Connect Instagram, TikTok, etc. to increase credibility and cross-promote</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-4" style={{ borderColor: '#0055A4' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Favorites System</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-5 rounded-xl shadow-lg" style={{ backgroundColor: '#E0F4FF' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-7 h-7" style={{ color: '#0055A4' }} />
                    <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>What are Favorites?</p>
                  </div>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>
                    Viewers can add you to their favorites list. When you go online, they receive instant notifications!
                  </p>
                </div>
                <div className="p-5 rounded-xl shadow-lg" style={{ backgroundColor: '#F0F9FF' }}>
                  <p className="font-extrabold text-lg mb-2" style={{ color: '#0055A4' }}>Why Favorites Matter:</p>
                  <ul className="text-base font-semibold space-y-2 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                    <li>Favorited broadcasters get more visibility on the platform</li>
                    <li>Followers return for more sessions, increasing your income</li>
                    <li>Build a loyal community of regular viewers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: 'Safety & Withdrawals',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg, #0055A4, #00BFFF)' }}>
              <Shield className="w-11 h-11 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: '#0055A4' }}>Safety & Getting Paid</h2>
            <p className="text-lg font-bold" style={{ color: '#4A90E2' }}>Important information for your protection and earnings</p>
          </div>

          <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Safety Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Never Share Personal Info</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Don't share your address, phone number, or other private details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Keep Transactions On-Platform</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>All payments MUST go through Camaraderie.tv - never accept outside payments</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Report Inappropriate Behavior</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>Use the reporting system if anyone harasses you or requests inappropriate content</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#00BFFF' }} />
                <div>
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>You Control Your Boundaries</p>
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>You can end any session at any time if you feel uncomfortable</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-4" style={{ borderColor: '#0055A4' }}>
            <CardHeader style={{ backgroundColor: '#E0F4FF' }}>
              <CardTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>Withdrawal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-5 rounded-xl shadow-lg" style={{ backgroundColor: '#E0F4FF' }}>
                <p className="font-extrabold text-xl mb-3" style={{ color: '#0055A4' }}>Payout Details:</p>
                <ul className="text-base font-semibold space-y-2 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                  <li>Minimum withdrawal: <span className="font-extrabold" style={{ color: '#0055A4' }}>$50 USD</span></li>
                  <li>Processing time: <span className="font-extrabold" style={{ color: '#0055A4' }}>2-5 business days</span></li>
                  <li>Available methods: Bank transfer, PayPal, Stripe, Wise, Cryptocurrency</li>
                  <li>Request withdrawals anytime from your dashboard</li>
                  <li>You'll receive email updates on withdrawal status</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl shadow-lg" style={{ backgroundColor: '#F0F9FF' }}>
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-7 h-7" style={{ color: '#00BFFF' }} />
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Track Your Earnings</p>
                </div>
                <p className="font-semibold" style={{ color: '#4A90E2' }}>
                  Your dashboard shows real-time earnings, completed sessions, and available balance for withdrawal. Everything is transparent and tracked automatically!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "You're All Set!",
      icon: CheckCircle2,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg, #00BFFF, #0055A4)' }}>
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4" style={{ color: '#0055A4' }}>You're Ready to Stream!</h2>
            <p className="text-xl font-bold" style={{ color: '#4A90E2' }}>Time to start your broadcasting journey</p>
          </div>

          <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF', backgroundColor: '#E0F4FF' }}>
            <CardContent className="p-8">
              <h3 className="text-2xl font-extrabold mb-6 text-center" style={{ color: '#0055A4' }}>Quick Recap:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl shadow-lg bg-white">
                  <CheckCircle2 className="w-7 h-7 mb-3" style={{ color: '#00BFFF' }} />
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Profile Setup</p>
                  <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>3 photos, languages, categories</p>
                </div>
                <div className="p-5 rounded-xl shadow-lg bg-white">
                  <CheckCircle2 className="w-7 h-7 mb-3" style={{ color: '#00BFFF' }} />
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Earnings</p>
                  <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>30-60% commission, level up</p>
                </div>
                <div className="p-5 rounded-xl shadow-lg bg-white">
                  <CheckCircle2 className="w-7 h-7 mb-3" style={{ color: '#00BFFF' }} />
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Streaming</p>
                  <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>GO ONLINE to start accepting sessions</p>
                </div>
                <div className="p-5 rounded-xl shadow-lg bg-white">
                  <CheckCircle2 className="w-7 h-7 mb-3" style={{ color: '#00BFFF' }} />
                  <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Safety</p>
                  <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>Keep personal info private, report issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-4" style={{ borderColor: '#0055A4' }}>
            <CardContent className="p-8">
              <h3 className="text-2xl font-extrabold mb-6 text-center" style={{ color: '#0055A4' }}>Next Steps:</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-5 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-white font-extrabold" style={{ backgroundColor: '#0055A4' }}>1</div>
                  <div>
                    <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Complete Your Profile</p>
                    <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>Add all required photos and information in Profile Settings</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-white font-extrabold" style={{ backgroundColor: '#00BFFF' }}>2</div>
                  <div>
                    <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Test Your Setup</p>
                    <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>Go to Broadcaster Dashboard and do a test stream to check camera/audio</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-xl shadow-md" style={{ backgroundColor: '#F0F9FF' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg text-white font-extrabold" style={{ backgroundColor: '#4A90E2' }}>3</div>
                  <div>
                    <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Go Live!</p>
                    <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>Click GO ONLINE and start connecting with viewers worldwide</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl p-8 shadow-2xl text-center" style={{ background: 'linear-gradient(135deg, #0055A4, #00BFFF)' }}>
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-white" />
            <p className="text-2xl font-extrabold text-white mb-3">Welcome to the Camaraderie.tv Community!</p>
            <p className="text-lg font-bold text-white">We're excited to see you grow and succeed as a broadcaster.</p>
          </div>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-5xl mx-auto">
        {isTutorialMode && (
          <div className="mb-6">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              className="font-bold border-2"
              style={{ borderColor: '#00BFFF', color: '#0055A4' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        )}

        <Card className="shadow-2xl border-4 mb-6" style={{ borderColor: '#00BFFF' }}>
          <CardHeader style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CurrentIcon className="w-8 h-8 text-white" />
                <CardTitle className="text-2xl font-extrabold text-white">
                  Broadcaster Onboarding
                </CardTitle>
              </div>
              <Badge className="text-base px-4 py-1.5 font-bold bg-white" style={{ color: '#0055A4' }}>
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-white">
                <span>{steps[currentStep].title}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-white/30" />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {steps[currentStep].content}

            <div className="flex items-center justify-between mt-8 pt-6 border-t-2" style={{ borderColor: '#87CEEB' }}>
              <Button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                variant="outline"
                className="font-bold border-2"
                style={{ borderColor: '#87CEEB', color: '#4A90E2' }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  className="font-extrabold shadow-xl text-lg px-8 h-12"
                  style={{ backgroundColor: '#00BFFF' }}
                >
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  {isTutorialMode ? 'Finish Tutorial' : 'Complete Tutorial & Start Streaming'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  className="font-extrabold shadow-xl px-6 h-12"
                  style={{ backgroundColor: '#0055A4' }}
                >
                  Next Step
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>

            {!isTutorialMode && (
              <div className="text-center mt-6">
                <button
                  onClick={handleComplete}
                  className="text-sm font-bold underline hover:no-underline transition-all"
                  style={{ color: '#4A90E2' }}
                >
                  Skip Tutorial (Not Recommended)
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-2">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-3 h-3 rounded-full transition-all shadow-md ${
                idx === currentStep ? 'w-8' : 'opacity-50 hover:opacity-75'
              }`}
              style={{ backgroundColor: idx <= currentStep ? '#0055A4' : '#87CEEB' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
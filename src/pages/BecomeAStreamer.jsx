
import React from 'react';
import { Video, DollarSign, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BecomeAStreamer() {
  const benefits = [
    { icon: DollarSign, title: 'Earn Income', description: 'Make money from private sessions with commission rates from 30-60%' },
    { icon: Users, title: 'Build Community', description: 'Grow your follower base and create lasting connections worldwide' },
    { icon: TrendingUp, title: 'Level Up', description: 'Increase your earnings as you gain experience and complete sessions' },
    { icon: Video, title: 'Flexible Streaming', description: 'Stream on your schedule with video, audio, or text options' }
  ];

  const steps = [
    'Create your account and select "Streamer/Model" during registration',
    'Upload 3 clear face photos (no filters) for your profile',
    'Complete ID verification with government-issued ID (front and back)',
    'Fill in your profile details: languages, categories, goals',
    'Wait 24-48 hours for admin approval',
    'Start streaming and earning!'
  ];

  const requirements = [
    'Must be 18 years or older',
    'Valid government-issued photo ID',
    'Clear, unfiltered face photos',
    'Reliable internet connection',
    'Webcam and microphone (for video/audio sessions)',
    'Professional and respectful conduct'
  ];

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-white" style={{ textShadow: '0 2px 12px rgba(0,85,164,0.3)' }}>
            Become a Streamer
          </h1>
          <p className="text-lg font-semibold text-white max-w-3xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.2)' }}>
            Join our global community of streamers and start earning from your content
          </p>
        </div>

        <div className="px-4 py-16">
          <h2 className="text-2xl font-extrabold text-center mb-12 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            Why Stream on Camaraderie.tv?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-2xl p-8 text-center hover:shadow-3xl transition-all transform hover:scale-105 border-4" style={{ borderColor: '#00BFFF' }}>
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg" style={{ backgroundColor: '#0055A4' }}>
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold mb-3" style={{ color: '#0055A4' }}>{benefit.title}</h3>
                <p className="font-bold" style={{ color: '#4A90E2' }}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white py-16 px-4 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-extrabold text-center mb-12" style={{ color: '#0055A4' }}>
              How to Get Started
            </h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-5 p-6 rounded-2xl shadow-xl border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-extrabold text-xl shadow-lg" style={{ backgroundColor: '#0055A4' }}>
                    {index + 1}
                  </div>
                  <p className="pt-2 text-lg font-bold" style={{ color: '#4A90E2' }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-extrabold text-center mb-12 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-xl border-2" style={{ borderColor: '#00BFFF' }}>
                <CheckCircle className="w-7 h-7 flex-shrink-0" style={{ color: '#00BFFF' }} />
                <span className="font-bold text-lg" style={{ color: '#4A90E2' }}>{req}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl shadow-2xl p-16 border-4" style={{ borderColor: '#00BFFF' }}>
            <h2 className="text-2xl font-extrabold mb-6" style={{ color: '#0055A4' }}>Ready to Start Streaming?</h2>
            <p className="text-2xl mb-10 font-bold" style={{ color: '#4A90E2' }}>Join our community of successful streamers today</p>
            <Link
              to={createPageUrl('Register')}
              className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-extrabold text-2xl hover:shadow-3xl transition-all shadow-2xl"
            >
              Create Your Account
              <ArrowRight className="w-7 h-7" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

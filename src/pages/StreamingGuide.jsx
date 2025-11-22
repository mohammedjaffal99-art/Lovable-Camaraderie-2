
import React from 'react';
import { Video, Settings, Users, DollarSign, Shield, Zap } from 'lucide-react';

export default function StreamingGuide() {
  const sections = [
    {
      icon: Video,
      title: 'Getting Started',
      content: [
        'Set up your profile with high-quality photos and complete information',
        'Choose your streaming categories and specify your languages',
        'Set your availability status (Online/Offline)',
        'Test your camera and microphone before going live'
      ]
    },
    {
      icon: Settings,
      title: 'Stream Settings',
      content: [
        'Update your status to "Online" to accept calls',
        'Set your status to "Live" when doing public broadcasts',
        'Mark yourself as "In Session" during private calls',
        'Go "Offline" when you need a break'
      ]
    },
    {
      icon: Users,
      title: 'Building Your Audience',
      content: [
        'Be active and engage with viewers in public chat',
        'Keep your profile updated with fresh photos',
        'Link your social media accounts to boost your commission',
        'Be consistent with your streaming schedule',
        'Respond to messages and build relationships with followers'
      ]
    },
    {
      icon: DollarSign,
      title: 'Earning Money',
      content: [
        'Earn from private video, audio, and text sessions',
        'Commission starts at 30% and increases to 60% as you level up',
        'Level up by completing sessions and maintaining good ratings',
        'Add social media links to boost your commission rate',
        'Payments are processed monthly with transparent tracking'
      ]
    },
    {
      icon: Shield,
      title: 'Safety & Guidelines',
      content: [
        'Always maintain professional and respectful conduct',
        'Never share personal contact information',
        'Report any inappropriate behavior immediately',
        'Follow all platform terms of service',
        'Respect user privacy - never record sessions without consent',
        'Block users or regions if needed for your safety'
      ]
    },
    {
      icon: Zap,
      title: 'Pro Tips',
      content: [
        'Use good lighting and a clean background for video',
        'Engage actively during sessions to build loyalty',
        'Offer varied content across different categories',
        'Be punctual for scheduled sessions',
        'Ask viewers to favorite you for notifications',
        'Promote your streams on social media'
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-white" style={{ textShadow: '0 2px 12px rgba(0,85,164,0.3)' }}>
            Streaming Guide
          </h1>
          <p className="text-lg font-semibold text-white max-w-3xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.2)' }}>
            Everything you need to know to succeed on Camaraderie.tv
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-2xl p-8 border-4" style={{ borderColor: '#00BFFF' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#0055A4' }}>
                  <section.icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-4">
                {section.content.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-extrabold mt-1" style={{ color: '#00BFFF' }}>•</span>
                    <span className="text-lg font-bold" style={{ color: '#4A90E2' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl shadow-2xl p-12 text-center text-white border-4" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)', borderColor: 'white' }}>
          <h2 className="text-4xl font-extrabold mb-6">Need More Help?</h2>
          <p className="text-xl mb-8 font-bold">
            Check out our FAQ page or contact our support team for personalized assistance
          </p>
          <div className="flex justify-center gap-6">
            <a
              href={'/FAQs'}
              className="px-10 py-5 bg-white rounded-full font-extrabold text-xl hover:shadow-3xl transition-all shadow-2xl"
              style={{ color: '#0055A4' }}
            >
              View FAQs
            </a>
            <a
              href={'/Contact'}
              className="px-10 py-5 border-4 border-white text-white rounded-full font-extrabold text-xl hover:bg-white hover:shadow-3xl transition-all"
              style={{ color: 'white' }}
              onMouseEnter={(e) => e.target.style.color = '#0055A4'}
              onMouseLeave={(e) => e.target.style.color = 'white'}
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

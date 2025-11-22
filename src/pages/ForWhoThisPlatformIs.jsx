
import React from 'react';
import { BookOpen, Users, Heart, Plane, Globe, Smile } from 'lucide-react';

export default function ForWhoThisPlatformIs() {
  const audiences = [
    {
      icon: BookOpen,
      title: 'Language Learners',
      description: 'Practice languages with native speakers from around the world through live conversations and text chat.'
    },
    {
      icon: Users,
      title: 'Making New Friends',
      description: 'Connect with like-minded individuals globally and build meaningful friendships across borders.'
    },
    {
      icon: Heart,
      title: 'Hobbies Passionate',
      description: 'Share your passion for arts, gaming, music, cooking, and more with enthusiastic communities.'
    },
    {
      icon: Plane,
      title: 'Wild Travelers',
      description: 'Meet locals and fellow travelers, discover new destinations, and share travel experiences.'
    },
    {
      icon: Globe,
      title: 'Culture Explorers',
      description: 'Immerse yourself in different cultures, traditions, and perspectives from every corner of the world.'
    },
    {
      icon: Smile,
      title: 'Having Fun',
      description: 'Enjoy casual conversations, entertainment, and lighthearted interactions in a vibrant community.'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-white" style={{ textShadow: '0 2px 12px rgba(0,85,164,0.3)' }}>
            For Who This Platform Is?
          </h1>
          <p className="text-lg font-semibold text-white max-w-4xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.2)' }}>
            Camaraderie.tv brings together diverse communities from around the world. Here's who can benefit from our platform:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((audience, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-2xl p-6 hover:shadow-3xl transition-all transform hover:scale-105 border-4"
              style={{ borderColor: '#00BFFF' }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg"
                style={{ backgroundColor: '#0055A4' }}
              >
                <audience.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#0055A4' }}>
                {audience.title}
              </h3>
              <p className="leading-relaxed font-semibold text-base" style={{ color: '#4A90E2' }}>
                {audience.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-2xl p-8 text-center border-4" style={{ borderColor: '#00BFFF' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#0055A4' }}>
            Everyone is Welcome!
          </h2>
          <p className="text-lg font-semibold max-w-3xl mx-auto" style={{ color: '#4A90E2' }}>
            No matter your background, interests, or goals - Camaraderie.tv is designed to help you connect, learn, and grow through authentic human interactions.
          </p>
        </div>
      </div>
    </div>
  );
}

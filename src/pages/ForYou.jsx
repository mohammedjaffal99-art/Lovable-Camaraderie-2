import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/AuthContext';
import PersonalizedRecommendations from '../components/viewer/PersonalizedRecommendations';
import ViewerJourney from '../components/viewer/ViewerJourney';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ForYou() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-6" style={{ color: '#87CEEB' }} />
              <h2 className="text-3xl font-extrabold mb-4" style={{ color: '#0055A4' }}>Sign in for Personalized Experience</h2>
              <p className="text-lg font-semibold mb-6" style={{ color: '#4A90E2' }}>
                Get AI-powered recommendations, track your journey, and discover broadcasters tailored to your interests
              </p>
              <Button 
                onClick={() => base44.auth.redirectToLogin()}
                className="font-bold shadow-lg text-lg px-8 h-12"
                style={{ backgroundColor: '#0055A4' }}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-3" style={{ color: '#0055A4' }}>
            <Sparkles className="w-10 h-10 inline mr-3" style={{ color: '#00BFFF' }} />
            For You
          </h1>
          <p className="text-lg font-bold" style={{ color: '#4A90E2' }}>Your personalized streaming experience powered by AI</p>
        </div>

        <ViewerJourney currentUser={user} />

        <PersonalizedRecommendations currentUser={user} />

        <Card className="shadow-xl border-4" style={{ borderColor: '#0055A4' }}>
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 flex-shrink-0" style={{ color: '#00BFFF' }} />
              <div>
                <p className="font-extrabold text-xl mb-3" style={{ color: '#0055A4' }}>How Recommendations Work</p>
                <ul className="text-base font-semibold space-y-2 ml-4 list-disc" style={{ color: '#4A90E2' }}>
                  <li>AI analyzes your session history, favorites, and browsing patterns</li>
                  <li>Suggests broadcasters that match your interests and preferences</li>
                  <li>Prioritizes online broadcasters for immediate interaction</li>
                  <li>Balances familiar favorites with new discoveries</li>
                  <li>Updates continuously as you explore the platform</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to={createPageUrl('Home')}>
            <Button 
              variant="outline"
              className="font-bold border-2"
              style={{ borderColor: '#00BFFF', color: '#0055A4' }}
            >
              <Users className="w-5 h-5 mr-2" />
              Browse All Broadcasters
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
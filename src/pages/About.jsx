
import React from "react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Users, Globe, Shield, Zap, Heart, Video, MessageSquare, Star, Award, TrendingUp } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 text-white" style={{ textShadow: '0 4px 20px rgba(0,85,164,0.3)', letterSpacing: '2px' }}>
            About Camaraderie.tv
          </h1>
          <p className="text-2xl md:text-3xl text-white mb-8 font-bold max-w-4xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.2)' }}>
            Connecting Communities Through Live Streaming
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-12 border-4" style={{ borderColor: '#00BFFF' }}>
          <div className="flex items-center gap-4 mb-6">
            <Heart className="w-12 h-12" style={{ color: '#0055A4' }} />
            <h2 className="text-4xl font-extrabold" style={{ color: '#0055A4' }}>Our Story</h2>
          </div>
          <p className="text-xl leading-relaxed mb-6 font-semibold" style={{ color: '#4A90E2' }}>
            Camaraderie.tv was founded with a vision to create a global platform where people from all walks of life can connect through live streaming. We believe in the power of authentic human connection and meaningful relationships that transcend borders.
          </p>
          <p className="text-xl leading-relaxed font-semibold" style={{ color: '#4A90E2' }}>
            Based in the UAE, we're committed to fostering diversity, cultural exchange, and safe online interactions. Today, we serve thousands of users across 13 languages, bringing communities together in one unified space.
          </p>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-extrabold text-center mb-12 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            Mission & Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: "Global Connection", desc: "Breaking down geographical and cultural barriers" },
              { icon: Shield, title: "Safety First", desc: "Age verification and 24/7 moderation" },
              { icon: Heart, title: "Authenticity", desc: "Real connections, real people, real experiences" },
              { icon: Zap, title: "Fair Compensation", desc: "Empowering creators with sustainable earnings" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-4 transform hover:scale-105" style={{ borderColor: '#00BFFF' }}>
                <item.icon className="w-16 h-16 mb-4" style={{ color: '#0055A4' }} />
                <h3 className="text-2xl font-extrabold mb-3" style={{ color: '#0055A4' }}>{item.title}</h3>
                <p className="font-semibold" style={{ color: '#4A90E2' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#11009E' }}>Platform Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#11009E' }}>
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Live Streaming</h3>
              <p className="text-sm text-gray-600">Public broadcasts for entertainment, education, and community building</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#11009E' }}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Private Sessions</h3>
              <p className="text-sm text-gray-600">One-on-one video, audio, or text interactions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#11009E' }}>
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Multi-Language</h3>
              <p className="text-sm text-gray-600">Platform available in 13 languages for global accessibility</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#11009E' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Verified Community</h3>
              <p className="text-sm text-gray-600">All broadcasters 18+ age-verified with ID documentation</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#11009E' }}>
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Level System</h3>
              <p className="text-sm text-gray-600">Broadcasters earn 30-60% commission, increasing with experience</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#11009E' }}>
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Real-Time Chat</h3>
              <p className="text-sm text-gray-600">Public chat rooms and private messaging for all users</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#11009E' }}>
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Favorites System</h3>
              <p className="text-sm text-gray-600">Follow your favorite streamers and get live notifications</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#11009E' }}>
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Flexible Pricing</h3>
              <p className="text-sm text-gray-600">Pay-per-minute system with packages for every budget</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl shadow-2xl p-16 border-4" style={{ borderColor: '#00BFFF' }}>
          <h2 className="text-5xl font-extrabold mb-6" style={{ color: '#0055A4' }}>Join Our Community</h2>
          <p className="text-2xl mb-10 font-semibold" style={{ color: '#4A90E2' }}>
            Be part of a global movement connecting people through live streaming
          </p>
          <Button
            onClick={() => window.location.href = createPageUrl('Register')}
            className="text-xl font-extrabold px-12 py-6 shadow-2xl hover:shadow-3xl transition-all"
            style={{ backgroundColor: '#0055A4', color: 'white' }}
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
}

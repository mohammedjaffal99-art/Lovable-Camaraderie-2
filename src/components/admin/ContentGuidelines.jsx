import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

export default function ContentGuidelines() {
  return (
    <Card className="shadow-xl border-2" style={{ borderColor: '#0055A4' }}>
      <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
        <CardTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Shield className="w-7 h-7" />
          Platform Content Guidelines
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
  );
}
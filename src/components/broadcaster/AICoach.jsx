import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Lightbulb, TrendingUp, Users, Heart, ThumbsUp, ThumbsDown, RefreshCw, MessageCircle, Smile, Star, Zap, Target, Mic, Eye, Video, Brain } from 'lucide-react';
import { toast } from 'sonner';

export default function AICoach({ broadcaster }) {
  const [generating, setGenerating] = useState(false);
  const [analyzingAdvanced, setAnalyzingAdvanced] = useState(false);
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['coachingInsights', broadcaster?.id],
    queryFn: async () => {
      if (!broadcaster?.id) return [];
      return await base44.entities.CoachingInsight.filter(
        { broadcaster_id: broadcaster.id },
        '-created_date',
        10
      );
    },
    enabled: !!broadcaster?.id,
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const [sessions, favorites, goals, moderationEvents, chatMessages] = await Promise.all([
        base44.entities.Session.filter({ broadcaster_id: broadcaster.id }, '-created_date', 50),
        base44.entities.Favorite.filter({ broadcaster_id: broadcaster.id }),
        base44.entities.StreamingGoal.filter({ broadcaster_id: broadcaster.id, status: 'active' }),
        base44.entities.ModerationEvent.filter({ broadcaster_id: broadcaster.id }, '-created_date', 10),
        base44.entities.ChatMessage.filter({ broadcaster_id: broadcaster.id, is_private: false }, '-created_date', 100)
      ]);

      const completedSessions = sessions.filter(s => s.status === 'completed');
      const avgSessionDuration = completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / completedSessions.length
        : 0;

      const sessionTypes = {
        video: completedSessions.filter(s => s.session_type === 'video').length,
        audio: completedSessions.filter(s => s.session_type === 'audio').length,
        text: completedSessions.filter(s => s.session_type === 'text').length
      };

      const totalEarnings = broadcaster.total_earnings || 0;
      const level = broadcaster.level || 0;
      const commissionRate = 30 + (level * 0.30);

      const prompt = `You are a friendly, enthusiastic AI coach for a live streamer on Camaraderie.tv! 🌟

Your personality: You're SUPER positive, encouraging, smiley, and fun! Think of yourself as their biggest cheerleader AND their productivity guru. You use lots of emojis, exclamation points, and keep things upbeat and motivating! You're professional but make coaching feel like chatting with a supportive friend who genuinely wants them to succeed and have FUN while doing it!

Broadcaster Profile:
- Name: ${broadcaster.full_name || 'Broadcaster'}
- Level: ${level}/90 (Commission: ${commissionRate.toFixed(1)}%)
- Total Sessions: ${completedSessions.length}
- Total Earnings: $${totalEarnings.toFixed(2)}
- Monthly Earnings: $${(broadcaster.monthly_earnings || 0).toFixed(2)}
- Followers: ${favorites.length}
- Categories: ${[broadcaster.category_1, broadcaster.category_2].filter(Boolean).join(', ')}
- Languages: ${[broadcaster.native_language, broadcaster.language_2].filter(Boolean).join(', ')}
- Active Goals: ${goals.length}

Performance Metrics:
- Average Session Duration: ${avgSessionDuration.toFixed(1)} minutes
- Session Type Distribution: Video ${sessionTypes.video}, Audio ${sessionTypes.audio}, Text ${sessionTypes.text}
- Recent Chat Activity: ${chatMessages.length} messages
- Recent Moderation Events: ${moderationEvents.length}

Your Task: Generate 5 personalized coaching insights that are:
1. SUPER positive and encouraging ("You're doing AMAZING!" vibes)
2. Focused on personality: being smiley, friendly, giggly, easy-going, inviting, fun-loving
3. Practical and actionable (productivity-focused)
4. Help them enjoy their streaming journey more
5. Boost their earnings through better engagement

Focus areas:
- How to be MORE approachable and fun during streams
- Ways to make conversations flow naturally and keep energy UP
- Tips for being genuinely friendly and making viewers feel welcome
- How to show authentic personality and have a great time
- Engagement strategies that feel natural and fun (not forced)
- Content ideas that match their vibe and categories
- Building genuine connections with viewers

Tone: Like a fun, supportive friend who's also a streaming pro! Use emojis, be enthusiastic, make them feel EXCITED about improving!

For each insight, provide:
- insight_type: one of "performance_analysis" | "content_suggestion" | "engagement_tip" | "personality_coaching"
- title: catchy, upbeat title (max 60 chars)
- message: detailed, friendly coaching message (150-250 chars)
- priority: "low" | "medium" | "high"

Return as JSON array of insights.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  insight_type: { type: "string" },
                  title: { type: "string" },
                  message: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      const created = [];
      for (const insight of (response.insights || [])) {
        const newInsight = await base44.entities.CoachingInsight.create({
          broadcaster_id: broadcaster.id,
          insight_type: insight.insight_type,
          title: insight.title,
          message: insight.message,
          priority: insight.priority,
          metrics: {
            sessions: completedSessions.length,
            earnings: totalEarnings,
            level,
            followers: favorites.length
          }
        });
        created.push(newInsight);
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingInsights']);
      toast.success('🎉 Fresh coaching insights generated!');
    },
  });

  const generateAdvancedAnalysisMutation = useMutation({
    mutationFn: async () => {
      const [sessions, chatMessages, favorites] = await Promise.all([
        base44.entities.Session.filter({ broadcaster_id: broadcaster.id, status: 'completed' }, '-created_date', 100),
        base44.entities.ChatMessage.filter({ broadcaster_id: broadcaster.id, is_private: false }, '-created_date', 200),
        base44.entities.Favorite.filter({ broadcaster_id: broadcaster.id })
      ]);

      const recentMessages = chatMessages.slice(0, 50).map(m => m?.message || '').filter(Boolean).join('\n');
      
      const sessionTypeCounts = {
        video: sessions.filter(s => s.session_type === 'video').length,
        audio: sessions.filter(s => s.session_type === 'audio').length,
        text: sessions.filter(s => s.session_type === 'text').length
      };

      const avgDuration = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length 
        : 0;

      const prompt = `You are an expert broadcasting coach specializing in advanced skill development and performance analysis. 

Analyze this broadcaster's performance data and provide DEEPLY PERSONALIZED, HIGHLY DETAILED coaching on:

Broadcaster: ${broadcaster.full_name || 'Broadcaster'}
Level: ${broadcaster.level || 0}/90
Categories: ${[broadcaster.category_1, broadcaster.category_2].filter(Boolean).join(', ')}
Languages: ${[broadcaster.native_language, broadcaster.language_2].filter(Boolean).join(', ')}

Performance Data:
- Total Sessions: ${sessions.length}
- Video: ${sessionTypeCounts.video}, Audio: ${sessionTypeCounts.audio}, Text: ${sessionTypeCounts.text}
- Average Session Duration: ${avgDuration.toFixed(1)} minutes
- Followers: ${favorites.length}
- Recent Chat Sample (last 50 messages):
${recentMessages || 'No messages yet'}

Based on the chat messages, analyze and provide insights on:

1. **SPEECH PATTERNS & COMMUNICATION STYLE**
   - Analyze their messaging tone, word choice, and conversation flow
   - Identify their natural communication strengths
   - Suggest specific ways to refine their unique voice
   - Recommend conversation starters or responses that match their style

2. **ON-CAMERA PRESENCE & ENERGY**
   - Based on session preferences (video vs audio vs text), assess their comfort level
   - Suggest ways to improve camera presence and body language
   - Tips for maintaining engaging energy throughout streams
   - How to appear more approachable and inviting

3. **INTERACTION & ENGAGEMENT TECHNIQUES**
   - Analyze their interaction patterns from chat behavior
   - Identify what makes their conversations engaging or where they could improve
   - Suggest specific techniques for better viewer retention
   - Recommend personalized icebreakers that fit their style

4. **UNIQUE BROADCASTING STYLE DEVELOPMENT**
   - Identify what makes them unique based on their data
   - Suggest ways to amplify their authentic personality
   - Recommend content angles that align with their strengths
   - Help them develop a signature style that stands out

5. **ADVANCED MONETIZATION STRATEGIES**
   - Based on their session distribution, suggest optimization strategies
   - Recommend pricing strategies aligned with their skill level
   - Tips for converting casual viewers to paying customers
   - Strategies to increase session duration and repeat bookings

Create 5 ADVANCED coaching insights with:
- insight_type: "performance_analysis" | "content_suggestion" | "engagement_tip" | "technical_optimization" | "personality_coaching"
- title: specific, actionable title (max 70 chars)
- message: highly detailed, personalized advice (200-350 chars with specific examples)
- priority: "low" | "medium" | "high"

Make these insights feel like they're from a coach who has watched their streams for months and knows their specific strengths and areas for growth.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  insight_type: { type: "string" },
                  title: { type: "string" },
                  message: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      const created = [];
      for (const insight of (response.insights || [])) {
        const newInsight = await base44.entities.CoachingInsight.create({
          broadcaster_id: broadcaster.id,
          insight_type: insight.insight_type,
          title: `🎯 ${insight.title}`,
          message: insight.message,
          priority: insight.priority,
          metrics: {
            sessions: sessions.length,
            chatMessages: chatMessages.length,
            followers: favorites.length,
            analysisType: 'advanced'
          }
        });
        created.push(newInsight);
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingInsights']);
      toast.success('🧠 Advanced skill analysis complete!');
    },
  });

  const markHelpfulMutation = useMutation({
    mutationFn: async ({ insightId, helpful }) => {
      await base44.entities.CoachingInsight.update(insightId, {
        helpful,
        read: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingInsights']);
    },
  });

  const getInsightIcon = (type) => {
    switch (type) {
      case 'performance_analysis': return TrendingUp;
      case 'content_suggestion': return Lightbulb;
      case 'engagement_tip': return Users;
      case 'personality_coaching': return Smile;
      case 'technical_optimization': return Zap;
      default: return Sparkles;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      await generateInsightsMutation.mutateAsync();
    } finally {
      setGenerating(false);
    }
  };

  const handleAdvancedAnalysis = async () => {
    setAnalyzingAdvanced(true);
    try {
      await generateAdvancedAnalysisMutation.mutateAsync();
    } finally {
      setAnalyzingAdvanced(false);
    }
  };

  const quickInsights = (insights || []).filter(i => i?.title && !i.title.startsWith('🎯'));
  const advancedInsights = (insights || []).filter(i => i?.title && i.title.startsWith('🎯'));

  return (
    <Card className="shadow-2xl border-4" style={{ borderColor: '#FF6B9D' }}>
      <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #FF6B9D, #FFA500, #FFD700)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-white" />
            <div>
              <CardTitle className="text-2xl font-extrabold text-white">Your AI Coach 🎯</CardTitle>
              <p className="text-sm font-semibold text-white/90 mt-1">Personalized tips to boost your streaming success! ✨</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="quick" className="font-bold">
              <Smile className="w-4 h-4 mr-2" />
              Quick Tips
            </TabsTrigger>
            <TabsTrigger value="advanced" className="font-bold">
              <Brain className="w-4 h-4 mr-2" />
              Advanced Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleGenerateInsights}
                disabled={generating || generateInsightsMutation.isPending}
                className="bg-white text-purple-600 hover:bg-purple-50 font-bold shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Generating...' : 'Get New Tips'}
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl p-6" style={{ backgroundColor: '#F0F9FF' }}>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : quickInsights.length === 0 ? (
              <div className="text-center py-12">
                <Smile className="w-16 h-16 mx-auto mb-4" style={{ color: '#FFD700' }} />
                <p className="text-xl font-bold mb-3" style={{ color: '#FF6B9D' }}>Ready to level up your streaming game? 🚀</p>
                <p className="text-base font-semibold mb-6" style={{ color: '#4A90E2' }}>
                  Get personalized coaching tips tailored just for you!
                </p>
                <Button
                  onClick={handleGenerateInsights}
                  disabled={generating}
                  className="font-bold text-lg px-8 h-12 shadow-xl"
                  style={{ background: 'linear-gradient(90deg, #FF6B9D, #FFA500)' }}
                >
                  <Sparkles className={`w-5 h-5 mr-2 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'Generating Magic...' : 'Get My Coaching Tips!'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {quickInsights.map((insight) => {
                  const Icon = getInsightIcon(insight.insight_type);
                  return (
                    <Card 
                      key={insight.id} 
                      className={`border-2 shadow-lg hover:shadow-xl transition-all ${!insight.read ? 'ring-2 ring-purple-300' : ''}`}
                      style={{ borderColor: '#FFD700' }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #FF6B9D, #FFA500)' }}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-extrabold text-lg" style={{ color: '#0055A4' }}>
                                  {insight.title}
                                </h3>
                                <Badge className={`${getPriorityColor(insight.priority)} border-2 font-bold`}>
                                  {insight.priority} priority
                                </Badge>
                                {!insight.read && (
                                  <Badge className="bg-purple-100 text-purple-800 border-2 border-purple-300 font-bold animate-pulse">
                                    NEW! ✨
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: '#4A90E2' }}>
                              {insight.message}
                            </p>

                            <div className="flex items-center gap-3">
                              <p className="text-xs font-bold" style={{ color: '#87CEEB' }}>Was this helpful?</p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={insight.helpful === true ? "default" : "outline"}
                                  onClick={() => markHelpfulMutation.mutate({ insightId: insight.id, helpful: true })}
                                  className="h-8 px-3"
                                  style={insight.helpful === true ? { backgroundColor: '#22c55e' } : {}}
                                >
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  Yes!
                                </Button>
                                <Button
                                  size="sm"
                                  variant={insight.helpful === false ? "default" : "outline"}
                                  onClick={() => markHelpfulMutation.mutate({ insightId: insight.id, helpful: false })}
                                  className="h-8 px-3"
                                  style={insight.helpful === false ? { backgroundColor: '#ef4444' } : {}}
                                >
                                  <ThumbsDown className="w-3 h-3 mr-1" />
                                  Not really
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="rounded-xl p-6 mb-6 border-2" style={{ backgroundColor: '#F0F4FF', borderColor: '#4A90E2' }}>
              <div className="flex items-start gap-3 mb-4">
                <Brain className="w-6 h-6" style={{ color: '#0055A4' }} />
                <div>
                  <h3 className="font-extrabold text-lg mb-2" style={{ color: '#0055A4' }}>
                    Deep Performance Analysis 🎓
                  </h3>
                  <p className="text-sm font-semibold mb-3" style={{ color: '#4A90E2' }}>
                    Get highly personalized insights by analyzing your:
                  </p>
                  <ul className="space-y-2 text-sm font-medium" style={{ color: '#4A90E2' }}>
                    <li className="flex items-center gap-2">
                      <Mic className="w-4 h-4" style={{ color: '#FF6B9D' }} />
                      <span><strong>Speech patterns</strong> from your chat interactions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Eye className="w-4 h-4" style={{ color: '#FFA500' }} />
                      <span><strong>On-camera presence</strong> based on session preferences</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: '#FFD700' }} />
                      <span><strong>Interaction style</strong> and engagement techniques</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Video className="w-4 h-4" style={{ color: '#00BFFF' }} />
                      <span><strong>Unique broadcasting style</strong> to stand out</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Button
                onClick={handleAdvancedAnalysis}
                disabled={analyzingAdvanced || generateAdvancedAnalysisMutation.isPending}
                className="w-full font-bold text-base h-12 shadow-xl"
                style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}
              >
                <Brain className={`w-5 h-5 mr-2 ${analyzingAdvanced ? 'animate-spin' : ''}`} />
                {analyzingAdvanced ? 'Analyzing Your Performance...' : 'Run Advanced Skill Analysis'}
              </Button>
            </div>

            {advancedInsights.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-3" style={{ color: '#4A90E2' }} />
                <p className="font-semibold" style={{ color: '#4A90E2' }}>
                  No advanced analysis yet. Click above to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {advancedInsights.map((insight) => {
                  const Icon = getInsightIcon(insight.insight_type);
                  return (
                    <Card 
                      key={insight.id} 
                      className={`border-2 shadow-lg hover:shadow-xl transition-all ${!insight.read ? 'ring-2 ring-blue-300' : ''}`}
                      style={{ borderColor: '#00BFFF' }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #0055A4, #00BFFF)' }}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-extrabold text-lg" style={{ color: '#0055A4' }}>
                                  {insight.title}
                                </h3>
                                <Badge className={`${getPriorityColor(insight.priority)} border-2 font-bold`}>
                                  {insight.priority} priority
                                </Badge>
                                {!insight.read && (
                                  <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300 font-bold animate-pulse">
                                    NEW ANALYSIS! 🎓
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: '#4A90E2' }}>
                              {insight.message}
                            </p>

                            <div className="flex items-center gap-3">
                              <p className="text-xs font-bold" style={{ color: '#87CEEB' }}>Was this helpful?</p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={insight.helpful === true ? "default" : "outline"}
                                  onClick={() => markHelpfulMutation.mutate({ insightId: insight.id, helpful: true })}
                                  className="h-8 px-3"
                                  style={insight.helpful === true ? { backgroundColor: '#22c55e' } : {}}
                                >
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  Yes!
                                </Button>
                                <Button
                                  size="sm"
                                  variant={insight.helpful === false ? "default" : "outline"}
                                  onClick={() => markHelpfulMutation.mutate({ insightId: insight.id, helpful: false })}
                                  className="h-8 px-3"
                                  style={insight.helpful === false ? { backgroundColor: '#ef4444' } : {}}
                                >
                                  <ThumbsDown className="w-3 h-3 mr-1" />
                                  Not really
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 rounded-xl p-6 border-2" style={{ backgroundColor: '#FFF5F9', borderColor: '#FF6B9D' }}>
          <div className="flex items-start gap-3">
            <Heart className="w-6 h-6 text-pink-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-base mb-2" style={{ color: '#0055A4' }}>
                Remember: The Secret Sauce is YOU! 🌟
              </p>
              <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>
                Your authentic smile, friendly energy, and genuine personality are what make viewers come back! 
                Focus on having a blast, being yourself, and creating a warm, welcoming vibe. When you're having fun, 
                your viewers will too - and that's when the magic happens! 😊💫
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Smile, Mic, Activity, MessageCircle, Users, Heart, Clock, BarChart3, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function AIPerformanceCenter({ broadcasterId }) {
  const { data: performanceLogs = [], isLoading } = useQuery({
    queryKey: ['ai-performance-logs', broadcasterId],
    queryFn: async () => {
      const logs = await base44.entities.AIPerformanceLog.filter(
        { broadcaster_id: broadcasterId, had_audience: true },
        '-created_date',
        30
      );
      return logs;
    }
  });

  // Get latest performance log
  const latestLog = performanceLogs[0];
  
  // Calculate weekly trend (compare last 7 days vs previous 7 days)
  const last7Days = performanceLogs.slice(0, 7);
  const previous7Days = performanceLogs.slice(7, 14);
  const currentAvg = last7Days.reduce((sum, log) => sum + (log.overall_score || 0), 0) / (last7Days.length || 1);
  const previousAvg = previous7Days.reduce((sum, log) => sum + (log.overall_score || 0), 0) / (previous7Days.length || 1);
  const trend = currentAvg - previousAvg;

  const getTrendIcon = () => {
    if (trend > 5) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend < -5) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend > 5) return "text-green-600";
    if (trend < -5) return "text-red-600";
    return "text-gray-600";
  };

  // Category scores with icons
  const categoryScores = latestLog ? [
    { label: "Engagement Level", value: latestLog.engagement_score || 0, icon: Activity, color: "#0055A4" },
    { label: "Facial Expression / Smile", value: latestLog.smile_score || 0, icon: Smile, color: "#00BFFF" },
    { label: "Voice Activity & Tone", value: latestLog.voice_score || 0, icon: Mic, color: "#4A90E2" },
    { label: "Movement / Animation", value: latestLog.movement_score || 0, icon: Activity, color: "#87CEEB" },
    { label: "Chat Responsiveness", value: latestLog.chat_responsiveness_score || 0, icon: MessageCircle, color: "#0055A4" },
    { label: "Viewer Retention", value: latestLog.retention_score || 0, icon: Users, color: "#00BFFF" },
    { label: "Emotional Warmth", value: latestLog.warmth_score || 0, icon: Heart, color: "#FF6B9D" },
    { label: "Idle Time Reduction", value: latestLog.idle_reduction_score || 0, icon: Clock, color: "#4A90E2" }
  ] : [];

  // Performance analytics data
  const smilesData = performanceLogs.slice(0, 10).reverse().map((log, idx) => ({
    session: `S${idx + 1}`,
    smiles: log.smiles_per_10min || 0
  }));

  const silenceData = performanceLogs.slice(0, 10).reverse().map((log, idx) => ({
    session: `S${idx + 1}`,
    periods: log.silence_periods || 0
  }));

  const chatSpeedData = performanceLogs.slice(0, 10).reverse().map((log, idx) => ({
    session: `S${idx + 1}`,
    speed: log.chat_reply_speed_avg || 0
  }));

  const idleTimeData = performanceLogs.slice(0, 10).reverse().map((log, idx) => ({
    session: `S${idx + 1}`,
    idle: Math.round((log.idle_time_total || 0) / 60) // Convert to minutes
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#00BFFF' }}></div>
      </div>
    );
  }

  if (!latestLog) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2" style={{ color: '#0055A4' }}>No Performance Data Yet</h3>
          <p className="text-gray-600">
            Start streaming with at least 2 viewers to begin tracking your AI performance metrics.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-left max-w-md mx-auto">
            <p className="font-semibold mb-2" style={{ color: '#0055A4' }}>How it works:</p>
            <ul className="space-y-1 text-gray-700">
              <li>• AI monitoring activates when you have 2+ viewers</li>
              <li>• Tracks engagement, expressions, voice, and more</li>
              <li>• Provides real-time coaching and post-stream insights</li>
              <li>• Helps improve your streaming performance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Section */}
      <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6" style={{ color: '#00BFFF' }} />
              AI Streamer Quality Score
            </span>
            <Badge className={getScoreBadgeColor(latestLog.overall_score || 0)}>
              {latestLog.overall_score || 0}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="text-6xl font-extrabold mb-2" style={{ color: '#0055A4' }}>
                {latestLog.overall_score || 0}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {getTrendIcon()}
                <span className={getTrendColor()}>
                  {Math.abs(trend).toFixed(1)} points {trend >= 0 ? 'up' : 'down'} this week
                </span>
              </div>
            </div>
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceLogs.slice(0, 7).reverse().map((log, idx) => ({
                  day: `D${idx + 1}`,
                  score: log.overall_score || 0
                }))}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00BFFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="score" stroke="#00BFFF" fillOpacity={1} fill="url(#scoreGradient)" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryScores.map((category, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <category.icon className="w-4 h-4" style={{ color: category.color }} />
                    <span className="text-sm font-semibold">{category.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(category.value)}`}>
                    {category.value}/100
                  </span>
                </div>
                <Progress value={category.value} className="h-2" style={{ backgroundColor: '#E8F4F8' }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Smiles per 10 min */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Smile className="w-4 h-4" style={{ color: '#00BFFF' }} />
                Smiles per 10 Minutes
              </h4>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={smilesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="smiles" fill="#00BFFF" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Silence Periods */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Mic className="w-4 h-4" style={{ color: '#FF6B9D' }} />
                Silence Periods Detected
              </h4>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={silenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="periods" fill="#FF6B9D" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chat Reply Speed */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" style={{ color: '#4A90E2' }} />
                Chat Reply Speed (seconds)
              </h4>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chatSpeedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="speed" stroke="#4A90E2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Idle Time */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: '#FFA500' }} />
                Idle Time (minutes)
              </h4>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={idleTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="idle" fill="#FFA500" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Coaching */}
      <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" style={{ color: '#00BFFF' }} />
            AI Personalized Coaching
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestLog.coaching_summary && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">{latestLog.coaching_summary}</p>
            </div>
          )}

          <div className="grid gap-6">
            {/* What you did great */}
            {latestLog.strengths && latestLog.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                  <span className="text-2xl">✨</span> What You Did Great
                </h4>
                <ul className="space-y-2">
                  {latestLog.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What to improve */}
            {latestLog.improvements && latestLog.improvements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                  <span className="text-2xl">💡</span> What to Improve
                </h4>
                <ul className="space-y-2">
                  {latestLog.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-orange-600 mt-0.5">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top 3 Recommendations */}
            {latestLog.recommendations && latestLog.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#0055A4' }}>
                  <span className="text-2xl">🎯</span> Top 3 Recommendations for Next Stream
                </h4>
                <ul className="space-y-2">
                  {latestLog.recommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="font-bold" style={{ color: '#00BFFF' }}>{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Engagement Style & Insights */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-purple-900">Your Engagement Style</h4>
                <p className="text-sm text-purple-800">
                  {latestLog.emotional_tone === 'positive' && "High-energy, positive broadcaster with warm audience connections"}
                  {latestLog.emotional_tone === 'neutral' && "Balanced and steady streaming approach"}
                  {latestLog.emotional_tone === 'negative' && "Room for improvement in positivity and energy"}
                  {latestLog.emotional_tone === 'varied' && "Dynamic style with varied emotional engagement"}
                </p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-indigo-900">Audience Behavior Insights</h4>
                <p className="text-sm text-indigo-800">
                  Peak viewers: {latestLog.peak_viewers || 0} • 
                  Retention: {latestLog.retention_score || 0}% • 
                  Chat engagement: {latestLog.chat_responsiveness_score >= 70 ? 'High' : latestLog.chat_responsiveness_score >= 40 ? 'Medium' : 'Low'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Users, DollarSign, Video, TrendingUp, Calendar, CheckCircle2, Flame } from 'lucide-react';

const GOAL_TYPE_CONFIG = {
  followers: { icon: Users, label: 'Followers', unit: 'followers', color: '#E91E63' },
  monthly_earnings: { icon: DollarSign, label: 'Monthly Earnings', unit: '$', color: '#4CAF50' },
  total_sessions: { icon: Video, label: 'Total Sessions', unit: 'sessions', color: '#2196F3' },
  level: { icon: TrendingUp, label: 'Level Up', unit: 'level', color: '#FF9800' },
  custom: { icon: Target, label: 'Custom Goal', unit: '', color: '#9C27B0' }
};

export default function GoalsDisplay({ broadcasterId }) {
  const { data: goals, isLoading } = useQuery({
    queryKey: ['publicGoals', broadcasterId],
    queryFn: async () => {
      if (!broadcasterId) return [];
      const allGoals = await base44.entities.StreamingGoal.filter(
        { broadcaster_id: broadcasterId, is_public: true, status: 'active' },
        '-created_date',
        10
      );
      return allGoals;
    },
    enabled: !!broadcasterId,
    initialData: [],
  });

  if (isLoading) {
    return (
      <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
      <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
        <div className="flex items-center gap-3">
          <Target className="w-7 h-7 text-white" />
          <div>
            <CardTitle className="text-2xl font-extrabold text-white">Streaming Goals</CardTitle>
            <p className="text-sm font-semibold text-white/90 mt-1">Help me achieve my goals!</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {goals.map((goal) => {
          const config = GOAL_TYPE_CONFIG[goal.goal_type];
          const Icon = config.icon;
          const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
          const isCompleted = goal.current_value >= goal.target_value;
          const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

          return (
            <div key={goal.id} className="p-5 rounded-xl shadow-lg border-2" style={{ 
              borderColor: isCompleted ? '#4CAF50' : '#87CEEB',
              backgroundColor: isCompleted ? '#F1F8F4' : '#F0F9FF'
            }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: config.color }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-extrabold" style={{ color: '#0055A4' }}>{goal.title}</h4>
                    {isCompleted && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {goal.description && (
                    <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>{goal.description}</p>
                  )}
                  {daysLeft !== null && daysLeft > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold" style={{ color: '#87CEEB' }}>
                      <Calendar className="w-3 h-3" />
                      {daysLeft} days remaining
                    </div>
                  )}
                  {daysLeft !== null && daysLeft <= 0 && !isCompleted && (
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-red-600">
                      <Calendar className="w-3 h-3" />
                      Deadline passed
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold" style={{ color: '#4A90E2' }}>Progress:</span>
                  <span className="text-xl font-extrabold" style={{ color: '#0055A4' }}>
                    {goal.goal_type === 'monthly_earnings' && '$'}
                    {goal.current_value.toLocaleString()}
                    {' / '}
                    {goal.goal_type === 'monthly_earnings' && '$'}
                    {goal.target_value.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-3" 
                  style={{ 
                    backgroundColor: '#E0E0E0',
                  }} 
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold" style={{ color: isCompleted ? '#4CAF50' : '#4A90E2' }}>
                    {progress.toFixed(1)}% Complete
                  </span>
                  {progress > 75 && !isCompleted && (
                    <Badge className="font-bold flex items-center gap-1" style={{ backgroundColor: '#FF9800' }}>
                      <Flame className="w-3 h-3" />
                      Almost there!
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
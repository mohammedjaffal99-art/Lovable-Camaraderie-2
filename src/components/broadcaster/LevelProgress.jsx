import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Award, DollarSign } from "lucide-react";

export default function LevelProgress({ broadcasterId, isOwner = false }) {
  const { data: levelGoals } = useQuery({
    queryKey: ['levelGoals'],
    queryFn: async () => {
      const goals = await base44.entities.LevelGoal.list();
      return goals.sort((a, b) => a.min_level - b.min_level);
    }
  });

  const { data: broadcaster } = useQuery({
    queryKey: ['broadcasterForLevel', broadcasterId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: broadcasterId });
      return users.length > 0 ? users[0] : null;
    },
    enabled: !!broadcasterId
  });

  const { data: sessions } = useQuery({
    queryKey: ['broadcasterEarnings', broadcasterId],
    queryFn: async () => {
      const completedSessions = await base44.entities.Session.filter({
        broadcaster_id: broadcasterId,
        status: 'completed'
      });
      return completedSessions;
    },
    enabled: !!broadcasterId
  });

  if (!levelGoals || !broadcaster || !sessions) {
    return (
      <Card className="shadow-xl border-2" style={{ borderColor: '#87CEEB' }}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto" style={{ borderColor: '#0055A4' }}></div>
        </CardContent>
      </Card>
    );
  }

  const totalEarnings = sessions.reduce((sum, s) => sum + (s.broadcaster_earnings || 0), 0);
  
  // Calculate current level
  let currentLevel = 0;
  let remainingEarnings = totalEarnings;
  let currentGoalConfig = null;
  let earningsToNextLevel = 0;
  let progressInCurrentLevel = 0;

  for (const goal of levelGoals) {
    const levelsInRange = goal.max_level - goal.min_level + 1;
    const totalNeededForRange = goal.earnings_required * levelsInRange;
    
    if (remainingEarnings >= totalNeededForRange) {
      currentLevel = goal.max_level;
      remainingEarnings -= totalNeededForRange;
    } else {
      const levelsCompleted = Math.floor(remainingEarnings / goal.earnings_required);
      currentLevel = goal.min_level + levelsCompleted;
      progressInCurrentLevel = remainingEarnings % goal.earnings_required;
      earningsToNextLevel = goal.earnings_required;
      currentGoalConfig = goal;
      break;
    }
  }

  if (!currentGoalConfig && levelGoals.length > 0) {
    currentGoalConfig = levelGoals[levelGoals.length - 1];
    earningsToNextLevel = currentGoalConfig.earnings_required;
  }

  currentLevel = Math.min(currentLevel, 90);
  
  const progressPercent = earningsToNextLevel > 0 ? (progressInCurrentLevel / earningsToNextLevel) * 100 : 100;
  const overallProgressPercent = (currentLevel / 90) * 100;

  const getRangeName = (level) => {
    if (level < 30) return 'Beginner';
    if (level < 60) return 'Experienced';
    return 'Expert';
  };

  // Audience view (larger interactive progress bar)
  if (!isOwner) {
    return (
      <div className="p-6 rounded-lg shadow-lg border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#87CEEB' }}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold px-3 py-1 rounded" style={{ backgroundColor: 'white', color: '#0055A4' }}>
              {getRangeName(currentLevel)}
            </span>
            <span className="text-lg font-bold" style={{ color: '#0055A4' }}>
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold" style={{ color: '#0055A4' }}>
              {currentLevel}
            </span>
            <div className="relative flex-1">
              <div className="h-3 rounded-full overflow-hidden shadow-inner" style={{ backgroundColor: '#fff' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: '#00BFFF',
                    width: `${progressPercent}%`
                  }}
                />
              </div>
            </div>
            <span className="text-xl font-bold" style={{ color: '#4A90E2' }}>
              {currentLevel + 1}
            </span>
          </div>
          <div className="flex justify-between text-xs font-semibold" style={{ color: '#4A90E2' }}>
            <span>Current Level</span>
            <span>Next Level</span>
          </div>
        </div>
      </div>
    );
  }

  // Streamer view (full details)
  return (
    <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-extrabold" style={{ color: '#0055A4' }}>
          <Award className="w-7 h-7" />
          Level Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Display */}
        <div className="text-center p-6 rounded-xl" style={{ background: `linear-gradient(135deg, #0055A4, #00BFFF)` }}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Award className="w-12 h-12 text-white" />
            <div className="text-left">
              <p className="text-white text-sm font-bold opacity-90">Current Level</p>
              <p className="text-white text-5xl font-extrabold">{currentLevel}</p>
            </div>
          </div>
          <p className="text-white text-lg font-bold mt-2">{getRangeName(currentLevel)}</p>
          {currentGoalConfig && (
            <div className="mt-3 pt-3 border-t-2 border-white/30">
              <p className="text-white text-sm font-bold">Commission Rate</p>
              <p className="text-white text-3xl font-extrabold">{currentGoalConfig.commission_rate}%</p>
            </div>
          )}
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold" style={{ color: '#0055A4' }}>Overall Progress to Level 90</p>
            <p className="text-sm font-bold" style={{ color: '#0055A4' }}>{currentLevel}/90</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
            <div 
              className="h-4 rounded-full shadow-md transition-all duration-500" 
              style={{ 
                width: `${overallProgressPercent}%`,
                background: 'linear-gradient(90deg, #0055A4, #00BFFF)'
              }}
            />
          </div>
          <p className="text-xs text-gray-600 text-center">{overallProgressPercent.toFixed(1)}% Complete</p>
        </div>

        {currentLevel < 90 && (
          <>
            {/* Next Level Progress */}
            <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: '#E0F4FF' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: '#0055A4' }} />
                  <p className="font-bold" style={{ color: '#0055A4' }}>Next Level: {currentLevel + 1}</p>
                </div>
                <p className="text-sm font-bold" style={{ color: '#0055A4' }}>{progressPercent.toFixed(0)}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
                <div 
                  className="h-3 rounded-full shadow-md transition-all duration-500" 
                  style={{ 
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #4A90E2, #00BFFF)'
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" style={{ color: '#4A90E2' }} />
                  <span className="font-bold" style={{ color: '#4A90E2' }}>
                    ${progressInCurrentLevel.toFixed(2)} / ${earningsToNextLevel.toFixed(2)}
                  </span>
                </div>
                <span className="text-gray-600 font-medium">
                  ${(earningsToNextLevel - progressInCurrentLevel).toFixed(2)} remaining
                </span>
              </div>
            </div>

            {/* Goal Requirements */}
            <div className="grid grid-cols-3 gap-3">
              {levelGoals.map((goal) => {
                const isCurrentRange = currentLevel >= goal.min_level && currentLevel <= goal.max_level;
                return (
                  <div
                    key={goal.level_range}
                    className={`p-3 rounded-lg text-center border-2 ${isCurrentRange ? 'shadow-lg' : ''}`}
                    style={{
                      borderColor: isCurrentRange ? '#00BFFF' : '#E0F4FF',
                      backgroundColor: isCurrentRange ? '#E0F4FF' : '#FAFAFA'
                    }}
                  >
                    <p className="text-xs font-bold text-gray-600 uppercase">{goal.level_range}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: '#0055A4' }}>
                      Levels {goal.min_level}-{goal.max_level}
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-600">Per Level</p>
                      <p className="text-lg font-extrabold" style={{ color: '#00BFFF' }}>
                        ${goal.earnings_required.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-600">Commission</p>
                      <p className="text-lg font-extrabold" style={{ color: '#16A34A' }}>
                        {goal.commission_rate}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {currentLevel === 90 && (
          <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
            <Award className="w-16 h-16 mx-auto mb-3 text-green-600" />
            <p className="text-2xl font-extrabold text-green-800">Maximum Level Reached!</p>
            <p className="text-green-600 mt-2">Congratulations on reaching the highest level!</p>
          </div>
        )}

        {/* Total Earnings Display */}
        <div className="p-4 rounded-lg border-2" style={{ borderColor: '#00BFFF', backgroundColor: '#E0F4FF' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#0055A4' }} />
              <span className="font-bold" style={{ color: '#0055A4' }}>Total Earnings</span>
            </div>
            <span className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>
              ${totalEarnings.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
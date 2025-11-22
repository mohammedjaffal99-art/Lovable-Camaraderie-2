import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Target, TrendingUp } from "lucide-react";
import { showToast } from "@/components/ui/toast-utils";

export default function GoalsManagement() {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [goals, setGoals] = useState({
    beginner: { earnings_required: 5000, commission_rate: 30 },
    experienced: { earnings_required: 9000, commission_rate: 45 },
    expert: { earnings_required: 10000, commission_rate: 60 }
  });

  const { data: levelGoals, isLoading } = useQuery({
    queryKey: ['levelGoals'],
    queryFn: async () => {
      const records = await base44.entities.LevelGoal.list();
      return records;
    }
  });

  React.useEffect(() => {
    if (levelGoals && levelGoals.length > 0) {
      const goalsMap = {};
      levelGoals.forEach(goal => {
        goalsMap[goal.level_range] = {
          earnings_required: goal.earnings_required,
          commission_rate: goal.commission_rate
        };
      });
      setGoals(goalsMap);
    }
  }, [levelGoals]);

  const updateGoalsMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        {
          level_range: 'beginner',
          min_level: 0,
          max_level: 30,
          earnings_required: goals.beginner.earnings_required,
          commission_rate: goals.beginner.commission_rate
        },
        {
          level_range: 'experienced',
          min_level: 31,
          max_level: 60,
          earnings_required: goals.experienced.earnings_required,
          commission_rate: goals.experienced.commission_rate
        },
        {
          level_range: 'expert',
          min_level: 61,
          max_level: 90,
          earnings_required: goals.expert.earnings_required,
          commission_rate: goals.expert.commission_rate
        }
      ];

      for (const update of updates) {
        const existing = levelGoals?.find(g => g.level_range === update.level_range);
        if (existing) {
          await base44.entities.LevelGoal.update(existing.id, update);
        } else {
          await base44.entities.LevelGoal.create(update);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['levelGoals']);
      setEditMode(false);
      showToast.success('Level goals updated successfully!');
    },
    onError: () => {
      showToast.error('Failed to update level goals');
    }
  });

  const handleSave = () => {
    updateGoalsMutation.mutate();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-4" style={{ borderColor: '#0055A4' }}></div></div>;
  }

  return (
    <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-extrabold" style={{ color: '#0055A4' }}>
            <Target className="w-7 h-7" />
            Leveling Goals Configuration
          </CardTitle>
          <Button
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            disabled={updateGoalsMutation.isPending}
            className="font-bold shadow-lg"
            style={{ backgroundColor: editMode ? '#16A34A' : '#0055A4' }}
          >
            {editMode ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              'Edit Goals'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          {/* Beginner */}
          <Card className="border-2" style={{ borderColor: '#87CEEB' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#0055A4' }}>
                <TrendingUp className="w-5 h-5" />
                Beginner (Levels 0-30)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Earnings Required (USD)</Label>
                <Input
                  type="number"
                  value={goals.beginner.earnings_required}
                  onChange={(e) => setGoals({...goals, beginner: {...goals.beginner, earnings_required: parseFloat(e.target.value)}})}
                  disabled={!editMode}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Amount needed to advance from one level to next</p>
              </div>
              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Commission Rate (%)</Label>
                <Input
                  type="number"
                  value={goals.beginner.commission_rate}
                  onChange={(e) => setGoals({...goals, beginner: {...goals.beginner, commission_rate: parseFloat(e.target.value)}})}
                  disabled={!editMode}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Streamer commission percentage</p>
              </div>
            </CardContent>
          </Card>

          {/* Experienced */}
          <Card className="border-2" style={{ borderColor: '#87CEEB' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#0055A4' }}>
                <TrendingUp className="w-5 h-5" />
                Experienced (Levels 31-60)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Earnings Required (USD)</Label>
                <Input
                  type="number"
                  value={goals.experienced.earnings_required}
                  onChange={(e) => setGoals({...goals, experienced: {...goals.experienced, earnings_required: parseFloat(e.target.value)}})}
                  disabled={!editMode}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Amount needed to advance from one level to next</p>
              </div>
              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Commission Rate (%)</Label>
                <Input
                  type="number"
                  value={goals.experienced.commission_rate}
                  onChange={(e) => setGoals({...goals, experienced: {...goals.experienced, commission_rate: parseFloat(e.target.value)}})}
                  disabled={!editMode}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Streamer commission percentage</p>
              </div>
            </CardContent>
          </Card>

          {/* Expert */}
          <Card className="border-2" style={{ borderColor: '#87CEEB' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#0055A4' }}>
                <TrendingUp className="w-5 h-5" />
                Expert (Levels 61-90)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Earnings Required (USD)</Label>
                <Input
                  type="number"
                  value={goals.expert.earnings_required}
                  onChange={(e) => setGoals({...goals, expert: {...goals.expert, earnings_required: parseFloat(e.target.value)}})}
                  disabled={!editMode}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Amount needed to advance from one level to next</p>
              </div>
              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Commission Rate (%)</Label>
                <Input
                  type="number"
                  value={goals.expert.commission_rate}
                  onChange={(e) => setGoals({...goals, expert: {...goals.expert, commission_rate: parseFloat(e.target.value)}})}
                  disabled={!editMode}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Streamer commission percentage</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: '#E0F4FF' }}>
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Changes to level goals will affect all streamers' progression and commission rates. 
            Current earnings progress will be recalculated based on the new requirements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function TargetManagement() {
  const [targetAmount, setTargetAmount] = useState('');
  const queryClient = useQueryClient();

  const { data: targetSetting } = useQuery({
    queryKey: ['platformTarget'],
    queryFn: async () => {
      const settings = await base44.entities.PlatformSettings.filter({ setting_key: 'monthly_target' });
      return settings[0] || null;
    },
    initialData: null,
  });

  const { data: currentMonthRevenue } = useQuery({
    queryKey: ['currentMonthRevenue'],
    queryFn: async () => {
      const sessions = await base44.entities.Session.list();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthSessions = sessions.filter(s => {
        if (s.status !== 'completed') return false;
        const sessionDate = new Date(s.created_date);
        return sessionDate >= startOfMonth;
      });

      return monthSessions.reduce((sum, s) => sum + (s.total_price || 0), 0);
    },
    refetchInterval: 10000,
    initialData: 0,
  });

  const setTargetMutation = useMutation({
    mutationFn: async (amount) => {
      if (targetSetting) {
        await base44.entities.PlatformSettings.update(targetSetting.id, {
          setting_value: amount.toString(),
          setting_type: 'general',
          description: `Monthly revenue target set to $${amount}`
        });
      } else {
        await base44.entities.PlatformSettings.create({
          setting_key: 'monthly_target',
          setting_value: amount.toString(),
          setting_type: 'general',
          description: `Monthly revenue target set to $${amount}`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['platformTarget']);
      setTargetAmount('');
      alert('Monthly target updated successfully!');
    },
  });

  const handleSetTarget = (e) => {
    e.preventDefault();
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setTargetMutation.mutate(amount);
  };

  const target = targetSetting ? parseFloat(targetSetting.setting_value) : 0;
  const remaining = Math.max(0, target - currentMonthRevenue);
  const progressPercentage = target > 0 ? Math.min(100, (currentMonthRevenue / target) * 100) : 0;
  const isCompleted = target > 0 && currentMonthRevenue >= target;

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Set Target Form */}
      <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Set Monthly Revenue Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetTarget} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="target">Target Amount (USD)</Label>
              <Input
                id="target"
                type="number"
                step="0.01"
                min="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Enter monthly target amount"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={setTargetMutation.isPending}
                style={{ backgroundColor: '#11009E' }}
              >
                Set Target
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Progress */}
      <Card className="border-2" style={{ borderColor: '#00BFFF' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {currentMonth} Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {target === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No target set for this month</p>
              <p className="text-sm">Set a target above to start tracking</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-900">Target</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">${target.toFixed(2)}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-semibold text-green-900">Achieved</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">${currentMonthRevenue.toFixed(2)}</p>
                </div>

                <div className={`${isCompleted ? 'bg-purple-50' : 'bg-orange-50'} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className={`w-4 h-4 ${isCompleted ? 'text-purple-600' : 'text-orange-600'}`} />
                    <p className={`text-sm font-semibold ${isCompleted ? 'text-purple-900' : 'text-orange-900'}`}>
                      {isCompleted ? 'Exceeded by' : 'Remaining'}
                    </p>
                  </div>
                  <p className={`text-2xl font-bold ${isCompleted ? 'text-purple-600' : 'text-orange-600'}`}>
                    ${isCompleted ? (currentMonthRevenue - target).toFixed(2) : remaining.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">Progress</span>
                  <span className="text-sm font-bold" style={{ color: '#11009E' }}>
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-4" />
              </div>

              {isCompleted && (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-bold text-lg">🎉 Target Completed!</p>
                  <p className="text-green-600 text-sm">Great job reaching this month's revenue goal!</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp, Users, DollarSign, Video, CheckCircle2, Trash2, Edit, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const GOAL_TYPE_CONFIG = {
  followers: { icon: Users, label: 'Followers', unit: 'followers', color: '#E91E63' },
  monthly_earnings: { icon: DollarSign, label: 'Monthly Earnings', unit: '$', color: '#4CAF50' },
  total_sessions: { icon: Video, label: 'Total Sessions', unit: 'sessions', color: '#2196F3' },
  level: { icon: TrendingUp, label: 'Level Up', unit: 'level', color: '#FF9800' },
  custom: { icon: Target, label: 'Custom Goal', unit: '', color: '#9C27B0' }
};

export default function GoalManager({ broadcaster, onGoalUpdate }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'followers',
    target_value: '',
    deadline: '',
    is_public: true,
    notify_on_complete: true
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['broadcasterGoals', broadcaster?.id],
    queryFn: async () => {
      if (!broadcaster?.id) return [];
      return await base44.entities.StreamingGoal.filter(
        { broadcaster_id: broadcaster.id },
        '-created_date',
        50
      );
    },
    enabled: !!broadcaster?.id,
    initialData: [],
  });

  const { data: followersCount } = useQuery({
    queryKey: ['followersCount', broadcaster?.id],
    queryFn: async () => {
      if (!broadcaster?.id) return 0;
      const favorites = await base44.entities.Favorite.filter({ broadcaster_id: broadcaster.id });
      return favorites.length;
    },
    enabled: !!broadcaster?.id,
    initialData: 0,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => {
      const currentValue = getCurrentValue(goalData.goal_type);
      return await base44.entities.StreamingGoal.create({
        ...goalData,
        broadcaster_id: broadcaster.id,
        current_value: currentValue,
        target_value: parseFloat(goalData.target_value)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['broadcasterGoals']);
      setShowDialog(false);
      resetForm();
      toast.success('Goal created successfully!');
      if (onGoalUpdate) onGoalUpdate();
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.StreamingGoal.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['broadcasterGoals']);
      setShowDialog(false);
      setEditingGoal(null);
      resetForm();
      toast.success('Goal updated successfully!');
      if (onGoalUpdate) onGoalUpdate();
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId) => {
      return await base44.entities.StreamingGoal.delete(goalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['broadcasterGoals']);
      toast.success('Goal deleted');
      if (onGoalUpdate) onGoalUpdate();
    },
  });

  const getCurrentValue = (goalType) => {
    switch (goalType) {
      case 'followers':
        return followersCount;
      case 'monthly_earnings':
        return broadcaster.monthly_earnings || 0;
      case 'total_sessions':
        return broadcaster.total_sessions || 0;
      case 'level':
        return broadcaster.level || 0;
      default:
        return 0;
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal_type: 'followers',
      target_value: '',
      deadline: '',
      is_public: true,
      notify_on_complete: true
    });
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      goal_type: goal.goal_type,
      target_value: goal.target_value,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      is_public: goal.is_public,
      notify_on_complete: goal.notify_on_complete
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.target_value) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingGoal) {
      updateGoalMutation.mutate({
        id: editingGoal.id,
        data: {
          ...formData,
          deadline: formData.deadline || null
        }
      });
    } else {
      createGoalMutation.mutate({
        ...formData,
        deadline: formData.deadline || null
      });
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-7 h-7" style={{ color: '#0055A4' }} />
          <div>
            <h2 className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>My Streaming Goals</h2>
            <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>Set goals to motivate yourself and engage your audience</p>
          </div>
        </div>

        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingGoal(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="font-bold shadow-lg" style={{ backgroundColor: '#0055A4' }}>
              <Plus className="w-5 h-5 mr-2" />
              Create New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-4" style={{ borderColor: '#00BFFF' }}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </DialogTitle>
              <DialogDescription className="font-semibold" style={{ color: '#4A90E2' }}>
                Set a goal to track your progress and motivate your audience
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Goal Type *</Label>
                <Select
                  value={formData.goal_type}
                  onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_TYPE_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: config.color }} />
                            {config.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Goal Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Reach 1000 Followers"
                  className="font-semibold"
                  required
                />
              </div>

              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell your followers why this goal matters to you..."
                  className="h-20 font-semibold"
                />
              </div>

              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Target Value *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  placeholder={`e.g., ${formData.goal_type === 'followers' ? '1000' : formData.goal_type === 'monthly_earnings' ? '500' : '100'}`}
                  className="font-semibold"
                  required
                />
              </div>

              <div>
                <Label className="font-bold" style={{ color: '#0055A4' }}>Deadline (Optional)</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="font-semibold"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
                  <div>
                    <Label htmlFor="is_public" className="font-bold cursor-pointer" style={{ color: '#0055A4' }}>Public Goal</Label>
                    <p className="text-xs font-semibold" style={{ color: '#4A90E2' }}>Visible on your profile to all viewers</p>
                  </div>
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
                  <div>
                    <Label htmlFor="notify_followers" className="font-bold cursor-pointer" style={{ color: '#0055A4' }}>Notify Followers</Label>
                    <p className="text-xs font-semibold" style={{ color: '#4A90E2' }}>Send notification when goal is completed</p>
                  </div>
                  <Switch
                    id="notify_followers"
                    checked={formData.notify_on_complete}
                    onCheckedChange={(checked) => setFormData({ ...formData, notify_on_complete: checked })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingGoal(null);
                    resetForm();
                  }}
                  className="flex-1 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                  className="flex-1 font-bold shadow-lg"
                  style={{ backgroundColor: '#0055A4' }}
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <Card className="shadow-xl border-4" style={{ borderColor: '#87CEEB' }}>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4" style={{ color: '#87CEEB' }} />
            <p className="text-xl font-bold mb-2" style={{ color: '#4A90E2' }}>No Goals Yet</p>
            <p className="font-semibold mb-6" style={{ color: '#87CEEB' }}>Create your first goal to track your progress and engage followers!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold" style={{ color: '#0055A4' }}>Active Goals</h3>
              {activeGoals.map((goal) => {
                const config = GOAL_TYPE_CONFIG[goal.goal_type];
                const Icon = config.icon;
                const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                const isCompleted = goal.current_value >= goal.target_value;

                return (
                  <Card key={goal.id} className="shadow-xl border-4" style={{ borderColor: isCompleted ? '#4CAF50' : '#00BFFF' }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: config.color }}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-xl font-extrabold" style={{ color: '#0055A4' }}>{goal.title}</h4>
                              {goal.is_public && (
                                <Badge variant="outline" className="text-xs font-bold">Public</Badge>
                              )}
                            </div>
                            {goal.description && (
                              <p className="text-sm font-semibold mb-2" style={{ color: '#4A90E2' }}>{goal.description}</p>
                            )}
                            {goal.deadline && (
                              <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#87CEEB' }}>
                                <Calendar className="w-3 h-3" />
                                Deadline: {new Date(goal.deadline).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(goal)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" style={{ color: '#4A90E2' }} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this goal?')) {
                                deleteGoalMutation.mutate(goal.id);
                              }
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold" style={{ color: '#4A90E2' }}>Progress:</span>
                          <span className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>
                            {goal.goal_type === 'monthly_earnings' && '$'}
                            {goal.current_value.toLocaleString()}
                            {' / '}
                            {goal.goal_type === 'monthly_earnings' && '$'}
                            {goal.target_value.toLocaleString()}
                            {' '}
                            {config.unit}
                          </span>
                        </div>
                        <Progress value={progress} className="h-4" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold" style={{ color: isCompleted ? '#4CAF50' : '#4A90E2' }}>
                            {progress.toFixed(1)}% Complete
                          </span>
                          {isCompleted && (
                            <Badge className="font-bold" style={{ backgroundColor: '#4CAF50' }}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Goal Reached!
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold flex items-center gap-2" style={{ color: '#4A90E2' }}>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Completed Goals
              </h3>
              {completedGoals.map((goal) => {
                const config = GOAL_TYPE_CONFIG[goal.goal_type];
                const Icon = config.icon;

                return (
                  <Card key={goal.id} className="shadow-lg border-2 opacity-80" style={{ borderColor: '#4CAF50', backgroundColor: '#F1F8F4' }}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" style={{ color: config.color }} />
                          <div>
                            <p className="font-bold" style={{ color: '#0055A4' }}>{goal.title}</p>
                            <p className="text-xs font-semibold text-gray-600">
                              Completed on {new Date(goal.completed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
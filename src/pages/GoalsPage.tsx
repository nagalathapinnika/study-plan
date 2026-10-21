import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Award,
  CheckCircle2,
  Flame,
  Zap,
  Clock,
  Sparkles,
  Trash2,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.js';
import { Goal, Achievement } from '../types.js';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    targetMetric: 'study_hours' as 'study_hours' | 'quizzes_completed' | 'tasks_completed' | 'quiz_score_pct',
    targetValue: 15
  });
  const [saving, setSaving] = useState(false);

  const fetchGoalsAndBadges = async () => {
    try {
      setLoading(true);
      const [goalsData, achData] = await Promise.all([
        api.getGoals(),
        api.getAchievements()
      ]);
      setGoals(goalsData);
      setAchievements(achData);
    } catch (err) {
      console.error('Failed to load goals & achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndBadges();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    try {
      setSaving(true);
      await api.createGoal(newGoal);
      setShowModal(false);
      setNewGoal({
        title: '',
        description: '',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        targetMetric: 'study_hours',
        targetValue: 15
      });
      await fetchGoalsAndBadges();
      confetti({ particleCount: 50, spread: 50 });
    } catch (err: any) {
      alert(err.message || 'Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      await fetchGoalsAndBadges();
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />;
      case 'Zap': return <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />;
      case 'Clock': return <Clock className="w-5 h-5 text-purple-500" />;
      case 'CheckCircle': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-indigo-500" />;
      default: return <Award className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Student Milestone System
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Verified Progress
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Academic Goals & Milestone Badges
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Set concrete study targets and earn achievement badges through real study sessions and quizzes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Active Learning Goals */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Active Learning Goals</h3>
          <span className="text-xs text-slate-500">
            {goals.filter(g => g.status === 'achieved').length} of {goals.length} Completed
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No goals created yet. Click &quot;Set New Goal&quot; above to establish a target!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(goal => {
              const pct = Math.min(100, Math.round((goal.currentProgress / goal.targetValue) * 100));

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    goal.status === 'achieved'
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-slate-50/60 border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        goal.status === 'achieved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {goal.status === 'achieved' ? 'Achieved' : 'In Progress'}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        Target: {goal.targetDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-xs text-slate-600 mt-0.5">{goal.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                      <span>Progress: {goal.currentProgress} / {goal.targetValue}</span>
                      <span className="font-bold text-slate-900">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.status === 'achieved' ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievement Badges Catalog */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Milestone Achievements</h3>
        <p className="text-xs text-slate-500 mb-4">Badges automatically unlock based on verified platform study actions</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.badgeId}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                ach.isUnlocked
                  ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-2 shadow-xs">
                {getBadgeIcon(ach.icon)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">{ach.title}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{ach.description}</p>
              </div>
              <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                ach.isUnlocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {ach.isUnlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Define Learning Goal</h3>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g. Complete 15 study hours this week"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Metric</label>
                <select
                  value={newGoal.targetMetric}
                  onChange={e => setNewGoal({ ...newGoal, targetMetric: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="study_hours">Study Hours Logged</option>
                  <option value="quizzes_completed">Practice Quizzes Completed</option>
                  <option value="tasks_completed">Study Plan Tasks Finished</option>
                  <option value="quiz_score_pct">Target Quiz Score Percentage</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Value</label>
                  <input
                    type="number"
                    min="1"
                    value={newGoal.targetValue}
                    onChange={e => setNewGoal({ ...newGoal, targetValue: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newGoal.description}
                  onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Why is this milestone important for your academics?"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  {saving ? 'Creating...' : 'Set Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

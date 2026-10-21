import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Target,
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { api } from '../services/api.js';

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, subjRes, trendsRes] = await Promise.all([
          api.getProgressSummary(),
          api.getProgressSubjects(),
          api.getProgressTrends()
        ]);
        setSummary(sumRes);
        setSubjects(subjRes);
        setTrends(trendsRes);
      } catch (err) {
        console.error('Failed to load progress analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading progress analytics...</div>;
  }

  const m = summary?.metrics;
  const strongest = [...subjects].filter(s => s.avgScore !== null).sort((a, b) => b.avgScore - a.avgScore)[0];
  const weakest = [...subjects].filter(s => s.avgScore !== null).sort((a, b) => a.avgScore - b.avgScore)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Data-Driven Evaluation
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Behavioral & Assessment Metrics
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Learning Progress & Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent metrics calculated strictly from your completed tasks, logged study time, and quiz assessments.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Task Completion Rate
          </span>
          <p className="text-2xl font-bold text-slate-900">{m?.taskCompletionPct || 0}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${m?.taskCompletionPct || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">{m?.completedTasks || 0} of {m?.totalTasks || 0} tasks</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Study Hours
          </span>
          <p className="text-2xl font-bold text-slate-900">{m?.totalStudyHours || 0} hrs</p>
          <p className="text-[11px] text-slate-500 mt-2">Verified stopwatch logs</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Quiz Average Score
          </span>
          <p className="text-2xl font-bold text-slate-900">{m?.avgQuizScore || 0}%</p>
          <p className="text-[11px] text-purple-700 mt-2 font-medium">{m?.totalQuizzes || 0} quiz attempts recorded</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Goals Achieved
          </span>
          <p className="text-2xl font-bold text-slate-900">{m?.achievedGoals || 0} / {m?.totalGoals || 0}</p>
          <p className="text-[11px] text-emerald-700 mt-2 font-medium">Active milestone targets</p>
        </div>
      </div>

      {/* Strongest & Weakest Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Strongest Subject
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              {strongest ? `${strongest.subject} (${strongest.avgScore}%)` : 'Not enough data'}
            </h4>
            <p className="text-[11px] text-emerald-800 mt-0.5">Consistently high assessment scores</p>
          </div>
          <Award className="w-8 h-8 text-emerald-600 shrink-0 opacity-80" />
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Focus Subject (Needs Review)
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              {weakest ? `${weakest.subject} (${weakest.avgScore}%)` : 'Not enough data'}
            </h4>
            <p className="text-[11px] text-amber-800 mt-0.5">Prioritize in your upcoming study plan</p>
          </div>
          <Target className="w-8 h-8 text-amber-600 shrink-0 opacity-80" />
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Score History Trend Line */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quiz Score Progression</h3>
              <p className="text-xs text-slate-500">Historical percentage scores over time</p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score %"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ fill: '#2563eb', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Take at least 2 practice assessments to plot score progression trends
              </div>
            )}
          </div>
        </div>

        {/* Subject-Wise Task Completion vs Study Hours */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject Study Hours</h3>
              <p className="text-xs text-slate-500">Total deep-work hours spent per subject</p>
            </div>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>

          <div className="h-64 w-full">
            {subjects.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Bar dataKey="studyHours" name="Study Hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No subject study data recorded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Subject Mastery Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Subject Mastery Breakdown</h3>
        <p className="text-xs text-slate-500 mb-4">Comprehensive performance audit across curriculum subjects</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5">Subject</th>
                <th className="pb-2.5">Mastery Status</th>
                <th className="pb-2.5">Avg Score</th>
                <th className="pb-2.5">Study Hours</th>
                <th className="pb-2.5">Task Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subjects.map(s => (
                <tr key={s.subject} className="hover:bg-slate-50/60">
                  <td className="py-3 font-bold text-slate-900">{s.subject}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.masteryStatus === 'Proficient'
                        ? 'bg-emerald-50 text-emerald-700'
                        : s.masteryStatus === 'Needs Focus'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {s.masteryStatus}
                    </span>
                  </td>
                  <td className="py-3 font-semibold">{s.avgScore !== null ? `${s.avgScore}%` : 'N/A'}</td>
                  <td className="py-3">{s.studyHours} hrs</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${s.taskPct}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-500">{s.tasksDone}/{s.tasksTotal}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparent Methodology Explainer */}
      <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Calculation Methodology & Transparency Notice</span>
        </div>
        <p>• {summary?.methodologyNotes?.completionRate}</p>
        <p>• {summary?.methodologyNotes?.quizScoreAverage}</p>
        <p>• {summary?.methodologyNotes?.learningRecommendations}</p>
      </div>
    </div>
  );
};

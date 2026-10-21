import React, { useState, useEffect } from 'react';
import {
  Repeat,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { RevisionSchedule } from '../types.js';

export const RevisionsPage: React.FC = () => {
  const [revisions, setRevisions] = useState<RevisionSchedule[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Manual revision schedule modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [manualSubject, setManualSubject] = useState('Data Structures & Algorithms');
  const [manualTopic, setManualTopic] = useState('Binary Search Trees');
  const [manualInterval, setManualInterval] = useState(3);
  const [saving, setSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const [revData, subjData] = await Promise.all([
        api.getRevisions(),
        api.getSubjects()
      ]);
      setRevisions(revData.revisions || []);
      setDueCount(revData.dueCount || 0);
      setUpcomingCount(revData.upcomingCount || 0);
      setSubjects(subjData);
    } catch (err) {
      console.error('Failed to load revision planner:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  const handleMarkRevised = async (id: string) => {
    try {
      setReviewingId(id);
      const res = await api.completeRevision(id);
      alert(res.message);
      await fetchRevisions();
    } catch (err: any) {
      alert(err.message || 'Failed to complete revision');
    } finally {
      setReviewingId(null);
    }
  };

  const handleCreateManualRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.createRevision({
        subject: manualSubject,
        topic: manualTopic,
        intervalDays: manualInterval
      });
      setShowAddModal(false);
      await fetchRevisions();
    } catch (err: any) {
      alert(err.message || 'Failed to create revision item');
    } finally {
      setSaving(false);
    }
  };

  const currentTopics = subjects.find(s => s.name === manualSubject)?.topics || [
    'General Topic',
    'Algorithm Review',
    'Practice Problems'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Spaced Repetition Algorithm
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Ebbinghaus Retention Curve
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Smart Revision Planner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritizes low-accuracy topics first, then stretches intervals to 3, 7, and 14 days as retention cements.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Topic Review</span>
        </button>
      </div>

      {/* Summary Alert Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          dueCount > 0 ? 'bg-rose-50/80 border-rose-200 text-rose-900' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {dueCount > 0 ? 'Action Required' : 'All Caught Up'}
            </span>
            <h4 className="text-lg font-bold mt-0.5">
              {dueCount} Review(s) Due Today
            </h4>
            <p className="text-xs opacity-80 mt-0.5">
              {dueCount > 0 ? 'Review these to prevent forgetting' : 'Zero overdue spaced reviews'}
            </p>
          </div>
          <Repeat className={`w-8 h-8 opacity-80 ${dueCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Future Reviews Scheduled
            </span>
            <h4 className="text-lg font-bold mt-0.5">
              {upcomingCount} Spaced Interval(s)
            </h4>
            <p className="text-xs opacity-80 mt-0.5">
              Scheduled ahead based on recent quiz scores
            </p>
          </div>
          <Calendar className="w-8 h-8 text-blue-600 opacity-80" />
        </div>
      </div>

      {/* Revisions List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Active Revision Queue</h3>
        <p className="text-xs text-slate-500 mb-4">Click &quot;Mark Reviewed&quot; once you refresh formulas or solve practice exercises</p>

        {revisions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No topics in the revision queue yet. Taking quizzes automatically populates this planner!
          </div>
        ) : (
          <div className="space-y-3">
            {revisions.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  item.status === 'Due'
                    ? 'bg-rose-50/40 border-rose-200/90'
                    : 'bg-slate-50/50 border-slate-200/80'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] mb-1">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      item.status === 'Due' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                    <span className="font-semibold text-blue-600">{item.subject}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">Repetition #{item.repetitionCount}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {item.topic}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>
                      Last Quiz Accuracy: <strong className="text-slate-700">{item.lastQuizScore}%</strong>
                    </span>
                    <span>
                      Target Review Date: <strong className="text-slate-700">{item.nextReviewDate}</strong>
                    </span>
                    <span>
                      Current Interval: <strong className="text-slate-700">{item.intervalDays} days</strong>
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleMarkRevised(item.id)}
                    disabled={reviewingId === item.id}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                      item.status === 'Due'
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{reviewingId === item.id ? 'Advancing Interval...' : 'Mark Reviewed'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Schedule Revision Interval</h3>

            <form onSubmit={handleCreateManualRevision} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={manualSubject}
                  onChange={e => {
                    setManualSubject(e.target.value);
                    const s = subjects.find(sub => sub.name === e.target.value);
                    if (s && s.topics.length > 0) setManualTopic(s.topics[0]);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                <select
                  value={manualTopic}
                  onChange={e => setManualTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  {currentTopics.map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Interval (Days)</label>
                <select
                  value={manualInterval}
                  onChange={e => setManualInterval(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value={1}>1 Day (Immediate / Difficult)</option>
                  <option value={3}>3 Days (Standard Recall)</option>
                  <option value={7}>7 Days (Consolidated)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  {saving ? 'Scheduling...' : 'Add to Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  ThumbsUp,
  ThumbsDown,
  History,
  FileText
} from 'lucide-react';
import { api } from '../services/api.js';
import { StudySession } from '../types.js';

export const TrackerPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [history, setHistory] = useState<StudySession[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [productivityRate, setProductivityRate] = useState(100);
  const [loading, setLoading] = useState(true);

  // Active Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Form selections
  const [selectedSubject, setSelectedSubject] = useState('Data Structures & Algorithms');
  const [selectedTopic, setSelectedTopic] = useState('Binary Search Trees');
  const [plannedDuration, setPlannedDuration] = useState(45);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isProductive, setIsProductive] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHistoryAndMetadata = async () => {
    try {
      setLoading(true);
      const [subs, histRes] = await Promise.all([
        api.getSubjects(),
        api.getStudySessionsHistory()
      ]);
      setSubjects(subs);
      setHistory(histRes.sessions || []);
      setTotalMinutes(histRes.totalMinutes || 0);
      setProductivityRate(histRes.productivityRate || 100);

      // Check if an active session exists
      const active = (histRes.sessions || []).find((s: StudySession) => s.status === 'active');
      if (active) {
        setActiveSessionId(active.id);
        setSelectedSubject(active.subject);
        setSelectedTopic(active.topic);
        const elapsed = Math.round((Date.now() - new Date(active.startTime).getTime()) / 1000);
        setSecondsElapsed(Math.max(0, elapsed));
        setIsTimerRunning(true);
      }
    } catch (err) {
      console.error('Failed to load study tracker history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndMetadata();
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const handleStartSession = async () => {
    try {
      const res = await api.startStudySession({
        subject: selectedSubject,
        topic: selectedTopic,
        plannedDuration
      });
      setActiveSessionId(res.id);
      setSecondsElapsed(0);
      setIsTimerRunning(true);
    } catch (err: any) {
      alert(err.message || 'Failed to start session');
    }
  };

  const handlePauseResume = async () => {
    if (!activeSessionId) return;
    try {
      if (isTimerRunning) {
        await api.pauseStudySession(activeSessionId);
        setIsTimerRunning(false);
      } else {
        await api.resumeStudySession(activeSessionId);
        setIsTimerRunning(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update timer state');
    }
  };

  const handleStopSession = () => {
    setIsTimerRunning(false);
    setShowCompletionModal(true);
  };

  const submitCompletedSession = async () => {
    if (!activeSessionId) return;
    const actualMins = Math.max(1, Math.round(secondsElapsed / 60));

    try {
      await api.completeStudySession(activeSessionId, {
        actualDuration: actualMins,
        notes: sessionNotes,
        isProductive
      });

      setShowCompletionModal(false);
      setActiveSessionId(null);
      setSecondsElapsed(0);
      setSessionNotes('');
      await fetchHistoryAndMetadata();
    } catch (err: any) {
      alert(err.message || 'Failed to complete session');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentTopics = subjects.find(s => s.name === selectedSubject)?.topics || [
    'Core Fundamentals',
    'Algorithm Analysis',
    'Applied Projects'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Deep Work Engine
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Behavior & Focus Logging
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Study Session & Habit Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log focused study periods, compare planned vs actual durations, and rate session productivity.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged Study Hours</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {Math.round((totalMinutes / 60) * 10) / 10} <span className="text-xs font-normal text-slate-500">hours</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Across {history.length} logged sessions</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity Rate</span>
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {productivityRate}%
          </p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Self-rated productive study</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Focus Status</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {activeSessionId ? (isTimerRunning ? 'Deep Focus' : 'Paused') : 'Idle'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {activeSessionId ? `${selectedTopic}` : 'Ready for next study block'}
          </p>
        </div>
      </div>

      {/* Timer & Session Controller Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stopwatch Controller Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between text-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-4">
              <Timer className="w-3.5 h-3.5" />
              <span>Interactive Pomodoro / Stopwatch</span>
            </span>

            {/* Huge Timer Digits */}
            <div className="py-6 font-mono text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight">
              {formatTime(secondsElapsed)}
            </div>

            <p className="text-xs text-slate-500">
              Planned target: <span className="font-semibold text-slate-800">{plannedDuration} minutes</span>
            </p>
          </div>

          {/* Controls */}
          <div className="pt-6 flex justify-center gap-3">
            {!activeSessionId ? (
              <button
                onClick={handleStartSession}
                className="w-full py-3 px-6 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Focus Session</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-700" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStopSession}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>End Session</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Session Configuration Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Configure Study Block</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubject}
              disabled={!!activeSessionId}
              onChange={e => {
                setSelectedSubject(e.target.value);
                const s = subjects.find(sub => sub.name === e.target.value);
                if (s && s.topics.length > 0) setSelectedTopic(s.topics[0]);
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
              value={selectedTopic}
              disabled={!!activeSessionId}
              onChange={e => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
            >
              {currentTopics.map((t: string) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Planned Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 45, 60, 90].map(mins => (
                <button
                  type="button"
                  key={mins}
                  disabled={!!activeSessionId}
                  onClick={() => setPlannedDuration(mins)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    plannedDuration === mins
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Study History Card (1 Col) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Session Logs</h3>
            <History className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-72">
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No completed sessions logged yet.</p>
            ) : (
              history.map(s => (
                <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span className="truncate pr-2">{s.topic}</span>
                    <span className="text-blue-600 font-mono text-[11px] shrink-0">{s.actualDuration}m</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{s.subject}</span>
                    <span>{s.startTime.split('T')[0]}</span>
                  </div>
                  {s.notes && (
                    <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-1 border-t border-slate-200/60 pt-1">
                      &quot;{s.notes}&quot;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Record Session Summary</h3>
            <p className="text-xs text-slate-500">
              You studied <span className="font-semibold text-slate-800">{selectedTopic}</span> for{' '}
              <span className="font-semibold text-blue-600">{Math.max(1, Math.round(secondsElapsed / 60))} minutes</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Was this session productive?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductive(true)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    isProductive
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Productive</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductive(false)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    !isProductive
                      ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>Distracted / Interrupted</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Personal Reflections or Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                placeholder="What did you accomplish? Any problems that were tricky?"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCompletedSession}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Save Session Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

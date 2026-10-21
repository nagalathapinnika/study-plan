import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Sparkles,
  BookOpen,
  HelpCircle,
  Timer,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Award,
  TrendingUp,
  RefreshCw,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import { api } from '../services/api.js';
import { StudyTask } from '../types.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, actRes, tasksRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardActivity(),
        api.getStudyTasks({ status: 'Pending' })
      ]);
      setSummary(sumRes);
      setActivity(actRes);
      setUpcomingTasks(tasksRes.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkTaskCompleted = async (taskId: string) => {
    try {
      setUpdatingTaskId(taskId);
      await api.updateStudyTask(taskId, { status: 'Completed' });
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading && !summary) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
        <p className="text-xs font-medium">Loading personalized student analytics...</p>
      </div>
    );
  }

  const isBrandNewStudent = !summary || (summary.completedLessons === 0 && summary.pendingTasks === 0 && summary.totalStudyHours === 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Banner & Quick Actions */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Student Control Center
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Overall Progress: {summary?.overallLearningProgress || 0}%
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hello, {summary?.studentName || 'Student'}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Here is your dynamic learning pulse. Complete your daily study slots, reinforce weak concepts, and maintain your streak.
          </p>
        </div>

        {/* 5 Quick Action Buttons with motion */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/study-plan')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Generate Plan</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/quizzes')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Start Quiz</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/resources')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Resources</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/tutor')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Tutor</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/tracker')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Record Session</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Empty State for New Users */}
      {isBrandNewStudent && (
        <motion.div
          variants={itemVariants}
          className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Let&apos;s Build Your First Study Plan</h3>
            <p className="text-xs text-slate-600 mt-1">
              Your dashboard stats are calculated from actual study sessions and assessments. Generate your first personalized plan to kick off your timeline!
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/study-plan')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create First Study Schedule
          </motion.button>
        </motion.div>
      )}

      {/* Core KPI Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Streak with animated pulse */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Study Streak</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </motion.div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {summary?.studyStreak || 0} <span className="text-xs font-normal text-slate-500">days</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Keep daily momentum</p>
        </motion.div>

        {/* Study Hours */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Hours</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {summary?.totalStudyHours || 0} <span className="text-xs font-normal text-slate-500">hrs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">From real study logs</p>
        </motion.div>

        {/* Completed Lessons */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {summary?.completedLessons || 0}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Tasks finished</p>
        </motion.div>

        {/* Pending Tasks */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending Tasks</span>
            <CalendarDays className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {summary?.pendingTasks || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled ahead</p>
        </motion.div>

        {/* Quiz Avg */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Quiz Average</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {summary?.quizAverageScore || 0}%
          </div>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">Assessments score</p>
        </motion.div>

        {/* Total Subjects */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Subjects</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {summary?.totalSubjects || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Course modules</p>
        </motion.div>
      </motion.div>

      {/* Weak Subjects Alert (If any subject < 70% accuracy) */}
      {summary?.weakSubjects && summary.weakSubjects.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Weak Subject Identified: {summary.weakSubjects[0].subject} ({summary.weakSubjects[0].averageScore}%)
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {summary.weakSubjects[0].reason}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/quizzes')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs"
            >
              Take Practice Quiz
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/revisions')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors"
            >
              Open Revision
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Charts Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Activity Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Study Activity</h3>
              <p className="text-xs text-slate-500">Actual vs Planned daily study hours</p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            {activity?.weeklyStudyActivity && activity.weeklyStudyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity.weeklyStudyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="hours" name="Logged Hours" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="planned" name="Planned Goal" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity data recorded yet this week
              </div>
            )}
          </div>
        </div>

        {/* Subject-Wise Performance Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subject Mastery & Scores</h3>
              <p className="text-xs text-slate-500">Average assessment score (%) by subject</p>
            </div>
            <Award className="w-4 h-4 text-purple-600" />
          </div>

          <div className="h-64 w-full">
            {activity?.subjectPerformance && activity.subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity.subjectPerformance} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="subject"
                    type="category"
                    tick={{ fontSize: 10, fill: '#334155' }}
                    width={110}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                  />
                  <Bar dataKey="score" name="Mastery Score %" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete your first quiz to unlock subject mastery charts
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Two Column Layout: Upcoming Tasks & Learning History */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upcoming Study Tasks</h3>
              <p className="text-xs text-slate-500">Prioritized from your personalized schedule</p>
            </div>
            <button
              onClick={() => navigate('/study-plan')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Full Calendar
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              All scheduled tasks are completed or no active plan generated yet.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map(task => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.005 }}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                      <span className="font-semibold text-blue-600">{task.subject}</span>
                      <span>·</span>
                      <span>{task.date}</span>
                      <span>·</span>
                      <span>{task.timeSlot} ({task.estimatedDuration}m)</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {task.topic}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {task.learningObjective}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMarkTaskCompleted(task.id)}
                      disabled={updatingTaskId === task.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{updatingTaskId === task.id ? 'Saving...' : 'Mark Done'}</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Studied & Recommended Topics (1 Col) */}
        <div className="space-y-6">
          {/* Recently Studied */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Recently Studied Topics</h3>
            {summary?.recentlyStudied && summary.recentlyStudied.length > 0 ? (
              <div className="space-y-2.5">
                {summary.recentlyStudied.map((item: any, idx: number) => (
                  <div key={idx} className="text-xs flex items-center justify-between pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-slate-800">{item.topic}</p>
                      <p className="text-[11px] text-slate-500">{item.subject}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No study sessions logged yet.</p>
            )}
          </div>

          {/* Recommended Next Topics */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Recommended Next Topics</h3>
            <p className="text-[11px] text-slate-500 mb-3">High-yield concepts to solidify your foundations</p>
            <div className="space-y-2">
              {summary?.recommendedTopics?.map((topic: string, i: number) => (
                <motion.div
                  whileHover={{ x: 3 }}
                  key={i}
                  onClick={() => navigate('/resources')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-xs font-medium text-slate-700 hover:text-blue-700 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span className="truncate pr-2">{topic}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

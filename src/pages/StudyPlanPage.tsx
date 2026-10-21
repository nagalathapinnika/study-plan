import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  ListFilter,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api.js';
import { StudyPlan, StudyTask } from '../types.js';
import { motion, AnimatePresence } from 'motion/react';

export const StudyPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Generator modal state
  const [showModal, setShowModal] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [genFormData, setGenFormData] = useState({
    title: '',
    subjects: [] as string[],
    currentSkillLevel: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    availableHoursPerDay: 3,
    targetDays: 14,
    examDate: '',
    learningGoal: 'Comprehensive preparation and conceptual mastery'
  });
  const [generating, setGenerating] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [plansData, subjectsData] = await Promise.all([
        api.getStudyPlans(),
        api.getSubjects()
      ]);

      setPlans(plansData);
      setAvailableSubjects(subjectsData);

      if (plansData.length > 0) {
        const active = plansData[0];
        setCurrentPlan(active);
        const tasksData = await api.getStudyTasks({ planId: active.id });
        setTasks(tasksData);
      } else {
        setCurrentPlan(null);
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to load study plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSelectPlan = async (plan: StudyPlan) => {
    setCurrentPlan(plan);
    setLoading(true);
    try {
      const tasksData = await api.getStudyTasks({ planId: plan.id });
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load tasks for plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (genFormData.subjects.length === 0) {
      alert('Please select at least one subject.');
      return;
    }

    try {
      setGenerating(true);
      const res = await api.generateStudyPlan({
        ...genFormData,
        title: genFormData.title.trim() || `${genFormData.subjects.join(' & ')} Plan`
      });

      setShowModal(false);
      await fetchInitialData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate study plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    try {
      setStatusUpdatingId(taskId);
      await api.updateStudyTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeletePlan = async () => {
    if (!currentPlan) return;
    if (!window.confirm(`Are you sure you want to delete the plan "${currentPlan.title}"?`)) return;

    try {
      await api.deleteStudyPlan(currentPlan.id);
      await fetchInitialData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  const toggleSubjectSelection = (subjName: string) => {
    if (genFormData.subjects.includes(subjName)) {
      setGenFormData({
        ...genFormData,
        subjects: genFormData.subjects.filter(s => s !== subjName)
      });
    } else {
      setGenFormData({
        ...genFormData,
        subjects: [...genFormData.subjects, subjName]
      });
    }
  };

  // Group tasks by date for calendar/day view
  const tasksByDate = tasks.reduce((acc: Record<string, StudyTask[]>, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const datesSorted = Object.keys(tasksByDate).sort();

  return (
    <div className="space-y-6">
      {/* Header with Title and Generator Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Adaptive Curriculum
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              {plans.length} Total Plan(s)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Personalized Study Schedules
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI balances difficult topics, spaced revisions, and breaks tailored to your daily schedule.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {plans.length > 0 && (
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="List View"
              >
                <ListFilter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Calendar / Schedule View"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setGenFormData({
                title: '',
                subjects: availableSubjects.map(s => s.name).slice(0, 2),
                currentSkillLevel: 'Intermediate',
                availableHoursPerDay: 3,
                targetDays: 14,
                examDate: '',
                learningGoal: 'Prepare for midterm examinations and interview problem sets'
              });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Study Plan</span>
          </button>
        </div>
      </div>

      {/* Plan Selector Bar */}
      {plans.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Active Plan:</span>
          {plans.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelectPlan(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                currentPlan?.id === p.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Active Plan Metadata Card */}
      {currentPlan ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                  {currentPlan.currentSkillLevel} Level
                </span>
                <span className="text-xs text-slate-500">
                  {currentPlan.availableHoursPerDay} hrs/day target
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{currentPlan.title}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{currentPlan.learningGoal}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDeletePlan}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">Subjects:</span>{' '}
              {currentPlan.subjects.join(', ')}
            </div>
            {currentPlan.examDate && (
              <div>
                <span className="font-semibold text-slate-700">Target Exam Date:</span>{' '}
                {currentPlan.examDate}
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-700">Total Tasks:</span> {tasks.length} (
              {tasks.filter(t => t.status === 'Completed').length} Completed)
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Active Study Plans</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click the button below to specify your topics, available study hours, and exam date. LearnPulse will build an optimized study calendar.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            Create My First Plan
          </button>
        </div>
      )}

      {/* Task List / Calendar View */}
      {currentPlan && tasks.length > 0 && (
        <div>
          {viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    task.status === 'Completed'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-blue-600">{task.subject}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-700">{task.date}</span>
                      <span>·</span>
                      <span>{task.timeSlot} ({task.estimatedDuration} mins)</span>
                      <span>·</span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        task.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.priority} Priority
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold text-slate-900 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                      {task.topic}
                    </h4>

                    <p className="text-xs text-slate-600 mt-1">
                      {task.learningObjective}
                    </p>

                    {task.recommendedResourceTitle && (
                      <div className="mt-2 text-xs flex items-center gap-1.5 text-blue-600">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="font-medium">Recommended: {task.recommendedResourceTitle}</span>
                        {task.recommendedResourceUrl && (
                          <a
                            href={task.recommendedResourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Task Status Selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={task.status}
                      disabled={statusUpdatingId === task.id}
                      onChange={(e) => handleTaskStatusChange(task.id, e.target.value as any)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none transition-colors ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : task.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* CALENDAR / TIMELINE GROUPED VIEW */
            <div className="space-y-6">
              {datesSorted.map((date) => {
                const dayTasks = tasksByDate[date];
                return (
                  <div key={date} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {date}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {dayTasks.length} Session(s) · {dayTasks.reduce((s, t) => s + t.estimatedDuration, 0)} mins total
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dayTasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl border transition-all ${
                            task.status === 'Completed'
                              ? 'bg-emerald-50/40 border-emerald-200 text-slate-500'
                              : 'bg-slate-50 border-slate-200/80 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold text-blue-600">{task.timeSlot}</span>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 truncate">{task.topic}</h5>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{task.learningObjective}</p>
                          <button
                            onClick={() => handleTaskStatusChange(
                              task.id,
                              task.status === 'Completed' ? 'Pending' : 'Completed'
                            )}
                            className="mt-2 text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {task.status === 'Completed' ? 'Mark Incomplete' : 'Complete Task'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* GENERATE STUDY PLAN MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Generate Personalized Study Plan</h3>
                    <p className="text-xs text-slate-500">Adapts to your quiz history and daily budget</p>
                  </div>
                </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan Title
                </label>
                <input
                  type="text"
                  value={genFormData.title}
                  onChange={e => setGenFormData({ ...genFormData, title: e.target.value })}
                  placeholder="e.g. End-Semester Accelerated Mastery Plan"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Subjects for this Plan *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableSubjects.map(s => {
                    const isSel = genFormData.subjects.includes(s.name);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSubjectSelection(s.name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isSel ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Skill Level
                  </label>
                  <select
                    value={genFormData.currentSkillLevel}
                    onChange={e => setGenFormData({ ...genFormData, currentSkillLevel: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Beginner">Beginner (Foundations)</option>
                    <option value="Intermediate">Intermediate (Standard)</option>
                    <option value="Advanced">Advanced (Rigorous)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Study Hours / Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={genFormData.availableHoursPerDay}
                    onChange={e => setGenFormData({ ...genFormData, availableHoursPerDay: parseFloat(e.target.value) || 2 })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Schedule Length (Days)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="30"
                    value={genFormData.targetDays}
                    onChange={e => setGenFormData({ ...genFormData, targetDays: parseInt(e.target.value) || 14 })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upcoming Exam Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={genFormData.examDate}
                    onChange={e => setGenFormData({ ...genFormData, examDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Learning Objective
                </label>
                <textarea
                  rows={2}
                  value={genFormData.learningGoal}
                  onChange={e => setGenFormData({ ...genFormData, learningGoal: e.target.value })}
                  placeholder="e.g. Master algorithm problem patterns, crack placement interviews, finish syllabus."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Plan...</span>
                    </>
                  ) : (
                    <span>Generate Optimized Plan</span>
                  )}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

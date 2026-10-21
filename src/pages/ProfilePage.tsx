import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

const AVAILABLE_SUBJECTS = [
  'Data Structures & Algorithms',
  'Python Programming',
  'Full-Stack Web Development',
  'Data Science & Machine Learning',
  'Discrete Mathematics & Linear Algebra'
];

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfileState, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    educationLevel: profile?.educationLevel || 'Undergraduate',
    courseDegree: profile?.courseDegree || 'B.Tech Computer Science',
    currentSemester: profile?.currentSemester || 'Semester 5',
    preferredLearningStyle: profile?.preferredLearningStyle || 'Visual',
    dailyStudyAvailability: profile?.dailyStudyAvailability || 3,
    learningGoals: profile?.learningGoals || '',
    targetCompletionDate: profile?.targetCompletionDate || ''
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    profile?.subjectsOfInterest || ['Data Structures & Algorithms', 'Python Programming']
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      setFormData({
        name: user.name,
        educationLevel: profile.educationLevel,
        courseDegree: profile.courseDegree,
        currentSemester: profile.currentSemester,
        preferredLearningStyle: profile.preferredLearningStyle,
        dailyStudyAvailability: profile.dailyStudyAvailability,
        learningGoals: profile.learningGoals,
        targetCompletionDate: profile.targetCompletionDate || ''
      });
      setSelectedSubjects(profile.subjectsOfInterest || []);
    }
  }, [user, profile]);

  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      if (selectedSubjects.length === 1) return;
      setSelectedSubjects(selectedSubjects.filter(s => s !== subj));
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      const res = await api.updateProfile({
        ...formData,
        subjectsOfInterest: selectedSubjects
      });
      updateProfileState(res.profile);
      await refreshProfile();
      setSuccessMsg('Profile settings updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Student Identity & Preferences
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Role: {user?.role}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Profile & Learning Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your study plan generator and resource recommender adapt to these preferences in real-time.
          </p>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Academic Background
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level</label>
                <select
                  value={formData.educationLevel}
                  onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate / Master">Graduate / Master</option>
                  <option value="Self-Taught / Professional">Self-Taught / Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Degree</label>
                <input
                  type="text"
                  value={formData.courseDegree}
                  onChange={e => setFormData({ ...formData, courseDegree: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester / Grade</label>
                <input
                  type="text"
                  value={formData.currentSemester}
                  onChange={e => setFormData({ ...formData, currentSemester: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Learning Style & Study Availability
            </h3>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Active Subjects of Interest
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SUBJECTS.map(subj => {
                  const isSel = selectedSubjects.includes(subj);
                  return (
                    <button
                      type="button"
                      key={subj}
                      onClick={() => toggleSubject(subj)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isSel ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {subj}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Learning Format</label>
                <select
                  value={formData.preferredLearningStyle}
                  onChange={e => setFormData({ ...formData, preferredLearningStyle: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Visual">Visual (Diagrams & Videos)</option>
                  <option value="Auditory">Auditory (Lectures & Audio)</option>
                  <option value="Reading/Writing">Reading & Writing (Articles & Docs)</option>
                  <option value="Kinesthetic">Kinesthetic (Interactive & Coding)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Study Availability (Hours/day)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={formData.dailyStudyAvailability}
                  onChange={e => setFormData({ ...formData, dailyStudyAvailability: parseFloat(e.target.value) || 2 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Academic Goal</label>
              <textarea
                rows={2}
                value={formData.learningGoals}
                onChange={e => setFormData({ ...formData, learningGoals: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

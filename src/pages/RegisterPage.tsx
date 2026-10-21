import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, AlertCircle, Check, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.js';
import { FirebaseDomainModal } from '../components/FirebaseDomainModal.js';

const AVAILABLE_SUBJECTS = [
  'Data Structures & Algorithms',
  'Python Programming',
  'Full-Stack Web Development',
  'Data Science & Machine Learning',
  'Discrete Mathematics & Linear Algebra'
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    educationLevel: 'Undergraduate',
    courseDegree: 'B.Tech Computer Science',
    currentSemester: 'Semester 4',
    preferredLearningStyle: 'Visual' as 'Visual' | 'Auditory' | 'Reading/Writing' | 'Kinesthetic',
    dailyStudyAvailability: 3,
    learningGoals: 'Master core concepts and prepare for upcoming technical assessments',
    targetCompletionDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Data Structures & Algorithms',
    'Python Programming'
  ]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);

  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      if (selectedSubjects.length === 1) return; // Keep at least one
      setSelectedSubjects(selectedSubjects.filter(s => s !== subj));
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setError(null);
      setGoogleLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.message || '';
      const code = err?.code || '';
      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setShowDomainModal(true);
        setError('Firebase Error: auth/unauthorized-domain. This app domain needs to be added in your Firebase Console.');
      } else {
        setError(msg || 'Google registration was cancelled or failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please provide your name, email, and a secure password.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject of interest.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await register({
        ...formData,
        subjectsOfInterest: selectedSubjects
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              LearnPulse AI
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Your Student Profile
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Stored in PostgreSQL database with adaptive study scheduling and smart recommendations.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white py-8 px-6 sm:px-10 border border-slate-200 rounded-2xl shadow-xs"
        >
          {/* Database status pill */}
          <div className="mb-5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full border border-emerald-200">
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL Relational Storage Configured</span>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
              {error.includes('unauthorized-domain') && (
                <button
                  type="button"
                  onClick={() => setShowDomainModal(true)}
                  className="self-start text-[11px] font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1"
                >
                  <span>How to authorize this domain →</span>
                </button>
              )}
            </motion.div>
          )}

          {/* Quick Sign-Up with Google */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handleGoogleRegister}
            disabled={googleLoading || loading}
            className="w-full mb-6 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Creating account...' : 'Quick Register with Google'}</span>
          </motion.button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-400">
              <span className="bg-white px-2">or complete full student profile</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Credentials */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                1. Account Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@student.edu"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min 6 characters) *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                2. Academic Background
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Education Level
                  </label>
                  <select
                    value={formData.educationLevel}
                    onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate / Master">Graduate / Master</option>
                    <option value="Self-Taught / Professional">Self-Taught / Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course / Degree
                  </label>
                  <input
                    type="text"
                    value={formData.courseDegree}
                    onChange={e => setFormData({ ...formData, courseDegree: e.target.value })}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester / Grade
                  </label>
                  <input
                    type="text"
                    value={formData.currentSemester}
                    onChange={e => setFormData({ ...formData, currentSemester: e.target.value })}
                    placeholder="e.g. Semester 5"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Learning Style & Subjects */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                3. Learning Preferences & Subjects
              </h3>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Subjects of Interest (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SUBJECTS.map(subj => {
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        key={subj}
                        onClick={() => toggleSubject(subj)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{subj}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Learning Style
                  </label>
                  <select
                    value={formData.preferredLearningStyle}
                    onChange={e => setFormData({ ...formData, preferredLearningStyle: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Visual">Visual (Diagrams, Mindmaps, Videos)</option>
                    <option value="Auditory">Auditory (Lectures, Explanations)</option>
                    <option value="Reading/Writing">Reading & Writing (Articles, Docs)</option>
                    <option value="Kinesthetic">Kinesthetic (Interactive Sandboxes, Coding)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Daily Study Availability (Hours/day)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={formData.dailyStudyAvailability}
                    onChange={e => setFormData({ ...formData, dailyStudyAvailability: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Learning Goal
                </label>
                <textarea
                  rows={2}
                  value={formData.learningGoals}
                  onChange={e => setFormData({ ...formData, learningGoals: e.target.value })}
                  placeholder="e.g. Master algorithm problem patterns, crack placement interviews, finish syllabus."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? 'Saving Profile to PostgreSQL...' : 'Complete Registration & Launch Workspace'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign In here
            </Link>
          </p>
        </motion.div>
      </motion.div>

      <FirebaseDomainModal
        isOpen={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        onUseDemo={() => navigate('/login')}
      />
    </div>
  );
};

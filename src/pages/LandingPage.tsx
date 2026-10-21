import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  CalendarCheck,
  BrainCircuit,
  Compass,
  CheckCircle2,
  ArrowRight,
  Layers,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  const handleDemoStudent = async () => {
    try {
      setLoadingDemo(true);
      await login('alex@student.edu', 'StudentPass123!');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to login with demo credentials');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleDemoAdmin = async () => {
    try {
      setLoadingDemo(true);
      await login('admin@learning.edu', 'AdminPass123!');
      navigate('/admin');
    } catch (err: any) {
      alert(err.message || 'Failed to login with admin credentials');
    } finally {
      setLoadingDemo(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const features = [
    {
      icon: CalendarCheck,
      iconBg: 'bg-blue-100 text-blue-700',
      title: 'Personalized Study Plan Generator',
      description: 'Allocates time slots based on your daily availability, examination deadlines, and quiz accuracy. Injects spaced revisions and balanced breaks.'
    },
    {
      icon: BrainCircuit,
      iconBg: 'bg-indigo-100 text-indigo-700',
      title: 'Adaptive Quizzes & Question Bank',
      description: 'Questions scale dynamically with mastery. If you struggle, foundation questions appear; once you excel, challenging scenarios test depth.'
    },
    {
      icon: Sparkles,
      iconBg: 'bg-amber-100 text-amber-700',
      title: 'AI Tutor & Multilingual Support',
      description: 'Step-by-step problem solver explaining topics at Beginner, Intermediate, or Advanced levels with support for Telugu, Hindi, Spanish, and English.'
    },
    {
      icon: Compass,
      iconBg: 'bg-teal-100 text-teal-700',
      title: 'Resource Recommendation Engine',
      description: 'Content-based matching that suggests curated articles, video lectures, and interactive sandboxes scored to your preferred learning format.'
    },
    {
      icon: Flame,
      iconBg: 'bg-rose-100 text-rose-700',
      title: 'Session Stopwatch & Habit Tracking',
      description: 'Log deep work sessions with pause/resume controls, productivity ratings, personal reflections, and automated streak calculations.'
    },
    {
      icon: Layers,
      iconBg: 'bg-purple-100 text-purple-700',
      title: 'Smart Spaced-Repetition Planner',
      description: 'Leitner-inspired intervals dynamically flag topics needing immediate recall reviews, keeping you examination-ready without cramming.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs"
            >
              <GraduationCap className="w-5 h-5" />
            </motion.div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              LearnPulse AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-xs"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </motion.div>
          <span>Intelligent Academic Adaptation & Behavior Tracking</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight max-w-3xl mx-auto"
        >
          Every student learns differently.{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your study plan should too.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Standard platforms serve the exact same lecture slides to everyone. LearnPulse AI analyzes your assessment performance, learning pace, and weak areas to engineer custom daily study schedules, targeted resources, and interactive AI tutoring.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            Create Student Account
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDemoStudent}
            disabled={loadingDemo}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs"
          >
            {loadingDemo ? 'Logging in...' : 'Explore Demo Student (Alex Chen)'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDemoAdmin}
            disabled={loadingDemo}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Curriculum Admin Login
          </motion.button>
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500"
        >
          {[
            'Full PostgreSQL Persistence',
            'Adaptive Spaced Repetition',
            'Gemini 3.8 & Knowledge Fallback',
            'Secure User Data Isolation'
          ].map((item, idx) => (
            <motion.span
              key={idx}
              whileHover={{ scale: 1.05, color: '#2563eb' }}
              className="flex items-center gap-1.5 transition-colors cursor-default"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {item}
            </motion.span>
          ))}
        </motion.div>
      </motion.section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900">
              Built for College Major Projects & Real Academic Workflows
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              A complete, modular full-stack application connecting personalized algorithmic schedules with practical student tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, index) => {
              const IconComp = feat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`w-10 h-10 rounded-xl ${feat.iconBg} flex items-center justify-center mb-4 shadow-2xs group-hover:shadow-xs transition-shadow`}
                  >
                    <IconComp className="w-5 h-5" />
                  </motion.div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            LearnPulse AI · Personalized Learning Assistant
          </div>
          <p>© 2026 AI-Powered Personalized Learning Assistant. All student records isolated & encrypted.</p>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import { Menu, Flame, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  streakCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, streakCount = 3 }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {profile?.courseDegree || 'Personalized Academic Journey'} · {profile?.currentSemester || 'Active Semester'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div
          title={`${streakCount} day study streak!`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold"
        >
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{streakCount}d Streak</span>
        </div>

        {/* Quick Action Buttons */}
        <button
          onClick={() => navigate('/tutor')}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Tutor</span>
        </button>

        <button
          onClick={() => navigate('/tracker')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Study Session</span>
        </button>

        {/* User Avatar */}
        <div
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 text-xs font-bold cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
          title="View Profile Settings"
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </div>
      </div>
    </header>
  );
};

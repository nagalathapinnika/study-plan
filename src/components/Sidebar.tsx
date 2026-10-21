import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  BotMessageSquare,
  BookOpen,
  HelpCircle,
  Timer,
  BarChart3,
  Repeat,
  Target,
  FileText,
  User,
  ShieldCheck,
  LogOut,
  X,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Study Plan', path: '/study-plan', icon: CalendarDays },
    { name: 'AI Tutor', path: '/tutor', icon: BotMessageSquare },
    { name: 'Learning Resources', path: '/resources', icon: BookOpen },
    { name: 'Quizzes', path: '/quizzes', icon: HelpCircle },
    { name: 'Study Tracker', path: '/tracker', icon: Timer },
    { name: 'Progress Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Revision Planner', path: '/revisions', icon: Repeat },
    { name: 'My Goals', path: '/goals', icon: Target },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Management', path: '/admin', icon: ShieldCheck });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 block leading-tight">
                LearnPulse AI
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Personalized Assistant
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Student Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User & Logout Profile */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

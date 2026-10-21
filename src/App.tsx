import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { StudyPlanPage } from './pages/StudyPlanPage.js';
import { TutorPage } from './pages/TutorPage.js';
import { ResourcesPage } from './pages/ResourcesPage.js';
import { QuizzesPage } from './pages/QuizzesPage.js';
import { TrackerPage } from './pages/TrackerPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { RevisionsPage } from './pages/RevisionsPage.js';
import { GoalsPage } from './pages/GoalsPage.js';
import { NotesPage } from './pages/NotesPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminPage } from './pages/AdminPage.js';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
        Loading authenticated workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
        Validating permissions...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Student Workspace */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/revisions" element={<RevisionsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

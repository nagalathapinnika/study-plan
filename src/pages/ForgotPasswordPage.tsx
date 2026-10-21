import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            LearnPulse AI
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Reset Account Access
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Local Development Password Recovery Assistant
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xs border border-slate-200 rounded-2xl sm:px-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Password Reset Instructions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In this local deployment environment, external SMTP delivery is deliberately disabled to avoid transmitting mock credentials.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 text-slate-700">
                <p className="font-semibold text-slate-900">Default Demo Accounts:</p>
                <p>• Student: <code className="text-blue-600 font-mono">alex@student.edu</code> / <code className="font-mono">StudentPass123!</code></p>
                <p>• Admin: <code className="text-blue-600 font-mono">admin@learning.edu</code> / <code className="font-mono">AdminPass123!</code></p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@student.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
              >
                Send Password Reset Instructions
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-medium text-slate-500 hover:text-slate-800">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

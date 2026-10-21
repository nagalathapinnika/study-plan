import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ExternalLink, Copy, Check, X, ShieldAlert, KeyRound } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirebaseDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseDemo?: () => void;
}

export const FirebaseDomainModal: React.FC<FirebaseDomainModalProps> = ({
  isOpen,
  onClose,
  onUseDemo
}) => {
  const [copied, setCopied] = useState(false);
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const projectId = firebaseConfig.projectId || 'directed-amp-05v9p';
  const consoleAuthSettingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  const handleCopy = () => {
    if (navigator.clipboard && currentDomain) {
      navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-amber-500/10 border-b border-amber-200/60 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Firebase: Unauthorized Domain
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  auth/unauthorized-domain
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Firebase Authentication blocks Google Sign-In popups when the hosting domain isn't registered in your Firebase project's <strong>Authorized domains</strong> list.
            </p>

            {/* Current Domain Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Your Current App Domain
              </span>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                <code className="text-xs font-mono font-medium text-blue-700 truncate">
                  {currentDomain || 'ais-dev-...run.app'}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Domain</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Steps to Fix */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                How to authorize this domain (1 minute):
              </h4>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-5">
                <li>
                  Open your{' '}
                  <a
                    href={consoleAuthSettingsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-0.5 text-blue-600 font-semibold hover:underline"
                  >
                    Firebase Console Settings
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Navigate to the <strong>Authorized domains</strong> tab.
                </li>
                <li>
                  Click <strong>Add domain</strong>, paste{' '}
                  <span className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[11px]">
                    {currentDomain}
                  </span>
                  , and click <strong>Save</strong>.
                </li>
              </ol>
            </div>

            {/* Alternative options */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                Want to test immediately without opening Firebase?
              </p>
              <p className="text-[11px] text-blue-700">
                You can use the built-in email/password login or demo credentials right away!
              </p>
            </div>
          </div>

          {/* Footer actions */}
          <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <a
              href={consoleAuthSettingsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
            >
              <span>Open Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2">
              {onUseDemo && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUseDemo();
                  }}
                  className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                >
                  Use Demo Login
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

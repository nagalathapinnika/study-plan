import React, { useState, useEffect, useRef } from 'react';
import {
  BotMessageSquare,
  Send,
  Plus,
  RefreshCw,
  Sparkles,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Globe,
  Sliders,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api.js';
import { TutorConversation, TutorMessage } from '../types.js';
import { motion, AnimatePresence } from 'motion/react';

export const TutorPage: React.FC = () => {
  const [conversations, setConversations] = useState<TutorConversation[]>([]);
  const [activeConv, setActiveConv] = useState<TutorConversation | null>(null);
  const [subjects, setAvailableSubjects] = useState<any[]>([]);

  // Form parameters
  const [selectedSubject, setSelectedSubject] = useState('Data Structures & Algorithms');
  const [selectedTopic, setSelectedTopic] = useState('Binary Search Trees');
  const [explanationLevel, setExplanationLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [language, setLanguage] = useState<'en' | 'te' | 'hi' | 'es'>('en');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [savedNoteSuccess, setSavedNoteSuccess] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [convs, subjs] = await Promise.all([
          api.getTutorConversations(),
          api.getSubjects()
        ]);
        setConversations(convs);
        setAvailableSubjects(subjs);

        if (convs.length > 0) {
          setActiveConv(convs[0]);
          setSelectedSubject(convs[0].subject);
          setSelectedTopic(convs[0].topic);
          setExplanationLevel(convs[0].explanationLevel);
          setLanguage(convs[0].language as any || 'en');
        }
      } catch (err) {
        console.error('Failed to load tutor data:', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, loading]);

  const handleStartNewChat = () => {
    setActiveConv(null);
    setInputQuery('');
    setNotice(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const query = inputQuery.trim();
    setInputQuery('');
    setLoading(true);
    setNotice(null);

    // Optimistically add user message
    const tempUserMsg: TutorMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    if (activeConv) {
      setActiveConv({
        ...activeConv,
        messages: [...activeConv.messages, tempUserMsg]
      });
    }

    try {
      const res = await api.sendTutorMessage({
        conversationId: activeConv?.id,
        subject: selectedSubject,
        topic: selectedTopic,
        question: query,
        explanationLevel,
        language
      });

      setActiveConv(res.conversation);
      if (res.meta?.notice) {
        setNotice(res.meta.notice);
      }

      // Update conversations list
      const updatedList = await api.getTutorConversations();
      setConversations(updatedList);
    } catch (err: any) {
      alert(err.message || 'Failed to generate tutor response');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotes = async (msg: TutorMessage) => {
    try {
      await api.createNote({
        title: `Tutor Concept: ${selectedTopic}`,
        content: msg.content,
        subject: selectedSubject,
        topic: selectedTopic,
        tags: ['tutor-insight', selectedTopic.toLowerCase()],
        tutorSnippet: msg.practiceQuestion
      });
      setSavedNoteSuccess('Explanation saved to your Notebook!');
      setTimeout(() => setSavedNoteSuccess(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    }
  };

  const currentTopics = subjects.find(s => s.name === selectedSubject)?.topics || [
    'General Principles',
    'Problem Solving',
    'Edge Cases'
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-5">
      {/* Sidebar: Conversation History & Settings */}
      <div className="w-full lg:w-72 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col shrink-0">
        <button
          onClick={handleStartNewChat}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 mb-3"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Doubt Session</span>
        </button>

        {/* Dynamic Controls */}
        <div className="space-y-2.5 pb-3 border-b border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                const s = subjects.find(sub => sub.name === e.target.value);
                if (s && s.topics.length > 0) setSelectedTopic(s.topics[0]);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              {currentTopics.map((t: string) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Level</label>
              <select
                value={explanationLevel}
                onChange={(e) => setExplanationLevel(e.target.value as any)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="en">English</option>
                <option value="te">Telugu</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1 mb-1">
            Recent Sessions ({conversations.length})
          </p>
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 p-2 text-center">No prior conversations</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveConv(c);
                  setSelectedSubject(c.subject);
                  setSelectedTopic(c.topic);
                  setExplanationLevel(c.explanationLevel);
                  setLanguage(c.language as any || 'en');
                }}
                className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  activeConv?.id === c.id
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate pr-2">{c.title}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <BotMessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                {selectedTopic}
                <span className="text-[10px] font-normal text-slate-500 hidden sm:inline">
                  ({selectedSubject} · {explanationLevel})
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Pedagogical tutor with step-by-step problem solver
              </p>
            </div>
          </div>

          {savedNoteSuccess && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-fade-in flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{savedNoteSuccess}</span>
            </div>
          )}
        </div>

        {/* Notice Banner (Fallback / Generative mode) */}
        {notice && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {!activeConv || activeConv.messages.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Ask your question on {selectedTopic}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Type any conceptual question, algorithm puzzle, or exam doubt. The assistant generates step-by-step proofs, code, key takeaways, and practice questions.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  onClick={() => setInputQuery(`Can you explain the main difference between ${selectedTopic} and standard alternatives with an example?`)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  &quot;Explain core principles with examples&quot;
                </button>
                <button
                  onClick={() => setInputQuery(`What are the most common exam questions or edge cases asked about ${selectedTopic}?`)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  &quot;Common exam traps & edge cases&quot;
                </button>
              </div>
            </div>
          ) : (
            activeConv.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs"
                  >
                    <BotMessageSquare className="w-3.5 h-3.5" />
                  </motion.div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200/90 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Assistant Key Points & Practice Question Enrichment */}
                  {msg.role === 'assistant' && msg.keyPoints && msg.keyPoints.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200/80 bg-white/60 p-3 rounded-xl">
                      <p className="font-bold text-[11px] text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Important Exam Points
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {msg.keyPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.practiceQuestion && (
                    <div className="mt-3 bg-blue-50/70 border border-blue-200/70 p-3 rounded-xl text-blue-900">
                      <p className="font-bold text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5 text-blue-700">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Self-Check Practice Question
                      </p>
                      <p>{msg.practiceQuestion}</p>
                    </div>
                  )}

                  {msg.role === 'assistant' && (
                    <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => handleSaveToNotes(msg)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                        title="Save to Notebook"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Save to Notes</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-center text-xs text-slate-400"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <BotMessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-2">
                <div className="flex gap-1 items-center">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    className="w-1.5 h-1.5 rounded-full bg-blue-600"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-blue-600"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    className="w-1.5 h-1.5 rounded-full bg-blue-600"
                  />
                </div>
                <span className="text-slate-600 font-medium">Formulating pedagogical breakdown...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Query Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask a question about ${selectedTopic}...`}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Tutor</span>
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Award,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api.js';
import { QuizAttempt } from '../types.js';

interface ActiveQuizData {
  quizId: string;
  subject: string;
  topic: string;
  adaptiveDifficulty: 'Easy' | 'Medium' | 'Hard';
  questions: {
    id: string;
    question: string;
    options: string[];
    difficulty: string;
    topic: string;
  }[];
}

export const QuizzesPage: React.FC = () => {
  const [subjectsTaxonomy, setSubjectsTaxonomy] = useState<any>({});
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz Setup
  const [selectedSubject, setSelectedSubject] = useState('Data Structures & Algorithms');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [requestedDifficulty, setRequestedDifficulty] = useState<string>('');

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizData | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any | null>(null);

  const fetchTaxonomyAndHistory = async () => {
    try {
      setLoading(true);
      const [taxData, histData] = await Promise.all([
        api.getQuizTaxonomy(),
        api.getQuizHistory()
      ]);
      setSubjectsTaxonomy(taxData.taxonomy || {});
      setHistory(histData);

      const subjects = Object.keys(taxData.taxonomy || {});
      if (subjects.length > 0 && !selectedSubject) {
        setSelectedSubject(subjects[0]);
      }
    } catch (err) {
      console.error('Failed to load quiz metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomyAndHistory();
  }, []);

  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setQuizResult(null);
      setSelectedAnswers({});
      setCurrentQuestionIdx(0);

      const res = await api.generateQuiz({
        subject: selectedSubject,
        topic: selectedTopic !== 'All' ? selectedTopic : undefined,
        requestedDifficulty: requestedDifficulty || undefined
      });

      setActiveQuiz(res);
    } catch (err: any) {
      alert(err.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (quizResult) return; // Locked after submission
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    // Check all questions answered
    const unanswered = activeQuiz.questions.filter(q => selectedAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const payloadAnswers = activeQuiz.questions.map(q => ({
        questionId: q.id,
        selectedOption: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1
      }));

      const res = await api.submitQuiz({
        subject: activeQuiz.subject,
        topic: activeQuiz.topic,
        difficulty: activeQuiz.adaptiveDifficulty,
        answers: payloadAnswers
      });

      setQuizResult(res);

      if (res.attempt.percentage >= 75) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      // Refresh history
      const updatedHistory = await api.getQuizHistory();
      setHistory(updatedHistory);
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const subjectList = Object.keys(subjectsTaxonomy);
  const currentTopics = subjectsTaxonomy[selectedSubject] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Diagnostic Knowledge Engine
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Adaptive Difficulty
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Adaptive Assessments & Quizzes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates accuracy, scales difficulty according to mastery, and schedules spaced repetitions.
          </p>
        </div>

        {activeQuiz && (
          <button
            onClick={() => {
              setActiveQuiz(null);
              setQuizResult(null);
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Exit Quiz
          </button>
        )}
      </div>

      {!activeQuiz ? (
        /* QUIZ SETUP & HISTORY VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Start New Quiz Form */}
          <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs h-fit space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Configure Practice Assessment</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={e => {
                  setSelectedSubject(e.target.value);
                  setSelectedTopic('All');
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                {subjectList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Topic</label>
              <select
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="All">All Topics (Comprehensive)</option>
                {currentTopics.map((t: any) => (
                  <option key={t.topic} value={t.topic}>
                    {t.topic} ({t.questionCount} Qs)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Mode</label>
              <select
                value={requestedDifficulty}
                onChange={e => setRequestedDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="">Auto-Adaptive (Recommended)</option>
                <option value="Easy">Foundation (Easy)</option>
                <option value="Medium">Standard (Medium)</option>
                <option value="Hard">Advanced (Hard)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Auto-Adaptive selects questions matching your historical accuracy.
              </p>
            </div>

            <button
              onClick={handleStartQuiz}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Assessment</span>
            </button>
          </div>

          {/* Assessment History Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Assessment Performance History</h3>
            <p className="text-xs text-slate-500 mb-4">Past results, accuracy percentages, and timestamps</p>

            {history.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No quizzes completed yet. Start your first practice quiz on the left!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5">Topic & Subject</th>
                      <th className="pb-2.5">Difficulty</th>
                      <th className="pb-2.5">Score</th>
                      <th className="pb-2.5">Accuracy</th>
                      <th className="pb-2.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {history.map(att => (
                      <tr key={att.id} className="hover:bg-slate-50/60">
                        <td className="py-3 pr-2">
                          <p className="font-bold text-slate-900">{att.topic}</p>
                          <p className="text-[11px] text-slate-500">{att.subject}</p>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            att.difficulty === 'Hard' ? 'bg-rose-50 text-rose-700' : att.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {att.difficulty}
                          </span>
                        </td>
                        <td className="py-3 font-semibold">{att.score} / {att.totalQuestions}</td>
                        <td className="py-3">
                          <span className={`font-bold ${
                            att.percentage >= 80 ? 'text-emerald-600' : att.percentage >= 60 ? 'text-blue-600' : 'text-amber-600'
                          }`}>
                            {att.percentage}%
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 font-mono text-[11px]">
                          {att.completedAt.split('T')[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ACTIVE QUIZ OR RESULTS VIEW */
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Result Banner if Submitted */}
          {quizResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center space-y-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto"
              >
                <Award className="w-6 h-6" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-900">
                Assessment Complete!
              </h3>
              <p className="text-xs text-slate-600">
                You scored <span className="font-bold text-blue-600 text-sm">{quizResult.attempt.score} out of {quizResult.attempt.totalQuestions}</span> ({quizResult.attempt.percentage}%).
              </p>
              <div className="p-3 bg-blue-50/60 rounded-xl text-xs text-blue-900 font-medium max-w-lg mx-auto">
                {quizResult.spacedRepetitionNote}
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleStartQuiz}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setActiveQuiz(null);
                    setQuizResult(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Back to Hub
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Active Questions Container */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <div>
                <span className="font-bold text-blue-600">{activeQuiz.subject}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span className="text-slate-600 font-medium">{activeQuiz.topic}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {activeQuiz.adaptiveDifficulty} Mode
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-8">
              {activeQuiz.questions.map((q, qIndex) => {
                const resultAnswer = quizResult?.attempt.answers?.find((a: any) => a.questionId === q.id);

                return (
                  <div key={q.id} className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {qIndex + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 pl-7">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = selectedAnswers[q.id] === optIndex;
                        let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                        if (isSelected && !quizResult) {
                          optionStyle = 'bg-blue-50 border-blue-500 text-blue-900 font-semibold ring-1 ring-blue-500';
                        }

                        // When quizResult is available, color code right vs wrong
                        if (quizResult && resultAnswer) {
                          const isCorrectOpt = resultAnswer.correctOption === optIndex;
                          const wasUserPick = resultAnswer.selectedOption === optIndex;

                          if (isCorrectOpt) {
                            optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                          } else if (wasUserPick && !resultAnswer.isCorrect) {
                            optionStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-semibold';
                          } else {
                            optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                          }
                        }

                        return (
                          <motion.button
                            type="button"
                            key={optIndex}
                            whileHover={!quizResult ? { scale: 1.015, x: 2 } : {}}
                            whileTap={!quizResult ? { scale: 0.985 } : {}}
                            disabled={!!quizResult}
                            onClick={() => handleSelectOption(q.id, optIndex)}
                            className={`p-3 text-left rounded-xl border text-xs transition-colors flex items-start gap-2 ${optionStyle}`}
                          >
                            <span className="font-mono font-semibold uppercase opacity-60">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Explanations shown after submission */}
                    {quizResult && resultAnswer && (
                      <div className={`mt-2 p-3 rounded-xl text-xs pl-7 ${
                        resultAnswer.isCorrect
                          ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/70 border border-rose-200 text-rose-900'
                      }`}>
                        <div className="font-semibold flex items-center gap-1.5 mb-1">
                          {resultAnswer.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Correct!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Incorrect. Correct Answer: Option {String.fromCharCode(65 + resultAnswer.correctOption)}</span>
                            </>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {resultAnswer.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Quiz Button */}
            {!quizResult && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Validating Answers...' : 'Submit Assessment'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

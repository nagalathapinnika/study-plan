import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  BookOpen,
  HelpCircle,
  Users,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { api } from '../services/api.js';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'resources' | 'questions'>('resources');
  const [loading, setLoading] = useState(true);

  // New Resource Form
  const [showResModal, setShowResModal] = useState(false);
  const [newRes, setNewRes] = useState({
    title: '',
    description: '',
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Traversals (BFS & DFS)',
    difficulty: 'Intermediate',
    resourceType: 'Article',
    url: '',
    estimatedMinutes: 30,
    provider: 'Academic Reference',
    tagsString: ''
  });

  // New Question Form
  const [showQModal, setShowQModal] = useState(false);
  const [newQ, setNewQ] = useState({
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Traversals (BFS & DFS)',
    difficulty: 'Medium',
    question: '',
    opt0: '',
    opt1: '',
    opt2: '',
    opt3: '',
    correctIndex: 0,
    explanation: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, resData] = await Promise.all([
        api.getAdminStats(),
        api.getResources()
      ]);
      setStats(statsData);
      setResources(resData);
    } catch (err: any) {
      alert(err.message || 'Administrative access denied');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.title || !newRes.url) return;

    try {
      await api.createAdminResource({
        ...newRes,
        tags: newRes.tagsString.split(',').map(t => t.trim()).filter(Boolean)
      });
      setShowResModal(false);
      setNewRes({
        title: '',
        description: '',
        subject: 'Data Structures & Algorithms',
        topic: 'Graph Traversals (BFS & DFS)',
        difficulty: 'Intermediate',
        resourceType: 'Article',
        url: '',
        estimatedMinutes: 30,
        provider: 'Academic Reference',
        tagsString: ''
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Delete this curriculum resource?')) return;
    try {
      await api.deleteAdminResource(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resource');
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.question || !newQ.opt0 || !newQ.opt1 || !newQ.opt2 || !newQ.opt3) return;

    try {
      await api.createAdminQuestion({
        subject: newQ.subject,
        topic: newQ.topic,
        difficulty: newQ.difficulty,
        question: newQ.question,
        options: [newQ.opt0, newQ.opt1, newQ.opt2, newQ.opt3],
        correctIndex: Number(newQ.correctIndex),
        explanation: newQ.explanation
      });
      setShowQModal(false);
      setNewQ({
        subject: 'Data Structures & Algorithms',
        topic: 'Graph Traversals (BFS & DFS)',
        difficulty: 'Medium',
        question: '',
        opt0: '',
        opt1: '',
        opt2: '',
        opt3: '',
        correctIndex: 0,
        explanation: ''
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add question');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Dashboard
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Curriculum Director</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Curriculum & Assessment Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add vetted educational resources, expand adaptive quiz question banks, and audit platform adoption.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'resources' ? (
            <button
              onClick={() => setShowResModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>
          ) : (
            <button
              onClick={() => setShowQModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Quiz Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Students</span>
          <p className="text-2xl font-bold text-slate-900">{stats?.studentsCount || 0}</p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Resources</span>
          <p className="text-2xl font-bold text-slate-900">{stats?.resourcesCount || 0}</p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Question Bank</span>
          <p className="text-2xl font-bold text-slate-900">{stats?.questionsCount || 0}</p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Quizzes Taken</span>
          <p className="text-2xl font-bold text-slate-900">{stats?.quizzesTakenCount || 0}</p>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Hours Logged</span>
          <p className="text-2xl font-bold text-slate-900">{stats?.totalPlatformStudyHours || 0} hrs</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'resources' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Curated Educational Resources ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'questions' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Question Bank Management
        </button>
      </div>

      {/* Resources Table */}
      {activeTab === 'resources' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5">Title & Provider</th>
                  <th className="pb-2.5">Subject & Topic</th>
                  <th className="pb-2.5">Type & Level</th>
                  <th className="pb-2.5">Est. Time</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="py-3 pr-2">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">
                        {r.title}
                      </a>
                      <p className="text-[11px] text-slate-500">{r.provider}</p>
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-slate-900">{r.subject}</p>
                      <p className="text-[11px] text-slate-500">{r.topic}</p>
                    </td>
                    <td className="py-3">
                      <span>{r.resourceType} · {r.difficulty}</span>
                    </td>
                    <td className="py-3">{r.estimatedMinutes} mins</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteResource(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Questions Manager Notice */}
      {activeTab === 'questions' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center max-w-md mx-auto space-y-3">
          <HelpCircle className="w-10 h-10 text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Add Questions to the Bank</h3>
          <p className="text-xs text-slate-500">
            Current question bank has {stats?.questionsCount || 0} active validated questions across all major subjects. Click &quot;Add Quiz Question&quot; to expand topics.
          </p>
          <button
            onClick={() => setShowQModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
          >
            Create New Question
          </button>
        </div>
      )}

      {/* Add Resource Modal */}
      {showResModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Curated Educational Resource</h3>

            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newRes.title}
                  onChange={e => setNewRes({ ...newRes, title: e.target.value })}
                  placeholder="e.g. Stanford CS106B Lecture: Recursion and Backtracking"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target URL *</label>
                <input
                  type="url"
                  value={newRes.url}
                  onChange={e => setNewRes({ ...newRes, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newRes.subject}
                    onChange={e => setNewRes({ ...newRes, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={newRes.topic}
                    onChange={e => setNewRes({ ...newRes, topic: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Format</label>
                  <select
                    value={newRes.resourceType}
                    onChange={e => setNewRes({ ...newRes, resourceType: e.target.value })}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Video">Video</option>
                    <option value="Interactive">Interactive</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Article">Article</option>
                    <option value="Practice">Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newRes.difficulty}
                    onChange={e => setNewRes({ ...newRes, difficulty: e.target.value as any })}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minutes</label>
                  <input
                    type="number"
                    value={newRes.estimatedMinutes}
                    onChange={e => setNewRes({ ...newRes, estimatedMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Name</label>
                <input
                  type="text"
                  value={newRes.provider}
                  onChange={e => setNewRes({ ...newRes, provider: e.target.value })}
                  placeholder="e.g. MIT OpenCourseWare"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showQModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900">Add Question to Bank</h3>

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newQ.subject}
                    onChange={e => setNewQ({ ...newQ, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={newQ.topic}
                    onChange={e => setNewQ({ ...newQ, topic: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question Statement *</label>
                <textarea
                  rows={2}
                  value={newQ.question}
                  onChange={e => setNewQ({ ...newQ, question: e.target.value })}
                  placeholder="e.g. What is the time complexity of searching an element in a balanced AVL tree?"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">4 Multiple-Choice Options</label>
                <input
                  type="text"
                  placeholder="Option A"
                  value={newQ.opt0}
                  onChange={e => setNewQ({ ...newQ, opt0: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Option B"
                  value={newQ.opt1}
                  onChange={e => setNewQ({ ...newQ, opt1: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Option C"
                  value={newQ.opt2}
                  onChange={e => setNewQ({ ...newQ, opt2: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Option D"
                  value={newQ.opt3}
                  onChange={e => setNewQ({ ...newQ, opt3: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Option</label>
                  <select
                    value={newQ.correctIndex}
                    onChange={e => setNewQ({ ...newQ, correctIndex: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newQ.difficulty}
                    onChange={e => setNewQ({ ...newQ, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pedagogical Explanation</label>
                <textarea
                  rows={2}
                  value={newQ.explanation}
                  onChange={e => setNewQ({ ...newQ, explanation: e.target.value })}
                  placeholder="Explain why this option is correct so students learn on submission..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Tag,
  Calendar
} from 'lucide-react';
import { api } from '../services/api.js';
import { Note } from '../types.js';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [subjects, setSubjects] = useState<any[]>([]);

  // Note editor modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    subject: 'Data Structures & Algorithms',
    topic: 'Binary Search Trees',
    tagsString: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const [notesData, subjectsData] = await Promise.all([
        api.getNotes({
          subject: selectedSubject !== 'All' ? selectedSubject : undefined,
          search: search.trim() ? search : undefined
        }),
        api.getSubjects()
      ]);
      setNotes(notesData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedSubject]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotes();
  };

  const openNewNoteModal = () => {
    setEditingNoteId(null);
    setNoteForm({
      title: '',
      content: '',
      subject: subjects.length > 0 ? subjects[0].name : 'General',
      topic: 'Core Summary',
      tagsString: ''
    });
    setShowEditor(true);
  };

  const openEditNoteModal = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title,
      content: note.content,
      subject: note.subject,
      topic: note.topic,
      tagsString: (note.tags || []).join(', ')
    });
    setShowEditor(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;

    const tags = noteForm.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      if (editingNoteId) {
        await api.updateNote(editingNoteId, {
          title: noteForm.title,
          content: noteForm.content,
          subject: noteForm.subject,
          topic: noteForm.topic,
          tags
        });
      } else {
        await api.createNote({
          title: noteForm.title,
          content: noteForm.content,
          subject: noteForm.subject,
          topic: noteForm.topic,
          tags
        });
      }
      setShowEditor(false);
      await fetchNotes();
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Delete this study note?')) return;
    try {
      await api.deleteNote(id);
      await fetchNotes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete note');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Student Knowledge Vault
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Persistent Notebook & Tutor Snippets
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Study Notes & Bookmarks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize conceptual summaries, formulas, and insights saved directly from your AI Tutor sessions.
          </p>
        </div>

        <button
          onClick={openNewNoteModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes by keyword or tag..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
        >
          <option value="All">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No notes found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Capture revision points or save insights from the AI Tutor to build your revision bank.
          </p>
          <button
            onClick={openNewNoteModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
          >
            Create First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map(note => (
            <div
              key={note.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2 text-slate-500">
                  <span className="font-semibold text-blue-600">{note.subject}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {note.updatedAt?.split('T')[0]}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{note.title}</h3>
                <span className="text-[11px] font-medium text-slate-500 block mb-2">
                  Topic: {note.topic}
                </span>

                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-6">
                  {note.content}
                </p>

                {note.tutorSnippet && (
                  <div className="mt-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-[11px] text-blue-900">
                    <span className="font-bold block mb-0.5">Tutor Challenge Question:</span>
                    <span className="italic">{note.tutorSnippet}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(note.tags || []).slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditNoteModal(note)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Edit Note"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {editingNoteId ? 'Edit Study Note' : 'Create New Study Note'}
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. BST Invariants & Recursive Traversal"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={noteForm.subject}
                    onChange={e => setNoteForm({ ...noteForm, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={noteForm.topic}
                    onChange={e => setNoteForm({ ...noteForm, topic: e.target.value })}
                    placeholder="e.g. Binary Search Trees"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content / Formulas *</label>
                <textarea
                  rows={6}
                  value={noteForm.content}
                  onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Write clear conceptual bullet points, derivations, or code snippets..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={noteForm.tagsString}
                  onChange={e => setNoteForm({ ...noteForm, tagsString: e.target.value })}
                  placeholder="e.g. trees, exam-review, formulas"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

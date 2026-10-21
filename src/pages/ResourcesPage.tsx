import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Star,
  Clock,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import { api } from '../services/api.js';
import { LearningResource } from '../types.js';

export const ResourcesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'bookmarked'>('recommended');
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Rate modal
  const [ratingResource, setRatingResource] = useState<LearningResource | null>(null);
  const [ratingVal, setRatingVal] = useState(5);

  const fetchResources = async () => {
    try {
      setLoading(true);
      if (activeTab === 'recommended') {
        const data = await api.getRecommendedResources();
        setResources(data);
      } else {
        const data = await api.getResources({
          subject: selectedSubject !== 'All' ? selectedSubject : undefined,
          type: selectedType !== 'All' ? selectedType : undefined,
          search: search.trim() ? search : undefined
        });
        setResources(data);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [activeTab, selectedSubject, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleToggleBookmark = async (resId: string) => {
    try {
      const res = await api.toggleBookmark(resId);
      setResources(prev =>
        prev.map(r => r.id === resId ? { ...r, isBookmarked: res.isBookmarked } : r)
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle bookmark');
    }
  };

  const handleCompleteResource = async (res: LearningResource) => {
    setRatingResource(res);
  };

  const submitCompletionWithRating = async () => {
    if (!ratingResource) return;
    try {
      await api.completeResource(ratingResource.id, ratingVal);
      setResources(prev =>
        prev.map(r => r.id === ratingResource.id ? { ...r, isCompleted: true, userRating: ratingVal } : r)
      );
      setRatingResource(null);
    } catch (err: any) {
      alert(err.message || 'Failed to complete resource');
    }
  };

  const displayedList = activeTab === 'bookmarked'
    ? resources.filter(r => r.isBookmarked)
    : resources;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Curated Curriculum
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Verified Legitimate Providers
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Learning Resource Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic recommendations scored to your weak topics, preferred media formats, and academic goals.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'recommended' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Recommended for You</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Resources
          </button>

          <button
            onClick={() => setActiveTab('bookmarked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'bookmarked' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>Saved Bookmarks</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {activeTab !== 'recommended' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title, description, or tags..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Subjects</option>
              <option value="Data Structures & Algorithms">Data Structures</option>
              <option value="Python Programming">Python</option>
              <option value="Full-Stack Web Development">Web Development</option>
              <option value="Data Science & Machine Learning">Data Science</option>
              <option value="Discrete Mathematics & Linear Algebra">Mathematics</option>
            </select>

            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Formats</option>
              <option value="Video">Video</option>
              <option value="Interactive">Interactive</option>
              <option value="Documentation">Documentation</option>
              <option value="Article">Article</option>
              <option value="Practice">Practice</option>
            </select>
          </div>
        </div>
      )}

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Loading learning resources...
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No resources matched</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different subject filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedList.map(resource => (
            <div
              key={resource.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-blue-300 ${
                resource.isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* Match Score & Provider Pill-free Header */}
                <div className="flex items-center justify-between text-[11px] mb-2 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-blue-600">{resource.provider}</span>
                    <span>·</span>
                    <span>{resource.resourceType}</span>
                    <span>·</span>
                    <span>{resource.difficulty}</span>
                  </div>

                  {resource.matchScore && (
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                      {resource.matchScore}% Match
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {resource.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                  {resource.description}
                </p>

                {resource.reason && (
                  <div className="mt-3 p-2 bg-blue-50/60 rounded-xl text-[11px] text-blue-900 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{resource.reason}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {resource.estimatedMinutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {resource.ratingAverage}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleBookmark(resource.id)}
                    title={resource.isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      resource.isBookmarked
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {resource.isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleCompleteResource(resource)}
                    title="Mark Completed"
                    className={`p-1.5 rounded-lg transition-colors ${
                      resource.isCompleted
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete & Rate Resource Modal */}
      {ratingResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Mark Resource Completed</h3>
            <p className="text-xs text-slate-500 mt-1">
              {ratingResource.title}
            </p>

            <div className="my-5">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Rate this resource (1 - 5 stars):
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingVal(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= ratingVal
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRatingResource(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={submitCompletionWithRating}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

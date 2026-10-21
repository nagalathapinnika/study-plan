import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { getRecommendedResources } from '../services/recommendation.js';
import { Bookmark, ResourceCompletion } from '../types.js';

const router = Router();

router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { subject, topic, type, search } = req.query;

  const userBookmarks = new Set(db.bookmarks.filter(b => b.userId === userId).map(b => b.resourceId));
  const userCompletions = new Map(db.resourceCompletions.filter(c => c.userId === userId).map(c => [c.resourceId, c]));

  let list = [...db.learningResources];

  if (subject && subject !== 'All') {
    list = list.filter(r => r.subject === subject);
  }
  if (topic && topic !== 'All') {
    list = list.filter(r => r.topic === topic);
  }
  if (type && type !== 'All') {
    list = list.filter(r => r.resourceType === type);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  const enriched = list.map(r => ({
    ...r,
    isBookmarked: userBookmarks.has(r.id),
    isCompleted: userCompletions.has(r.id),
    userRating: userCompletions.get(r.id)?.rating
  }));

  res.json(enriched);
});

router.get('/recommendations', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const recommendations = getRecommendedResources(userId);
  res.json(recommendations);
});

router.post('/:id/bookmark', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;

  const resource = db.learningResources.find(r => r.id === id);
  if (!resource) {
    res.status(404).json({ error: 'Learning resource not found.' });
    return;
  }

  const existingIndex = db.bookmarks.findIndex(b => b.userId === userId && b.resourceId === id);
  let isBookmarked = false;

  if (existingIndex !== -1) {
    db.bookmarks.splice(existingIndex, 1);
    isBookmarked = false;
  } else {
    const bookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      userId,
      resourceId: id,
      createdAt: new Date().toISOString()
    };
    db.bookmarks.push(bookmark);
    isBookmarked = true;
  }

  db.save();
  res.json({ message: isBookmarked ? 'Bookmarked' : 'Bookmark removed', isBookmarked });
});

router.post('/:id/complete', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { rating } = req.body;

  const resource = db.learningResources.find(r => r.id === id);
  if (!resource) {
    res.status(404).json({ error: 'Learning resource not found.' });
    return;
  }

  let completion = db.resourceCompletions.find(c => c.userId === userId && c.resourceId === id);
  if (!completion) {
    completion = {
      id: `comp-${Date.now()}`,
      userId,
      resourceId: id,
      rating: rating ? Number(rating) : undefined,
      completedAt: new Date().toISOString()
    };
    db.resourceCompletions.push(completion);
  } else {
    if (rating) completion.rating = Number(rating);
  }

  // Update resource rating stats if rating provided
  if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
    const rVal = Number(rating);
    const newCount = resource.ratingsCount + 1;
    resource.ratingAverage = Math.round(((resource.ratingAverage * resource.ratingsCount + rVal) / newCount) * 10) / 10;
    resource.ratingsCount = newCount;
  }

  db.save();
  res.json({ message: 'Resource marked as completed', completion });
});

export default router;

import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { RevisionSchedule } from '../types.js';

const router = Router();

router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const todayStr = new Date().toISOString().split('T')[0];

  const list = db.revisionSchedules.filter(r => r.userId === userId);

  // Dynamically flag items whose nextReviewDate <= today as Due
  list.forEach(r => {
    if (r.status !== 'Completed' && r.nextReviewDate <= todayStr) {
      r.status = 'Due';
    }
  });

  // Sort Due first, then by nextReviewDate ascending
  list.sort((a, b) => {
    if (a.status === 'Due' && b.status !== 'Due') return -1;
    if (b.status === 'Due' && a.status !== 'Due') return 1;
    return a.nextReviewDate.localeCompare(b.nextReviewDate);
  });

  const dueCount = list.filter(r => r.status === 'Due').length;
  const upcomingCount = list.filter(r => r.status === 'Upcoming').length;

  res.json({ revisions: list, dueCount, upcomingCount });
});

router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { subject, topic, intervalDays = 3 } = req.body;

  if (!subject || !topic) {
    res.status(400).json({ error: 'Subject and topic are required.' });
    return;
  }

  const days = Number(intervalDays) || 3;
  const nextDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

  const item: RevisionSchedule = {
    id: `rev-${Date.now()}`,
    userId,
    subject,
    topic,
    lastQuizScore: 70,
    intervalDays: days,
    nextReviewDate: nextDate,
    status: 'Upcoming',
    repetitionCount: 0
  };

  db.revisionSchedules.push(item);
  db.save();

  res.status(201).json(item);
});

router.patch('/:id/complete', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;

  const rev = db.revisionSchedules.find(r => r.id === id && r.userId === userId);
  if (!rev) {
    res.status(404).json({ error: 'Revision schedule item not found.' });
    return;
  }

  rev.repetitionCount += 1;
  rev.lastReviewedDate = new Date().toISOString().split('T')[0];

  // SuperMemo / Leitner progression: double interval or advance
  const nextInterval = Math.min(30, Math.round(rev.intervalDays * 2));
  rev.intervalDays = nextInterval;
  rev.nextReviewDate = new Date(Date.now() + nextInterval * 86400000).toISOString().split('T')[0];
  rev.status = 'Upcoming';

  db.save();

  res.json({
    message: `Topic reviewed successfully! Next spaced review scheduled in ${nextInterval} days.`,
    revision: rev
  });
});

export default router;

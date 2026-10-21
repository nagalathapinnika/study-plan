import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { StudySession } from '../types.js';

const router = Router();

router.post('/start', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { subject, topic, plannedDuration = 45 } = req.body;

  if (!subject || !topic) {
    res.status(400).json({ error: 'Subject and topic are required to start a session.' });
    return;
  }

  // Terminate or complete any lingering active sessions for this user to avoid overlapping count
  db.studySessions
    .filter(s => s.userId === userId && s.status === 'active')
    .forEach(s => {
      s.status = 'completed';
      s.endTime = new Date().toISOString();
    });

  const session: StudySession = {
    id: `sess-${Date.now()}`,
    userId,
    subject,
    topic,
    plannedDuration: Number(plannedDuration) || 45,
    actualDuration: 0,
    startTime: new Date().toISOString(),
    status: 'active'
  };

  db.studySessions.push(session);
  db.save();

  res.status(201).json(session);
});

router.patch('/:id/pause', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;

  const session = db.studySessions.find(s => s.id === id && s.userId === userId);
  if (!session) {
    res.status(404).json({ error: 'Study session not found.' });
    return;
  }

  session.status = 'paused';
  db.save();
  res.json({ message: 'Session paused', session });
});

router.patch('/:id/resume', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;

  const session = db.studySessions.find(s => s.id === id && s.userId === userId);
  if (!session) {
    res.status(404).json({ error: 'Study session not found.' });
    return;
  }

  session.status = 'active';
  db.save();
  res.json({ message: 'Session resumed', session });
});

router.patch('/:id/complete', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { actualDuration, notes, isProductive } = req.body;

  const session = db.studySessions.find(s => s.id === id && s.userId === userId);
  if (!session) {
    res.status(404).json({ error: 'Study session not found.' });
    return;
  }

  session.status = 'completed';
  session.endTime = new Date().toISOString();
  if (actualDuration !== undefined) {
    session.actualDuration = Number(actualDuration);
  } else {
    // calculate from startTime to now
    const diffMins = Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000);
    session.actualDuration = Math.max(1, diffMins);
  }

  if (notes !== undefined) session.notes = notes;
  if (isProductive !== undefined) session.isProductive = Boolean(isProductive);

  // Update study hours goals
  const hoursAdded = session.actualDuration / 60;
  const hourGoals = db.goals.filter(g => g.userId === userId && g.targetMetric === 'study_hours' && g.status === 'in_progress');
  for (const goal of hourGoals) {
    goal.currentProgress = Math.round((goal.currentProgress + hoursAdded) * 10) / 10;
    if (goal.currentProgress >= goal.targetValue) {
      goal.status = 'achieved';
    }
  }

  db.save();
  res.json({ message: 'Session recorded successfully', session });
});

router.get('/history', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const history = db.studySessions
    .filter(s => s.userId === userId)
    .sort((a, b) => b.startTime.localeCompare(a.startTime));

  const totalMinutes = history.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.actualDuration, 0);
  const productiveCount = history.filter(s => s.status === 'completed' && s.isProductive).length;
  const completedCount = history.filter(s => s.status === 'completed').length;

  res.json({
    sessions: history,
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    productivityRate: completedCount > 0 ? Math.round((productiveCount / completedCount) * 100) : 100
  });
});

export default router;

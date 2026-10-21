import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { Goal } from '../types.js';

const router = Router();

router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const goals = db.goals.filter(g => g.userId === userId);
  res.json(goals);
});

router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { title, description = '', subject, targetDate, targetMetric = 'study_hours', targetValue = 10 } = req.body;

  if (!title || !targetDate) {
    res.status(400).json({ error: 'Title and target date are required.' });
    return;
  }

  const goal: Goal = {
    id: `goal-${Date.now()}`,
    userId,
    title,
    description,
    subject: subject || undefined,
    targetDate,
    targetMetric,
    currentProgress: 0,
    targetValue: Number(targetValue) || 10,
    status: 'in_progress',
    createdAt: new Date().toISOString()
  };

  db.goals.push(goal);
  db.save();

  res.status(201).json(goal);
});

router.patch('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { currentProgress, status, title } = req.body;

  const goal = db.goals.find(g => g.id === id && g.userId === userId);
  if (!goal) {
    res.status(404).json({ error: 'Goal not found.' });
    return;
  }

  if (title) goal.title = title;
  if (currentProgress !== undefined) {
    goal.currentProgress = Number(currentProgress);
    if (goal.currentProgress >= goal.targetValue) {
      goal.status = 'achieved';
    }
  }
  if (status) goal.status = status;

  db.save();
  res.json({ message: 'Goal updated', goal });
});

router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;

  const index = db.goals.findIndex(g => g.id === id && g.userId === userId);
  if (index === -1) {
    res.status(404).json({ error: 'Goal not found.' });
    return;
  }

  db.goals.splice(index, 1);
  db.save();
  res.json({ message: 'Goal deleted successfully.' });
});

router.get('/achievements', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const userAchievements = db.achievements.filter(a => a.userId === userId);

  // Available catalog
  const catalog = [
    { badgeId: 'streak_3', title: '3-Day Momentum', description: 'Log study sessions 3 days in a row', icon: 'Flame' },
    { badgeId: 'streak_7', title: 'Weekly Champion', description: 'Log study sessions 7 consecutive days', icon: 'Zap' },
    { badgeId: 'quiz_ace', title: 'First Perfect Quiz', description: 'Score 100% on any practice assessment', icon: 'Award' },
    { badgeId: 'marathon_10', title: '10 Hours Logged', description: 'Complete 10 hours of focused study time', icon: 'Clock' },
    { badgeId: 'master_planner', title: 'Plan Architect', description: 'Generate and complete your first personalized study plan', icon: 'CheckCircle' },
    { badgeId: 'curious_mind', title: 'Deep Inquirer', description: 'Ask the AI Tutor 5 or more in-depth conceptual questions', icon: 'Sparkles' }
  ];

  const unlockedMap = new Map(userAchievements.map(a => [a.badgeId, a.unlockedAt]));

  const result = catalog.map(c => ({
    ...c,
    isUnlocked: unlockedMap.has(c.badgeId),
    unlockedAt: unlockedMap.get(c.badgeId) || null
  }));

  res.json(result);
});

export default router;

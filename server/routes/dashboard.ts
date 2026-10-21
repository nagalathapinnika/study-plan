import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { getDashboardSummary, getActivityAnalytics } from '../services/analytics.js';

const router = Router();

router.get('/summary', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const summary = getDashboardSummary(userId);
  res.json(summary);
});

router.get('/activity', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const activity = getActivityAnalytics(userId);
  res.json(activity);
});

export default router;

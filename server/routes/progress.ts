import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';

const router = Router();

router.get('/summary', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;

  const tasks = db.studyTasks.filter(t => t.userId === userId);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const taskCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const sessions = db.studySessions.filter(s => s.userId === userId && s.status === 'completed');
  const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.actualDuration, 0);

  const quizzes = db.quizAttempts.filter(q => q.userId === userId);
  const avgQuizScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((acc, q) => acc + q.percentage, 0) / quizzes.length)
    : 0;

  const goals = db.goals.filter(g => g.userId === userId);
  const achievedGoals = goals.filter(g => g.status === 'achieved').length;

  res.json({
    metrics: {
      totalTasks,
      completedTasks,
      taskCompletionPct,
      totalStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
      totalQuizzes: quizzes.length,
      avgQuizScore,
      totalGoals: goals.length,
      achievedGoals
    },
    methodologyNotes: {
      completionRate: 'Calculated as (completedTasks / totalPlannedTasks) * 100.',
      quizScoreAverage: 'Calculated as the arithmetic mean of percentage scores across all validated assessment attempts.',
      learningRecommendations: 'Recommendations are data-driven estimates derived from current quiz performance and study habits; they do not claim to measure innate intelligence.'
    }
  });
});

router.get('/subjects', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const quizzes = db.quizAttempts.filter(q => q.userId === userId);
  const tasks = db.studyTasks.filter(t => t.userId === userId);
  const sessions = db.studySessions.filter(s => s.userId === userId && s.status === 'completed');

  const subjectStats: Record<string, {
    subject: string;
    quizCount: number;
    quizTotalPct: number;
    studyMinutes: number;
    tasksTotal: number;
    tasksDone: number;
  }> = {};

  for (const s of db.subjects) {
    subjectStats[s.name] = {
      subject: s.name,
      quizCount: 0,
      quizTotalPct: 0,
      studyMinutes: 0,
      tasksTotal: 0,
      tasksDone: 0
    };
  }

  for (const q of quizzes) {
    if (!subjectStats[q.subject]) {
      subjectStats[q.subject] = { subject: q.subject, quizCount: 0, quizTotalPct: 0, studyMinutes: 0, tasksTotal: 0, tasksDone: 0 };
    }
    subjectStats[q.subject].quizCount++;
    subjectStats[q.subject].quizTotalPct += q.percentage;
  }

  for (const t of tasks) {
    if (!subjectStats[t.subject]) {
      subjectStats[t.subject] = { subject: t.subject, quizCount: 0, quizTotalPct: 0, studyMinutes: 0, tasksTotal: 0, tasksDone: 0 };
    }
    subjectStats[t.subject].tasksTotal++;
    if (t.status === 'Completed') subjectStats[t.subject].tasksDone++;
  }

  for (const sess of sessions) {
    if (!subjectStats[sess.subject]) {
      subjectStats[sess.subject] = { subject: sess.subject, quizCount: 0, quizTotalPct: 0, studyMinutes: 0, tasksTotal: 0, tasksDone: 0 };
    }
    subjectStats[sess.subject].studyMinutes += sess.actualDuration;
  }

  const result = Object.values(subjectStats).map(s => {
    const avgScore = s.quizCount > 0 ? Math.round(s.quizTotalPct / s.quizCount) : null;
    const taskPct = s.tasksTotal > 0 ? Math.round((s.tasksDone / s.tasksTotal) * 100) : 0;
    const studyHours = Math.round((s.studyMinutes / 60) * 10) / 10;
    return {
      subject: s.subject,
      avgScore,
      studyHours,
      tasksTotal: s.tasksTotal,
      tasksDone: s.tasksDone,
      taskPct,
      masteryStatus: avgScore !== null && avgScore >= 80 ? 'Proficient' : avgScore !== null && avgScore < 65 ? 'Needs Focus' : 'Developing'
    };
  });

  res.json(result);
});

router.get('/trends', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const quizzes = db.quizAttempts
    .filter(q => q.userId === userId)
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));

  const trends = quizzes.map((q, idx) => ({
    attemptNumber: idx + 1,
    topic: q.topic,
    subject: q.subject,
    score: q.percentage,
    date: q.completedAt.split('T')[0]
  }));

  res.json(trends);
});

export default router;

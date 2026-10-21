import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { generatePersonalizedStudyPlan } from '../services/studyPlanGenerator.js';

const router = Router();

router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const plans = db.studyPlans.filter(p => p.userId === userId);
  res.json(plans);
});

router.post('/generate', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const {
    title,
    subjects,
    currentSkillLevel = 'Intermediate',
    availableHoursPerDay = 3,
    examDate,
    targetDays = 14,
    learningGoal = 'Comprehensive mastery and exam preparation'
  } = req.body;

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    res.status(400).json({ error: 'At least one subject must be selected for study plan generation.' });
    return;
  }

  const { plan, tasks } = generatePersonalizedStudyPlan({
    userId,
    title: title || `${subjects.join(' & ')} Study Plan`,
    subjects,
    currentSkillLevel,
    availableHoursPerDay: Number(availableHoursPerDay) || 3,
    examDate,
    targetDays: Number(targetDays) || 14,
    learningGoal
  });

  db.studyPlans.push(plan);
  tasks.forEach(t => db.studyTasks.push(t));
  db.save();

  res.status(201).json({
    message: 'Personalized study plan generated successfully!',
    plan,
    tasks
  });
});

router.get('/:planId', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { planId } = req.params;

  const plan = db.studyPlans.find(p => p.id === planId && p.userId === userId);
  if (!plan) {
    res.status(404).json({ error: 'Study plan not found.' });
    return;
  }

  const tasks = db.studyTasks.filter(t => t.planId === planId);
  res.json({ plan, tasks });
});

router.put('/:planId', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { planId } = req.params;
  const { title, status, availableHoursPerDay, examDate, targetCompletionDate } = req.body;

  const planIndex = db.studyPlans.findIndex(p => p.id === planId && p.userId === userId);
  if (planIndex === -1) {
    res.status(404).json({ error: 'Study plan not found.' });
    return;
  }

  const plan = db.studyPlans[planIndex];
  if (title) plan.title = title;
  if (status) plan.status = status;
  if (availableHoursPerDay) plan.availableHoursPerDay = Number(availableHoursPerDay);
  if (examDate !== undefined) plan.examDate = examDate;
  if (targetCompletionDate) plan.targetCompletionDate = targetCompletionDate;

  db.save();
  res.json({ message: 'Study plan updated successfully', plan });
});

router.delete('/:planId', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { planId } = req.params;

  const planIndex = db.studyPlans.findIndex(p => p.id === planId && p.userId === userId);
  if (planIndex === -1) {
    res.status(404).json({ error: 'Study plan not found.' });
    return;
  }

  db.studyPlans.splice(planIndex, 1);
  // Remove associated tasks
  const remainingTasks = db.studyTasks.filter(t => t.planId !== planId);
  db.studyTasks.length = 0;
  remainingTasks.forEach(t => db.studyTasks.push(t));

  db.save();
  res.json({ message: 'Study plan and associated tasks deleted successfully.' });
});

export default router;

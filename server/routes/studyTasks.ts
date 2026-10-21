import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { StudyTask } from '../types.js';

const router = Router();

router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { planId, date, status } = req.query;

  let tasks = db.studyTasks.filter(t => t.userId === userId);

  if (planId) {
    tasks = tasks.filter(t => t.planId === planId);
  }
  if (date) {
    tasks = tasks.filter(t => t.date === date);
  }
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }

  // Sort by date ascending, then time
  tasks.sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));

  res.json(tasks);
});

router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const {
    planId,
    subject,
    topic,
    date,
    timeSlot = '10:00 - 11:00',
    estimatedDuration = 60,
    priority = 'Medium',
    difficulty = 'Medium',
    learningObjective,
    recommendedResourceTitle,
    recommendedResourceUrl
  } = req.body;

  if (!subject || !topic || !date) {
    res.status(400).json({ error: 'Subject, topic, and date are required.' });
    return;
  }

  const newTask: StudyTask = {
    id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    planId: planId || 'manual',
    userId,
    subject,
    topic,
    date,
    timeSlot,
    estimatedDuration: Number(estimatedDuration) || 60,
    priority,
    difficulty,
    learningObjective: learningObjective || `Study and practice ${topic}`,
    recommendedResourceTitle,
    recommendedResourceUrl,
    status: 'Pending'
  };

  db.studyTasks.push(newTask);
  db.save();

  res.status(201).json(newTask);
});

router.patch('/:taskId', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { taskId } = req.params;
  const { status, timeSlot, date, priority, learningObjective } = req.body;

  const task = db.studyTasks.find(t => t.id === taskId && t.userId === userId);
  if (!task) {
    res.status(404).json({ error: 'Study task not found.' });
    return;
  }

  if (status) {
    task.status = status;
    if (status === 'Completed') {
      task.completedAt = new Date().toISOString();

      // Check task-related goals
      const goals = db.goals.filter(g => g.userId === userId && g.targetMetric === 'tasks_completed' && g.status === 'in_progress');
      for (const goal of goals) {
        goal.currentProgress += 1;
        if (goal.currentProgress >= goal.targetValue) {
          goal.status = 'achieved';
        }
      }
    }
  }

  if (timeSlot) task.timeSlot = timeSlot;
  if (date) task.date = date;
  if (priority) task.priority = priority;
  if (learningObjective) task.learningObjective = learningObjective;

  db.save();
  res.json({ message: 'Task updated successfully', task });
});

router.delete('/:taskId', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { taskId } = req.params;

  const index = db.studyTasks.findIndex(t => t.id === taskId && t.userId === userId);
  if (index === -1) {
    res.status(404).json({ error: 'Study task not found.' });
    return;
  }

  db.studyTasks.splice(index, 1);
  db.save();
  res.json({ message: 'Task deleted successfully.' });
});

export default router;

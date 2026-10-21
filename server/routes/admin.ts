import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../services/auth.js';
import { LearningResource, QuizQuestion } from '../types.js';

const router = Router();

// Protect all admin endpoints
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', (_req: AuthenticatedRequest, res: Response): void => {
  const studentsCount = db.users.filter(u => u.role === 'student').length;
  const resourcesCount = db.learningResources.length;
  const questionsCount = db.quizQuestions.length;
  const quizzesTakenCount = db.quizAttempts.length;
  const sessionsCount = db.studySessions.length;
  const totalStudyMinutes = db.studySessions.reduce((sum, s) => sum + s.actualDuration, 0);

  res.json({
    studentsCount,
    resourcesCount,
    questionsCount,
    quizzesTakenCount,
    sessionsCount,
    totalPlatformStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10
  });
});

router.post('/resources', (req: AuthenticatedRequest, res: Response): void => {
  const {
    title,
    description,
    subject,
    topic,
    difficulty = 'Intermediate',
    resourceType = 'Article',
    url,
    estimatedMinutes = 30,
    provider = 'Custom Curriculum',
    tags = []
  } = req.body;

  if (!title || !subject || !topic || !url) {
    res.status(400).json({ error: 'Title, subject, topic, and URL are required.' });
    return;
  }

  const resource: LearningResource = {
    id: `res-${Date.now()}`,
    title,
    description: description || '',
    subject,
    topic,
    difficulty,
    resourceType,
    url,
    estimatedMinutes: Number(estimatedMinutes) || 30,
    provider,
    tags: Array.isArray(tags) ? tags : [],
    ratingAverage: 5.0,
    ratingsCount: 1
  };

  db.learningResources.push(resource);
  db.save();

  res.status(201).json(resource);
});

router.put('/resources/:id', (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const resource = db.learningResources.find(r => r.id === id);

  if (!resource) {
    res.status(404).json({ error: 'Resource not found.' });
    return;
  }

  const { title, description, subject, topic, difficulty, resourceType, url, estimatedMinutes, provider, tags } = req.body;

  if (title !== undefined) resource.title = title;
  if (description !== undefined) resource.description = description;
  if (subject !== undefined) resource.subject = subject;
  if (topic !== undefined) resource.topic = topic;
  if (difficulty !== undefined) resource.difficulty = difficulty;
  if (resourceType !== undefined) resource.resourceType = resourceType;
  if (url !== undefined) resource.url = url;
  if (estimatedMinutes !== undefined) resource.estimatedMinutes = Number(estimatedMinutes);
  if (provider !== undefined) resource.provider = provider;
  if (tags !== undefined) resource.tags = tags;

  db.save();
  res.json({ message: 'Resource updated', resource });
});

router.delete('/resources/:id', (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const index = db.learningResources.findIndex(r => r.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Resource not found.' });
    return;
  }

  db.learningResources.splice(index, 1);
  db.save();
  res.json({ message: 'Resource deleted successfully.' });
});

router.post('/questions', (req: AuthenticatedRequest, res: Response): void => {
  const { subject, topic, difficulty = 'Medium', question, options, correctIndex, explanation } = req.body;

  if (!subject || !topic || !question || !options || !Array.isArray(options) || options.length !== 4 || correctIndex === undefined) {
    res.status(400).json({ error: 'Subject, topic, question, 4 options, and correctIndex (0-3) are required.' });
    return;
  }

  const q: QuizQuestion = {
    id: `q-${Date.now()}`,
    subject,
    topic,
    difficulty,
    question,
    options,
    correctIndex: Number(correctIndex),
    explanation: explanation || 'Standard textbook explanation.'
  };

  db.quizQuestions.push(q);
  db.save();

  res.status(201).json(q);
});

router.delete('/questions/:id', (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const index = db.quizQuestions.findIndex(q => q.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Question not found.' });
    return;
  }

  db.quizQuestions.splice(index, 1);
  db.save();
  res.json({ message: 'Question deleted successfully.' });
});

export default router;

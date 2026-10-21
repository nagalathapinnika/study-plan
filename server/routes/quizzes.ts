import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { QuizAttempt, RevisionSchedule } from '../types.js';

const router = Router();

router.get('/', authenticateToken, (_req: AuthenticatedRequest, res: Response): void => {
  // Aggregate available subjects and topics from questions
  const taxonomy: Record<string, { topic: string; questionCount: number }[]> = {};

  for (const q of db.quizQuestions) {
    if (!taxonomy[q.subject]) {
      taxonomy[q.subject] = [];
    }
    let entry = taxonomy[q.subject].find(e => e.topic === q.topic);
    if (!entry) {
      entry = { topic: q.topic, questionCount: 0 };
      taxonomy[q.subject].push(entry);
    }
    entry.questionCount++;
  }

  res.json({ taxonomy, totalQuestionsInBank: db.quizQuestions.length });
});

router.post('/generate', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { subject, topic, requestedDifficulty } = req.body;

  if (!subject) {
    res.status(400).json({ error: 'Subject is required to generate quiz.' });
    return;
  }

  // Adaptive difficulty calculation based on user's past accuracy
  const pastAttempts = db.quizAttempts.filter(a => a.userId === userId && a.subject === subject);
  let resolvedDifficulty: 'Easy' | 'Medium' | 'Hard' = requestedDifficulty || 'Medium';

  if (!requestedDifficulty && pastAttempts.length > 0) {
    const avgScore = pastAttempts.reduce((sum, a) => sum + a.percentage, 0) / pastAttempts.length;
    if (avgScore >= 80) {
      resolvedDifficulty = 'Hard';
    } else if (avgScore < 60) {
      resolvedDifficulty = 'Easy';
    } else {
      resolvedDifficulty = 'Medium';
    }
  }

  // Filter questions
  let candidatePool = db.quizQuestions.filter(q => q.subject === subject);
  if (topic && topic !== 'All') {
    const topicMatches = candidatePool.filter(q => q.topic === topic);
    if (topicMatches.length > 0) {
      candidatePool = topicMatches;
    }
  }

  // Shuffle and pick up to 4 questions
  const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 4);

  if (selected.length === 0) {
    res.status(404).json({ error: 'No questions found for the selected subject/topic.' });
    return;
  }

  // Strip correctIndex and explanation to prevent client-side inspection before submission
  const clientQuestions = selected.map(q => ({
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options
  }));

  res.json({
    quizId: `quiz-${Date.now()}`,
    subject,
    topic: topic || selected[0].topic,
    adaptiveDifficulty: resolvedDifficulty,
    questions: clientQuestions
  });
});

router.post('/submit', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { subject, topic, difficulty = 'Medium', answers } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    res.status(400).json({ error: 'Answers array cannot be empty.' });
    return;
  }

  let score = 0;
  const detailedAnswers: QuizAttempt['answers'] = [];

  for (const item of answers) {
    const question = db.quizQuestions.find(q => q.id === item.questionId);
    if (!question) continue;

    const isCorrect = question.correctIndex === item.selectedOption;
    if (isCorrect) score++;

    detailedAnswers.push({
      questionId: question.id,
      questionText: question.question,
      selectedOption: item.selectedOption,
      correctOption: question.correctIndex,
      isCorrect,
      explanation: question.explanation
    });
  }

  const totalQuestions = detailedAnswers.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const attempt: QuizAttempt = {
    id: `att-${Date.now()}`,
    userId,
    subject: subject || 'General Assessment',
    topic: topic || 'Multiple Topics',
    difficulty: difficulty as any,
    score,
    totalQuestions,
    percentage,
    answers: detailedAnswers,
    completedAt: new Date().toISOString()
  };

  db.quizAttempts.push(attempt);

  // Update or schedule revision based on spaced-repetition logic
  const intervalDays = percentage < 65 ? 1 : percentage < 85 ? 3 : 7;
  const nextDate = new Date(Date.now() + intervalDays * 86400000).toISOString().split('T')[0];

  let rev = db.revisionSchedules.find(r => r.userId === userId && r.topic === attempt.topic);
  if (rev) {
    rev.lastQuizScore = percentage;
    rev.intervalDays = intervalDays;
    rev.nextReviewDate = nextDate;
    rev.status = 'Upcoming';
    rev.repetitionCount += 1;
  } else {
    rev = {
      id: `rev-${Date.now()}`,
      userId,
      subject: attempt.subject,
      topic: attempt.topic,
      lastQuizScore: percentage,
      intervalDays,
      nextReviewDate: nextDate,
      status: percentage < 65 ? 'Due' : 'Upcoming',
      repetitionCount: 1
    };
    db.revisionSchedules.push(rev);
  }

  // Update goals
  const quizGoals = db.goals.filter(g => g.userId === userId && g.status === 'in_progress');
  for (const goal of quizGoals) {
    if (goal.targetMetric === 'quizzes_completed') {
      goal.currentProgress += 1;
      if (goal.currentProgress >= goal.targetValue) goal.status = 'achieved';
    } else if (goal.targetMetric === 'quiz_score_pct' && (!goal.subject || goal.subject === subject)) {
      goal.currentProgress = Math.max(goal.currentProgress, percentage);
      if (goal.currentProgress >= goal.targetValue) goal.status = 'achieved';
    }
  }

  db.save();

  res.json({
    message: 'Quiz submitted successfully',
    attempt,
    spacedRepetitionNote:
      percentage < 65
        ? 'High-priority revision scheduled in 1 day to reinforce understanding.'
        : percentage < 85
        ? 'Solid performance! Scheduled review in 3 days.'
        : 'Mastery demonstrated! Spaced repetition interval extended to 7 days.'
  });
});

router.get('/history', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const history = db.quizAttempts
    .filter(a => a.userId === userId)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  res.json(history);
});

export default router;

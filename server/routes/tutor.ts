import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { askAiTutor } from '../services/geminiTutor.js';
import { TutorConversation, TutorMessage } from '../types.js';

const router = Router();

router.get('/conversations', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const conversations = db.tutorConversations
    .filter(c => c.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  res.json(conversations);
});

router.get('/conversations/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const conv = db.tutorConversations.find(c => c.id === req.params.id && c.userId === userId);

  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }

  res.json(conv);
});

router.post('/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const {
    conversationId,
    subject = 'Computer Science',
    topic = 'General Programming',
    question,
    explanationLevel = 'Intermediate',
    language = 'en'
  } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    res.status(400).json({ error: 'Question content cannot be empty.' });
    return;
  }

  const profile = db.studentProfiles.find(p => p.userId === userId);

  let conv: TutorConversation | undefined;
  if (conversationId) {
    conv = db.tutorConversations.find(c => c.id === conversationId && c.userId === userId);
  }

  const history = conv ? conv.messages.map(m => ({ role: m.role, content: m.content })) : [];

  // Generate Tutor Response
  const tutorResult = await askAiTutor({
    subject: conv ? conv.subject : subject,
    topic: conv ? conv.topic : topic,
    question,
    explanationLevel,
    language,
    educationLevel: profile?.educationLevel || 'Undergraduate Student',
    conversationHistory: history
  });

  const now = new Date().toISOString();
  const userMsg: TutorMessage = {
    id: `msg-${Date.now()}-u`,
    role: 'user',
    content: question.trim(),
    timestamp: now
  };

  const assistantMsg: TutorMessage = {
    id: `msg-${Date.now()}-a`,
    role: 'assistant',
    content: tutorResult.answer,
    keyPoints: tutorResult.keyPoints,
    practiceQuestion: tutorResult.practiceQuestion,
    timestamp: new Date().toISOString()
  };

  if (!conv) {
    // Generate brief title from question
    const title = question.length > 50 ? question.substring(0, 47) + '...' : question;
    conv = {
      id: `conv-${Date.now()}`,
      userId,
      subject,
      topic,
      explanationLevel,
      language,
      title,
      messages: [userMsg, assistantMsg],
      createdAt: now,
      updatedAt: now
    };
    db.tutorConversations.push(conv);
  } else {
    conv.messages.push(userMsg);
    conv.messages.push(assistantMsg);
    conv.updatedAt = now;
  }

  db.save();

  res.json({
    conversation: conv,
    reply: assistantMsg,
    meta: {
      isAiGenerated: tutorResult.isAiGenerated,
      modelUsed: tutorResult.modelUsed,
      notice: tutorResult.notice
    }
  });
});

export default router;

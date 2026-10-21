import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { Note } from '../types.js';

const router = Router();

router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { subject, search } = req.query;

  let notes = db.notes.filter(n => n.userId === userId);

  if (subject && subject !== 'All') {
    notes = notes.filter(n => n.subject === subject);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json(notes);
});

router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { title, content, subject = 'General', topic = 'General', tags = [], tutorSnippet } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }

  const now = new Date().toISOString();
  const note: Note = {
    id: `note-${Date.now()}`,
    userId,
    title,
    content,
    subject,
    topic,
    tags: Array.isArray(tags) ? tags : [],
    tutorSnippet: tutorSnippet || undefined,
    createdAt: now,
    updatedAt: now
  };

  db.notes.push(note);
  db.save();

  res.status(201).json(note);
});

router.put('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, content, subject, topic, tags } = req.body;

  const note = db.notes.find(n => n.id === id && n.userId === userId);
  if (!note) {
    res.status(404).json({ error: 'Note not found.' });
    return;
  }

  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (subject !== undefined) note.subject = subject;
  if (topic !== undefined) note.topic = topic;
  if (tags !== undefined) note.tags = tags;
  note.updatedAt = new Date().toISOString();

  db.save();
  res.json({ message: 'Note updated', note });
});

router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;

  const index = db.notes.findIndex(n => n.id === id && n.userId === userId);
  if (index === -1) {
    res.status(404).json({ error: 'Note not found.' });
    return;
  }

  db.notes.splice(index, 1);
  db.save();
  res.json({ message: 'Note deleted successfully.' });
});

export default router;

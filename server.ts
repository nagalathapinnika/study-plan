import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import authRoutes from './server/routes/auth.js';
import profileRoutes from './server/routes/profile.js';
import dashboardRoutes from './server/routes/dashboard.js';
import studyPlansRoutes from './server/routes/studyPlans.js';
import studyTasksRoutes from './server/routes/studyTasks.js';
import tutorRoutes from './server/routes/tutor.js';
import resourcesRoutes from './server/routes/resources.js';
import quizzesRoutes from './server/routes/quizzes.js';
import studySessionsRoutes from './server/routes/studySessions.js';
import progressRoutes from './server/routes/progress.js';
import revisionsRoutes from './server/routes/revisions.js';
import goalsRoutes from './server/routes/goals.js';
import notesRoutes from './server/routes/notes.js';
import adminRoutes from './server/routes/admin.js';
import subjectsRoutes from './server/routes/subjects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI-Powered Personalized Learning Assistant Backend'
  });
});

// Mount REST API Routers
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/study-plans', studyPlansRoutes);
app.use('/api/study-tasks', studyTasksRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/study-sessions', studySessionsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/revisions', revisionsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subjects', subjectsRoutes);

// Vite middleware mounting in development, or static in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Learning Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

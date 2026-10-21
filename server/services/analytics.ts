import { db } from '../db/database.js';

export interface DashboardSummary {
  studentName: string;
  totalSubjects: number;
  totalStudyHours: number;
  studyStreak: number;
  completedLessons: number;
  pendingTasks: number;
  quizAverageScore: number;
  overallLearningProgress: number; // percentage 0-100
  weakSubjects: { subject: string; averageScore: number; reason: string }[];
  recentlyStudied: { subject: string; topic: string; date: string }[];
  recommendedTopics: string[];
}

export interface ActivityData {
  weeklyStudyActivity: { day: string; hours: number; planned: number }[];
  subjectPerformance: { subject: string; score: number; completedTasks: number; totalTasks: number }[];
  scoreTrends: { date: string; score: number; topic: string }[];
}

export function calculateStudyStreak(userId: string): number {
  const sessions = db.studySessions
    .filter(s => s.userId === userId && s.status === 'completed')
    .map(s => s.startTime.split('T')[0]);

  const taskDates = db.studyTasks
    .filter(t => t.userId === userId && t.status === 'Completed' && t.completedAt)
    .map(t => t.completedAt!.split('T')[0]);

  const uniqueDates = Array.from(new Set([...sessions, ...taskDates])).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If haven't logged today or yesterday, streak is broken
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let expectedTime = uniqueDates[0] === todayStr ? Date.now() : Date.now() - 86400000;

  for (const dateStr of uniqueDates) {
    const expectedStr = new Date(expectedTime).toISOString().split('T')[0];
    if (dateStr === expectedStr) {
      streak++;
      expectedTime -= 86400000;
    } else {
      break;
    }
  }

  return Math.max(1, streak);
}

export function getDashboardSummary(userId: string): DashboardSummary {
  const user = db.users.find(u => u.id === userId);
  const profile = db.studentProfiles.find(p => p.userId === userId);

  const studentName = user ? user.name : 'Student';
  const subjectsOfInterest = profile?.subjectsOfInterest || ['Data Structures & Algorithms', 'Python Programming'];

  // Study hours from sessions
  const sessions = db.studySessions.filter(s => s.userId === userId && s.status === 'completed');
  const totalSessionMinutes = sessions.reduce((acc, s) => acc + (s.actualDuration || 0), 0);
  const totalStudyHours = Math.round((totalSessionMinutes / 60) * 10) / 10;

  const streak = calculateStudyStreak(userId);

  // Tasks
  const tasks = db.studyTasks.filter(t => t.userId === userId);
  const completedLessons = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

  // Quizzes
  const quizzes = db.quizAttempts.filter(q => q.userId === userId);
  const quizAverageScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((acc, q) => acc + q.percentage, 0) / quizzes.length)
    : 0;

  // Overall progress
  const totalItems = tasks.length + quizzes.length;
  const completedItems = completedLessons + quizzes.length;
  const overallLearningProgress = totalItems > 0
    ? Math.min(100, Math.round((completedItems / totalItems) * 100))
    : 0;

  // Weak subjects calculation
  const subjectScores: Record<string, { totalPct: number; count: number }> = {};
  for (const q of quizzes) {
    if (!subjectScores[q.subject]) {
      subjectScores[q.subject] = { totalPct: 0, count: 0 };
    }
    subjectScores[q.subject].totalPct += q.percentage;
    subjectScores[q.subject].count += 1;
  }

  const weakSubjects = Object.entries(subjectScores)
    .filter(([_, stats]) => (stats.totalPct / stats.count) < 70)
    .map(([subj, stats]) => ({
      subject: subj,
      averageScore: Math.round(stats.totalPct / stats.count),
      reason: `Accuracy is below 70% across ${stats.count} quiz attempt(s). Immediate revision recommended.`
    }));

  // Recently studied
  const recentSessions = [...sessions].sort((a, b) => b.startTime.localeCompare(a.startTime)).slice(0, 4);
  const recentlyStudied = recentSessions.map(s => ({
    subject: s.subject,
    topic: s.topic,
    date: s.startTime.split('T')[0]
  }));

  // Recommended topics
  const recommendedTopics = [
    'Graph Traversals (BFS & DFS)',
    'Dynamic Programming Basics',
    'Model Evaluation & Confusion Matrices'
  ];

  return {
    studentName,
    totalSubjects: subjectsOfInterest.length,
    totalStudyHours,
    studyStreak: streak,
    completedLessons,
    pendingTasks,
    quizAverageScore,
    overallLearningProgress,
    weakSubjects,
    recentlyStudied,
    recommendedTopics
  };
}

export function getActivityAnalytics(userId: string): ActivityData {
  const sessions = db.studySessions.filter(s => s.userId === userId && s.status === 'completed');
  const tasks = db.studyTasks.filter(t => t.userId === userId);
  const quizzes = db.quizAttempts.filter(q => q.userId === userId);

  // Past 7 days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const weeklyStudyActivity = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = days[d.getDay()];

    const dayMinutes = sessions
      .filter(s => s.startTime.startsWith(dateStr))
      .reduce((sum, s) => sum + s.actualDuration, 0);

    const plannedDayMinutes = tasks
      .filter(t => t.date === dateStr)
      .reduce((sum, t) => sum + t.estimatedDuration, 0);

    weeklyStudyActivity.push({
      day: dayLabel,
      hours: Math.round((dayMinutes / 60) * 10) / 10,
      planned: Math.round((plannedDayMinutes / 60) * 10) / 10 || 1.5
    });
  }

  // Subject Performance
  const allSubjects = db.subjects.map(s => s.name);
  const subjectPerformance = allSubjects.map(subject => {
    const subjQuizzes = quizzes.filter(q => q.subject === subject);
    const avgScore = subjQuizzes.length > 0
      ? Math.round(subjQuizzes.reduce((sum, q) => sum + q.percentage, 0) / subjQuizzes.length)
      : 70; // default baseline

    const subjTasks = tasks.filter(t => t.subject === subject);
    const completedTasks = subjTasks.filter(t => t.status === 'Completed').length;

    return {
      subject,
      score: avgScore,
      completedTasks,
      totalTasks: Math.max(subjTasks.length, 1)
    };
  });

  // Score Trends
  const scoreTrends = quizzes
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .slice(-7)
    .map(q => ({
      date: q.completedAt.split('T')[0].substring(5), // MM-DD
      score: q.percentage,
      topic: q.topic
    }));

  return {
    weeklyStudyActivity,
    subjectPerformance,
    scoreTrends
  };
}

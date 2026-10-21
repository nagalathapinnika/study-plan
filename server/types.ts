export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface StudentProfile {
  userId: string;
  educationLevel: string; // e.g. "Undergraduate", "High School", "Graduate"
  courseDegree: string; // e.g. "B.Tech Computer Science"
  currentSemester: string; // e.g. "Semester 5"
  subjectsOfInterest: string[]; // e.g. ["Data Structures", "Web Development", "Machine Learning"]
  preferredLearningStyle: 'Visual' | 'Auditory' | 'Reading/Writing' | 'Kinesthetic';
  dailyStudyAvailability: number; // hours per day, e.g. 3
  learningGoals: string;
  targetCompletionDate?: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  category: string;
  description: string;
  topics: string[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  subjects: string[];
  currentSkillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  availableHoursPerDay: number;
  examDate?: string;
  targetCompletionDate: string;
  learningGoal: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
}

export interface StudyTask {
  id: string;
  planId: string;
  userId: string;
  subject: string;
  topic: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 - 10:30"
  estimatedDuration: number; // minutes
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  learningObjective: string;
  recommendedResourceTitle?: string;
  recommendedResourceUrl?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  completedAt?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  resourceType: 'Video' | 'Article' | 'Documentation' | 'Practice' | 'Interactive' | 'Revision';
  url: string;
  estimatedMinutes: number;
  provider: string; // e.g. "MDN", "freeCodeCamp", "Khan Academy", "MIT OCW"
  tags: string[];
  ratingAverage: number;
  ratingsCount: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  resourceId: string;
  createdAt: string;
}

export interface ResourceCompletion {
  id: string;
  userId: string;
  resourceId: string;
  rating?: number;
  completedAt: string;
}

export interface QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[]; // 4 options
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: {
    questionId: string;
    questionText: string;
    selectedOption: number;
    correctOption: number;
    isCorrect: boolean;
    explanation: string;
  }[];
  completedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  plannedDuration: number; // minutes
  actualDuration: number; // minutes
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed';
  notes?: string;
  isProductive?: boolean;
}

export interface RevisionSchedule {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  lastQuizScore: number;
  intervalDays: number;
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedDate?: string;
  status: 'Due' | 'Upcoming' | 'Completed';
  repetitionCount: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  subject?: string;
  targetDate: string;
  targetMetric: 'study_hours' | 'quizzes_completed' | 'tasks_completed' | 'quiz_score_pct';
  currentProgress: number;
  targetValue: number;
  status: 'in_progress' | 'achieved';
  createdAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  subject: string;
  topic: string;
  tags: string[];
  tutorSnippet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  keyPoints?: string[];
  practiceQuestion?: string;
  timestamp: string;
}

export interface TutorConversation {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  explanationLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string; // 'en', 'te', 'hi', 'es'
  title: string;
  messages: TutorMessage[];
  createdAt: string;
  updatedAt: string;
}

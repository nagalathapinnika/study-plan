export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt?: string;
}

export interface StudentProfile {
  userId: string;
  educationLevel: string;
  courseDegree: string;
  currentSemester: string;
  subjectsOfInterest: string[];
  preferredLearningStyle: 'Visual' | 'Auditory' | 'Reading/Writing' | 'Kinesthetic';
  dailyStudyAvailability: number;
  learningGoals: string;
  targetCompletionDate?: string;
  updatedAt?: string;
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
  date: string;
  timeSlot: string;
  estimatedDuration: number;
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
  provider: string;
  tags: string[];
  ratingAverage: number;
  ratingsCount: number;
  matchScore?: number;
  reason?: string;
  isBookmarked?: boolean;
  isCompleted?: boolean;
  userRating?: number;
}

export interface QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
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
  plannedDuration: number;
  actualDuration: number;
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
  nextReviewDate: string;
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
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
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
  language: string;
  title: string;
  messages: TutorMessage[];
  createdAt: string;
  updatedAt: string;
}

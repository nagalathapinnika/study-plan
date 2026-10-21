import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  Subject,
  StudyPlan,
  StudyTask,
  LearningResource,
  Bookmark,
  ResourceCompletion,
  QuizQuestion,
  QuizAttempt,
  StudySession,
  RevisionSchedule,
  Goal,
  Achievement,
  Note,
  TutorConversation
} from '../types.js';
import { INITIAL_SUBJECTS, INITIAL_RESOURCES, INITIAL_QUIZ_QUESTIONS } from './seed.js';

interface DatabaseSchema {
  users: User[];
  studentProfiles: StudentProfile[];
  subjects: Subject[];
  studyPlans: StudyPlan[];
  studyTasks: StudyTask[];
  learningResources: LearningResource[];
  bookmarks: Bookmark[];
  resourceCompletions: ResourceCompletion[];
  quizQuestions: QuizQuestion[];
  quizAttempts: QuizAttempt[];
  studySessions: StudySession[];
  revisionSchedules: RevisionSchedule[];
  goals: Goal[];
  achievements: Achievement[];
  notes: Note[];
  tutorConversations: TutorConversation[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, re-initializing seed data:', err);
      }
    }

    const initial = this.createInitialDatabase();
    this.saveData(initial);
    return initial;
  }

  private createInitialDatabase(): DatabaseSchema {
    // Generate pre-hashed passwords
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('StudentPass123!', salt);
    const adminPasswordHash = bcrypt.hashSync('AdminPass123!', salt);

    const demoUserId = 'usr-alex-demo';
    const adminUserId = 'usr-admin-system';

    const users: User[] = [
      {
        id: demoUserId,
        name: 'Alex Chen',
        email: 'alex@student.edu',
        passwordHash: demoPasswordHash,
        role: 'student',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: adminUserId,
        name: 'Curriculum Director',
        email: 'admin@learning.edu',
        passwordHash: adminPasswordHash,
        role: 'admin',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      }
    ];

    const studentProfiles: StudentProfile[] = [
      {
        userId: demoUserId,
        educationLevel: 'Undergraduate',
        courseDegree: 'B.Tech Computer Science & Engineering',
        currentSemester: 'Semester 5',
        subjectsOfInterest: [
          'Data Structures & Algorithms',
          'Python Programming',
          'Data Science & Machine Learning'
        ],
        preferredLearningStyle: 'Visual',
        dailyStudyAvailability: 3.5,
        learningGoals: 'Master dynamic programming, crack technical interviews, and build ML models.',
        targetCompletionDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        updatedAt: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ];

    const planId = 'plan-alex-sem5';
    const studyPlans: StudyPlan[] = [
      {
        id: planId,
        userId: demoUserId,
        title: 'Interview & Midterm Accelerated Plan',
        subjects: ['Data Structures & Algorithms', 'Python Programming', 'Data Science & Machine Learning'],
        currentSkillLevel: 'Intermediate',
        availableHoursPerDay: 3.5,
        examDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
        targetCompletionDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        learningGoal: 'Prepare for CS midterms and software engineering technical assessments',
        status: 'active',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      }
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const studyTasks: StudyTask[] = [
      {
        id: 'task-1',
        planId,
        userId: demoUserId,
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Search Trees',
        date: yesterdayStr,
        timeSlot: '09:00 - 10:15',
        estimatedDuration: 75,
        priority: 'High',
        difficulty: 'Medium',
        learningObjective: 'Implement in-order and post-order traversal and solve LCA of BST',
        recommendedResourceTitle: 'Visual Guide to Binary Search Trees',
        recommendedResourceUrl: 'https://visualgo.net/en/bst',
        status: 'Completed',
        completedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'task-2',
        planId,
        userId: demoUserId,
        subject: 'Python Programming',
        topic: 'Object-Oriented Programming (OOP)',
        date: todayStr,
        timeSlot: '11:00 - 12:00',
        estimatedDuration: 60,
        priority: 'Medium',
        difficulty: 'Easy',
        learningObjective: 'Understand Python inheritance and dunder methods (__init__, __str__)',
        recommendedResourceTitle: 'Official Python Tutorial: Classes and OOP',
        recommendedResourceUrl: 'https://docs.python.org/3/tutorial/classes.html',
        status: 'In Progress'
      },
      {
        id: 'task-3',
        planId,
        userId: demoUserId,
        subject: 'Data Science & Machine Learning',
        topic: 'Data Wrangling with Pandas',
        date: todayStr,
        timeSlot: '16:00 - 17:15',
        estimatedDuration: 75,
        priority: 'High',
        difficulty: 'Medium',
        learningObjective: 'Clean missing data using dropna/fillna and run groupby aggregations',
        recommendedResourceTitle: '10 Minutes to Pandas - Quickstart Handbook',
        recommendedResourceUrl: 'https://pandas.pydata.org/docs/user_guide/10min.html',
        status: 'Pending'
      },
      {
        id: 'task-4',
        planId,
        userId: demoUserId,
        subject: 'Data Structures & Algorithms',
        topic: 'Graph Traversals (BFS & DFS)',
        date: tomorrowStr,
        timeSlot: '10:00 - 11:30',
        estimatedDuration: 90,
        priority: 'High',
        difficulty: 'Hard',
        learningObjective: 'Build adjacency list representation and detect cycles in directed graphs',
        recommendedResourceTitle: 'MIT 6.006: Introduction to Algorithms - Graph Traversal',
        recommendedResourceUrl: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        status: 'Pending'
      }
    ];

    const quizAttempts: QuizAttempt[] = [
      {
        id: 'att-1',
        userId: demoUserId,
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Search Trees',
        difficulty: 'Medium',
        score: 3,
        totalQuestions: 4,
        percentage: 75,
        answers: [
          {
            questionId: 'q-dsa-1',
            questionText: 'In an in-order traversal of a valid Binary Search Tree (BST), what property do the visited node values exhibit?',
            selectedOption: 1,
            correctOption: 1,
            isCorrect: true,
            explanation: 'In-order traversal naturally yields sorted non-decreasing values.'
          }
        ],
        completedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'att-2',
        userId: demoUserId,
        subject: 'Python Programming',
        topic: 'Object-Oriented Programming (OOP)',
        difficulty: 'Easy',
        score: 4,
        totalQuestions: 4,
        percentage: 100,
        answers: [],
        completedAt: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ];

    const studySessions: StudySession[] = [
      {
        id: 'sess-1',
        userId: demoUserId,
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Search Trees',
        plannedDuration: 75,
        actualDuration: 80,
        startTime: new Date(Date.now() - 26 * 3600000).toISOString(),
        endTime: new Date(Date.now() - (26 * 3600000 - 80 * 60000)).toISOString(),
        status: 'completed',
        notes: 'Solved 2 LeetCode BST problems and reviewed recursion call stack visualization.',
        isProductive: true
      },
      {
        id: 'sess-2',
        userId: demoUserId,
        subject: 'Python Programming',
        topic: 'List Comprehensions & Generators',
        plannedDuration: 45,
        actualDuration: 50,
        startTime: new Date(Date.now() - 50 * 3600000).toISOString(),
        endTime: new Date(Date.now() - (50 * 3600000 - 50 * 60000)).toISOString(),
        status: 'completed',
        notes: 'Understood generator lazy evaluation and memory benchmark differences.',
        isProductive: true
      }
    ];

    const revisionSchedules: RevisionSchedule[] = [
      {
        id: 'rev-1',
        userId: demoUserId,
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Search Trees',
        lastQuizScore: 75,
        intervalDays: 3,
        nextReviewDate: todayStr,
        status: 'Due',
        repetitionCount: 1
      },
      {
        id: 'rev-2',
        userId: demoUserId,
        subject: 'Python Programming',
        topic: 'Object-Oriented Programming (OOP)',
        lastQuizScore: 100,
        intervalDays: 7,
        nextReviewDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        status: 'Upcoming',
        repetitionCount: 2
      }
    ];

    const goals: Goal[] = [
      {
        id: 'goal-1',
        userId: demoUserId,
        title: 'Complete 15 Focused Study Hours this week',
        description: 'Maintain deep-work study habits across CS subjects',
        targetDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        targetMetric: 'study_hours',
        currentProgress: 8.5,
        targetValue: 15,
        status: 'in_progress',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'goal-2',
        userId: demoUserId,
        title: 'Score 85%+ on DSA Practice Quizzes',
        description: 'Achieve mastery in Trees, Graphs, and Dynamic Programming',
        subject: 'Data Structures & Algorithms',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        targetMetric: 'quiz_score_pct',
        currentProgress: 75,
        targetValue: 85,
        status: 'in_progress',
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
      }
    ];

    const achievements: Achievement[] = [
      {
        id: 'ach-1',
        userId: demoUserId,
        badgeId: 'streak_3',
        title: '3-Day Momentum',
        description: 'Logged study sessions for 3 consecutive days without missing.',
        icon: 'Flame',
        unlockedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'ach-2',
        userId: demoUserId,
        badgeId: 'quiz_ace',
        title: 'First Perfect Quiz',
        description: 'Scored 100% on a comprehensive topic assessment.',
        icon: 'Award',
        unlockedAt: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ];

    const bookmarks: Bookmark[] = [
      {
        id: 'bm-1',
        userId: demoUserId,
        resourceId: 'res-dsa-1',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'bm-2',
        userId: demoUserId,
        resourceId: 'res-web-3',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];

    const notes: Note[] = [
      {
        id: 'note-1',
        userId: demoUserId,
        title: 'Key Invariants of Binary Search Trees',
        content: `1. For any node N:\n- Every node in left subtree has value < N.key\n- Every node in right subtree has value > N.key\n2. In-order traversal visits in ascending sorted order: O(N) time.\n3. Search, Insert, Delete run in O(h) time, where h is height.\n- In balanced BST (AVL/Red-Black), h = O(log N).\n- In degenerate BST (linked list shape), h = O(N).`,
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Search Trees',
        tags: ['trees', 'invariants', 'big-o'],
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];

    const tutorConversations: TutorConversation[] = [
      {
        id: 'conv-1',
        userId: demoUserId,
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Search Trees',
        explanationLevel: 'Intermediate',
        language: 'en',
        title: 'Time complexity comparison between BST and Hash Map',
        messages: [
          {
            id: 'm-1',
            role: 'user',
            content: 'Why would someone choose a self-balancing BST over a Hash Map when Hash Maps offer O(1) lookups?',
            timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
          },
          {
            id: 'm-2',
            role: 'assistant',
            content: 'While Hash Maps offer average O(1) lookups, self-balancing BSTs (like Red-Black Trees or Java TreeMap) are preferred when:\n\n1. **Range Queries**: BSTs can find all keys between K1 and K2 in O(log N + k) time. Hash maps must scan the entire table in O(N).\n2. **Sorted Order**: BSTs can produce all elements in sorted order with an in-order traversal in O(N) without extra sorting.\n3. **Finding Predecessors / Successors**: Finding the closest higher or lower value takes O(log N) in a BST, which is impossible efficiently in an unordered hash table.\n4. **Guaranteed Worst-Case Bounds**: Hash maps degrade to O(N) on hash collisions or resize events, whereas balanced BST operations are strictly guaranteed O(log N).',
            keyPoints: [
              'Hash Maps: average O(1) for point lookups, but poor for range queries and sorting.',
              'Balanced BSTs: guaranteed O(log N), support range queries and predecessor/successor searches.'
            ],
            practiceQuestion: 'What is the time complexity of finding the Minimum key in a balanced BST vs a Hash Map?',
            timestamp: new Date(Date.now() - 2 * 86400000 + 5000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];

    return {
      users,
      studentProfiles,
      subjects: INITIAL_SUBJECTS,
      studyPlans,
      studyTasks,
      learningResources: INITIAL_RESOURCES,
      bookmarks,
      resourceCompletions: [],
      quizQuestions: INITIAL_QUIZ_QUESTIONS,
      quizAttempts,
      studySessions,
      revisionSchedules,
      goals,
      achievements,
      notes,
      tutorConversations
    };
  }

  private saveData(data: DatabaseSchema): void {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public save(): void {
    this.saveData(this.data);
  }

  // Accessors
  public get users() { return this.data.users; }
  public get studentProfiles() { return this.data.studentProfiles; }
  public get subjects() { return this.data.subjects; }
  public get studyPlans() { return this.data.studyPlans; }
  public get studyTasks() { return this.data.studyTasks; }
  public get learningResources() { return this.data.learningResources; }
  public get bookmarks() { return this.data.bookmarks; }
  public get resourceCompletions() { return this.data.resourceCompletions; }
  public get quizQuestions() { return this.data.quizQuestions; }
  public get quizAttempts() { return this.data.quizAttempts; }
  public get studySessions() { return this.data.studySessions; }
  public get revisionSchedules() { return this.data.revisionSchedules; }
  public get goals() { return this.data.goals; }
  public get achievements() { return this.data.achievements; }
  public get notes() { return this.data.notes; }
  public get tutorConversations() { return this.data.tutorConversations; }
}

export const db = new Database();

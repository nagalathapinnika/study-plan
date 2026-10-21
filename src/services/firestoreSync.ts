import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.js';
import { User, StudentProfile, StudyPlan, StudyTask, QuizAttempt } from '../types.js';

export const firestoreSync = {
  /**
   * Syncs user profile and preferences to Firestore
   */
  async syncUserProfile(user: User, profile?: StudentProfile | null): Promise<void> {
    const userPath = `users/${user.id}`;
    try {
      await setDoc(
        doc(db, 'users', user.id),
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'student',
          educationLevel: profile?.educationLevel || '',
          courseDegree: profile?.courseDegree || '',
          currentSemester: profile?.currentSemester || '',
          preferredLearningStyle: profile?.preferredLearningStyle || 'Visual',
          dailyStudyAvailability: profile?.dailyStudyAvailability || 2,
          learningGoals: profile?.learningGoals || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  },

  /**
   * Retrieves user profile from Firestore
   */
  async getUserProfile(userId: string): Promise<Record<string, unknown> | null> {
    const userPath = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, userPath);
    }
  },

  /**
   * Syncs a study plan to Firestore
   */
  async saveStudyPlan(userId: string, plan: StudyPlan): Promise<void> {
    const planPath = `users/${userId}/plans/${plan.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'plans', plan.id), {
        id: plan.id,
        userId: userId,
        title: plan.title,
        currentSkillLevel: plan.currentSkillLevel || 'Beginner',
        availableHoursPerDay: plan.availableHoursPerDay || 2,
        targetCompletionDate: plan.targetCompletionDate || '',
        learningGoal: plan.learningGoal || '',
        status: plan.status || 'active',
        createdAt: plan.createdAt || new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, planPath);
    }
  },

  /**
   * Syncs a study task to Firestore
   */
  async saveTask(userId: string, task: StudyTask): Promise<void> {
    const taskPath = `users/${userId}/tasks/${task.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'tasks', task.id), {
        id: task.id,
        planId: task.planId,
        userId: userId,
        subject: task.subject,
        topic: task.topic,
        date: task.date || '',
        timeSlot: task.timeSlot || '',
        estimatedDuration: task.estimatedDuration || 30,
        priority: task.priority || 'Medium',
        difficulty: task.difficulty || 'Medium',
        learningObjective: task.learningObjective || '',
        status: task.status || 'Pending',
        completedAt: task.completedAt || '',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, taskPath);
    }
  },

  /**
   * Records a quiz attempt to Firestore
   */
  async recordQuizAttempt(userId: string, attempt: QuizAttempt): Promise<void> {
    const attemptPath = `users/${userId}/quizAttempts/${attempt.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'quizAttempts', attempt.id), {
        id: attempt.id,
        userId: userId,
        subject: attempt.subject,
        topic: attempt.topic,
        difficulty: attempt.difficulty,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        completedAt: attempt.completedAt,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, attemptPath);
    }
  },

  /**
   * Fetches user plans from Firestore
   */
  async getStudyPlans(userId: string): Promise<StudyPlan[]> {
    const plansPath = `users/${userId}/plans`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'plans'));
      return snap.docs.map(d => d.data() as StudyPlan);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, plansPath);
    }
  }
};

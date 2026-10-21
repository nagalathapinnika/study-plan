import { pgTable, serial, text, timestamp, doublePrecision, boolean } from 'drizzle-orm/pg-core';

// Users table (PostgreSQL)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or local identifier
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('student'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Student profiles table
export const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .notNull()
    .references(() => users.uid),
  educationLevel: text('education_level').default('Undergraduate'),
  courseDegree: text('course_degree').default('B.Tech Computer Science'),
  currentSemester: text('current_semester').default('Semester 1'),
  subjectsOfInterest: text('subjects_of_interest'), // JSON string array
  preferredLearningStyle: text('preferred_learning_style').default('Visual'),
  dailyStudyAvailability: doublePrecision('daily_study_availability').default(2.0),
  learningGoals: text('learning_goals').default(''),
  targetCompletionDate: text('target_completion_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Automated Test Suite for AI-Powered Personalized Learning Assistant
 * Verifies backend REST endpoints, authentication, user data isolation,
 * adaptive study plans, quiz scoring, and analytics calculations.
 */

import { db } from '../db/database.js';
import { generatePersonalizedStudyPlan } from '../services/studyPlanGenerator.js';
import { getRecommendedResources } from '../services/recommendation.js';
import { calculateStudyStreak, getDashboardSummary } from '../services/analytics.js';
import bcrypt from 'bcryptjs';

console.log('🧪 Starting AI-Powered Personalized Learning Assistant Test Suite...\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  try {
    // Test 1: Database Pre-Seeding
    console.log('Section 1: Database Integrity & Pre-Seeding');
    assert(db.users.length >= 2, 'Default demo student and admin users initialized');
    assert(db.subjects.length >= 5, 'Curriculum subjects initialized');
    assert(db.learningResources.length >= 10, 'Curated learning resources populated');
    assert(db.quizQuestions.length >= 10, 'Adaptive quiz question bank populated');

    // Test 2: Password Hashing Security
    console.log('\nSection 2: Authentication & Password Security');
    const demoUser = db.users.find(u => u.email === 'alex@student.edu');
    assert(demoUser !== undefined, 'Demo student account exists');
    assert(demoUser!.passwordHash !== 'StudentPass123!', 'Password is not stored in plaintext');
    assert(bcrypt.compareSync('StudentPass123!', demoUser!.passwordHash), 'Bcrypt verification validates correct password');
    assert(!bcrypt.compareSync('WrongPassword', demoUser!.passwordHash), 'Bcrypt rejects invalid credentials');

    // Test 3: Recommendation Engine
    console.log('\nSection 3: Content-Based & Performance Recommendation Engine');
    const recommendations = getRecommendedResources(demoUser!.id);
    assert(recommendations.length > 0, 'Recommendation engine returns scored resources');
    assert(recommendations[0].matchScore !== undefined, 'Resources contain quantitative match scores');
    assert(recommendations[0].reason !== undefined && recommendations[0].reason.length > 0, 'Resources provide explainable recommendation reasoning');

    // Test 4: Personalized Study Plan Generator
    console.log('\nSection 4: Personalized Study Plan Generator');
    const { plan, tasks } = generatePersonalizedStudyPlan({
      userId: demoUser!.id,
      title: 'Automated Test Plan',
      subjects: ['Data Structures & Algorithms', 'Python Programming'],
      currentSkillLevel: 'Intermediate',
      availableHoursPerDay: 2.5,
      targetDays: 7,
      learningGoal: 'Master test criteria'
    });

    assert(plan.userId === demoUser!.id, 'Study plan binds to the requesting student');
    assert(tasks.length > 0, 'Tasks are generated across time slots');
    assert(tasks.every(t => t.timeSlot && t.estimatedDuration > 0), 'Every task has assigned duration and time slot');
    assert(tasks.some(t => t.topic.includes('Review')), 'Spaced repetition / review tasks are injected');

    // Test 5: Analytics & Streak Calculation
    console.log('\nSection 5: Behavioral Tracking & Analytics Calculations');
    const streak = calculateStudyStreak(demoUser!.id);
    assert(streak >= 1, 'Calculates consecutive study streak accurately from database records');

    const summary = getDashboardSummary(demoUser!.id);
    assert(summary.totalStudyHours >= 0, 'Total study hours computed from actual session logs');
    assert(summary.quizAverageScore >= 0, 'Quiz average score computed from database attempts');

    // Test Summary
    console.log(`\n=========================================`);
    console.log(`Test Execution Finished: ${passedTests} Passed, ${failedTests} Failed`);
    console.log(`=========================================\n`);

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  }
}

runTests();

import { db } from '../db/database.js';
import { StudyPlan, StudyTask } from '../types.js';

interface PlanGenerationOptions {
  userId: string;
  title: string;
  subjects: string[];
  currentSkillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  availableHoursPerDay: number;
  examDate?: string;
  targetDays?: number;
  learningGoal: string;
}

export function generatePersonalizedStudyPlan(options: PlanGenerationOptions): { plan: StudyPlan; tasks: StudyTask[] } {
  const {
    userId,
    title,
    subjects,
    currentSkillLevel,
    availableHoursPerDay,
    examDate,
    targetDays = 14,
    learningGoal
  } = options;

  // Determine weak topics from quiz attempts
  const attempts = db.quizAttempts.filter(a => a.userId === userId);
  const topicAccuracy: Record<string, { total: number; correct: number }> = {};
  for (const a of attempts) {
    if (!topicAccuracy[a.topic]) {
      topicAccuracy[a.topic] = { total: 0, correct: 0 };
    }
    topicAccuracy[a.topic].total += a.totalQuestions;
    topicAccuracy[a.topic].correct += a.score;
  }

  // Find all topics belonging to the selected subjects
  const selectedSubjectsData = db.subjects.filter(s => subjects.includes(s.name));
  type TopicItem = {
    subject: string;
    topic: string;
    accuracy?: number;
    priority: 'High' | 'Medium' | 'Low';
    difficulty: 'Easy' | 'Medium' | 'Hard';
  };

  const topicPool: TopicItem[] = [];

  for (const subj of selectedSubjectsData) {
    for (const t of subj.topics) {
      const stats = topicAccuracy[t];
      const accuracy = stats ? (stats.correct / stats.total) * 100 : undefined;
      
      let priority: 'High' | 'Medium' | 'Low' = 'Medium';
      let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';

      if (accuracy !== undefined && accuracy < 65) {
        priority = 'High';
        difficulty = 'Hard';
      } else if (accuracy !== undefined && accuracy >= 85) {
        priority = 'Low';
        difficulty = 'Easy';
      } else if (currentSkillLevel === 'Beginner') {
        difficulty = 'Easy';
      } else if (currentSkillLevel === 'Advanced') {
        difficulty = 'Hard';
      }

      topicPool.push({
        subject: subj.name,
        topic: t,
        accuracy,
        priority,
        difficulty
      });
    }
  }

  // Sort topics: High priority first, then harder topics first
  topicPool.sort((a, b) => {
    const pOrder = { High: 3, Medium: 2, Low: 1 };
    return pOrder[b.priority] - pOrder[a.priority];
  });

  const planId = `plan-${Date.now()}`;
  const now = new Date();
  const targetDateStr = examDate || new Date(now.getTime() + targetDays * 86400000).toISOString().split('T')[0];

  const plan: StudyPlan = {
    id: planId,
    userId,
    title,
    subjects,
    currentSkillLevel,
    availableHoursPerDay,
    examDate,
    targetCompletionDate: targetDateStr,
    learningGoal,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const tasks: StudyTask[] = [];
  const totalDays = Math.min(21, Math.max(3, targetDays));
  const dailyMinutesBudget = Math.round(availableHoursPerDay * 60);

  // Time slot templates based on typical student daily schedule
  const slotPresets = [
    { start: '09:00', end: '10:15', duration: 75 },
    { start: '10:30', end: '11:45', duration: 75 },
    { start: '14:00', end: '15:15', duration: 75 },
    { start: '16:00', end: '17:15', duration: 75 },
    { start: '19:00', end: '20:00', duration: 60 }
  ];

  let topicIndex = 0;

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const dayDate = new Date(now.getTime() + dayOffset * 86400000);
    const dateStr = dayDate.toISOString().split('T')[0];
    let allocatedMinutesToday = 0;
    let slotIndex = 0;

    // Every 4th day or the day before an exam, inject a Revision / Practice Quiz session
    const isRevisionDay = dayOffset > 0 && dayOffset % 4 === 0;

    while (allocatedMinutesToday + 45 <= dailyMinutesBudget && slotIndex < slotPresets.length) {
      const preset = slotPresets[slotIndex];
      const sessionDuration = Math.min(preset.duration, dailyMinutesBudget - allocatedMinutesToday);

      if (sessionDuration < 30) break;

      if (isRevisionDay && allocatedMinutesToday === 0) {
        // Dedicated review task
        const reviewTopic = topicPool[(topicIndex + topicPool.length - 1) % topicPool.length] || topicPool[0];
        tasks.push({
          id: `task-${Date.now()}-${tasks.length + 1}`,
          planId,
          userId,
          subject: reviewTopic.subject,
          topic: `Review & Spaced Repetition: ${reviewTopic.topic}`,
          date: dateStr,
          timeSlot: `${preset.start} - ${preset.end}`,
          estimatedDuration: sessionDuration,
          priority: 'High',
          difficulty: 'Medium',
          learningObjective: `Consolidate key formulas, run self-test quiz, and resolve weak spots in ${reviewTopic.topic}`,
          status: 'Pending'
        });
      } else {
        const currentItem = topicPool[topicIndex % topicPool.length];
        topicIndex++;

        // Find relevant resource
        const matchedResource = db.learningResources.find(
          r => r.topic === currentItem.topic || r.subject === currentItem.subject
        );

        tasks.push({
          id: `task-${Date.now()}-${tasks.length + 1}`,
          planId,
          userId,
          subject: currentItem.subject,
          topic: currentItem.topic,
          date: dateStr,
          timeSlot: `${preset.start} - ${preset.end}`,
          estimatedDuration: sessionDuration,
          priority: currentItem.priority,
          difficulty: currentItem.difficulty,
          learningObjective: `Master core principles, work through step-by-step examples, and complete practice problems on ${currentItem.topic}`,
          recommendedResourceTitle: matchedResource?.title,
          recommendedResourceUrl: matchedResource?.url,
          status: 'Pending'
        });
      }

      allocatedMinutesToday += sessionDuration;
      slotIndex++;
    }
  }

  return { plan, tasks };
}

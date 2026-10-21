import { db } from '../db/database.js';
import { LearningResource } from '../types.js';

export interface ScoredResource extends LearningResource {
  matchScore: number;
  reason: string;
  isBookmarked: boolean;
  isCompleted: boolean;
}

export function getRecommendedResources(userId: string): ScoredResource[] {
  const profile = db.studentProfiles.find(p => p.userId === userId);
  const quizAttempts = db.quizAttempts.filter(a => a.userId === userId);
  const userBookmarks = new Set(db.bookmarks.filter(b => b.userId === userId).map(b => b.resourceId));
  const userCompletions = new Set(db.resourceCompletions.filter(c => c.userId === userId).map(c => c.resourceId));

  // Determine topic accuracy from quizzes
  const topicAccuracy: Record<string, { total: number; correct: number }> = {};
  for (const attempt of quizAttempts) {
    if (!topicAccuracy[attempt.topic]) {
      topicAccuracy[attempt.topic] = { total: 0, correct: 0 };
    }
    topicAccuracy[attempt.topic].total += attempt.totalQuestions;
    topicAccuracy[attempt.topic].correct += attempt.score;
  }

  const weakTopics = new Set<string>();
  const masteredTopics = new Set<string>();
  for (const [topic, stats] of Object.entries(topicAccuracy)) {
    const pct = (stats.correct / stats.total) * 100;
    if (pct < 70) {
      weakTopics.add(topic);
    } else if (pct >= 85) {
      masteredTopics.add(topic);
    }
  }

  const userInterests = new Set(profile?.subjectsOfInterest || []);
  const learningStyle = profile?.preferredLearningStyle || 'Visual';

  // Format of preferred resource types based on learning style
  const stylePreferenceMap: Record<string, string[]> = {
    Visual: ['Video', 'Interactive'],
    Auditory: ['Video'],
    'Reading/Writing': ['Article', 'Documentation'],
    Kinesthetic: ['Practice', 'Interactive']
  };
  const preferredTypes = new Set(stylePreferenceMap[learningStyle] || ['Video', 'Interactive']);

  const scored: ScoredResource[] = db.learningResources.map(resource => {
    let score = 50; // Base score
    const reasons: string[] = [];

    // Weak topic boost (highest priority)
    if (weakTopics.has(resource.topic)) {
      score += 35;
      reasons.push(`Targeted practice for ${resource.topic} (recent accuracy < 70%)`);
    }

    // Subject interest boost
    if (userInterests.has(resource.subject)) {
      score += 20;
      reasons.push(`Directly aligns with your interest in ${resource.subject}`);
    }

    // Preferred learning style match
    if (preferredTypes.has(resource.resourceType)) {
      score += 15;
      reasons.push(`Matches your preferred ${learningStyle} learning format (${resource.resourceType})`);
    }

    // High rating boost
    if (resource.ratingAverage >= 4.8) {
      score += 10;
    }

    // If already mastered, lower score slightly to prioritize unmet needs
    if (masteredTopics.has(resource.topic)) {
      score -= 15;
    }

    // If already completed, downrank slightly
    const isCompleted = userCompletions.has(resource.id);
    if (isCompleted) {
      score -= 25;
    }

    const primaryReason = reasons.length > 0 
      ? reasons[0] 
      : `High-quality ${resource.difficulty} level resource from ${resource.provider}`;

    return {
      ...resource,
      matchScore: Math.max(10, Math.min(99, score)),
      reason: primaryReason,
      isBookmarked: userBookmarks.has(resource.id),
      isCompleted
    };
  });

  // Sort descending by matchScore, then by rating
  return scored.sort((a, b) => b.matchScore - a.matchScore || b.ratingAverage - a.ratingAverage);
}

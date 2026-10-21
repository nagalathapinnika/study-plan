import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { StudentProfile } from '../types.js';

const router = Router();

router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  let profile = db.studentProfiles.find(p => p.userId === userId);

  if (!profile) {
    profile = {
      userId,
      educationLevel: 'Undergraduate',
      courseDegree: 'Computer Science',
      currentSemester: 'Semester 1',
      subjectsOfInterest: ['Data Structures & Algorithms'],
      preferredLearningStyle: 'Visual',
      dailyStudyAvailability: 2,
      learningGoals: 'Develop strong study habits',
      updatedAt: new Date().toISOString()
    };
    db.studentProfiles.push(profile);
    db.save();
  }

  res.json({
    user: {
      id: req.user!.id,
      name: req.user!.name,
      email: req.user!.email,
      role: req.user!.role
    },
    profile
  });
});

router.put('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const {
    name,
    educationLevel,
    courseDegree,
    currentSemester,
    subjectsOfInterest,
    preferredLearningStyle,
    dailyStudyAvailability,
    learningGoals,
    targetCompletionDate
  } = req.body;

  // Update user name if changed
  if (name && req.user) {
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      db.users[userIndex].name = name;
    }
  }

  let profile = db.studentProfiles.find(p => p.userId === userId);
  if (!profile) {
    profile = {
      userId,
      educationLevel: educationLevel || 'Undergraduate',
      courseDegree: courseDegree || 'Computer Science',
      currentSemester: currentSemester || 'Semester 1',
      subjectsOfInterest: subjectsOfInterest || [],
      preferredLearningStyle: preferredLearningStyle || 'Visual',
      dailyStudyAvailability: Number(dailyStudyAvailability) || 2,
      learningGoals: learningGoals || '',
      targetCompletionDate,
      updatedAt: new Date().toISOString()
    };
    db.studentProfiles.push(profile);
  } else {
    if (educationLevel !== undefined) profile.educationLevel = educationLevel;
    if (courseDegree !== undefined) profile.courseDegree = courseDegree;
    if (currentSemester !== undefined) profile.currentSemester = currentSemester;
    if (subjectsOfInterest !== undefined) profile.subjectsOfInterest = subjectsOfInterest;
    if (preferredLearningStyle !== undefined) profile.preferredLearningStyle = preferredLearningStyle;
    if (dailyStudyAvailability !== undefined) profile.dailyStudyAvailability = Number(dailyStudyAvailability);
    if (learningGoals !== undefined) profile.learningGoals = learningGoals;
    if (targetCompletionDate !== undefined) profile.targetCompletionDate = targetCompletionDate;
    profile.updatedAt = new Date().toISOString();
  }

  db.save();
  res.json({
    message: 'Profile updated successfully',
    profile
  });
});

export default router;

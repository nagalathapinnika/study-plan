import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { generateToken, AuthenticatedRequest, authenticateToken } from '../services/auth.js';
import { User, StudentProfile } from '../types.js';
import { findUserByEmail, createSqlUser, getOrCreateUser } from '../../src/db/users.ts';
import { adminAuth } from '../../src/lib/firebase-admin.ts';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    email,
    password,
    educationLevel,
    courseDegree,
    currentSemester,
    subjectsOfInterest,
    preferredLearningStyle,
    dailyStudyAvailability,
    learningGoals,
    targetCompletionDate
  } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  // Check PostgreSQL first
  try {
    const existingSqlUser = await findUserByEmail(email);
    if (existingSqlUser) {
      res.status(409).json({ error: 'An account with this email address already exists in the database.' });
      return;
    }
  } catch (err) {
    console.warn('PostgreSQL lookup warning, checking local storage:', err);
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `usr-${Date.now()}`;

  const newUser: User = {
    id: userId,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'student',
    createdAt: new Date().toISOString()
  };

  const newProfile: StudentProfile = {
    userId,
    educationLevel: educationLevel || 'Undergraduate',
    courseDegree: courseDegree || 'Computer Science',
    currentSemester: currentSemester || 'Semester 1',
    subjectsOfInterest: subjectsOfInterest || ['Data Structures & Algorithms', 'Python Programming'],
    preferredLearningStyle: preferredLearningStyle || 'Visual',
    dailyStudyAvailability: Number(dailyStudyAvailability) || 2,
    learningGoals: learningGoals || 'Build consistent daily study habits and master fundamentals',
    targetCompletionDate: targetCompletionDate || undefined,
    updatedAt: new Date().toISOString()
  };

  // Persist into PostgreSQL database
  try {
    await createSqlUser(userId, email, name, passwordHash, 'student', newProfile);
  } catch (err) {
    console.error('Failed to insert into PostgreSQL:', err);
  }

  db.users.push(newUser);
  db.studentProfiles.push(newProfile);
  db.save();

  const token = generateToken(newUser);
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    },
    profile: newProfile
  });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  // 1. Check PostgreSQL database first
  let user: User | null = null;
  try {
    const sqlUser = await findUserByEmail(email);
    if (sqlUser && sqlUser.passwordHash) {
      const isMatch = bcrypt.compareSync(password, sqlUser.passwordHash);
      if (isMatch) {
        user = {
          id: sqlUser.uid,
          name: sqlUser.name,
          email: sqlUser.email,
          passwordHash: sqlUser.passwordHash,
          role: sqlUser.role as any,
          createdAt: sqlUser.createdAt ? sqlUser.createdAt.toISOString() : new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('PostgreSQL query error, falling back to local database:', err);
  }

  // 2. Fallback to local store if not found or during initial migration
  if (!user) {
    const localUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (localUser && bcrypt.compareSync(password, localUser.passwordHash)) {
      user = localUser;
    }
  }

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  let profile = db.studentProfiles.find(p => p.userId === user!.id);
  if (!profile) {
    profile = {
      userId: user.id,
      educationLevel: 'Undergraduate',
      courseDegree: 'B.Tech Computer Science',
      currentSemester: 'Semester 1',
      subjectsOfInterest: ['Data Structures & Algorithms', 'Python Programming'],
      preferredLearningStyle: 'Visual',
      dailyStudyAvailability: 3,
      learningGoals: 'Master core concepts',
      updatedAt: new Date().toISOString()
    };
    db.studentProfiles.push(profile);
    db.save();
  }

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    profile
  });
});

// Google Sign-In with Firebase ID token
router.post('/google-login', async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ error: 'Firebase ID token is required for Google Sign-In.' });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    if (!email) {
      res.status(400).json({ error: 'Email required in Google account.' });
      return;
    }

    // Save or update in PostgreSQL database
    const sqlUser = await getOrCreateUser(uid, email, name || email.split('@')[0]);

    // Sync into local session cache
    let existingUser = db.users.find(u => u.id === uid || u.email.toLowerCase() === email.toLowerCase());
    if (!existingUser) {
      existingUser = {
        id: uid,
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        passwordHash: '',
        role: 'student',
        createdAt: new Date().toISOString()
      };
      db.users.push(existingUser);
    } else {
      existingUser.id = uid;
      if (name) existingUser.name = name;
    }

    let profile = db.studentProfiles.find(p => p.userId === uid);
    if (!profile) {
      profile = {
        userId: uid,
        educationLevel: 'Undergraduate',
        courseDegree: 'B.Tech Computer Science',
        currentSemester: 'Semester 1',
        subjectsOfInterest: ['Data Structures & Algorithms', 'Python Programming'],
        preferredLearningStyle: 'Visual',
        dailyStudyAvailability: 3,
        learningGoals: 'Master core concepts and prepare for placements',
        updatedAt: new Date().toISOString()
      };
      db.studentProfiles.push(profile);
    }

    db.save();

    const token = generateToken(existingUser);

    res.json({
      token,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      },
      profile
    });
  } catch (error: any) {
    console.error('Google Sign-In verification error:', error);
    res.status(401).json({ error: 'Failed to verify Google Sign-In with Firebase.' });
  }
});

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const profile = db.studentProfiles.find(p => p.userId === user.id);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    profile: profile || null
  });
});

export default router;

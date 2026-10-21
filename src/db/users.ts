import { sqlDb } from './index.ts';
import { users, studentProfiles } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name: string) {
  try {
    const inserted = await sqlDb
      .insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0],
        role: 'student',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name: name || email.split('@')[0],
        },
      })
      .returning();

    const user = inserted[0];

    // Ensure profile exists in PostgreSQL
    const existingProfile = await sqlDb
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userUid, uid));

    if (existingProfile.length === 0) {
      await sqlDb.insert(studentProfiles).values({
        userUid: uid,
        educationLevel: 'Undergraduate',
        courseDegree: 'B.Tech Computer Science',
        currentSemester: 'Semester 1',
        subjectsOfInterest: JSON.stringify(['Data Structures & Algorithms', 'Python Programming']),
        preferredLearningStyle: 'Visual',
        dailyStudyAvailability: 3.0,
        learningGoals: 'Master core concepts and prepare for upcoming technical assessments',
      });
    }

    return user;
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database operation failed. Please try again later.', { cause: error });
  }
}

export async function findUserByEmail(email: string) {
  try {
    const results = await sqlDb
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return results[0] || null;
  } catch (error) {
    console.error('Database findUserByEmail failed:', error);
    throw new Error('Database operation failed.', { cause: error });
  }
}

export async function createSqlUser(
  uid: string,
  email: string,
  name: string,
  passwordHash: string,
  role: string,
  profileData: any
) {
  try {
    const inserted = await sqlDb
      .insert(users)
      .values({
        uid,
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: role || 'student',
      })
      .returning();

    const user = inserted[0];

    await sqlDb.insert(studentProfiles).values({
      userUid: uid,
      educationLevel: profileData.educationLevel || 'Undergraduate',
      courseDegree: profileData.courseDegree || 'B.Tech Computer Science',
      currentSemester: profileData.currentSemester || 'Semester 1',
      subjectsOfInterest: JSON.stringify(profileData.subjectsOfInterest || []),
      preferredLearningStyle: profileData.preferredLearningStyle || 'Visual',
      dailyStudyAvailability: Number(profileData.dailyStudyAvailability) || 2.0,
      learningGoals: profileData.learningGoals || '',
      targetCompletionDate: profileData.targetCompletionDate || null,
    });

    return user;
  } catch (error) {
    console.error('Database createSqlUser failed:', error);
    throw new Error('Database user creation failed.', { cause: error });
  }
}

export async function getSqlProfile(uid: string) {
  try {
    const user = await sqlDb.select().from(users).where(eq(users.uid, uid));
    if (user.length === 0) return null;

    const prof = await sqlDb
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userUid, uid));

    return {
      user: user[0],
      profile: prof[0] || null,
    };
  } catch (error) {
    console.error('Database getSqlProfile failed:', error);
    throw new Error('Database fetch failed.', { cause: error });
  }
}

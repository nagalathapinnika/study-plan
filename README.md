# AI-Powered Personalized Learning Assistant

An intelligent, full-stack learning platform that analyzes student study behavior, academic performance, preferences, and progress to generate personalized study schedules, recommend targeted educational resources, provide AI-powered tutoring with offline fallbacks, and track learning habits.

Designed for college major projects, engineering portfolios, and real-world student productivity.

---

## 📖 Problem Statement & Objectives

### The Problem
Traditional educational platforms treat all learners identically by serving uniform lecture slides, static timelines, and generic problem sets. In reality, students exhibit diverse learning speeds, foundational weak spots, fluctuating study availability, and distinct format preferences (Visual vs Reading vs Practice).

### The Solution
**LearnPulse AI** builds an adaptive learning loop:
1. **Behavior & Diagnostic Analysis**: Monitors student assessment performance and topic accuracy.
2. **Personalized Study Generation**: Dynamically constructs daily time slots that prioritize weak topics, inject spaced revisions, and respect daily study hour constraints.
3. **Curated Recommendations**: Uses content-based similarity and learning style preferences to recommend verified educational materials.
4. **AI Pedagogical Tutoring**: Delivers step-by-step conceptual breakdowns, exam points, and follow-up challenges via Gemini 3.8 Flash, paired with a reliable offline rule-based knowledge fallback.
5. **Continuous Tracking**: Logs focused Pomodoro study blocks, streaks, and mastery trends.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 (TypeScript)
  - Vite 8
  - Tailwind CSS 4
  - React Router DOM
  - Recharts (Interactive Analytics & Mastery Trends)
  - Lucide React (Icons)
  - Canvas Confetti (Milestone Celebrations)

- **Backend**:
  - Node.js & Express (TypeScript via `tsx`)
  - Modular REST API Architecture
  - JWT Authentication (`jsonwebtoken`)
  - Bcrypt Password Hashing (`bcryptjs`)
  - Google Gemini API (`@google/genai` TypeScript SDK with model `gemini-3.8-flash`)

- **Database & Cloud Integrations**:
  - **Firebase Firestore & Authentication**: Cloud Firestore with schema models (`firebase-blueprint.json`), ABAC zero-trust security rules (`firestore.rules`), and Google OAuth / Firebase ID token verification.
  - **Cloud SQL (PostgreSQL)**: Scalable relational persistence with Drizzle ORM schemas.
  - **Local Storage Engine**: Embedded fallback database engine (`.data/db.json` with write-ahead temp file swapping).

---

## 🌟 Key Application Features

1. **Authentication & User Profile**:
   - Secure Bcrypt password hashing and 7-day JWT authentication.
   - Profile onboarding capturing Education Level, Degree/Major, Current Semester, Subjects of Interest, Preferred Learning Style (Visual, Auditory, Reading, Kinesthetic), and Daily Hours.
   - Strict student data isolation.

2. **Personalized Student Dashboard**:
   - Real-time study streak flame counter.
   - Total logged study hours from actual timers.
   - Completed lessons, pending tasks, and quiz score averages.
   - Recharts weekly study activity chart (Logged vs Planned) and subject mastery chart.
   - Dynamic weak subject alert banner with immediate practice shortcuts.

3. **AI-Personalized Study Plan Generator**:
   - Generates schedules respecting daily hour budgets without exceeding student capacity.
   - Automatic injection of spaced repetition reviews on low-accuracy topics.
   - Calendar / Timeline view and List view.
   - One-click task status transitions (Pending $\to$ In Progress $\to$ Completed).

4. **AI Tutor & Doubt Solver**:
   - Pedagogical chat interface with conversation history.
   - Adjustable explanation levels: *Beginner*, *Intermediate*, *Advanced*.
   - Multilingual support: *English*, *Telugu*, *Hindi*, *Spanish*.
   - Automatic extraction of Key Exam Points and Self-Check Practice Questions.
   - Instant "Save to Notes" action to store insights directly into the student notebook.
   - **Zero-failure fallback**: Automatically shifts to a structured pedagogical engine if `GEMINI_API_KEY` is not configured.

5. **Resource Recommendation Engine**:
   - Content-based scoring engine weighting weak topic priority, subject interest, format affinity, and peer ratings.
   - Curated links from verified providers (MIT OCW, VisuAlgo, MDN, Khan Academy, 3Blue1Brown, Python PSF).
   - Bookmark toggle and completion ratings (1-5 stars).

6. **Adaptive Quiz & Assessment System**:
   - Dynamically scales difficulty (Easy, Medium, Hard) based on historical student accuracy.
   - Anti-cheat design: correct answers remain hidden on the server until submission.
   - Instant feedback with detailed pedagogical explanations for every option.
   - Automatically schedules spaced repetition reviews based on quiz performance.

7. **Study Session Stopwatch & Habit Tracking**:
   - Start, pause, resume, and end study sessions.
   - Compares planned target duration with actual elapsed focus time.
   - Self-rated session productivity tag and personal reflections.
   - True streak calculation requiring consecutive calendar-day activity.

8. **Progress Analytics & Methodology Transparency**:
   - Subject-wise proficiency status (Proficient, Developing, Needs Focus).
   - Historical quiz score progression trendline.
   - Full disclosure of metric calculation formulas.

9. **Smart Spaced-Repetition Planner**:
   - Implements Leitner-inspired intervals ($<65\%$ accuracy $\to$ 1-day review; $65\text{--}85\%$ $\to$ 3-day review; $>85\%$ $\to$ 7-day interval).
   - Flags Due vs Upcoming items.

10. **Goals & Achievements**:
    - Custom target metrics (study hours, quizzes, task counts).
    - Milestone badges (*3-Day Momentum*, *First Perfect Quiz*, *10 Hours Logged*, etc.) with celebratory confetti.

11. **Curriculum Administration**:
    - Dedicated administrator dashboard for adding/managing educational resources and expanding question banks.

---

## 🚀 Quickstart & Execution Instructions

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd personalized-learning-assistant

# Install project dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file based on `.env.example`:
```env
# Optional: Live generative AI tutoring via Google Gemini
GEMINI_API_KEY="your_gemini_api_key_here"

# JWT Token Signing Key
JWT_SECRET="super-secure-production-secret-key"

# Server Port (default 3000)
PORT=3000
```
*(Note: If `GEMINI_API_KEY` is omitted, the app automatically runs in built-in offline educational knowledge engine mode).*

### 4. Running the Full-Stack Application
```bash
# Starts Express backend and mounts Vite development middleware on http://localhost:3000
npm run dev
```

### 5. Running Automated Backend Tests
```bash
npm test
```

### 6. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Pre-Configured Test Credentials

For quick evaluation, use these pre-seeded accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **Demo Student** | `alex@student.edu` | `StudentPass123!` | Undergraduate CS student with active study plans, quiz history, and logged study hours. |
| **Curriculum Admin** | `admin@learning.edu` | `AdminPass123!` | Access to the Administrative Management console for adding resources and managing questions. |

*You can also click "Explore Demo Student" or "Create Student Account" directly on the landing page.*

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new student profile |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT |
| `GET` | `/api/auth/me` | Fetch authenticated session |
| `GET` | `/api/profile` | Retrieve student profile & preferences |
| `PUT` | `/api/profile` | Update student profile & availability |
| `GET` | `/api/dashboard/summary` | Aggregate student statistics & streak |
| `GET` | `/api/dashboard/activity` | Weekly hours & mastery data |
| `POST` | `/api/study-plans/generate` | Algorithmic personalized schedule builder |
| `GET` | `/api/study-plans` | Retrieve student study plans |
| `PATCH` | `/api/study-tasks/:id` | Update task status (Pending/In Progress/Completed) |
| `POST` | `/api/tutor/chat` | Send doubt to AI Tutor with level & language |
| `GET` | `/api/resources/recommendations` | Scored resource recommendations |
| `POST` | `/api/resources/:id/bookmark` | Toggle resource bookmark |
| `POST` | `/api/quizzes/generate` | Adaptive assessment question generator |
| `POST` | `/api/quizzes/submit` | Score calculation & spaced review trigger |
| `POST` | `/api/study-sessions/start` | Launch interactive focus stopwatch |
| `PATCH` | `/api/study-sessions/:id/complete` | Record duration & productivity notes |
| `GET` | `/api/revisions` | Spaced repetition queue |
| `POST` | `/api/goals` | Create student milestone target |
| `GET` | `/api/admin/stats` | Platform adoption metrics (Admin only) |
| `GET` | `/api/health` | Service health status check |

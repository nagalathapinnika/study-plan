const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('pla_auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('pla_auth_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('pla_auth_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected server error occurred';
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {}

    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      clearToken();
      // Redirect to login if token expired
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  googleLogin: (idToken: string) => request<any>('/auth/google-login', { method: 'POST', body: JSON.stringify({ idToken }) }),
  getMe: () => request<any>('/auth/me'),

  // Profile
  getProfile: () => request<any>('/profile'),
  updateProfile: (data: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Dashboard
  getDashboardSummary: () => request<any>('/dashboard/summary'),
  getDashboardActivity: () => request<any>('/dashboard/activity'),

  // Subjects
  getSubjects: () => request<any[]>('/subjects'),

  // Study Plans
  getStudyPlans: () => request<any[]>('/study-plans'),
  generateStudyPlan: (data: any) => request<any>('/study-plans/generate', { method: 'POST', body: JSON.stringify(data) }),
  getStudyPlan: (id: string) => request<any>(`/study-plans/${id}`),
  updateStudyPlan: (id: string, data: any) => request<any>(`/study-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudyPlan: (id: string) => request<any>(`/study-plans/${id}`, { method: 'DELETE' }),

  // Study Tasks
  getStudyTasks: (params?: { planId?: string; date?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.planId) q.append('planId', params.planId);
    if (params?.date) q.append('date', params.date);
    if (params?.status) q.append('status', params.status);
    return request<any[]>(`/study-tasks?${q.toString()}`);
  },
  createStudyTask: (data: any) => request<any>('/study-tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateStudyTask: (id: string, data: any) => request<any>(`/study-tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStudyTask: (id: string) => request<any>(`/study-tasks/${id}`, { method: 'DELETE' }),

  // AI Tutor
  getTutorConversations: () => request<any[]>('/tutor/conversations'),
  getTutorConversation: (id: string) => request<any>(`/tutor/conversations/${id}`),
  sendTutorMessage: (data: any) => request<any>('/tutor/chat', { method: 'POST', body: JSON.stringify(data) }),

  // Resources
  getResources: (params?: { subject?: string; topic?: string; type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.subject) q.append('subject', params.subject);
    if (params?.topic) q.append('topic', params.topic);
    if (params?.type) q.append('type', params.type);
    if (params?.search) q.append('search', params.search);
    return request<any[]>(`/resources?${q.toString()}`);
  },
  getRecommendedResources: () => request<any[]>('/resources/recommendations'),
  toggleBookmark: (id: string) => request<any>(`/resources/${id}/bookmark`, { method: 'POST' }),
  completeResource: (id: string, rating?: number) => request<any>(`/resources/${id}/complete`, { method: 'POST', body: JSON.stringify({ rating }) }),

  // Quizzes
  getQuizTaxonomy: () => request<any>('/quizzes'),
  generateQuiz: (data: any) => request<any>('/quizzes/generate', { method: 'POST', body: JSON.stringify(data) }),
  submitQuiz: (data: any) => request<any>('/quizzes/submit', { method: 'POST', body: JSON.stringify(data) }),
  getQuizHistory: () => request<any[]>('/quizzes/history'),

  // Study Sessions
  startStudySession: (data: any) => request<any>('/study-sessions/start', { method: 'POST', body: JSON.stringify(data) }),
  pauseStudySession: (id: string) => request<any>(`/study-sessions/${id}/pause`, { method: 'PATCH' }),
  resumeStudySession: (id: string) => request<any>(`/study-sessions/${id}/resume`, { method: 'PATCH' }),
  completeStudySession: (id: string, data: any) => request<any>(`/study-sessions/${id}/complete`, { method: 'PATCH', body: JSON.stringify(data) }),
  getStudySessionsHistory: () => request<any>('/study-sessions/history'),

  // Progress
  getProgressSummary: () => request<any>('/progress/summary'),
  getProgressSubjects: () => request<any[]>('/progress/subjects'),
  getProgressTrends: () => request<any[]>('/progress/trends'),

  // Revisions
  getRevisions: () => request<any>('/revisions'),
  createRevision: (data: any) => request<any>('/revisions', { method: 'POST', body: JSON.stringify(data) }),
  completeRevision: (id: string) => request<any>(`/revisions/${id}/complete`, { method: 'PATCH' }),

  // Goals & Achievements
  getGoals: () => request<any[]>('/goals'),
  createGoal: (data: any) => request<any>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: string, data: any) => request<any>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteGoal: (id: string) => request<any>(`/goals/${id}`, { method: 'DELETE' }),
  getAchievements: () => request<any[]>('/goals/achievements'),

  // Notes
  getNotes: (params?: { subject?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.subject) q.append('subject', params.subject);
    if (params?.search) q.append('search', params.search);
    return request<any[]>(`/notes?${q.toString()}`);
  },
  createNote: (data: any) => request<any>('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: any) => request<any>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string) => request<any>(`/notes/${id}`, { method: 'DELETE' }),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  createAdminResource: (data: any) => request<any>('/admin/resources', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminResource: (id: string, data: any) => request<any>(`/admin/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminResource: (id: string) => request<any>(`/admin/resources/${id}`, { method: 'DELETE' }),
  createAdminQuestion: (data: any) => request<any>('/admin/questions', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminQuestion: (id: string) => request<any>(`/admin/questions/${id}`, { method: 'DELETE' }),
};

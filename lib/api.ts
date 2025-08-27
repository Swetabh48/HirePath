import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Foods API
export const foodsAPI = {
  search: (params: any) => api.get('/foods', { params }),
  create: (data: any) => api.post('/foods', data),
  getById: (id: string) => api.get(`/foods/${id}`),
  update: (id: string, data: any) => api.put(`/foods/${id}`, data),
  delete: (id: string) => api.delete(`/foods/${id}`),
};

// Meals API
export const mealsAPI = {
  getMeals: (params: any) => api.get('/meals', { params }),
  logMeal: (data: any) => api.post('/meals', data),
  analyzeImage: (data: any) => api.post('/meals/analyze-image', data),
  analyzeText: (data: any) => api.post('/meals/analyze-text', data),
  getSummary: (params: any) => api.get('/meals/summary', { params }),
};

// Meal Plans API
export const mealPlansAPI = {
  getMealPlans: (params: any) => api.get('/meal-plans', { params }),
  generateMealPlan: (data: any) => api.post('/meal-plans', data),
  getMealPlan: (id: string) => api.get(`/meal-plans/${id}`),
  updateMealPlan: (id: string, data: any) => api.put(`/meal-plans/${id}`, data),
  deleteMealPlan: (id: string) => api.delete(`/meal-plans/${id}`),
};

// Progress API
export const progressAPI = {
  getProgress: (params: any) => api.get('/progress', { params }),
  logProgress: (data: any) => api.post('/progress', data),
  getProgress: (id: string) => api.get(`/progress/${id}`),
  updateProgress: (id: string, data: any) => api.put(`/progress/${id}`, data),
  deleteProgress: (id: string) => api.delete(`/progress/${id}`),
};

export default api;
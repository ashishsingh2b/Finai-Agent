import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', new URLSearchParams({ username: email, password }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }),

    register: (data: { email: string; full_name: string; password: string }) =>
        api.post('/auth/register', data),

    me: () => api.get('/auth/me'),
    updateProfile: (data: { full_name?: string; password?: string; email?: string; role?: string }) => api.put('/auth/me', data),
};

// Analysis APIs
export const analysisAPI = {
    uploadFile: (file: File, language: string = 'es') => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/analysis/upload?language=${language}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getAnalysis: (id: number) => api.get(`/analysis/${id}`),

    listAnalyses: (skip: number = 0, limit: number = 20) =>
        api.get(`/analysis/?skip=${skip}&limit=${limit}`),
};

// User Management APIs
export const userAPI = {
    listUsers: (skip: number = 0, limit: number = 100) =>
        api.get(`/users/?skip=${skip}&limit=${limit}`),

    createUser: (userData: any) =>
        api.post('/users/', userData),

    updateStatus: (userId: number, isActive: boolean) =>
        api.put(`/users/${userId}/status?is_active=${isActive}`),

    deleteUser: (userId: number) =>
        api.delete(`/users/${userId}`),
};

export default api;

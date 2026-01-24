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
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data: { token: string; new_password: string }) => api.post('/auth/reset-password', data),
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
    uploadSplitFiles: (files: File[], language: string = 'es') => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return api.post(`/analysis/upload-split?language=${language}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getAnalysis: (id: number) => api.get(`/analysis/${id}`),

    downloadPDF: (id: number, language: string = 'es') =>
        api.get(`/analysis/${id}/export/pdf?language=${language}`, { responseType: 'blob' }),

    downloadExcel: (id: number, language: string = 'es') =>
        api.get(`/analysis/${id}/export/excel?language=${language}`, { responseType: 'blob' }),

    listAnalyses: (skip: number = 0, limit: number = 20) =>
        api.get(`/analysis/?skip=${skip}&limit=${limit}`),

    updateAnalysisStatus: (id: number, data: { application_status?: string, payment_behavior?: string }) =>
        api.post(`/analysis/${id}/status`, data),
};

// User Management APIs
export const userAPI = {
    listUsers: (skip: number = 0, limit: number = 100) =>
        api.get(`/users/?skip=${skip}&limit=${limit}`),

    createUser: (userData: any) =>
        api.post('/users/', userData),

    updateStatus: (userId: number, isActive: boolean) =>
        api.put(`/users/${userId}/status?is_active=${isActive}`),

    updateUser: (userId: number, userData: any) =>
        api.put(`/users/${userId}`, userData),

    deleteUser: (userId: number) =>
        api.delete(`/users/${userId}`),
};

export default api;

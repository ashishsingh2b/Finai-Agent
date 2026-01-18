import { create } from 'zustand';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('access_token'),
    isAuthenticated: !!localStorage.getItem('access_token'),
    loading: false,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const response = await authAPI.login(email, password);
            const { access_token } = response.data;

            localStorage.setItem('access_token', access_token);

            // Fetch user profile
            const userResponse = await authAPI.me();
            set({
                token: access_token,
                user: userResponse.data,
                isAuthenticated: true,
                loading: false,
            });
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            set({ isAuthenticated: false });
            return;
        }

        try {
            const response = await authAPI.me();
            set({ user: response.data, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('access_token');
            set({ isAuthenticated: false });
        }
    },
}));

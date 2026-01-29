import { create } from 'zustand';


export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface UIState {
    isLoading: boolean;
    toasts: Toast[];
    setLoading: (loading: boolean) => void;
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
}


export const useUIStore = create<UIState>((set) => ({
    isLoading: false,
    toasts: [],
    setLoading: (loading) => set({ isLoading: loading }),

    addToast: (message, type) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { id, message, type }],
        }));

        /**
         * Automated Session Lifespan for Notifications.
         * Toasts are removed from the queue after 5 seconds to prevent 
         * UI clutter.
         */
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, 5000);
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));


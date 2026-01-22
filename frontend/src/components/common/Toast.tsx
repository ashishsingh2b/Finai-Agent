import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, ToastType } from '../../store/uiStore';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X
} from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-red-500" size={18} />,
    warning: <AlertTriangle className="text-amber-500" size={18} />,
    info: <Info className="text-blue-500" size={18} />,
};

const bgColors: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-red-50 border-red-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-blue-50 border-blue-100',
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useUIStore();

    return (
        <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-2xl border shadow-2xl flex items-start gap-4 ${bgColors[toast.type]}`}
                    >
                        <div className="mt-0.5">{icons[toast.type]}</div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-gray-900 leading-tight uppercase tracking-wider mb-1">
                                {toast.type}
                            </p>
                            <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-black/5 rounded-lg transition-colors text-gray-400"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

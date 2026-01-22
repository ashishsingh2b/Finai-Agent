import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalLoader: React.FC = () => {
    const isLoading = useUIStore((state) => state.isLoading);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
                >
                    <div className="relative">
                        {/* Outer Ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-full border-t-2 border-b-2 border-[#11303B]"
                        />

                        {/* Inner Ring */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 m-auto w-16 h-16 rounded-full border-r-2 border-l-2 border-[#6ECEB2]"
                        />

                        {/* Center Dot */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 m-auto w-4 h-4 bg-[#11303B] rounded-full"
                        />

                        {/* Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                        >
                            <span className="text-[10px] font-black text-[#11303B] uppercase tracking-[0.3em] animate-pulse">
                                Processing Neural Data
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

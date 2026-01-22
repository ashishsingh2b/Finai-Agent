import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle, Cpu } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6ECEB2]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#11303B]/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 text-center max-w-lg"
            >
                {/* Visual Icon Group */}
                <div className="relative mb-12 flex justify-center">
                    <motion.div
                        animate={{
                            rotate: [0, 90, 180, 270, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="w-48 h-48 border-2 border-dashed border-[#11303B]/10 rounded-full flex items-center justify-center"
                    >
                        <AlertCircle size={80} className="text-[#11303B]/20" />
                    </motion.div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-gray-50">
                        <span className="text-5xl font-black text-[#11303B]">404</span>
                    </div>
                </div>

                <h1 className="text-[#1A1A1A] text-4xl font-black tracking-tight mb-4">
                    Neural Hub Out of Range
                </h1>
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-8 leading-relaxed">
                    The requested data stream could not be localized within our institutional network. Access to this sector is restricted or non-existent.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full sm:w-auto bg-[#11303B] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#0a1e25] transition-all transform hover:scale-[1.05] shadow-2xl shadow-blue-900/30"
                    >
                        <Home size={18} />
                        Return to Terminal
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto bg-white text-[#11303B] border border-gray-100 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-xl"
                    >
                        Go Back
                    </button>
                </div>

                {/* System Footnote */}
                <div className="mt-16 flex items-center justify-center gap-6 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Cpu size={12} />
                        Protocol: v2.1.0-ERROR
                    </div>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <div>Secured Access Segment</div>
                </div>
            </motion.div>
        </div>
    );
};

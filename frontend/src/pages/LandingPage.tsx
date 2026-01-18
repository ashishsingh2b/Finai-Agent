import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/common/LanguageSelector';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#2D5A9E]/20">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2D5A9E" strokeWidth="0.5" opacity="0.3" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Language Selector - Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <LanguageSelector />
            </div>

            {/* Moving Graph Lines Animation */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
                <svg className="absolute w-[200%] h-full animate-graph-slide" preserveAspectRatio="none" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 200 Q 150 100, 300 200 T 600 200 T 900 200 T 1200 100" stroke="#2D5A9E" strokeWidth="2" fill="none" className="drop-shadow-lg" />
                    <path d="M0 250 Q 150 150, 300 250 T 600 250 T 900 300 T 1200 200" stroke="#4F83CC" strokeWidth="2" fill="none" opacity="0.6" />
                </svg>
                {/* Second layer for depth */}
                <svg className="absolute top-20 w-[200%] h-full animate-graph-slide-slow" preserveAspectRatio="none" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 300 Q 200 200, 400 300 T 800 300 T 1200 250" stroke="#1E3E6F" strokeWidth="1.5" fill="none" opacity="0.4" />
                </svg>
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2D5A9E]/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Content Card */}
            <div className="relative z-10 flex flex-col items-center space-y-10 animate-in fade-in zoom-in duration-700">

                {/* Logo & Title Container */}
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#2D5A9E] to-blue-400 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative w-24 h-24 bg-[#0F172A] rounded-2xl flex items-center justify-center border border-[#2D5A9E]/30 shadow-2xl">
                            <BarChart3 className="text-[#2D5A9E] w-12 h-12" />
                        </div>
                    </div>

                    <div className="text-center space-y-3">
                        <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                            {t('landing.title')}
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-8 bg-[#2D5A9E]/50"></div>
                            <p className="text-[#2D5A9E] font-bold text-xs uppercase tracking-[0.4em] text-shadow">
                                {t('landing.subtitle')}
                            </p>
                            <div className="h-px w-8 bg-[#2D5A9E]/50"></div>
                        </div>
                    </div>
                </div>

                {/* Cyberpunk/Tech Button */}
                <button
                    onClick={() => navigate('/login')}
                    className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#2D5A9E] to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative flex items-center gap-3 text-white font-bold text-sm tracking-widest uppercase">
                        <span>{t('landing.enter')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>

                {/* Additional Text / Features */}
                <div className="pt-8 text-center space-y-4 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                    <p className="text-gray-500 font-medium text-sm leading-relaxed">
                        {t('landing.desc')}
                    </p>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        <span>• {t('landing.security')}</span>
                        <span>• {t('landing.uptime')}</span>
                        <span>• {t('landing.analytics')}</span>
                    </div>
                </div>
            </div>

            {/* CSS Animation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes graph-slide {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes graph-slide-slow {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-30%); }
                }
                .animate-graph-slide {
                    animation: graph-slide 20s linear infinite;
                }
                .animate-graph-slide-slow {
                    animation: graph-slide 20s linear infinite reverse;
                }
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                `
            }} />
        </div>
    );
};

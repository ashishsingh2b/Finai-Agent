import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/common/LanguageSelector';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#11303B] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-white/20">
            {/* Minimal Language Selector - Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <LanguageSelector />
            </div>

            {/* Subtle Background Animation */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
                <svg className="absolute w-[200%] h-full animate-graph-slide" preserveAspectRatio="none" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 200 Q 150 100, 300 200 T 600 200 T 900 200 T 1200 100" stroke="white" strokeWidth="2" fill="none" opacity="0.6" />
                    <path d="M0 250 Q 150 150, 300 250 T 600 250 T 900 300 T 1200 200" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
                </svg>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes graph-slide {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-graph-slide {
                    animation: graph-slide 30s linear infinite;
                }
                `
            }} />

            {/* Main Content Card */}
            <div className="relative z-10 flex flex-col items-center space-y-10 animate-in fade-in zoom-in duration-700">
                {/* Logo & Title Container */}
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative w-48 h-24 sm:w-64 sm:h-32 flex items-center justify-center transition-transform hover:scale-105 duration-500">
                        <img src="/logo.avif" alt="Moskalti Capital" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                </div>

                {/* Cyberpunk/Tech Button */}
                <button
                    onClick={() => navigate('/login')}
                    className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95 shadow-2xl"
                >
                    <div className="absolute inset-0 w-full h-full bg-white hover:bg-white/90 transition-all rounded-full"></div>
                    <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative flex items-center gap-3 text-[#11303B] font-black text-sm tracking-[0.2em] uppercase">
                        <span>{t('landing.enter')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>

                {/* Additional Text / Features */}
                <div className="pt-8 text-center space-y-4 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                    <p className="text-white/60 font-medium text-sm leading-relaxed">
                        {t('landing.desc')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] font-bold text-white/40 uppercase tracking-widest px-4">
                        <span>• {t('landing.security')}</span>
                        <span>• {t('landing.uptime')}</span>
                        <span>• {t('landing.analytics')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

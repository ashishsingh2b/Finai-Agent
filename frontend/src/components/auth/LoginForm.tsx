import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../common/LanguageSelector';
import {
    ShieldCheck,
    AtSign,
    Lock,
    ArrowRight,
    BarChart3,
    Loader2,
    X,
    ArrowLeft,
    Mail
} from 'lucide-react';

export const LoginForm: React.FC = () => {
    const { t } = useTranslation();
    const [view, setView] = useState<'login' | 'forgot'>('login');

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot Password State
    const [resetEmail, setResetEmail] = useState('');
    const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || t('login.invalidCredentials'));
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetStatus('sending');
        // Mock API call
        setTimeout(() => {
            setResetStatus('sent');
        }, 1500);
    };

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
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2D5A9E]/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
                <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">

                    {/* Close Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className={`transition-all duration-500 ease-in-out ${view === 'login' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute inset-0 p-8 pointer-events-none'}`}>
                        {/* Login View */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#2D5A9E] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto mb-6">
                                <BarChart3 className="text-white w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight mb-2">{t('login.welcome')}</h1>
                            <p className="text-gray-400 text-sm">{t('login.subtitle')}</p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold">
                                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#2D5A9E] transition-colors">
                                        <AtSign size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm font-medium text-white focus:bg-[#1A1A1A] focus:ring-2 focus:ring-[#2D5A9E]/50 focus:border-[#2D5A9E] transition-all outline-none placeholder:text-gray-600"
                                        placeholder={t('login.email')}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#2D5A9E] transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm font-medium text-white focus:bg-[#1A1A1A] focus:ring-2 focus:ring-[#2D5A9E]/50 focus:border-[#2D5A9E] transition-all outline-none placeholder:text-gray-600"
                                        placeholder={t('login.password')}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-[#2D5A9E] hover:text-white transition-colors uppercase tracking-wider">
                                    {t('login.forgot')}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#2D5A9E] hover:bg-[#1E3E6F] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {t('login.access')}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-medium">{t('login.demo')}</span>
                                <button
                                    onClick={() => {
                                        setEmail('admin@moskalti.com');
                                        setPassword('admin123');
                                    }}
                                    className="text-[#2D5A9E] font-bold hover:text-white transition-colors uppercase tracking-wider"
                                >
                                    {t('login.autofill')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`transition-all duration-500 ease-in-out ${view === 'forgot' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute inset-0 p-8 pointer-events-none'}`}>
                        {/* Forgot Password View */}
                        {resetStatus === 'sent' ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 animate-in zoom-in spin-in-90 duration-500">
                                    <Mail className="text-emerald-500 w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2">{t('login.checkEmail')}</h2>
                                    <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
                                        {t('login.emailSent')} <span className="text-white font-bold">{resetEmail}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setView('login');
                                        setResetStatus('idle');
                                        setResetEmail('');
                                    }}
                                    className="px-8 py-3 bg-[#1A1A1A] hover:bg-white text-white hover:text-black rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    {t('login.backLogin')}
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setView('login')}
                                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors group"
                                >
                                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                    {t('login.backLogin')}
                                </button>

                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-white mb-2">{t('login.reset')}</h2>
                                    <p className="text-gray-400 text-sm">{t('login.resetDesc')}</p>
                                </div>

                                <form onSubmit={handleForgotSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#2D5A9E] transition-colors">
                                                <AtSign size={16} />
                                            </div>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm font-medium text-white focus:bg-[#1A1A1A] focus:ring-2 focus:ring-[#2D5A9E]/50 focus:border-[#2D5A9E] transition-all outline-none placeholder:text-gray-600"
                                                placeholder={t('login.email')}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={resetStatus === 'sending'}
                                        className="w-full bg-[#2D5A9E] hover:bg-[#1E3E6F] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resetStatus === 'sending' ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            t('login.sendLink')
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                </div>

                <p className="mt-8 text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    {t('login.secured')}
                </p>
            </div>

            {/* Reuse Animation Styles */}
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

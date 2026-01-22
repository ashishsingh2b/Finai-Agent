import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../common/LanguageSelector';
import { authAPI } from '../../services/api';
import {
    AtSign,
    Lock,
    ArrowRight,
    Loader2,
    X,
    ArrowLeft,
    Mail,
    Eye,
    EyeOff
} from 'lucide-react';

export const LoginForm: React.FC = () => {
    const { t } = useTranslation();
    const [view, setView] = useState<'login' | 'forgot'>('login');

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Forgot Password State
    const [resetEmail, setResetEmail] = useState('');
    const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const { login } = useAuthStore();
    const { addToast } = useUIStore();
    const navigate = useNavigate();

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            addToast('Login successful! Redirecting...', 'success');
            navigate('/dashboard');
        } catch (err: any) {
            addToast(err.response?.data?.detail || t('login.invalidCredentials'), 'error');
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetStatus('sending');

        try {
            await authAPI.forgotPassword(resetEmail);
            setResetStatus('sent');
        } catch (err: any) {
            console.error('Password reset error:', err);
            setResetStatus('sent'); // Still show success to avoid revealing if email exists
        }
    };

    return (
        <div className="min-h-screen bg-[#11303B] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-white/20">
            {/* Minimal Language Selector - Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <LanguageSelector />
            </div>


            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
                <div className="bg-[#11303B] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

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
                            <div className="w-40 h-20 mx-auto mb-6 flex items-center justify-center transition-transform hover:scale-105 duration-500">
                                <img src="/logo.avif" alt="Moskalti Capital" className="w-full h-full object-contain drop-shadow-2xl" />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight mb-2">{t('login.welcome')}</h1>
                            <p className="text-gray-400 text-sm">{t('login.subtitle')}</p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-white transition-colors">
                                        <AtSign size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[#0a1e25] border border-white/10 rounded-xl text-sm font-medium text-white focus:bg-[#0d232b] focus:ring-2 focus:ring-white/20 focus:border-white/50 transition-all outline-none placeholder:text-white/40"
                                        placeholder={t('login.email')}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-white transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-[#0a1e25] border border-white/10 rounded-xl text-sm font-medium text-white focus:bg-[#0d232b] focus:ring-2 focus:ring-white/20 focus:border-white/50 transition-all outline-none placeholder:text-white/40"
                                        placeholder={t('login.password')}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setView('forgot')}
                                    className="group relative text-xs font-semibold text-white/70 hover:text-white transition-all duration-300 uppercase tracking-wider px-2 py-1"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    <span className="relative z-10">{t('login.forgot')}</span>
                                    {/* Animated underline */}
                                    <span
                                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"
                                    ></span>
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                            >
                                <div className="absolute inset-0 w-full h-full bg-white hover:bg-white/90 transition-all"></div>
                                <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <div className="relative flex items-center gap-2 text-[#11303B]">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {t('login.access')}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
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
                                    className="text-white font-bold hover:text-white/80 transition-colors uppercase tracking-wider"
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
                                    className="w-full relative overflow-hidden group bg-white hover:bg-gray-50 text-[#11303B] font-black py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] isolate"
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-multiply z-0"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-10"></div>
                                    <div className="relative z-20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                                        <ArrowLeft size={16} strokeWidth={3} className="transition-transform group-hover:-translate-x-1" />
                                        {t('login.backLogin')}
                                    </div>
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
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-white transition-colors">
                                                <AtSign size={16} />
                                            </div>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm font-medium text-white focus:bg-[#1A1A1A] focus:ring-2 focus:ring-[#76d2b1]/50 focus:border-[#76d2b1] transition-all outline-none placeholder:text-gray-600"
                                                placeholder={t('login.email')}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={resetStatus === 'sending'}
                                        className="w-full relative overflow-hidden group bg-white hover:bg-gray-50 text-[#11303B] font-black py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] isolate"
                                    >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-multiply z-0"></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-10"></div>
                                        <div className="relative z-20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                                            {resetStatus === 'sending' ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                <>
                                                    {t('login.sendLink')}
                                                    <ArrowRight size={16} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </div>
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

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Loader2, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { authAPI } from '../services/api';

export const ResetPasswordPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError(t('resetPassword.invalidToken'));
            setStatus('error');
        }
    }, [token, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('resetPassword.passwordsDoNotMatch'));
            return;
        }

        setError('');
        setLoading(true);

        try {
            await authAPI.resetPassword({
                token: token!,
                new_password: password
            });

            setStatus('success');
            setLoading(false);

            // Auto redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || t('resetPassword.resetFailed'));
            setStatus('error');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#11303B] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-white/20">
            {/* Minimal Language Selector - Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <LanguageSelector />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-[#11303B] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md mx-auto relative overflow-hidden">
                    <div className="flex flex-col items-center mb-6 sm:mb-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                            <ShieldCheck size={28} className="text-[#11303B]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
                            {status === 'success' ? t('resetPassword.successTitle') : t('resetPassword.title')}
                        </h1>
                        <p className="text-gray-400 text-sm mt-2 text-center">
                            {status === 'success'
                                ? t('resetPassword.successSubtitle')
                                : t('resetPassword.subtitle')}
                        </p>
                    </div>

                    {status === 'success' ? (
                        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom duration-500">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} className="text-green-500" />
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 bg-[#11303B] hover:bg-[#0a1e25] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                            >
                                {t('resetPassword.backToLogin')}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">
                                    {t('resetPassword.newPassword')}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-white transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-[#0a1e25] border border-white/10 rounded-xl text-sm font-medium text-white focus:bg-[#0d232b] focus:ring-2 focus:ring-white/20 focus:border-white/50 transition-all outline-none placeholder:text-white/40"
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
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

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4">
                                    {t('resetPassword.confirmPassword')}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-white transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 bg-[#0a1e25] border border-white/10 rounded-xl text-sm font-medium text-white focus:bg-[#0d232b] focus:ring-2 focus:ring-white/20 focus:border-white/50 transition-all outline-none placeholder:text-white/40"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full relative py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden mt-8"
                            >
                                <div className="absolute inset-0 w-full h-full bg-white hover:bg-white/90 transition-all"></div>
                                <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <div className="relative flex items-center gap-2 text-[#11303B]">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {t('resetPassword.submit')}
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

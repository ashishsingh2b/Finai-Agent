import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import {
    User,
    Lock,
    Camera,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ProfilePage: React.FC = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const { t } = useTranslation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [passwordSaving, setPasswordSaving] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!newPassword || !confirmPassword) {
            setPasswordError(t('profile.errFillFields'));
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(t('profile.errLength'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(t('profile.errMatch'));
            return;
        }

        try {
            setPasswordSaving(true);
            await authAPI.updateProfile({ password: newPassword });
            setNewPassword('');
            setConfirmPassword('');
            setPasswordSuccess(t('profile.successUpdate'));
        } catch (err: any) {
            const msg = err?.response?.data?.detail || err?.message || t('profile.errUpdate');
            setPasswordError(String(msg));
        } finally {
            setPasswordSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div>
                    <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight">{t('profile.title')}</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Settings Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        {[
                            { id: 'profile', label: t('profile.settings'), icon: User },
                            { id: 'password', label: t('profile.changePassword'), icon: Lock },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all relative ${activeTab === item.id
                                    ? 'bg-[#11303B]/5 text-[#11303B]'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                            >
                                {activeTab === item.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#11303B]"></div>
                                )}
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Form */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                {/* Avatar Section */}
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                            {user?.full_name ? (
                                                <span className="text-3xl font-black text-[#11303B]">{user.full_name.charAt(0)}</span>
                                            ) : (
                                                <User className="w-10 h-10 text-gray-300" />
                                            )}
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-[#11303B] text-white rounded-full shadow-md hover:bg-[#0a1e25] transition-colors">
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="px-5 py-3 bg-[#6ECEB2] text-[#11303B] text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#6ECEB2]/20 hover:bg-[#5bc1a6] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                                            {t('profile.uploadNew')}
                                        </button>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('profile.firstName')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            defaultValue={user?.full_name?.split(' ')[0]}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#11303B]/20 focus:border-[#11303B] transition-all"
                                            placeholder="First name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('profile.lastName')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            defaultValue={user?.full_name?.split(' ')[1] || ''}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#11303B]/20 focus:border-[#11303B] transition-all"
                                            placeholder="Last name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('profile.email')}</label>
                                        <input
                                            type="email"
                                            defaultValue={user?.email}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#11303B]/20 focus:border-[#11303B] transition-all"
                                            placeholder="examples@gmail.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('profile.mobileNumber')} <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 flex items-center gap-2">
                                                <div className="w-5 h-4 bg-green-600 rounded-sm relative overflow-hidden">
                                                    <div className="absolute inset-x-0 h-1/3 bg-white top-1/3"></div>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#11303B]/20 focus:border-[#11303B] transition-all"
                                                placeholder="0806 123 7890"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('profile.gender')}</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input type="radio" name="gender" className="w-4 h-4 text-[#11303B] focus:ring-[#11303B]" />
                                                <span className="text-sm font-bold text-gray-700">{t('profile.male')}</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input type="radio" name="gender" className="w-4 h-4 text-[#11303B] focus:ring-[#11303B]" />
                                                <span className="text-sm font-bold text-gray-700">{t('profile.female')}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4">
                                    <button className="bg-[#6ECEB2] text-[#11303B] px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#6ECEB2]/20 hover:bg-[#5bc1a6] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 group">
                                        {t('profile.saveChanges')}
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeTab === 'password' && (
                            <form onSubmit={handleChangePassword} className="space-y-8">
                                <div>
                                    <h2 className="text-lg font-black text-[#1A1A1A] tracking-tight">{t('profile.changePassword')}</h2>
                                    <p className="text-sm text-gray-500 mt-1">{t('profile.passwordDesc')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('profile.newPassword')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#11303B]/20 focus:border-[#11303B] transition-all"
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t('profile.confirmPassword')} <span className="text-red-500">*</span></label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#11303B]/20 focus:border-[#11303B] transition-all"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                {passwordError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-lg">
                                        {passwordError}
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-lg">
                                        {passwordSuccess}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={passwordSaving}
                                        className={`bg-[#6ECEB2] text-[#11303B] px-8 py-3 rounded-xl font-black text-sm shadow-xl shadow-[#6ECEB2]/20 transition-all transform active:scale-[0.98] ${passwordSaving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#5bc1a6] hover:scale-[1.02]'}`}
                                    >
                                        {passwordSaving ? t('profile.saving') : t('profile.updatePassword')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

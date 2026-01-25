import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { userAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import {
    Users,
    UserPlus,
    Shield,
    ShieldAlert,
    Trash2,
    Edit2,
    XCircle,
    CheckCircle,
    Ban
} from 'lucide-react';

interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export const UserManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuthStore();
    const { addToast, setLoading: setGlobalLoading } = useUIStore();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ email: '', full_name: '', password: '', role: 'analyst' });
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await userAPI.listUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setGlobalLoading(true);
        try {
            await userAPI.createUser(formData);
            addToast(t('users.successCreate'), 'success');
            setShowCreateModal(false);
            setFormData({ email: '', full_name: '', password: '', role: 'analyst' });
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to create user:', error);
            addToast(error.response?.data?.detail || t('users.errCreate'), 'error');
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setGlobalLoading(true);
        try {
            const updateData: any = {};
            if (formData.full_name) updateData.full_name = formData.full_name;
            if (formData.email) updateData.email = formData.email;
            if (formData.role) updateData.role = formData.role;
            if (formData.password) updateData.password = formData.password;

            await userAPI.updateUser(selectedUser.id, updateData);
            addToast(t('users.successUpdate'), 'success');
            setShowEditModal(false);
            setSelectedUser(null);
            setFormData({ email: '', full_name: '', password: '', role: 'analyst' });
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to update user:', error);
            addToast(error.response?.data?.detail || t('users.errUpdate'), 'error');
        } finally {
            setGlobalLoading(false);
        }
    };

    const toggleUserStatus = async (userId: number, currentStatus: boolean, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setGlobalLoading(true);
        try {
            await userAPI.updateStatus(userId, !currentStatus);
            addToast(t(!currentStatus ? 'users.activated' : 'users.deactivated'), 'success');
            fetchUsers();
        } catch (error: any) {
            console.error('Failed to update user status:', error);
            addToast(t('users.errStatus'), 'error');
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleDeleteUser = async (userId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (window.confirm(t('users.confirmDelete'))) {
            setGlobalLoading(true);
            try {
                await userAPI.deleteUser(userId);
                addToast(t('users.successDelete') || 'User deleted successfully', 'success');
                fetchUsers();
            } catch (error: any) {
                console.error('Failed to delete user:', error);
                addToast(t('users.errDelete'), 'error');
            } finally {
                setGlobalLoading(false);
            }
        }
    };

    const openEditModal = (user: User, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedUser(user);
        setFormData({
            email: user.email,
            full_name: user.full_name,
            password: '', // Don't fill password
            role: user.role
        });
        setShowEditModal(true);
    };

    if (currentUser?.role !== 'admin') {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-xl font-black text-gray-900 mb-2">{t('common.accessDenied')}</h2>
                    <p className="text-gray-500">{t('users.deniedDesc')}</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[#11303B] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                            <Users size={14} />
                            {t('users.title')}
                        </div>
                        <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight leading-none mb-2">
                            {t('users.title')}
                            <span className="ml-3 bg-[#11303B]/10 text-[#11303B] px-2.5 py-0.5 rounded-lg text-[10px] align-middle font-black uppercase tracking-wider">{t('users.total', { count: users.length })}</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-xs">{t('users.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ email: '', full_name: '', password: '', role: 'analyst' });
                            setShowCreateModal(true);
                        }}
                        className="w-full sm:w-auto bg-[#6ECEB2] text-[#11303B] px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5bc1a6] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#6ECEB2]/20 group"
                    >
                        <UserPlus size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                        {t('users.addUser')}
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    {loading ? (
                        <div className="p-10 flex justify-center">
                            <div className="w-10 h-10 border-4 border-[#11303B]/20 border-t-[#11303B] rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="overflow-visible">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">{t('users.user')}</th>
                                        <th className="hidden sm:table-cell px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">{t('users.role')}</th>
                                        <th className="hidden md:table-cell px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">{t('users.status')}</th>
                                        <th className="hidden lg:table-cell px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">{t('users.joined')}</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">{t('users.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-gray-100 flex items-center justify-center font-black text-[#11303B] text-sm">
                                                        {user.full_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-[#1A1A1A]">{user.full_name}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {user.role === 'admin' ? <Shield size={12} className="text-[#11303B]" /> : <Users size={12} className="text-gray-400" />}
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'text-[#11303B]' : 'text-gray-600'}`}>
                                                        {t(`users.roles.${user.role}`)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${user.is_active
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                    {user.is_active ? t('users.active') : t('users.inactive')}
                                                </span>
                                            </td>
                                            <td className="hidden lg:table-cell px-6 py-4">
                                                <div className="text-[10px] font-bold text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => openEditModal(user, e)}
                                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-200 hover:text-[#11303B] transition-all shadow-sm"
                                                        title={t('users.update')}
                                                    >
                                                        <Edit2 size={14} strokeWidth={2.5} />
                                                    </button>

                                                    {user.id !== currentUser?.id && (
                                                        <>
                                                            <button
                                                                onClick={(e) => toggleUserStatus(user.id, user.is_active, e)}
                                                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm ${user.is_active
                                                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                                    }`}
                                                                title={user.is_active ? t('users.deactivate') : t('users.activate')}
                                                            >
                                                                {user.is_active ? <Ban size={14} strokeWidth={2.5} /> : <CheckCircle size={14} strokeWidth={2.5} />}
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteUser(user.id, e)}
                                                                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all shadow-sm"
                                                                title={t('users.delete')}
                                                            >
                                                                <Trash2 size={14} strokeWidth={2.5} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create/Edit User Modal */}
                {(showCreateModal || showEditModal) && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                                        {showEditModal ? t('users.updateTitle') : t('users.createTitle')}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-medium mt-1">{t('users.enterInfo')}</p>
                                </div>
                                <button
                                    onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <form onSubmit={showEditModal ? handleUpdateUser : handleCreateUser} className="space-y-6">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">{t('login.name') || 'Full Name'}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#11303B] transition-all"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">{t('login.email')}</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#11303B] transition-all"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="user@moskalti.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">
                                        {showEditModal ? t('users.newPasswordOpt') : t('login.password')}
                                    </label>
                                    <input
                                        type="password"
                                        required={!showEditModal}
                                        placeholder={showEditModal ? "••••••••" : "••••••••"}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#11303B] transition-all"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">{t('users.role')}</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#11303B] transition-all appearance-none cursor-pointer"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="analyst">{t('users.roles.analyst')}</option>
                                            <option value="manager">{t('users.roles.manager')}</option>
                                            <option value="admin">{t('users.roles.admin')}</option>
                                        </select>
                                        <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full bg-[#11303B] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#0a1e25] transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                                    >
                                        {showEditModal ? t('users.saveChanges') : t('users.createBtn')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

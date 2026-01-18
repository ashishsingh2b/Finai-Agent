import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../common/LanguageSelector';
import {
    LayoutDashboard,
    FileText,
    User,
    LogOut,
    Menu,
    BarChart3,
    Upload,
    Users,
    ChevronLeft,
    Search,
    Bell
} from 'lucide-react';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { logout, user } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard' },
        { icon: Upload, label: t('nav.upload'), path: '/dashboard/upload' },
        { icon: FileText, label: t('nav.reports'), path: '/dashboard/reports' },
        { icon: User, label: t('nav.profile'), path: '/dashboard/profile' },
        ...(user?.role === 'admin' ? [{ icon: Users, label: t('nav.users'), path: '/dashboard/users' }] : []),
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-[#2D5A9E]/10">
            {/* Sidebar (Desktop) */}
            <aside
                className={`hidden md:flex flex-col bg-[#2D5A9E] text-white transition-all duration-300 ease-in-out border-r border-white/10 ${isCollapsed ? 'w-20' : 'w-64'
                    } fixed inset-y-0 left-0 z-50 shadow-2xl shadow-blue-900/50`}
            >
                {/* Logo Section */}
                <div className="h-24 flex items-center px-6 border-b border-white/10 bg-[#2D5A9E]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/10">
                            <BarChart3 className="text-[#2D5A9E] w-5 h-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col animate-in fade-in duration-300">
                                <span className="font-black text-lg tracking-tight leading-none text-white">MOSKALTI</span>
                                <span className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Intelligence</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${location.pathname === item.path
                                ? 'bg-white text-[#2D5A9E] shadow-lg shadow-black/10 font-black'
                                : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                }`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <item.icon size={20} className={`${location.pathname === item.path ? 'text-[#2D5A9E]' : 'text-blue-200 group-hover:text-white'}`} />
                            {!isCollapsed && <span className={`text-sm tracking-wide ${location.pathname === item.path ? 'font-black' : 'font-bold'}`}>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-red-500/20 hover:text-white transition-all group`}
                        title={isCollapsed ? t('nav.logout') : ''}
                    >
                        <LogOut size={20} className="group-hover:text-red-200" />
                        {!isCollapsed && <span className="font-bold text-sm tracking-wide">{t('nav.logout')}</span>}
                    </button>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#2D5A9E] z-[60] px-4 flex items-center justify-between border-b border-white/10 shadow-lg shadow-blue-900/20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <BarChart3 className="text-[#2D5A9E] w-5 h-5" />
                    </div>
                    <span className="text-white font-black text-lg tracking-tighter">MOSKALTI</span>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSelector />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-white hover:bg-white/10 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className="absolute top-0 right-0 bottom-0 w-3/4 bg-[#2D5A9E] p-6 slide-in-from-right animate-in duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-white font-black text-xl tracking-tighter">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-blue-200 hover:text-white">
                                <ChevronLeft className="w-6 h-6 rotate-180" />
                            </button>
                        </div>
                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-white font-bold transition-all ${location.pathname === item.path
                                        ? 'bg-white text-[#2D5A9E] shadow-lg shadow-black/10'
                                        : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    <item.icon className={`w-6 h-6 ${location.pathname === item.path ? 'text-[#2D5A9E]' : 'text-white'}`} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                        <button
                            onClick={handleLogout}
                            className="absolute bottom-10 left-6 right-6 flex items-center gap-4 px-4 py-4 rounded-2xl text-blue-100 bg-red-500/20 hover:bg-red-500/30 font-bold"
                        >
                            <LogOut className="w-6 h-6 text-red-100" />
                            <span>{t('nav.logout')}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main
                className={`flex-1 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'
                    } pt-20 md:pt-0 min-h-screen`}
            >
                {/* Topbar (Desktop) */}
                <header className="hidden md:flex h-14 items-center justify-between px-10 bg-white/50 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
                    <div className="flex items-center gap-4 bg-gray-100/50 px-4 py-2.5 rounded-2xl border border-gray-200/50 w-96 group focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-900/5 transition-all">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[#2D5A9E]" />
                        <input
                            type="text"
                            placeholder="Universal search..."
                            className="bg-transparent border-none text-sm font-medium w-full focus:ring-0 placeholder:text-gray-400 text-gray-700"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <LanguageSelector className="mr-2" />
                        <button className="relative p-2 text-gray-400 hover:text-[#2D5A9E] hover:bg-blue-50 rounded-xl transition-all">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="text-right flex flex-col items-end">
                                <span className="text-xs font-black text-gray-900 leading-none group-hover:text-[#2D5A9E] transition-colors">{user?.full_name}</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{user?.role}</span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] border border-gray-200 overflow-hidden group-hover:border-[#2D5A9E] transition-all">
                                <img src={`https://ui-avatars.com/api/?name=${user?.full_name}&background=2D5A9E&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <div className="px-6 md:px-10 pb-6 md:pb-10 pt-2 md:pt-4 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            ` }} />
        </div>
    );
};

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
    Upload,
    Users,
    ChevronLeft,
    Search,
    Bell,
    BookOpen
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
        { icon: BookOpen, label: t('nav.documentation'), path: '/dashboard/documentation' },
        { icon: FileText, label: t('nav.reports'), path: '/dashboard/reports' },
        { icon: User, label: t('nav.profile'), path: '/dashboard/profile' },
        ...(user?.role === 'admin' ? [{ icon: Users, label: t('nav.users'), path: '/dashboard/users' }] : []),
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-[#6ECEB2]/30">
            <div className="flex flex-1">
                {/* Sidebar (Desktop) */}
                <aside
                    className={`hidden md:flex flex-col bg-[#11303B] text-white transition-all duration-300 ease-in-out border-r border-white/10 ${isCollapsed ? 'w-20' : 'w-64'
                        } fixed inset-y-0 left-0 z-50 shadow-2xl shadow-blue-900/50`}
                >
                    {/* Logo Section */}
                    <div className="h-24 flex items-center justify-center px-6 border-b border-white/10 bg-[#11303B]">
                        <div className={`transition-all duration-300 flex items-center justify-center ${isCollapsed ? 'w-10 h-10' : 'w-40 h-16'}`}>
                            <img src="/logo.avif" alt="Moskalti Capital" className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-8 px-4 space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${location.pathname === item.path
                                    ? 'bg-[#11303B] relative overflow-hidden'
                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                title={isCollapsed ? item.label : ''}
                            >
                                {location.pathname === item.path && (
                                    <>
                                        <div className="absolute inset-0 bg-[#6ECEB2]/10" />
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6ECEB2]" />
                                    </>
                                )}
                                <item.icon size={20} className={`${location.pathname === item.path ? 'text-[#6ECEB2]' : 'text-blue-200 group-hover:text-white'}`} />
                                {!isCollapsed && <span className={`text-sm tracking-wide ${location.pathname === item.path ? 'font-black text-white' : 'font-bold'}`}>{item.label}</span>}
                            </button>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-white/10 space-y-2">
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-[#ef6b6b]/20 hover:text-white transition-all group`}
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
                <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#11303B] z-[60] px-4 flex items-center justify-between border-b border-white/10 shadow-lg shadow-blue-900/20">
                    <div className="flex items-center justify-center w-32 h-10">
                        <img src="/logo.avif" alt="Moskalti Capital" className="w-full h-full object-contain drop-shadow-md" />
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
                            className="absolute top-0 right-0 bottom-0 w-3/4 bg-[#11303B] p-6 slide-in-from-right animate-in duration-300"
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
                                            ? 'bg-white/10 text-[#6ECEB2] shadow-lg shadow-black/10 border-l-4 border-[#6ECEB2]'
                                            : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <item.icon className={`w-6 h-6 ${location.pathname === item.path ? 'text-[#6ECEB2]' : 'text-white'}`} />
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
                        } pt-20 md:pt-0 min-h-screen flex flex-col`}
                >
                    {/* Topbar (Desktop) - Bicolor Header Layout */}
                    {/* Topbar (Desktop) - Bicolor Header Layout */}
                    <header className="hidden md:flex h-12 items-center justify-between px-6 bg-[#11303B] sticky top-0 z-40 border-b border-white/10">
                        <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 w-80 group focus-within:bg-[#11303B] focus-within:border-[#6ECEB2] focus-within:ring-1 focus-within:ring-[#6ECEB2] transition-all">
                            <Search className="w-3.5 h-3.5 text-white group-focus-within:text-[#6ECEB2]" />
                            <input
                                type="text"
                                placeholder="Universal search..."
                                className="bg-transparent border-none text-[10px] font-medium w-full focus:ring-0 placeholder:text-white/60 text-white focus:text-white placeholder-focus:text-white/60"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <LanguageSelector className="mr-0 scale-90" />
                            <button className="relative p-1.5 text-white hover:bg-white/20 rounded-lg transition-all">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#ef6b6b] rounded-full ring-1 ring-[#11303B]"></span>
                            </button>
                            <div className="w-px h-6 bg-white/20"></div>
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-xs font-black text-white leading-none group-hover:text-[#11303B] transition-colors">{user?.full_name}</span>
                                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-0.5">{user?.role}</span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/10 overflow-hidden group-hover:border-white transition-all">
                                    <img src={`https://ui-avatars.com/api/?name=${user?.full_name}&background=11303B&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Container */}
                    <div className="px-6 md:px-10 pb-6 md:pb-10 pt-2 md:pt-8 max-w-[1600px] mx-auto flex-1 w-full">
                        {children}
                    </div>

                    {/* Institutional Footer */}
                    <footer className="footer-institutional w-full py-8 mt-auto border-t border-gray-100 bg-white">
                        <div className="max-w-[1600px] mx-auto px-10 flex flex-col items-center">
                            <p className="font-bold text-gray-400 text-[11px] uppercase tracking-[0.2em] mb-4">
                                <a href="https://www.moskalti.com/aviso-de-privacidad" target="_blank" rel="noopener noreferrer" className="hover:text-[#11303B] underline underline-offset-4 transition-colors">
                                    © 2025 Moskalti Capital - Aviso de privacidad
                                </a>
                            </p>
                            <div className="flex items-center gap-4 opacity-30 grayscale active:grayscale-0 transition-all hover:opacity-60">
                                <img src="/logo.avif" alt="Moskalti" className="h-6 object-contain" />
                            </div>
                        </div>
                    </footer>
                </main>
            </div>

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

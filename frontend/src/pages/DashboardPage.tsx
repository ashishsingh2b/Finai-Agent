import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { analysisAPI } from '../services/api';
import { AnalysisListItem } from '../types';
import {
    FileText,
    TrendingUp,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    ShieldAlert,
    BarChart3,
    Calendar,
    ChevronRight,
    Search,
    Activity
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalyses();
    }, []);

    const fetchAnalyses = async () => {
        try {
            const response = await analysisAPI.listAnalyses();
            setAnalyses(response.data.analyses || []);
        } catch (error) {
            console.error('Failed to fetch analyses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20';
            case 'B': return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20';
            case 'C': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20';
            case 'D': return 'bg-orange-50 text-orange-700 border-orange-100 ring-orange-500/20';
            case 'E': return 'bg-red-50 text-red-700 border-red-100 ring-red-500/20';
            default: return 'bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/20';
        }
    };

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#2D5A9E] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                        <Activity size={14} />
                        {t('dash.terminal')}
                    </div>
                    <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight leading-none mb-2">
                        {t('dash.greeting')}, <span className="text-[#2D5A9E]">{user?.full_name?.split(' ')[0]}</span>.
                    </h1>
                    <p className="text-gray-500 font-medium text-xs">{t('dash.welcome')}</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard/upload')}
                        className="bg-[#2D5A9E] text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1E3E6F] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-900/20 group"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                        {t('dash.create')}
                    </button>
                </div>
            </div>

            {/* Metrics Grid (Compact) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-in fade-in slide-in-from-bottom duration-1000">
                {[
                    { label: t('dash.total'), val: analyses.length, trend: '+12%', up: true, icon: FileText, color: 'blue' },
                    { label: t('dash.avgRisk'), val: (analyses.reduce((acc, curr) => acc + curr.credit_score, 0) / (analyses.length || 1)).toFixed(0), trend: '+4.2', up: true, icon: TrendingUp, color: 'emerald' },
                    { label: t('dash.highRisk'), val: analyses.filter(a => ['D', 'E'].includes(a.category)).length, trend: '-2', up: true, icon: ShieldAlert, color: 'red' },
                    { label: t('dash.uptime'), val: '99.9%', trend: t('dash.stable'), up: true, icon: BarChart3, color: 'indigo' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#2D5A9E]/10 group-hover:text-[#2D5A9E] transition-all`}>
                                <stat.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className={`flex items-center gap-1 text-[9px] font-black ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {stat.trend}
                            </div>
                        </div>
                        <div className="text-xl font-black text-[#1A1A1A] mb-0.5 tracking-tighter">{stat.val}</div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Area - Full Width - Table Only */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-[#1A1A1A] text-base font-black tracking-tight flex items-center gap-3">
                        {t('dash.recent')}
                        <span className="bg-[#2D5A9E]/10 text-[#2D5A9E] px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">{analyses.length} Total</span>
                    </h2>
                </div>

                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                    {loading ? (
                        <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-[#2D5A9E]/20 border-t-[#2D5A9E] rounded-full animate-spin"></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dash.fetching')}</span>
                        </div>
                    ) : analyses.length === 0 ? (
                        <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                            <Search className="w-8 h-8 text-gray-200" />
                            <p className="text-gray-500 font-medium text-xs">{t('dash.noHistory')}</p>
                            <button
                                onClick={() => navigate('/dashboard/upload')}
                                className="text-[#2D5A9E] font-black text-[9px] uppercase tracking-widest py-2 px-4 bg-[#2D5A9E]/5 rounded-xl hover:bg-[#2D5A9E]/10"
                            >
                                {t('dash.start')}
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{t('dash.entity')}</th>
                                        <th className="px-4 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{t('dash.timeline')}</th>
                                        <th className="px-4 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-center">{t('dash.score')}</th>
                                        <th className="px-4 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">{t('dash.action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {analyses.map((analysis) => (
                                        <tr
                                            key={analysis.id}
                                            onClick={() => navigate(`/analysis/${analysis.id}`)}
                                            className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-[#2D5A9E] text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        {analysis.company_name.charAt(0)}
                                                    </div>
                                                    <div className="text-xs font-black text-[#1A1A1A] group-hover:text-[#2D5A9E] transition-colors">{analysis.company_name}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-[10px] font-bold text-gray-400 capitalize">{new Date(analysis.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black border transition-all ${getCategoryStyles(analysis.category)}`}>
                                                    {analysis.credit_score}% ({analysis.category})
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2D5A9E] inline-block" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

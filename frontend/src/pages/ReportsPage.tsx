import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Download,
    ChevronRight,
    Calendar,
    ArrowUpDown,
    FileText,
    MoreHorizontal
} from 'lucide-react';
import { analysisAPI } from '../services/api';
import { AnalysisListItem } from '../types';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTranslation } from 'react-i18next';

export const ReportsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
    const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    useEffect(() => {
        fetchAnalyses();
    }, []);

    useEffect(() => {
        let results = analyses;

        if (searchTerm) {
            results = results.filter(a =>
                a.company_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCategory !== 'All') {
            results = results.filter(a => a.category === filterCategory);
        }

        setFilteredAnalyses(results);
    }, [searchTerm, filterCategory, analyses]);

    const fetchAnalyses = async () => {
        try {
            const response = await analysisAPI.listAnalyses(0, 50);
            const data = response.data.analyses || [];
            setAnalyses(data);
            setFilteredAnalyses(data);
        } catch (error) {
            console.error('Failed to fetch analyses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10';
            case 'B': return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10';
            case 'C': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10';
            case 'D': return 'bg-orange-50 text-orange-700 border-orange-100 ring-orange-500/10';
            case 'E': return 'bg-red-50 text-red-700 border-red-100 ring-red-500/10';
            default: return 'bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10';
        }
    };

    return (
        <DashboardLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[#2D5A9E] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                            <FileText size={14} />
                            {t('reports.title')}
                        </div>
                        <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight leading-none mb-2">{t('reports.mainTitle')}</h1>
                        <p className="text-gray-500 font-medium text-xs">{t('reports.subtitle')}</p>
                    </div>

                    <button className="bg-[#2D5A9E] text-white px-5 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-[#1E3E6F] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/20 group">
                        <Download className="w-3.5 h-3.5 group-hover:animate-bounce" />
                        {t('reports.export')}
                    </button>
                </div>

                {/* Filters & Search Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
                    <div className="lg:col-span-2 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D5A9E] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('reports.searchPlaceholder')}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-900/5 focus:border-[#2D5A9E] outline-none font-bold text-xs text-[#1A1A1A] transition-all placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D5A9E] transition-colors" size={16} />
                        <select
                            className="w-full pl-11 pr-8 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-900/5 focus:border-[#2D5A9E] outline-none font-black text-[10px] uppercase tracking-widest text-gray-500 appearance-none cursor-pointer transition-all"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">{t('reports.filter.allGrades')}</option>
                            {['A', 'B', 'C', 'D', 'E'].map(grade => (
                                <option key={grade} value={grade}>{t('reports.filter.grade', { grade })}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D5A9E] transition-colors" size={16} />
                        <button className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm text-left font-black text-[10px] uppercase tracking-widest text-gray-500 group-hover:bg-gray-50 transition-all">
                            {t('reports.filter.date')}
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">
                                        <div className="flex items-center gap-2">
                                            {t('reports.col.entity')}
                                            <ArrowUpDown size={10} />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">{t('reports.col.health')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">{t('reports.col.grade')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">{t('reports.col.period')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">{t('reports.col.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-[#2D5A9E]/20 border-t-[#2D5A9E] rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black text-[#2D5A9E] uppercase tracking-widest">{t('reports.loading')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAnalyses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Search size={24} className="text-gray-400" />
                                                </div>
                                                <p className="text-gray-400 font-bold text-sm">{t('reports.noResults.title')}</p>
                                                <button
                                                    onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
                                                    className="text-[#2D5A9E] text-[10px] font-black uppercase tracking-widest hover:underline"
                                                >
                                                    {t('reports.noResults.clear')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAnalyses.map((analysis) => (
                                        <tr
                                            key={analysis.id}
                                            onClick={() => navigate(`/analysis/${analysis.id}`)}
                                            className="hover:bg-gray-50/50 transition-all cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-gray-100 flex items-center justify-center font-black text-[#2D5A9E] text-sm group-hover:bg-white group-hover:shadow-md group-hover:scale-105 transition-all">
                                                        {analysis.company_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-[#1A1A1A] group-hover:text-[#2D5A9E] transition-colors">{analysis.company_name}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">ID: {analysis.id.toString().padStart(6, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 w-32">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[9px] font-black text-[#1A1A1A] uppercase">{t('reports.signalStrength')}</span>
                                                        <span className="text-[10px] font-black text-[#2D5A9E]">{analysis.credit_score.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#2D5A9E] to-blue-400 rounded-full transition-all duration-1000"
                                                            style={{ width: `${analysis.credit_score}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border tracking-wider transition-all ${getCategoryStyles(analysis.category)} shadow-sm`}>
                                                        GRADE {analysis.category}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Calendar size={12} className="text-gray-300" />
                                                    <span className="text-[11px] font-bold">{new Date(analysis.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                                    <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#2D5A9E] hover:border-[#2D5A9E] hover:shadow-md transition-all">
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                    <button className="p-2 bg-[#1A1A1A] rounded-lg text-white hover:bg-[#2D5A9E] shadow-md transition-all">
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (Mockup) */}
                <div className="mt-10 flex items-center justify-between px-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {t('reports.showing', { count: filteredAnalyses.length, total: analyses.length })}
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-400 cursor-not-allowed">{t('reports.pagination.prev')}</button>
                        <button className="px-5 py-2.5 bg-[#1A1A1A] rounded-xl text-xs font-black text-white shadow-lg">1</button>
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black text-[#1A1A1A] hover:bg-gray-50">2</button>
                        <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black text-[#1A1A1A] hover:bg-gray-50">{t('reports.pagination.next')}</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

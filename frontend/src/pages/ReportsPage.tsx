import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Download,
    Calendar,
    ArrowUpDown,
    FileText,
    FileDown,
    Eye
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
    const [activeDownloadId, setActiveDownloadId] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = () => setActiveDownloadId(null);
        window.addEventListener('click', handleClickOutside);
        fetchAnalyses();
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleDownload = async (id: number, type: 'pdf' | 'excel', companyName: string) => {
        try {
            const response = type === 'pdf'
                ? await analysisAPI.downloadPDF(id)
                : await analysisAPI.downloadExcel(id);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `credit_analysis_${companyName.replace(/\s+/g, '_')}_${id}.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Failed to download ${type}:`, error);
            alert(`Failed to download ${type.toUpperCase()}. Please try again.`);
        }
    };

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
                        <div className="flex items-center gap-2 text-[#11303B] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                            <FileText size={14} />
                            {t('reports.title')}
                        </div>
                        <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight leading-none mb-2">{t('reports.mainTitle')}</h1>
                        <p className="text-gray-500 font-medium text-xs">{t('reports.subtitle')}</p>
                    </div>

                    <button className="bg-[#6ECEB2] text-[#11303B] px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5bc1a6] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#6ECEB2]/20 group">
                        <Download className="w-3.5 h-3.5 group-hover:animate-bounce" />
                        {t('reports.export')}
                    </button>
                </div>

                {/* Filters & Search Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
                    <div className="lg:col-span-2 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#11303B] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('reports.searchPlaceholder')}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-900/5 focus:border-[#11303B] outline-none font-bold text-xs text-[#1A1A1A] transition-all placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#11303B] transition-colors" size={16} />
                        <select
                            className="w-full pl-11 pr-8 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-900/5 focus:border-[#11303B] outline-none font-black text-[10px] uppercase tracking-widest text-gray-500 appearance-none cursor-pointer transition-all"
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
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#253746] transition-colors" size={16} />
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
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]">
                                        <div className="flex items-center gap-2">
                                            Company Entity
                                            <ArrowUpDown size={10} />
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]">Health Index</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em] text-center">Grade Placement</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]">Application Status</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]">Payment Behavior</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]">Analysis Period</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-[#11303B]/20 border-t-[#11303B] rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black text-[#11303B] uppercase tracking-widest">{t('reports.loading')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAnalyses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Search size={24} className="text-gray-400" />
                                                </div>
                                                <p className="text-gray-400 font-bold text-sm">{t('reports.noResults.title')}</p>
                                                <button
                                                    onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
                                                    className="text-[#11303B] text-[10px] font-black uppercase tracking-widest hover:underline"
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
                                            className="hover:bg-gray-50/50 transition-all group border-b border-gray-50 last:border-0"
                                        >
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/analysis/${analysis.id}`)}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-gray-100 flex items-center justify-center font-black text-[#11303B] text-sm group-hover:bg-white group-hover:shadow-md group-hover:scale-105 transition-all">
                                                        {analysis.company_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-[#1A1A1A] group-hover:text-[#11303B] transition-colors">{analysis.company_name}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">ID: {analysis.id.toString().padStart(6, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/analysis/${analysis.id}`)}>
                                                <div className="flex flex-col gap-1 w-32">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[9px] font-black text-[#1A1A1A] uppercase">Health Index</span>
                                                        <span className="text-[10px] font-black text-[#11303B]">{analysis.credit_score.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#11303B] to-[#76d2b1] rounded-full transition-all duration-1000"
                                                            style={{ width: `${analysis.credit_score}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/analysis/${analysis.id}`)}>
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border tracking-wider transition-all ${getCategoryStyles(analysis.category)} shadow-sm`}>
                                                        GRADE {analysis.category}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Status Column */}
                                            <td className="px-6 py-4">
                                                <select
                                                    defaultValue={analysis.application_status}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        try {
                                                            await analysisAPI.updateAnalysisStatus(analysis.id, {
                                                                application_status: newStatus,
                                                                payment_behavior: newStatus !== 'APPROVED' ? 'NA' : analysis.payment_behavior
                                                            });
                                                            fetchAnalyses(); // Refresh data
                                                        } catch (error) {
                                                            console.error('Failed to update status:', error);
                                                        }
                                                    }}
                                                    className={`w-full px-3 py-1.5 rounded-lg text-[10px] font-black border tracking-wider cursor-pointer shadow-sm outline-none transition-all ${analysis.application_status === 'APPROVED' ? 'bg-[#5aac44] text-white border-[#5aac44]' :
                                                        analysis.application_status === 'REJECTED' ? 'bg-[#ef4444] text-white border-[#ef4444]' :
                                                            'bg-[#fbbf24] text-white border-[#fbbf24]'
                                                        }`}
                                                >
                                                    <option value="UNDER_REVIEW" className="bg-white text-gray-800">{t('status.UNDER_REVIEW')}</option>
                                                    <option value="APPROVED" className="bg-white text-gray-800">{t('status.APPROVED')}</option>
                                                    <option value="REJECTED" className="bg-white text-gray-800">{t('status.REJECTED')}</option>
                                                </select>
                                            </td>
                                            {/* Behavior Column */}
                                            <td className="px-6 py-4">
                                                <select
                                                    disabled={analysis.application_status !== 'APPROVED'}
                                                    value={analysis.payment_behavior}
                                                    onChange={async (e) => {
                                                        try {
                                                            await analysisAPI.updateAnalysisStatus(analysis.id, { payment_behavior: e.target.value });
                                                            fetchAnalyses();
                                                        } catch (error) {
                                                            console.error('Failed to update behavior:', error);
                                                        }
                                                    }}
                                                    className={`w-full px-3 py-1.5 rounded-lg text-[10px] font-black border tracking-wider shadow-sm outline-none transition-all appearance-none cursor-pointer ${analysis.application_status !== 'APPROVED'
                                                        ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                                                        : 'bg-white text-[#11303B] border-[#11303B]/20 hover:border-[#11303B] hover:shadow-md'
                                                        }`}
                                                >
                                                    <option value="NA">{t('behavior.NA')}</option>
                                                    <option value="ON_TIME">{t('behavior.ON_TIME')}</option>
                                                    <option value="DELINQUENT">{t('behavior.DELINQUENT')}</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[#11303B]">
                                                    <Calendar size={12} className="text-[#11303B]/60" />
                                                    <span className="text-[11px] font-black">{new Date(analysis.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {/* Consolidated Download Button */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDownloadId(activeDownloadId === analysis.id ? null : analysis.id);
                                                            }}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border shadow-sm hover:shadow-md group/dl ${activeDownloadId === analysis.id
                                                                ? 'bg-[#253746] text-white border-[#253746]'
                                                                : 'bg-[#11303B] text-white border-[#11303B] hover:bg-[#253746] hover:border-[#253746]'
                                                                }`}
                                                            title={t('common.download_report')}
                                                        >
                                                            <FileDown size={12} strokeWidth={3} className="text-white transition-colors" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{t('common.download_report')}</span>
                                                        </button>

                                                        {activeDownloadId === analysis.id && (
                                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownload(analysis.id, 'pdf', analysis.company_name);
                                                                        setActiveDownloadId(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-[10px] font-black text-[#11303B] hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ef6b6b]" />
                                                                    {t('common.pdf_version')}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownload(analysis.id, 'excel', analysis.company_name);
                                                                        setActiveDownloadId(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-[10px] font-black text-[#5aac44] hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#5aac44]" />
                                                                    {t('common.excel_version')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => navigate(`/analysis/${analysis.id}`)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-white bg-[#11303B] border border-[#11303B] hover:bg-[#253746] hover:border-[#253746] hover:shadow-md rounded-lg transition-all"
                                                    >
                                                        <Eye size={12} strokeWidth={3} className="text-white" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Report</span>
                                                    </button>

                                                    <button
                                                        onClick={() => navigate('/dashboard/upload')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-white bg-[#11303B] border border-[#11303B] hover:bg-[#253746] hover:border-[#253746] hover:shadow-md rounded-lg transition-all"
                                                        title="Update / Edit"
                                                    >
                                                        <FileText size={12} strokeWidth={3} className="text-white" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Edit</span>
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
        </DashboardLayout >
    );
};

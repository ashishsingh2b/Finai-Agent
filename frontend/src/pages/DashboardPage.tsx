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
    Search,
    Activity,
    Eye,
    FileDown,
    RefreshCcw,
    ArrowLeft
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useUIStore } from '../store/uiStore';

export const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { t, i18n } = useTranslation();
    const { addToast } = useUIStore();
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeDownloadId, setActiveDownloadId] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = () => setActiveDownloadId(null);
        window.addEventListener('click', handleClickOutside);
        fetchAnalyses();
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchAnalyses = async () => {
        try {
            setError(null);
            const response = await analysisAPI.listAnalyses();
            setAnalyses(response.data.analyses || []);
        } catch (error) {
            console.error('Failed to fetch analyses:', error);
            setError(t('dash.errLoad'));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string, currentBehavior: string) => {
        try {
            const payload = {
                application_status: status,
                payment_behavior: status !== 'APPROVED' ? 'NA' : currentBehavior
            };

            console.log('Sending status update payload:', payload);

            await analysisAPI.updateAnalysisStatus(id, payload);

            // Optimistic Update: Refresh the list
            fetchAnalyses();
            addToast(t('dash.statusUpdated', { status }), 'success');
        } catch (error) {
            console.error('Failed to update status:', error);
            addToast(t('dash.errStatus'), 'error');
        }
    };

    const handleBehaviorUpdate = async (id: number, behavior: string) => {
        try {
            const payload = { payment_behavior: behavior };
            console.log('Sending behavior update payload:', payload);

            await analysisAPI.updateAnalysisStatus(id, payload);
            fetchAnalyses();
            addToast(t('dash.behaviorRecorded'), 'success');
        } catch (error) {
            console.error('Failed to update behavior:', error);
            addToast(t('dash.errBehavior'), 'error');
        }
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'A': return 'bg-[#6ECEB2]/20 text-[#11303B] border-[#6ECEB2]/50 ring-[#6ECEB2]/30 font-bold';
            case 'B': return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20';
            case 'C': return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20';
            case 'D': return 'bg-orange-50 text-orange-700 border-orange-100 ring-orange-500/20';
            case 'E': return 'bg-red-50 text-red-700 border-red-100 ring-red-500/20';
            default: return 'bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/20';
        }
    };

    const handleDownload = async (id: number, type: 'pdf' | 'excel', companyName: string) => {
        try {
            const response = type === 'pdf'
                ? await analysisAPI.downloadPDF(id, i18n.language)
                : await analysisAPI.downloadExcel(id, i18n.language);

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
            alert(t('analysis.downloadFailed', { type: type.toUpperCase() }));
        }
    };

    // Calculate Dynamic Stats and Trends
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

    // 1. Total Analyses
    const recentAnalyses = analyses.filter(a => new Date(a.created_at) >= sevenDaysAgo);
    const prevAnalyses = analyses.filter(a => new Date(a.created_at) >= fourteenDaysAgo && new Date(a.created_at) < sevenDaysAgo);
    const totalTrend = prevAnalyses.length === 0 ? '+100%' : `${(((recentAnalyses.length - prevAnalyses.length) / prevAnalyses.length) * 100).toFixed(0)}%`;

    // 2. Avg Risk Score
    const recentAvg = recentAnalyses.length > 0 ? recentAnalyses.reduce((acc, curr) => acc + curr.credit_score, 0) / recentAnalyses.length : 0;
    const prevAvg = prevAnalyses.length > 0 ? prevAnalyses.reduce((acc, curr) => acc + curr.credit_score, 0) / prevAnalyses.length : 0;
    const scoreTrend = (recentAvg - prevAvg).toFixed(1);
    const scoreTrendUp = recentAvg >= prevAvg;

    // 3. High Risk Units
    const currentHighRisk = analyses.filter(a => ['D', 'E'].includes(a.category)).length;
    const recentHighRisk = recentAnalyses.filter(a => ['D', 'E'].includes(a.category)).length;
    const prevHighRiskCount = prevAnalyses.filter(a => ['D', 'E'].includes(a.category)).length;
    const highRiskTrend = (recentHighRisk - prevHighRiskCount);

    // 4. Total Active Portfolio (Sum of APPROVED credits)
    const totalActivePortfolio = analyses
        .filter(a => a.application_status === 'APPROVED')
        .reduce((sum, curr) => sum + (curr.credit_amount || 0), 0);

    const recentActivePortfolio = recentAnalyses
        .filter(a => a.application_status === 'APPROVED')
        .reduce((sum, curr) => sum + (curr.credit_amount || 0), 0);

    const prevActivePortfolio = prevAnalyses
        .filter(a => a.application_status === 'APPROVED')
        .reduce((sum, curr) => sum + (curr.credit_amount || 0), 0);

    const portfolioTrendPercentage = prevActivePortfolio === 0 ? '+100%' : `${(((recentActivePortfolio - prevActivePortfolio) / prevActivePortfolio) * 100).toFixed(0)}%`;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#11303B] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                        <Activity size={14} />
                        {t('dash.terminal')}
                    </div>
                    <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight leading-none mb-2">
                        {t('dash.greeting')}, <span className="text-[#11303B]">{user?.full_name?.split(' ')[0]}</span>.
                    </h1>
                    <p className="text-gray-500 font-medium text-xs">{t('dash.welcome')}</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard/upload')}
                        className="bg-[#6ECEB2] text-[#11303B] px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5bc1a6] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#6ECEB2]/20 group"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                        {t('dash.create')}
                    </button>
                </div>
            </div>

            {/* Metrics Grid (Compact) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6 animate-in fade-in slide-in-from-bottom duration-1000">
                {[
                    { label: t('dash.total'), val: analyses.length, trend: totalTrend, up: true, icon: FileText, color: 'blue', border: 'border-blue-400/50', bg: 'bg-blue-50', footer: t('dash.systemRecords') },
                    { label: t('dash.avgRisk'), val: (analyses.reduce((acc, curr) => acc + curr.credit_score, 0) / (analyses.length || 1)).toFixed(0), trend: scoreTrend, up: scoreTrendUp, icon: TrendingUp, color: 'emerald', border: 'border-emerald-400/50', bg: 'bg-emerald-50', footer: t('dash.networkAvg') },
                    { label: t('dash.highRisk'), val: currentHighRisk, trend: highRiskTrend > 0 ? `+${highRiskTrend}` : highRiskTrend, up: highRiskTrend <= 0, icon: ShieldAlert, color: 'red', border: 'border-red-400/50', bg: 'bg-red-50', footer: t('dash.criticalAlerts') },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 sm:border-4 ${stat.border} shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full`}>
                        {/* Background decoration */}
                        <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bg} rounded-full -mr-10 -mt-10`}></div>

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#11303B]/10 group-hover:text-[#11303B] transition-all`}>
                                        <stat.icon size={12} className="sm:w-3.5 sm:h-3.5" />
                                    </div>
                                    <div className={`flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[9px] font-black ${stat.up ? 'text-emerald-500' : 'text-red-500'} bg-white/80 px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm`}>
                                        {stat.up ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                                        {stat.trend}
                                    </div>
                                </div>

                                <div className="mb-1.5 sm:mb-2">
                                    <div className="text-lg sm:text-xl font-black text-[#1A1A1A] mb-0 rounded hover:bg-gray-50 tracking-tighter leading-none">{stat.val}</div>
                                    <div className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">{stat.label}</div>
                                </div>
                            </div>

                            <div>
                                {/* Decorative Sparkline */}
                                <div className="mb-1 sm:mb-1.5 opacity-60">
                                    <svg className={`w-full h-6 sm:h-8 ${stat.color === 'blue' ? 'text-blue-400' : stat.color === 'emerald' ? 'text-emerald-400' : 'text-red-400'} fill-current`} viewBox="0 0 300 80" preserveAspectRatio="none">
                                        <path
                                            d={i === 0 ? "M 0 50 Q 50 40 100 55 T 200 45 T 300 50 L 300 80 L 0 80 Z"
                                                : i === 1 ? "M 0 60 Q 75 30 150 50 T 300 40 L 300 80 L 0 80 Z"
                                                    : "M 0 40 Q 100 60 200 40 T 300 60 L 300 80 L 0 80 Z"}
                                            opacity="0.2"
                                        />
                                        <path
                                            d={i === 0 ? "M 0 50 Q 50 40 100 55 T 200 45 T 300 50"
                                                : i === 1 ? "M 0 60 Q 75 30 150 50 T 300 40"
                                                    : "M 0 40 Q 100 60 200 40 T 300 60"}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        />
                                    </svg>
                                </div>

                                <div className="text-[6px] sm:text-[7px] font-black text-gray-400 pt-1 sm:pt-1.5 border-t border-gray-100 uppercase tracking-widest truncate">
                                    {stat.footer}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Total Active Portfolio Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-2.5 sm:p-3 border-2 sm:border-4 border-[#6ECEB2] relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mr-10 -mt-10"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <ArrowLeft size={10} className="sm:w-3.5 sm:h-3.5 text-gray-400" />
                                    <span className="text-[8px] sm:text-[10px] font-semibold text-gray-600">MXN</span>
                                </div>
                                <div className="flex items-center gap-0.5 sm:gap-1 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                                    <TrendingUp size={8} className="sm:w-2.5 sm:h-2.5 text-[#6ECEB2]" />
                                    <span className="text-[8px] sm:text-[9px] font-bold text-[#6ECEB2]">{portfolioTrendPercentage}</span>
                                </div>
                            </div>

                            {/* Balance */}
                            <div className="mb-1 sm:mb-1.5">
                                <div className="text-lg sm:text-xl font-black text-[#11303B] mb-0 tracking-tight leading-none">
                                    {formatCurrency(totalActivePortfolio).replace('USD', '$')}
                                </div>
                                <div className="text-[7px] sm:text-[8px] text-gray-500 font-bold uppercase tracking-wider truncate">
                                    {t('dash.portfolioLabel')}
                                </div>
                            </div>
                        </div>

                        <div>
                            {/* Chart visualization */}
                            <div className="mb-1 sm:mb-1.5">
                                <svg className="w-full h-6 sm:h-8" viewBox="0 0 300 80" preserveAspectRatio="none">
                                    {/* Chart line */}
                                    <path
                                        d="M 0 50 Q 30 45 60 48 T 120 45 T 180 42 T 240 38 T 300 35"
                                        fill="none"
                                        stroke="#6ECEB2"
                                        strokeWidth="3"
                                    />
                                    {/* Filled area under line */}
                                    <path
                                        d="M 0 50 Q 30 45 60 48 T 120 45 T 180 42 T 240 38 T 300 35 L 300 80 L 0 80 Z"
                                        fill="url(#gradient-compact)"
                                        opacity="0.2"
                                    />
                                    <defs>
                                        <linearGradient id="gradient-compact" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#6ECEB2" stopOpacity="0.5" />
                                            <stop offset="100%" stopColor="#6ECEB2" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* Footer */}
                            <div className="text-[6px] sm:text-[8px] font-black text-gray-400 pt-1 sm:pt-1.5 border-t border-gray-100 uppercase tracking-widest truncate">
                                {t('dash.systemRecords')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Full Width - Table Only */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-[#1A1A1A] text-base font-black tracking-tight flex items-center gap-3">
                        {t('dash.recent')}
                        <span className="bg-[#11303B]/10 text-[#11303B] px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">{analyses.length} {t('dash.totalBadge')}</span>
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4" />
                            {error}
                        </div>
                        <button
                            onClick={fetchAnalyses}
                            className="bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg transition-colors"
                        >
                            {t('dash.retry')}
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                    {loading ? (
                        <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-[#11303B]/20 border-t-[#11303B] rounded-full animate-spin"></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dash.fetching')}</span>
                        </div>
                    ) : analyses.length === 0 ? (
                        <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                            <Search className="w-8 h-8 text-gray-200" />
                            <p className="text-gray-500 font-medium text-xs">{t('dash.noHistory')}</p>
                            <button
                                onClick={() => navigate('/dashboard/upload')}
                                className="text-[#11303B] font-black text-[9px] uppercase tracking-widest py-2 px-4 bg-[#11303B]/5 rounded-xl hover:bg-[#11303B]/10"
                            >
                                {t('dash.start')}
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-widest leading-none">{t('dash.cols.entity')}</th>
                                        <th className="hidden sm:table-cell px-4 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-widest leading-none">{t('dash.cols.period')}</th>
                                        <th className="hidden md:table-cell px-4 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-widest leading-none text-center">{t('dash.cols.health')}</th>
                                        <th className="px-4 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-widest leading-none">{t('dash.cols.status')}</th>
                                        <th className="hidden lg:table-cell px-4 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-widest leading-none">{t('dash.cols.behavior')}</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-widest leading-none text-right">{t('dash.cols.actions')}</th>
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
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-[#11303B] text-xs group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        {analysis.company_name.charAt(0)}
                                                    </div>
                                                    <div className="text-xs font-black text-[#1A1A1A] group-hover:text-[#11303B] transition-colors">{analysis.company_name}</div>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-4 py-4">
                                                <div className="text-[10px] font-black text-[#11303B] capitalize">{new Date(analysis.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                            </td>
                                            <td className="hidden md:table-cell px-4 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black border transition-all ${getCategoryStyles(analysis.category)}`}>
                                                    {analysis.credit_score}% ({analysis.category})
                                                </span>
                                            </td>
                                            {/* Status Column */}
                                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={analysis.application_status}
                                                    onChange={(e) => handleStatusUpdate(analysis.id, e.target.value, analysis.payment_behavior)}
                                                    className={`w-full px-3 py-1.5 rounded-lg text-[9px] font-black border tracking-wider cursor-pointer shadow-sm outline-none transition-all ${analysis.application_status === 'APPROVED' ? 'bg-[#5aac44] text-white border-[#5aac44]' :
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
                                            <td className="hidden lg:table-cell px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    disabled={analysis.application_status !== 'APPROVED'}
                                                    value={analysis.payment_behavior}
                                                    onChange={(e) => handleBehaviorUpdate(analysis.id, e.target.value)}
                                                    className={`w-full px-3 py-1.5 rounded-lg text-[9px] font-black border tracking-wider shadow-sm outline-none transition-all appearance-none cursor-pointer ${analysis.application_status !== 'APPROVED'
                                                        ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                                                        : 'bg-white text-[#11303B] border-[#11303B]/20 hover:border-[#11303B] hover:shadow-md'
                                                        }`}
                                                >
                                                    <option value="NA">{t('behavior.NA')}</option>
                                                    <option value="ON_TIME">{t('behavior.ON_TIME')}</option>
                                                    <option value="DELINQUENT">{t('behavior.DELINQUENT')}</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => navigate(`/analysis/${analysis.id}`)}
                                                        className="w-8 h-8 flex items-center justify-center bg-[#0d9488] text-white rounded-lg hover:bg-[#0f766e] transition-all shadow-sm group"
                                                        title={t('dash.viewReport')}
                                                    >
                                                        <Eye size={14} strokeWidth={2.5} />
                                                    </button>

                                                    {/* Consolidated Download Button */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDownloadId(activeDownloadId === analysis.id ? null : analysis.id);
                                                            }}
                                                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm ${activeDownloadId === analysis.id
                                                                ? 'bg-[#111827] text-white'
                                                                : 'bg-[#1e293b] text-white hover:bg-[#0f172a]'
                                                                }`}
                                                            title={t('common.download_report')}
                                                        >
                                                            <FileDown size={14} strokeWidth={2.5} />
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
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
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
                                                        onClick={() => navigate('/dashboard/upload')}
                                                        className="w-8 h-8 flex items-center justify-center bg-[#e5e7eb] text-[#374151] rounded-lg hover:bg-gray-300 transition-all shadow-sm"
                                                        title={t('dash.updateEdit')}
                                                    >
                                                        <RefreshCcw size={14} strokeWidth={2.5} />
                                                    </button>
                                                </div>
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

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FinancialIndicators } from '../components/dashboard/FinancialIndicators';
import { SWOTAnalysis } from '../components/dashboard/SWOTAnalysis';
import { Recommendation } from '../components/dashboard/Recommendation';
import { FinancialCharts } from '../components/dashboard/FinancialCharts';
import { analysisAPI } from '../services/api';
import { AnalysisData } from '../types';
import {
    FileText,
    ArrowLeft,
    User as UserIcon,
    AlertCircle,
    Mail,
    FilePieChart,
    RefreshCcw,
    FileSpreadsheet,
    FileSearch
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useTranslation } from 'react-i18next';

export const AnalysisPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [data, setData] = useState<AnalysisData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const { setLoading: setGlobalLoading, addToast } = useUIStore();

    useEffect(() => {
        const handleClickOutside = () => setIsDownloadOpen(false);
        window.addEventListener('click', handleClickOutside);

        if (!id) {
            setError('Missing analysis id.');
            return;
        }

        const parsedId = Number.parseInt(id, 10);
        if (Number.isNaN(parsedId)) {
            setError('Invalid analysis id.');
            return;
        }

        fetchAnalysis(parsedId);

        return () => window.removeEventListener('click', handleClickOutside);
    }, [id]);

    const fetchAnalysis = async (analysisId: number) => {
        try {
            setGlobalLoading(true);
            setError(null);
            const response = await analysisAPI.getAnalysis(analysisId);
            setData(response.data);
        } catch (err) {
            console.error(err);
            const message =
                (err as any)?.response?.data?.detail ||
                (err as any)?.response?.data?.message ||
                (err as Error)?.message ||
                'Failed to load analysis.';
            setError(message);
            addToast(message, 'error');
        } finally {
            setGlobalLoading(false);
        }
    };

    const swot = data?.swot_analysis || {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
    };

    const handleDownload = async (type: 'pdf' | 'excel') => {
        if (!id || !data) return;
        setGlobalLoading(true);
        try {
            const parsedId = Number.parseInt(id, 10);
            const response = type === 'pdf'
                ? await analysisAPI.downloadPDF(parsedId)
                : await analysisAPI.downloadExcel(parsedId);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `credit_analysis_${data.company_name.replace(/\s+/g, '_')}_${id}.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            addToast(`Report downloaded successfully`, 'success');
        } catch (error) {
            console.error(`Failed to download ${type}:`, error);
            addToast(`Failed to download ${type.toUpperCase()}. Please try again.`, 'error');
        } finally {
            setGlobalLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans text-gray-900 overflow-x-hidden">
            {/* Header */}
            <header className="bg-[#11303B] px-6 py-2 flex items-center justify-between text-white shadow-lg relative z-20">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/dashboard')} className="hover:opacity-80 transition-opacity flex items-center gap-2">
                        <ArrowLeft size={18} strokeWidth={3} />
                    </button>
                    <div className="flex items-center justify-center w-24 h-8">
                        <img src="/logo.avif" alt="Moskalti Capital" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                </div>

                <div className="flex-1 flex justify-center px-4">
                    <div className="text-[10px] font-black opacity-90 bg-white/10 px-4 py-1 rounded-full border border-white/10 max-w-md truncate">
                        FILE: <span className="text-white">{data?.company_name || 'LOADING...'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 mr-2">
                        {/* Consolidated Download Button */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDownloadOpen(!isDownloadOpen);
                                }}
                                className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${isDownloadOpen
                                    ? 'bg-white text-[#11303B] border-white'
                                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                                    }`}
                            >
                                <FilePieChart size={14} />
                                {t('common.download_report')}
                            </button>

                            {isDownloadOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => handleDownload('pdf')}
                                        className="w-full text-left px-4 py-2.5 text-[10px] font-black text-[#11303B] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-[#ef6b6b]" />
                                        {t('common.pdf_version')}
                                    </button>
                                    <button
                                        onClick={() => handleDownload('excel')}
                                        className="w-full text-left px-4 py-2.5 text-[10px] font-black text-[#5aac44] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-[#5aac44]" />
                                        {t('common.excel_version')}
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/dashboard/upload')}
                            className="bg-[#6ECEB2] hover:bg-[#5bc1a6] px-3 py-1.5 rounded-lg text-[#11303B] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-[#6ECEB2]/20"
                        >
                            <RefreshCcw size={14} />
                            Update Documents
                        </button>
                    </div>
                    <button className="relative p-1.5 hover:bg-white/10 rounded-lg transition-all">
                        <Mail size={18} className="opacity-90" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#11303B]"></span>
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-white text-[#11303B] flex items-center justify-center hover:scale-105 transition-all shadow-md">
                        <UserIcon size={16} strokeWidth={3} />
                    </button>
                </div>
            </header>

            <main className="p-4 max-w-[1800px] mx-auto animate-in fade-in duration-500">
                {error ? (
                    <div className="bg-red-50/50 border border-red-200 rounded-2xl p-8 max-w-2xl mx-auto text-center animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Analysis Error</h2>
                        <p className="text-sm font-bold text-red-600/80 mb-8">{error}</p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => id && fetchAnalysis(Number.parseInt(id))}
                                className="px-6 py-3 rounded-xl bg-[#11303B] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0a1e25] transition-all shadow-lg shadow-blue-900/20"
                            >
                                Retry Analysis
                            </button>
                        </div>
                    </div>
                ) : !data ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-[12px] font-black text-gray-700 uppercase tracking-widest">No analysis data</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-4 items-start">
                        {/* Sidebar */}
                        <div className="col-span-12 lg:col-span-2 space-y-4">
                            {/* General Information */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-[#11303B]">
                                <div className="bg-[#11303B] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner">General Information</div>
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-center group/row">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Industry:</div>
                                        <div className="text-[11px] font-black text-[#11303B]">{data.company_industry || 'N/A'}</div>
                                    </div>
                                    <div className="flex justify-between items-center group/row">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Years in Business:</div>
                                        <div className="text-[11px] font-black text-[#11303B]">{data.years_in_business ? `${data.years_in_business} years` : 'N/A'}</div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Top Clients:</div>
                                        <div className="text-[10px] font-black text-[#11303B] leading-tight">{data.top_clients || 'See Billing Report'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-left duration-500">
                                <div className="bg-[#11303B] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner flex items-center gap-2">
                                    <FileSearch size={14} className="opacity-80" />
                                    Credit Details
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Approved Amount:</span>
                                        <span className="text-[12px] font-black text-[#10b981]">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.approved_amount || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Term:</span>
                                        <span className="text-[11px] font-black text-[#11303B]">{data.loan_term_months || 12} months</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Interest Rate:</span>
                                        <span className="text-[11px] font-black text-[#11303B]">
                                            {data.applicable_interest_rate
                                                ? `TIIE + ${(data.applicable_interest_rate * 100).toFixed(1)}%`
                                                : 'TIIE + 5.5% (Indicative)'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Credit Type:</span>
                                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">{data.credit_type || 'Revolving'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-[#11303B] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner flex items-center justify-between">
                                    Documents
                                    <button
                                        onClick={() => navigate('/dashboard/upload')}
                                        className="text-[8px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="p-1 space-y-0.5">
                                    {[
                                        { icon: FileText, label: 'Tax Certificate' },
                                        { icon: FileSpreadsheet, label: 'Financial Statements' },
                                        { icon: FileSearch, label: 'Billing Report' },
                                        { icon: AlertCircle, label: 'Risk Report' },
                                        { icon: FileText, label: 'Company Profile' }
                                    ].map((doc, i) => (
                                        <div key={i} className="flex items-center gap-3 transition-colors hover:bg-gray-50 px-3 py-2 rounded-lg cursor-pointer group">
                                            <doc.icon size={14} className="text-[#11303B]/60 group-hover:text-[#11303B]" />
                                            <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#11303B]">{doc.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="col-span-12 lg:col-span-10 space-y-4">
                            {/* Status Bar */}
                            <div className="bg-white/50 border-b border-gray-200 py-1.5 flex items-center justify-start gap-6 px-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-700">Credit Risk:</span>
                                    <div className={`flex items-center rounded-full pl-1 pr-3 py-0.5 gap-2 border border-black/10 shadow-sm ${data.credit_category === 'A' ? 'bg-emerald-500' :
                                        data.credit_category === 'B' ? 'bg-blue-500' :
                                            data.credit_category === 'C' ? 'bg-amber-500' :
                                                'bg-red-500'
                                        }`}>
                                        <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                                            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)] ${data.credit_category === 'A' ? 'bg-emerald-400' :
                                                data.credit_category === 'B' ? 'bg-blue-400' :
                                                    data.credit_category === 'C' ? 'bg-amber-400' :
                                                        'bg-red-400'
                                                }`} />
                                        </div>
                                        <span className={`text-[10px] font-black leading-none ${['A', 'B', 'D', 'E'].includes(data.credit_category) ? 'text-white' : 'text-gray-900'}`}>
                                            CATEGORY {data.credit_category}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-4 w-px bg-gray-300"></div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Analyst Identity</span>
                                    <span className="text-[10px] font-black text-[#11303B]">{data.analyzed_by_name || 'System Neural Engine'}</span>
                                </div>
                                <div className="h-4 w-px bg-gray-300"></div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-700">Payment Behavior:</span>
                                    <span className="text-[11px] font-black text-gray-900 tracking-tight">{data.payment_behavior || 'NA'}</span>
                                </div>

                                <div className="flex-1"></div>

                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Live Neural Analysis</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-10 gap-6">
                                {/* Middle */}
                                <div className="col-span-10 lg:col-span-6 space-y-4">

                                    <FinancialIndicators ratios={{
                                        current_ratio: data.current_ratio ?? 0,
                                        debt_to_assets: data.debt_to_assets ?? 0,
                                        roe: data.roe ?? 0,
                                        roa: data.roa ?? 0,
                                        profit_margin: data.profit_margin ?? 0,
                                        ebitda_margin: data.ebitda_margin ?? 0,
                                        interest_coverage: data.interest_coverage,
                                        leverage_ratio: data.leverage_ratio,
                                        sales_trend: data.sales_trend
                                    }} />
                                    <SWOTAnalysis swot={swot} />
                                </div>

                                {/* Right */}
                                <div className="col-span-10 lg:col-span-4 space-y-4 flex flex-col">
                                    <FinancialCharts analysis={data} />
                                    <Recommendation
                                        recommendation={data.recommendation}
                                        category={data.credit_category}
                                        score={data.total_credit_score}
                                        justification={data.justification || []}
                                        conditions={data.conditions || []}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

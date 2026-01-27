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
    const { t, i18n } = useTranslation();

    const [data, setData] = useState<AnalysisData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const { setLoading: setGlobalLoading, addToast } = useUIStore();

    useEffect(() => {
        const handleClickOutside = () => setIsDownloadOpen(false);
        window.addEventListener('click', handleClickOutside);

        if (!id) {
            setError(t('analysis.missingId'));
            return;
        }

        const parsedId = Number.parseInt(id, 10);
        if (Number.isNaN(parsedId)) {
            setError(t('analysis.invalidId'));
            return;
        }

        fetchAnalysis(parsedId);

        return () => window.removeEventListener('click', handleClickOutside);
    }, [id, i18n.language]);

    const fetchAnalysis = async (analysisId: number) => {
        try {
            setGlobalLoading(true);
            setError(null);
            const response = await analysisAPI.getAnalysis(analysisId, i18n.language);
            setData(response.data);
        } catch (err) {
            console.error(err);
            const message =
                (err as any)?.response?.data?.detail ||
                (err as any)?.response?.data?.message ||
                (err as Error)?.message ||
                t('analysis.loadFailed');
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
                ? await analysisAPI.downloadPDF(parsedId, i18n.language)
                : await analysisAPI.downloadExcel(parsedId, i18n.language);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `credit_analysis_${data.company_name.replace(/\s+/g, '_')}_${id}.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            addToast(t('analysis.downloadSuccess'), 'success');
        } catch (error) {
            console.error(`Failed to download ${type}:`, error);
            addToast(t('analysis.downloadFailed', { type: type.toUpperCase() }), 'error');
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

                <div className="flex-1 flex justify-center px-4 overflow-hidden">
                    <div className="text-[10px] sm:text-[10px] font-black opacity-90 bg-white/10 px-4 py-1 rounded-full border border-white/10 max-w-xs sm:max-w-md truncate">
                        <span className="hidden xs:inline">{t('analysis.fileLabel')}</span> <span className="text-white">{data?.company_name || t('analysis.loading')}</span>
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
                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${isDownloadOpen
                                    ? 'bg-white text-[#11303B] border-white'
                                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                                    }`}
                            >
                                <FilePieChart size={14} />
                                <span className="hidden md:inline">{t('common.download_report')}</span>
                                <span className="md:hidden">{t('common.download')}</span>
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
                            <span className="hidden md:inline">{t('analysis.updateDocs')}</span>
                            <span className="md:hidden">{t('dash.update')}</span>
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
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{t('analysis.errorTitle')}</h2>
                        <p className="text-sm font-bold text-red-600/80 mb-8">{error}</p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                            >
                                {t('nav.dashboard')}
                            </button>
                            <button
                                onClick={() => id && fetchAnalysis(Number.parseInt(id))}
                                className="px-6 py-3 rounded-xl bg-[#11303B] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0a1e25] transition-all shadow-lg shadow-blue-900/20"
                            >
                                {t('dash.retry')}
                            </button>
                        </div>
                    </div>
                ) : !data ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-[12px] font-black text-gray-700 uppercase tracking-widest">{t('analysis.noData')}</div>
                    </div>
                ) : (
                    <>
                        {/* Risk Alerts */}
                        {data.validation_alerts && data.validation_alerts.length > 0 && (
                            <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                                {data.validation_alerts.filter((a: any) => a.level === 'WARNING').map((alert: any, idx: number) => (
                                    <div key={idx} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                                                <AlertCircle size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[#11303B] font-black text-xs uppercase tracking-wider mb-0.5">{alert.message}</p>
                                                <p className="text-amber-800/60 text-[10px] font-bold uppercase tracking-tight">{alert.details}</p>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block px-4 py-1.5 bg-amber-200/50 rounded-full text-[10px] font-black text-amber-700 uppercase tracking-widest leading-none border border-amber-200">
                                            Risk Indicator
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-12 gap-4 items-start">
                            {/* Sidebar */}
                            <div className="col-span-12 lg:col-span-2 space-y-4">
                                {/* General Information */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-[#11303B]">
                                    <div className="bg-[#11303B] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner">{t('analysis.generalInfo')}</div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-center group/row">
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{t('analysis.industry')}</div>
                                            <div className="text-[11px] font-black text-[#11303B]">{data.company_industry || 'N/A'}</div>
                                        </div>
                                        <div className="flex justify-between items-center group/row">
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{t('analysis.yearsInBusiness')}</div>
                                            <div className="text-[11px] font-black text-[#11303B]">{data.years_in_business ? t('analysis.yearsUnit', { count: data.years_in_business }) : 'N/A'}</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{t('analysis.topClients')}</div>
                                            <div className="text-[10px] font-black text-[#11303B] leading-tight">{data.top_clients || t('analysis.seeBilling')}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-left duration-500">
                                    <div className="bg-[#11303B] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner flex items-center gap-2">
                                        <FileSearch size={14} className="opacity-80" />
                                        {t('analysis.creditDetails')}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500">{t('analysis.approvedAmount')}</span>
                                            <span className="text-[12px] font-black text-[#10b981]">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.approved_amount || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500">{t('analysis.term')}</span>
                                            <span className="text-[11px] font-black text-[#11303B]">{t('analysis.monthsUnit', { count: data.loan_term_months || 12 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500">{t('analysis.interestRate')}</span>
                                            <span className="text-[11px] font-black text-[#11303B]">
                                                {data.applicable_interest_rate
                                                    ? `TIIE + ${(data.applicable_interest_rate * 100).toFixed(1)}%`
                                                    : `TIIE + 5.5% (${t('analysis.indicative')})`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500">{t('analysis.creditType')}</span>
                                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">{data.credit_type ? t(`analysis.types.${data.credit_type.toLowerCase()}`, { defaultValue: data.credit_type }) : t('analysis.creditTypeRevolving')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-[#11303B] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner flex items-center justify-between">
                                        {t('analysis.documents')}
                                        <button
                                            onClick={() => navigate('/dashboard/upload')}
                                            className="text-[8px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
                                        >
                                            {t('analysis.edit')}
                                        </button>
                                    </div>
                                    <div className="p-1 space-y-0.5">
                                        {[
                                            { icon: FileText, label: t('analysis.taxCertificate') },
                                            { icon: FileSpreadsheet, label: t('analysis.financialStatements') },
                                            { icon: FileSearch, label: t('analysis.billingReport') },
                                            { icon: AlertCircle, label: t('analysis.riskReport') },
                                            { icon: FileText, label: t('analysis.companyProfile') }
                                        ].map((doc, i) => (
                                            <div key={i} className="flex items-center gap-3 transition-colors hover:bg-gray-50 px-4 py-2 rounded-lg cursor-pointer group">
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
                                <div className="bg-white/50 border-b border-gray-200 py-2 sm:py-1.5 flex flex-wrap items-center justify-start gap-y-3 gap-x-6 px-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-gray-700">{t('analysis.riskLabel')}</span>
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
                                                {t('analysis.category', { category: data.credit_category })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">{t('analysis.analyst')}</span>
                                        <span className="text-[10px] font-black text-[#11303B]">{data.analyzed_by_name || t('analysis.systemEngine')}</span>
                                    </div>
                                    <div className="hidden sm:block h-4 w-px bg-gray-300"></div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-gray-700">{t('analysis.behaviorLabel')}</span>
                                        <span className="text-[11px] font-black text-gray-900 tracking-tight">{data.payment_behavior ? t(`behavior.${data.payment_behavior}`) : 'NA'}</span>
                                    </div>

                                    <div className="hidden xl:flex flex-1"></div>

                                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">{t('analysis.liveAnalysis')}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-10 gap-6">
                                    {/* Middle */}
                                    <div className="col-span-12 lg:col-span-6 space-y-4">
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
                                    <div className="col-span-12 lg:col-span-4 space-y-4 flex flex-col">
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
                    </>
                )}
            </main>
        </div>
    );
};

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
    FileSpreadsheet,
    FileSearch,
    AlertCircle,
    Mail,
    Download,
    FilePieChart
} from 'lucide-react';

export const AnalysisPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('Missing analysis id.');
            setLoading(false);
            return;
        }

        const parsedId = Number.parseInt(id, 10);
        if (Number.isNaN(parsedId)) {
            setError('Invalid analysis id.');
            setLoading(false);
            return;
        }

        fetchAnalysis(parsedId);
    }, [id]);

    const fetchAnalysis = async (analysisId: number) => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const swot = data?.swot_analysis || {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans text-gray-900 overflow-x-hidden">
            {/* Header */}
            <header className="bg-[#253746] px-6 py-3 flex items-center justify-between text-white shadow-lg relative z-20">
                <div className="flex items-center gap-8">
                    <button onClick={() => navigate('/dashboard')} className="hover:opacity-80 transition-opacity flex items-center gap-2">
                        <ArrowLeft size={20} strokeWidth={3} />
                    </button>
                    <h1 className="text-xl font-black tracking-tight uppercase">Business Credit Analysis</h1>
                </div>

                <div className="text-xs font-bold opacity-90 absolute left-1/2 -translate-x-1/2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                    File: <span className="text-white">{data?.company_name || 'Loading...'}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 mr-2">
                        <button
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/analysis/${id}/export/pdf`, '_blank')}
                            className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                        >
                            <FilePieChart size={14} />
                            PDF Report
                        </button>
                        <button
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/analysis/${id}/export/excel`, '_blank')}
                            className="bg-[#5aac44] hover:bg-[#4a8d38] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
                        >
                            <Download size={14} />
                            Excel Data
                        </button>
                    </div>
                    <button className="relative p-1.5 hover:bg-white/10 rounded-lg transition-all">
                        <Mail size={18} className="opacity-90" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#253746]"></span>
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-white text-[#253746] flex items-center justify-center hover:scale-105 transition-all shadow-md">
                        <UserIcon size={16} strokeWidth={3} />
                    </button>
                </div>
            </header>

            <main className="p-4 max-w-[1800px] mx-auto animate-in fade-in duration-500">
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-[12px] font-black text-gray-700 uppercase tracking-widest">Loading analysis...</div>
                        <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-[#253746] rounded-full animate-pulse" />
                        </div>
                    </div>
                ) : error ? (
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
                                className="px-6 py-3 rounded-xl bg-[#253746] text-white text-xs font-black uppercase tracking-widest hover:bg-[#1A2630] transition-all shadow-lg shadow-blue-900/20"
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
                        <div className="col-span-12 lg:col-span-2 space-y-[5px]">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-[#253746] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner">General Information</div>
                                <div className="p-3 space-y-1">
                                    <div className="flex justify-between items-center group/row py-1">
                                        <div className="text-[10px] font-black text-[#253746] whitespace-nowrap">Industry:</div>
                                        <div className="text-[10px] font-bold text-gray-700">{data.company_industry || 'N/A'}</div>
                                    </div>
                                    <div className="h-px bg-gray-100/60"></div>
                                    <div className="flex justify-between items-center group/row py-1">
                                        <div className="text-[10px] font-black text-[#253746] whitespace-nowrap">Years in Business:</div>
                                        <div className="text-[10px] font-bold text-gray-700">{data.years_in_business ? `${data.years_in_business} years` : 'N/A'}</div>
                                    </div>
                                    <div className="h-px bg-gray-100/60"></div>
                                    <div className="flex flex-col py-1">
                                        <div className="text-[10px] font-black text-[#253746] whitespace-nowrap">Top Clients:</div>
                                        <div className="text-[10px] font-bold text-gray-700 leading-tight">{data.top_clients || 'See Billing Report'}</div>
                                    </div>
                                    <div className="h-px bg-gray-100/60"></div>
                                    <div className="flex justify-between items-center group/row py-1">
                                        <div className="text-[10px] font-black text-[#253746] whitespace-nowrap">Fiscal Status:</div>
                                        <div className="text-[10px] font-bold text-gray-700">{data.fiscal_status || 'Compliant'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-[#253746] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner">Documents</div>
                                <div className="p-1.5 space-y-0">
                                    {[
                                        { icon: FileText, label: 'Tax Certificate' },
                                        { icon: FileSpreadsheet, label: 'Financial Statements' },
                                        { icon: FileSearch, label: 'Billing Report' },
                                        { icon: AlertCircle, label: 'Risk Report' },
                                        { icon: FileText, label: 'Company Profile' }
                                    ].map((doc, i) => (
                                        <React.Fragment key={i}>
                                            <div className="flex items-center gap-2.5 group cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                                                <doc.icon size={13} className="text-[#253746] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                                                <span className="text-[10px] font-black text-[#253746]/80 group-hover:text-[#253746] transition-colors">{doc.label}</span>
                                            </div>
                                            {i < 4 && <div className="h-px bg-gray-100/60 mx-2"></div>}
                                        </React.Fragment>
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
                                    <div className={`flex items-center rounded-full pl-1 pr-3 py-0.5 gap-2 border border-black/10 shadow-sm ${data.credit_category === 'EXCELLENT' ? 'bg-emerald-500' :
                                        data.credit_category === 'GOOD' ? 'bg-blue-500' :
                                            data.credit_category === 'MEDIUM' ? 'bg-[#FFD54F]' :
                                                'bg-red-500'
                                        }`}>
                                        <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                                            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)] ${data.credit_category === 'EXCELLENT' ? 'bg-emerald-400' :
                                                data.credit_category === 'GOOD' ? 'bg-blue-400' :
                                                    data.credit_category === 'MEDIUM' ? 'bg-[#FFD54F]' :
                                                        'bg-red-400'
                                                }`}></div>
                                        </div>
                                        <span className={`text-[10px] font-black leading-none ${['EXCELLENT', 'GOOD', 'POOR'].includes(data.credit_category) ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {data.credit_category}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-4 w-px bg-gray-300"></div>
                                <div className="w-40 h-6 bg-gray-100/50 rounded-md border border-gray-200/50"></div>
                                <div className="h-4 w-px bg-gray-300"></div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-700">Payment History:</span>
                                    <span className="text-[11px] font-black text-gray-900 tracking-tight">Acceptable</span>
                                </div>

                                <div className="flex-1"></div>

                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Analysis</span>
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
                                        interest_coverage: data.interest_coverage
                                    }} />
                                    <SWOTAnalysis swot={swot} />
                                </div>

                                {/* Right */}
                                <div className="col-span-10 lg:col-span-4 space-y-4 flex flex-col">
                                    <FinancialCharts />
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

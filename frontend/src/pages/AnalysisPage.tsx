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
    Mail
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
            <header className="bg-[#2D5A9E] px-6 py-3 flex items-center justify-between text-white shadow-lg relative z-20">
                <div className="flex items-center gap-8">
                    <button onClick={() => navigate('/dashboard')} className="hover:opacity-80 transition-opacity flex items-center gap-2">
                        <ArrowLeft size={20} strokeWidth={3} />
                    </button>
                    <h1 className="text-xl font-black tracking-tight uppercase">Business Credit Analysis</h1>
                </div>

                <div className="text-xs font-bold opacity-90 absolute left-1/2 -translate-x-1/2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                    File: <span className="text-white">{data?.company_name || 'Loading...'}</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-1.5 hover:bg-white/10 rounded-lg transition-all">
                        <Mail size={18} className="opacity-90" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#2D5A9E]"></span>
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-white text-[#2D5A9E] flex items-center justify-center hover:scale-105 transition-all shadow-md">
                        <UserIcon size={16} strokeWidth={3} />
                    </button>
                </div>
            </header>

            <main className="p-4 max-w-[1800px] mx-auto animate-in fade-in duration-500">
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-[12px] font-black text-gray-700 uppercase tracking-widest">Loading analysis...</div>
                        <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-[#2D5A9E] rounded-full animate-pulse" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-[12px] font-black text-red-600 uppercase tracking-widest">Unable to load analysis</div>
                        <div className="mt-2 text-[12px] font-bold text-gray-700">{error}</div>
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-4 py-2 rounded-lg bg-[#2D5A9E] text-white text-[11px] font-black uppercase tracking-wider hover:opacity-90"
                            >
                                Back to dashboard
                            </button>
                            {id && (
                                <button
                                    onClick={() => {
                                        const parsedId = Number.parseInt(id, 10);
                                        if (!Number.isNaN(parsedId)) fetchAnalysis(parsedId);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-[11px] font-black uppercase tracking-wider hover:bg-gray-50"
                                >
                                    Retry
                                </button>
                            )}
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
                                <div className="bg-[#2D5A9E] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner">General Information</div>
                                <div className="p-3 space-y-1">
                                    <div className="flex justify-between items-center group/row py-1">
                                        <div className="text-[10px] font-black text-[#2D5A9E] whitespace-nowrap">Industry:</div>
                                        <div className="text-[10px] font-bold text-gray-700">Technology</div>
                                    </div>
                                    <div className="h-px bg-gray-100/60"></div>
                                    <div className="flex justify-between items-center group/row py-1">
                                        <div className="text-[10px] font-black text-[#2D5A9E] whitespace-nowrap">Years in Business:</div>
                                        <div className="text-[10px] font-bold text-gray-700">8 years</div>
                                    </div>
                                    <div className="h-px bg-gray-100/60"></div>
                                    <div className="flex flex-col py-1">
                                        <div className="text-[10px] font-black text-[#2D5A9E] whitespace-nowrap">Top Clients:</div>
                                        <div className="text-[10px] font-bold text-gray-700 leading-tight">ABC Corp, InovaTech</div>
                                    </div>
                                    <div className="h-px bg-gray-100/60"></div>
                                    <div className="flex justify-between items-center group/row py-1">
                                        <div className="text-[10px] font-black text-[#2D5A9E] whitespace-nowrap">Fiscal Status:</div>
                                        <div className="text-[10px] font-bold text-gray-700">Compliant</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-[#2D5A9E] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner">Documents</div>
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
                                                <doc.icon size={13} className="text-[#2D5A9E] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                                                <span className="text-[10px] font-black text-[#2D5A9E]/80 group-hover:text-[#2D5A9E] transition-colors">{doc.label}</span>
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
                                    <div className="flex items-center bg-[#FFD54F] rounded-full pl-1 pr-3 py-0.5 gap-2 border border-black/10 shadow-sm">
                                        <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-900 leading-none">MEDIUM</span>
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

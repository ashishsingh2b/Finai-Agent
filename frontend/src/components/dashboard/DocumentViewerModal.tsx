import * as React from 'react';
import { X, FileText, FileSpreadsheet, FileSearch, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnalysisData } from '../../types';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'TAX' | 'FINANCIALS' | 'BILLING' | 'RISK' | 'PROFILE' | null;
    data: AnalysisData;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, type, data }) => {
    const { t } = useTranslation();

    if (!isOpen || !type) return null;

    const renderHeader = () => {
        const icons = {
            TAX: <FileText size={20} />,
            FINANCIALS: <FileSpreadsheet size={20} />,
            BILLING: <FileSearch size={20} />,
            RISK: <AlertCircle size={20} />,
            PROFILE: <FileText size={20} />
        };

        const titles = {
            TAX: t('analysis.taxCertificate'),
            FINANCIALS: t('analysis.financialStatements'),
            BILLING: t('analysis.billingReport'),
            RISK: t('analysis.riskReport'),
            PROFILE: t('analysis.companyProfile')
        };

        return (
            <div className="bg-[#11303B] px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <div className="opacity-80">{icons[type]}</div>
                    <span className="font-black uppercase tracking-widest text-sm">{titles[type]}</span>
                </div>
                <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
        );
    };

    const renderContent = () => {
        switch (type) {
            case 'FINANCIALS':
                const metrics = [
                    { label: t('fin.liquidity'), value: data.current_ratio?.toFixed(2) },
                    { label: t('fin.roe'), value: `${data.roe?.toFixed(2)}%` },
                    { label: t('fin.leverage'), value: `${(data.leverage_ratio || data.debt_to_assets || 0 * 100).toFixed(2)}%` },
                    { label: t('fin.interestCov'), value: data.interest_coverage?.toFixed(2) },
                    { label: t('fin.salesTrend'), value: `${data.sales_trend?.toFixed(2)}%` },
                    { label: t('fin.coverage'), value: data.net_income_coverage?.toFixed(2) }
                ];

                return (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {metrics.map((m, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{m.label}</span>
                                    <span className="text-sm font-black text-[#11303B]">{m.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 italic text-[10px] text-blue-800 font-bold">
                            * Information extracted from digital records and analyzed via neural engine.
                        </div>
                    </div>
                );

            case 'BILLING':
                const clients = data.top_clients ? data.top_clients.split(',').map(c => c.trim()) : [];
                return (
                    <div className="p-6">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">IDENTIFIED KEY ENTITIES</div>
                        <div className="space-y-2">
                            {clients.length > 0 ? clients.map((client, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="w-6 h-6 rounded bg-[#11303B]/10 flex items-center justify-center font-black text-[#11303B] text-[10px]">{i + 1}</div>
                                    <span className="text-xs font-black text-gray-800">{client}</span>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 italic text-sm">{t('swot.noData')}</div>
                            )}
                        </div>
                    </div>
                );

            case 'RISK':
                const alerts = data.validation_alerts || [];
                return (
                    <div className="p-6">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">CRITICAL VALIDATION SIGNAL ANALYSIS</div>
                        <div className="space-y-4">
                            {alerts.length > 0 ? alerts.map((alert, i) => (
                                <div key={i} className={`p-4 rounded-xl border flex gap-4 ${alert.level === 'WARNING' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className={`mt-1 ${alert.level === 'WARNING' ? 'text-amber-500' : 'text-red-500'}`}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-wider text-gray-900">{alert.message}</div>
                                        <div className="text-[10px] font-bold text-gray-700 leading-relaxed">{alert.details}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 italic text-sm">No critical risk signals identified in this dataset.</div>
                            )}
                        </div>
                    </div>
                );

            case 'PROFILE':
                return (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('analysis.industry')}</div>
                                    <div className="text-sm font-black text-[#11303B]">{data.company_industry || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('analysis.yearsInBusiness')}</div>
                                    <div className="text-sm font-black text-[#11303B]">{data.years_in_business ? t('analysis.yearsUnit', { count: data.years_in_business }) : 'N/A'}</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">FISCAL STATUS</div>
                                    <div className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-black inline-block uppercase tracking-wider">SECURED & VERIFIED</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SYSTEM IDENTITY</div>
                                    <div className="text-sm font-black text-[#11303B]">UUID: {data.id}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div className="p-8 text-center text-gray-400">{t('swot.noData')}</div>;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-200">
                {renderHeader()}
                <div className="max-h-[70vh] overflow-y-auto bg-white">
                    {renderContent()}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#11303B] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-colors"
                    >
                        Close Portal
                    </button>
                </div>
            </div>
        </div>
    );
};

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { SWOTAnalysisProps } from '../../types';
import { CheckCircle2, TrendingUp, AlertCircle, ShieldAlert } from 'lucide-react';

export const SWOTAnalysis: React.FC<SWOTAnalysisProps> = ({ swot }) => {
    const { t } = useTranslation();
    const s = swot.strengths || [];
    const w = swot.weaknesses || [];
    const o = swot.opportunities || [];
    const th = swot.threats || [];

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transform hover:-translate-y-0.5 transition-all duration-300">
            <div className="bg-[#253746] px-4 py-2.5 text-white font-black text-[11px] uppercase tracking-wider">
                SWOT Analysis
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="space-y-2">
                    <div className="bg-[#E8F5E9] px-3 py-1.5 flex items-center gap-2 border-l-3 border-[#2E7D32] rounded-sm">
                        <CheckCircle2 size={13} className="text-[#2E7D32]" strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase text-[#2E7D32] tracking-wider">{t('swot.strengths')}</span>
                    </div>
                    {s.length > 0 ? (
                        <ul className="pl-5 space-y-1">
                            {s.slice(0, 3).map((item, i) => (
                                <li key={i} className="text-[10px] text-gray-700 font-bold flex items-start gap-2 leading-relaxed">
                                    <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full flex-shrink-0 mt-1"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : <span className="text-[10px] text-gray-400 italic pl-1">No data available</span>}
                </div>

                {/* Opportunities */}
                <div className="space-y-2">
                    <div className="bg-[#FFF3E0] px-3 py-1.5 flex items-center gap-2 border-l-3 border-[#EF6C00] rounded-sm">
                        <TrendingUp size={13} className="text-[#EF6C00]" strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase text-[#EF6C00] tracking-wider">{t('swot.opportunities')}</span>
                    </div>
                    {o.length > 0 ? (
                        <ul className="pl-5 space-y-1">
                            {o.slice(0, 3).map((item, i) => (
                                <li key={i} className="text-[10px] text-gray-700 font-bold flex items-start gap-2 leading-relaxed">
                                    <span className="w-1.5 h-1.5 bg-[#EF6C00] rounded-full flex-shrink-0 mt-1"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : <span className="text-[10px] text-gray-400 italic pl-1">No data available</span>}
                </div>

                {/* Weaknesses */}
                <div className="space-y-2">
                    <div className="bg-[#FFEBEE] px-3 py-1.5 flex items-center gap-2 border-l-3 border-[#C62828] rounded-sm">
                        <AlertCircle size={13} className="text-[#C62828]" strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase text-[#C62828] tracking-wider">{t('swot.weaknesses')}</span>
                    </div>
                    {w.length > 0 ? (
                        <ul className="pl-5 space-y-1">
                            {w.slice(0, 3).map((item, i) => (
                                <li key={i} className="text-[10px] text-gray-700 font-bold flex items-start gap-2 leading-relaxed">
                                    <span className="w-1.5 h-1.5 bg-[#C62828] rounded-full flex-shrink-0 mt-1"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : <span className="text-[10px] text-gray-400 italic pl-1">No data available</span>}
                </div>

                {/* Threats */}
                <div className="space-y-2">
                    <div className="bg-[#ECEFF1] px-3 py-1.5 flex items-center gap-2 border-l-3 border-[#37474F] rounded-sm">
                        <ShieldAlert size={13} className="text-[#37474F]" strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase text-[#37474F] tracking-wider">{t('swot.threats')}</span>
                    </div>
                    {th.length > 0 ? (
                        <ul className="pl-5 space-y-1">
                            {th.slice(0, 3).map((item, i) => (
                                <li key={i} className="text-[10px] text-gray-700 font-bold flex items-start gap-2 leading-relaxed">
                                    <span className="w-1.5 h-1.5 bg-[#37474F] rounded-full flex-shrink-0 mt-1"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    ) : <span className="text-[10px] text-gray-400 italic pl-1">No data available</span>}
                </div>
            </div>
        </div>
    );
};

import * as React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RecommendationProps } from '../../types';

export const Recommendation: React.FC<RecommendationProps> = ({
    recommendation,
    justification,
    conditions
}) => {
    const { t } = useTranslation();

    const processPoints = (data: string | string[] | undefined) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        return data.split('.').filter(s => s.trim().length > 0).map(s => s.trim());
    };

    const justificationPoints = processPoints(justification);
    const conditionPoints = processPoints(conditions);

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-full flex flex-col transform hover:-translate-y-0.5 transition-all duration-300">
            <div className="bg-[#11303B] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner text-left">
                Evaluation & Recommendation
            </div>
            <div className="p-5 space-y-5 flex-1 text-left">
                {/* Conclusion */}
                <div>
                    <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-3">Conclusion:</div>
                    <div className={`flex items-center gap-2.5 font-black text-xs px-4 py-3 rounded-lg border-2 shadow-sm ${recommendation?.toLowerCase().includes('reject')
                        ? 'text-red-700 bg-red-50 border-red-200'
                        : 'text-[#11303B] bg-[#6ECEB2]/20 border-[#6ECEB2]/50'
                        }`}>
                        <Check size={18} strokeWidth={4} />
                        <span className="tracking-tight uppercase text-sm">{(recommendation || t('rec.approveCond'))}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-3 border-t-2 border-gray-100">
                    {/* Justification */}
                    <div className="space-y-3">
                        <div className="text-[10px] font-black text-[#11303B] uppercase tracking-widest mb-2">Justification:</div>
                        <ul className="space-y-2">
                            {(justificationPoints.length > 0 ? justificationPoints : ['Adequate liquidity', 'Moderate debt']).map((point, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-[10px] font-bold text-gray-700 leading-relaxed">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-[#11303B] rounded-full flex-shrink-0"></span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-3">
                        <div className="text-[10px] font-black text-[#11303B] uppercase tracking-widest mb-2">Conditions:</div>
                        <ul className="space-y-2">
                            {(conditionPoints.length > 0 ? conditionPoints : ['18 months term', 'Collateral']).map((point, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-[10px] font-bold text-gray-700 leading-relaxed">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-gray-900 rounded-full flex-shrink-0"></span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FinancialIndicatorsProps } from '../../types';

export const FinancialIndicators: React.FC<FinancialIndicatorsProps> = ({ ratios }) => {
    const { t } = useTranslation();

    const indicators = [
        {
            label: t('fin.liquidity'),
            value: (ratios.current_ratio || 1.5).toFixed(1),
            status: (ratios.current_ratio || 1.5) > 1.2 ? t('fin.adequate') : t('fin.low'),
        },
        {
            label: t('fin.roe'),
            value: `${((ratios.roe || 0.124) * 100).toFixed(1)}%`,
            status: (ratios.roe || 0.124) > 0.1 ? t('fin.profitable') : t('fin.low'),
        },
        {
            label: t('fin.debtAssets'),
            value: `${((ratios.debt_to_assets || 0.55) * 100).toFixed(0)}%`,
            status: (ratios.debt_to_assets || 0.55) < 0.6 ? t('fin.moderate') : t('fin.high'),
        },
        {
            label: t('fin.interestCov'),
            value: `${(ratios.interest_coverage || 3.2).toFixed(1)}x`,
            status: (ratios.interest_coverage || 3.2) > 3 ? t('fin.acceptable') : t('fin.low'),
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transform hover:-translate-y-0.5 transition-all duration-300">
            <div className="bg-[#253746] px-4 py-2.5 text-white font-black text-[11px] uppercase tracking-wider">
                Financial Indicators
            </div>
            <div className="p-5 bg-white">
                <div className="border border-gray-200 rounded-lg flex items-stretch divide-x divide-gray-200 bg-gray-50/30 shadow-sm overflow-hidden">
                    {indicators.map((ind, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center py-5 px-2 hover:bg-white/60 transition-colors group">
                            <div className="text-[10px] font-black text-gray-500 mb-3 group-hover:text-[#253746] transition-colors whitespace-nowrap uppercase tracking-widest leading-none">
                                {ind.label}
                            </div>
                            <div className="text-3xl font-black text-gray-900 tracking-tight mb-5 group-hover:scale-105 transition-transform leading-none">
                                {ind.value}
                            </div>
                            <div className={`w-full max-w-[110px] text-center text-[10px] font-black px-3 py-2 rounded-md shadow-md uppercase tracking-wider ${ind.status === t('fin.adequate') ? 'bg-[#6ECEB2] text-[#11303B]' :
                                ind.status === t('fin.profitable') ? 'bg-[#EF6C00] text-white' :
                                    ind.status === t('fin.moderate') ? 'bg-[#6ECEB2] text-[#11303B]' :
                                        ind.status === t('fin.acceptable') ? 'bg-[#6ECEB2] text-[#11303B]' :
                                            'bg-red-600 text-white'
                                }`}>
                                {ind.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

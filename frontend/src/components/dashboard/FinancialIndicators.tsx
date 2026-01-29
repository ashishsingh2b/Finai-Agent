import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FinancialIndicatorsProps } from '../../types';

/**
 * FinancialIndicators Component.
 * High-level display of key institutional ratios (Liquidity, ROE, Leverage, etc.)
 * with automated status categorization.
 */
export const FinancialIndicators: React.FC<FinancialIndicatorsProps> = ({ ratios }) => {

    const { t } = useTranslation();

    const indicators = [
        {
            label: t('fin.liquidity'),
            value: (ratios.current_ratio || 0).toFixed(1),
            status: (ratios.current_ratio || 0) > 1.2 ? t('fin.adequate') : t('fin.low'),
        },
        {
            label: t('fin.roe'),
            value: `${(ratios.roe || 0).toFixed(1)}%`,
            status: (ratios.roe || 0) > 10 ? t('fin.profitable') : t('fin.low'),
        },
        {
            label: t('fin.leverage'),
            value: `${((ratios.leverage_ratio ?? ratios.debt_to_assets ?? 0) * 100).toFixed(0)}%`,
            status: (ratios.leverage_ratio ?? ratios.debt_to_assets ?? 0) < 0.6 ? t('fin.moderate') : t('fin.high'),
        },
        {
            label: t('fin.salesTrend'),
            value: `${(ratios.sales_trend || 0).toFixed(1)}%`,
            status: (ratios.sales_trend || 0) > 0 ? t('fin.growth') : t('fin.decline'),
        },
        {
            label: t('fin.coverage'),
            value: (ratios.net_income_coverage || ratios.profit_to_loan_ratio || 0).toFixed(2),
            status: (ratios.net_income_coverage || ratios.profit_to_loan_ratio || 0) > 2 ? t('fin.adequate') : t('fin.low'),
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transform hover:-translate-y-0.5 transition-all duration-300">
            <div className="bg-[#11303B] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner">
                {t('fin.title')}
            </div>
            <div className="p-5 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-200 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {indicators.map((ind, i) => (
                        <div key={i} className="flex flex-col items-center py-5 px-2 bg-gray-50/30 hover:bg-white transition-colors group">
                            <div className="h-8 flex items-center justify-center text-[10px] font-black text-gray-500 mb-3 group-hover:text-[#11303B] transition-colors uppercase tracking-widest leading-none text-center px-1">
                                {ind.label}
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-5 group-hover:scale-105 transition-transform leading-none text-center">
                                {ind.value}
                            </div>
                            <div className={`min-w-[90px] text-center text-[10px] font-black px-3 py-2 rounded-md shadow-md uppercase tracking-wider ${ind.status === t('fin.adequate') ? 'bg-[#6ECEB2] text-[#11303B]' :
                                ind.status === t('fin.profitable') ? 'bg-[#EF6C00] text-white' :
                                    ind.status === t('fin.moderate') ? 'bg-[#6ECEB2] text-[#11303B]' :
                                        ind.status === t('fin.growth') ? 'bg-[#EF6C00] text-white' :
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

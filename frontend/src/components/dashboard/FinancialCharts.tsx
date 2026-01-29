import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip
} from 'recharts';

interface ChartProps {
    analysis?: any;
}

/**
 * FinancialCharts Component.
 * Orchestrates dynamic Recharts visualizations including Composed Trend
 * and Debt-to-Equity distribution metrics.
 */
export const FinancialCharts: React.FC<ChartProps> = ({ analysis }) => {

    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const { t } = useTranslation();

    /**
     * Behavioral Data Derivation.
     * Computes Debt/Equity distribution from raw analytical ratios
     * for specialized pie chart visualization.
     */
    const hasDebtData = analysis?.debt_to_assets !== undefined && analysis?.debt_to_assets !== null;
    const debtValue = hasDebtData ? Math.round(analysis.debt_to_assets * 100) : 0;
    const equityValue = hasDebtData ? 100 - debtValue : 0;

    const pieData = hasDebtData ? [
        { name: t('charts.debt'), value: debtValue },
        { name: t('charts.equity'), value: equityValue },
    ] : [];


    // Real indicators for the chart - No more fake fallbacks
    const trendData = [
        { name: 'Score', value: analysis?.total_credit_score ? (analysis.total_credit_score / 10) : 0 },
        { name: 'ROE', value: analysis?.roe || 0 },
        { name: 'Liq', value: analysis?.current_ratio ? (analysis.current_ratio * 5) : 0 },
        { name: 'Cov', value: (analysis?.net_income_coverage || analysis?.profit_to_loan_ratio || 0) * 2 },
        { name: 'Prof', value: analysis?.profit_margin || 0 },
    ];

    const ChartContent = ({ full = false }) => (
        <div className={`bg-white border border-gray-200 rounded-md p-5 grid ${full ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-8 md:gap-6 items-start ${full ? 'h-full' : 'min-h-[225px]'}`}>
            {/* Revenue & Profit Trend */}
            <div className="flex flex-col h-full">
                <h3 className="text-[10px] font-black text-[#1A1A1A] mb-5 uppercase tracking-tight text-center">{t('charts.visualization')}</h3>
                <div className="flex-1 min-h-[145px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={trendData} margin={{ top: 8, right: 10, left: -22, bottom: 15 }}>
                            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                fontSize={8}
                                tickLine={false}
                                axisLine={{ stroke: '#999999' }}
                                tick={{ fill: '#333333', fontWeight: 600 }}
                            />
                            <YAxis
                                fontSize={8}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#333333', fontWeight: 600 }}
                                domain={['auto', 'auto']}
                                tickFormatter={(val) => `${val}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f3f4f6' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#11303B"
                                barSize={24}
                                radius={[4, 4, 0, 0]}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Debt / Equity Pie Chart */}
            <div className="flex flex-col items-center h-full">
                <h3 className={`font-black text-[#1A1A1A] ${full ? 'text-sm mb-6' : 'text-[10px] mb-5'} uppercase tracking-tight text-center`}>{t('charts.debtEquityRatio')}</h3>
                <div className="flex-1 w-full relative min-h-[145px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                startAngle={90}
                                endAngle={-270}
                                innerRadius={0}
                                outerRadius={full ? 120 : 60}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="white"
                                strokeWidth={2}
                                labelLine={false}
                                label={(props: any) => {
                                    const { cx, cy, midAngle, outerRadius, percent, name } = props;
                                    const radius = outerRadius * 0.7;
                                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

                                    if (percent < 0.05) return null;

                                    return (
                                        <g>
                                            <text
                                                x={x}
                                                y={y - (full ? 8 : 4)}
                                                fill="white"
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fontSize={full ? 14 : 9}
                                                fontWeight="bold"
                                            >
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                            <text
                                                x={x}
                                                y={y + (full ? 10 : 5)}
                                                fill="white"
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fontSize={full ? 9 : 6}
                                                fontWeight="600"
                                                style={{ textTransform: 'uppercase', opacity: 0.9 }}
                                            >
                                                {name}
                                            </text>
                                        </g>
                                    );
                                }}
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef6b6b' : '#11303B'} style={{ outline: 'none' }} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {!hasDebtData && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('swot.noData')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
            <style dangerouslySetInnerHTML={{
                __html: `
                .recharts-sector:focus, .recharts-surface:focus, .recharts-pie-sector:focus, .recharts-wrapper:focus {
                    outline: none !important;
                }
                path.recharts-sector {
                    outline: none !important;
                }
            `}} />

            <div className="bg-[#11303B] px-4 py-2 text-white font-black text-[10px] uppercase tracking-wider shadow-inner flex justify-between items-center">
                <span>{t('charts.title')}</span>
            </div>

            <div
                className="p-4 bg-gray-50/30 cursor-pointer"
                onClick={() => setIsFullScreen(true)}
            >
                <ChartContent />
            </div>

            {/* Full Screen Modal */}
            {isFullScreen && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-300">
                        <div className="bg-[#11303B] text-white px-6 py-4 font-bold text-lg flex justify-between items-center shadow-md">
                            <span>{t('charts.fullTitle')}</span>
                            <button
                                onClick={() => setIsFullScreen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 flex-1 overflow-auto bg-gray-50">
                            <ChartContent full={true} />
                        </div>
                    </div>
                    <div
                        className="absolute inset-0 -z-10"
                        onClick={() => setIsFullScreen(false)}
                    />
                </div>
            )}
        </div>
    );
};

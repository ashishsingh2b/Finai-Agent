import * as React from 'react';
import { X } from 'lucide-react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip
} from 'recharts';

interface ChartProps {
    analysis?: any;
}

export const FinancialCharts: React.FC<ChartProps> = ({ analysis }) => {
    const [isFullScreen, setIsFullScreen] = React.useState(false);

    // Dynamic data derivation
    const debtValue = analysis?.debt_to_assets ? Math.round(analysis.debt_to_assets * 100) : 55;
    const equityValue = 100 - debtValue;

    const pieData = [
        { name: 'Debt', value: debtValue },
        { name: 'Equity', value: equityValue },
    ];

    // Simplistic trend data derived from scores/ratios
    const trendData = [
        { name: 'Score', revenue: 12, profit1: (analysis?.total_credit_score ? (analysis.total_credit_score / 4) : 15) },
        { name: 'ROE', revenue: 18, profit1: (analysis?.roe ? (analysis.roe / 2) : 18) },
        { name: 'Liq', revenue: 16, profit1: (analysis?.current_ratio ? (analysis.current_ratio * 10) : 15) },
        { name: 'Sol', revenue: 22, profit1: (analysis?.solvency_score ? (analysis.solvency_score / 4) : 21) },
        { name: 'Prof', revenue: 26, profit1: (analysis?.profitability_score ? (analysis.profitability_score / 4) : 25) },
    ];

    const ChartContent = ({ full = false }) => (
        <div className={`bg-white border border-gray-200 rounded-md p-5 grid ${full ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-2'} gap-6 items-start ${full ? 'h-full' : 'min-h-[225px]'}`}>
            {/* Revenue & Profit Trend */}
            <div className="flex flex-col h-full">
                <h3 className="text-[10px] font-black text-[#1A1A1A] mb-5 uppercase tracking-tight text-center">Indicators Visualization</h3>
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
                                domain={[0, 30]}
                                ticks={[0, 10, 20, 30]}
                                tickFormatter={(val) => `${val}`}
                            />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#11303B" barSize={20} />
                            <Line
                                type="monotone"
                                dataKey="profit1"
                                stroke="#6ECEB2"
                                strokeWidth={2}
                                dot={{ r: full ? 4 : 2, fill: '#ED7D31', stroke: '#ED7D31' }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Debt / Equity Pie Chart */}
            <div className="flex flex-col items-center h-full">
                <h3 className={`font-black text-[#1A1A1A] ${full ? 'text-sm mb-6' : 'text-[10px] mb-5'} uppercase tracking-tight text-center`}>Debt / Equity Ratio</h3>
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
                                label={full ? (props: any) => {
                                    const { cx, cy, midAngle, outerRadius, percent, index } = props;
                                    const radius = outerRadius * 0.6; // Position at 60% of radius (inside the slice)
                                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                    return (
                                        <text
                                            x={x}
                                            y={y}
                                            fill="white"
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            fontSize={16}
                                            fontWeight="bold"
                                        >
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                } : false}
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef6b6b' : '#11303B'} style={{ outline: 'none' }} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {!full && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="relative w-full h-full">
                                <div className="absolute top-[42%] right-[28%] flex flex-col items-center">
                                    <span className="text-white text-[10px] font-black leading-tight">{debtValue}%</span>
                                    <span className="text-white text-[7px] font-bold leading-tight uppercase">Debt</span>
                                </div>
                                <div className="absolute top-[42%] left-[28%] flex flex-col items-center">
                                    <span className="text-white text-[10px] font-black leading-tight">{equityValue}%</span>
                                    <span className="text-white text-[7px] font-bold leading-tight uppercase">Equity</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full border border-gray-200 flex flex-col">
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
                <span>Financial Charts</span>
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
                            <span>Analysis Report - Financial Charts</span>
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

import * as React from 'react';
import { X } from 'lucide-react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip
} from 'recharts';

interface ChartProps {
    data?: any;
}

const sampleTrendData = [
    { name: '10%', revenue: 12, profit1: 14, profit2: 5 },
    { name: '1h 30', revenue: 18, profit1: 18, profit2: 7 },
    { name: '39%', revenue: 16, profit1: 15, profit2: 5 },
    { name: '2700', revenue: 22, profit1: 21, profit2: 12 },
    { name: '2000', revenue: 26, profit1: 25, profit2: 8 },
];

const samplePieData = [
    { name: 'Debt', value: 55 },
    { name: 'Equity', value: 45 },
];

export const FinancialCharts: React.FC<ChartProps> = () => {
    const [isFullScreen, setIsFullScreen] = React.useState(false);

    const ChartContent = ({ full = false }) => (
        <div className={`bg-white border border-gray-200 rounded-md p-5 grid ${full ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-2'} gap-6 items-start ${full ? 'h-full' : 'min-h-[225px]'}`}>
            {/* Revenue & Profit Trend */}
            <div className="flex flex-col h-full">
                <h3 className="text-[10px] font-black text-[#1A1A1A] mb-5 uppercase tracking-tight text-center">Revenue & Profit Trend</h3>
                <div className="flex-1 min-h-[145px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={sampleTrendData} margin={{ top: 8, right: 10, left: -22, bottom: 15 }}>
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
                                tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#253746" barSize={20} />
                            <Line
                                type="monotone"
                                dataKey="profit1"
                                stroke="#ED7D31"
                                strokeWidth={2}
                                dot={{ r: full ? 4 : 2, fill: '#ED7D31', stroke: '#ED7D31' }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Debt / Equity Pie Chart */}
            <div className="flex flex-col items-center h-full">
                <h3 className="text-[10px] font-black text-[#1A1A1A] mb-5 uppercase tracking-tight text-center">Debt / Equity Ratio</h3>
                <div className="flex-1 w-full relative min-h-[145px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={samplePieData}
                                cx="50%"
                                cy="40%"
                                startAngle={90}
                                endAngle={-270}
                                innerRadius={0}
                                outerRadius={full ? 100 : 60}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="white"
                                strokeWidth={2}
                            >
                                {samplePieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#C00000' : '#253746'} style={{ outline: 'none' }} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-full h-full">
                            <div className="absolute top-[36%] left-[33%] flex flex-col items-center">
                                <span className="text-white text-[10px] font-black leading-tight">55%</span>
                                <span className="text-white text-[7px] font-bold leading-tight uppercase">Debt</span>
                            </div>
                            <div className="absolute bottom-[36%] right-[33%] flex flex-col items-center">
                                <span className="text-white text-[10px] font-black leading-tight">45%</span>
                                <span className="text-white text-[7px] font-bold leading-tight uppercase">Equity</span>
                            </div>
                        </div>
                    </div>
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

            <div className="bg-[#253746] text-white px-5 py-3 font-bold text-sm tracking-wide flex justify-between items-center">
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
                        <div className="bg-[#253746] text-white px-6 py-4 font-bold text-lg flex justify-between items-center shadow-md">
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

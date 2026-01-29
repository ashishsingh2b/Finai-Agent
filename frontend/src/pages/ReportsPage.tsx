/**
 * Institutional Analytics & Reporting Hub.
 * Provides advanced filtering, search, and bulk export capabilities 
 * for the complete historical analysis dataset.
 */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Download,
    Calendar,
    ArrowUpDown,
    FileText,
    FileDown,
    Eye,
    RefreshCcw,
    ChevronDown,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { analysisAPI } from '../services/api';
import { AnalysisListItem } from '../types';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/uiStore';

export const ReportsPage: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { addToast } = useUIStore();
    const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
    const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [activeDownloadId, setActiveDownloadId] = useState<number | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // --- Pagination Infrastructure ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    /**
     * Reports Initialization Lifecycle.
     * Hydrates the complete analysis list and registers global event listeners.
     */
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDownloadId(null);
            setShowExportMenu(false);
        }
        window.addEventListener('click', handleClickOutside);
        fetchAnalyses();
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    /**
     * Dataset Export Orchestrator.
     * Generates a consolidated institutional report (PDF/Excel) for all historical records.
     */
    const handleExportDataset = async (format: 'excel' | 'pdf') => {
        try {
            const response = await analysisAPI.exportAllAnalyses(i18n.language, format);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const ext = format === 'excel' ? 'xlsx' : 'pdf';
            link.setAttribute('download', `all_credit_analyses_${new Date().toISOString().split('T')[0]}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            addToast(t('reports.exportSuccess'), 'success');
        } catch (error) {
            console.error('Core dataset export failure:', error);
            addToast(t('reports.exportFailed'), 'error');
        } finally {
            setShowExportMenu(false);
        }
    };

    /**
     * Granular Entity Export.
     * Extracts a specific report (PDF/Excel) for an individual portfolio entry.
     */
    const handleDownload = async (id: number, type: 'pdf' | 'excel', companyName: string) => {
        try {
            const response = type === 'pdf'
                ? await analysisAPI.downloadPDF(id)
                : await analysisAPI.downloadExcel(id);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `credit_analysis_${companyName.replace(/\s+/g, '_')}_${id}.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Granular export interruption [${type}]:`, error);
            alert(t('analysis.downloadFailed', { type: type.toUpperCase() }));
        }
    };

    /**
     * Analytical Filtering Pipeline.
     * Re-evaluates search, category, and date constraints whenever the dataset 
     * or filter state changes.
     */
    useEffect(() => {
        let results = analyses;

        if (searchTerm) {
            results = results.filter(a =>
                a.company_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCategory !== 'All') {
            results = results.filter(a => a.category === filterCategory);
        }

        if (dateFilter) {
            results = results.filter(a => {
                if (!a.created_at) return false;
                return a.created_at.startsWith(dateFilter);
            });
        }

        setFilteredAnalyses(results);
        setCurrentPage(1); // Reset pagination index on filter mutation
    }, [searchTerm, filterCategory, dateFilter, analyses]);

    const fetchAnalyses = async () => {
        try {
            const response = await analysisAPI.listAnalyses(0, 1000); // Fetch deep historical slice
            const data = response.data.analyses || [];
            setAnalyses(data);
            setFilteredAnalyses(data);
        } catch (error) {
            console.error('Analysis repository retrieval failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string, currentBehavior: string) => {
        try {
            const payload = {
                application_status: status,
                payment_behavior: status !== 'APPROVED' ? 'NA' : currentBehavior
            };
            await analysisAPI.updateAnalysisStatus(id, payload);
            fetchAnalyses();
            addToast(`Status updated to ${status}`, 'success');
        } catch (error) {
            console.error('Status synchronization failure:', error);
            addToast('Failed to update analysis status.', 'error');
        }
    };

    const handleBehaviorUpdate = async (id: number, behavior: string) => {
        try {
            await analysisAPI.updateAnalysisStatus(id, { payment_behavior: behavior });
            fetchAnalyses();
            addToast('Payment behavior updated.', 'success');
        } catch (error) {
            console.error('Behavior logging failure:', error);
            addToast('Error saving behavior.', 'error');
        }
    };

    // --- Pagination Calculation ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAnalyses = filteredAnalyses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const getCategoryStyles = (category: string) => {
        const styles: Record<string, string> = {
            'A': 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10',
            'B': 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10',
            'C': 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10',
            'D': 'bg-orange-50 text-orange-700 border-orange-100 ring-orange-500/10',
            'E': 'bg-red-50 text-red-700 border-red-100 ring-red-500/10',
        };
        return styles[category] || 'bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10';
    };

    return (
        <DashboardLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Reports Navigation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[#11303B] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                            <FileText size={14} />
                            {t('reports.title')}
                        </div>
                        <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight leading-none mb-2">{t('reports.mainTitle')}</h1>
                        <p className="text-gray-500 font-medium text-xs">{t('reports.subtitle')}</p>
                    </div>

                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowExportMenu(!showExportMenu);
                            }}
                            className="w-full sm:w-auto bg-[#6ECEB2] text-[#11303B] px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5bc1a6] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#6ECEB2]/20 group"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {t('reports.export')}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Automated Bulk Export Control */}
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => handleExportDataset('excel')}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">Excel Report</div>
                                        <div className="text-[10px] text-gray-500 font-medium">Spreadsheet format</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleExportDataset('pdf')}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group border-t border-gray-50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">PDF Report</div>
                                        <div className="text-[10px] text-gray-500 font-medium">Document format</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search & Intelligence Filtering Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
                    <div className="lg:col-span-2 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#11303B] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('reports.searchPlaceholder')}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-900/5 focus:border-[#11303B] outline-none font-bold text-xs text-[#1A1A1A] transition-all placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#11303B] transition-colors" size={16} />
                        <select
                            className="w-full pl-11 pr-8 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-900/5 focus:border-[#11303B] outline-none font-black text-[10px] uppercase tracking-widest text-gray-500 appearance-none cursor-pointer transition-all"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">{t('reports.filter.allGrades')}</option>
                            {['A', 'B', 'C', 'D', 'E'].map(grade => (
                                <option key={grade} value={grade}>{t('reports.filter.grade').replace('{grade}', grade)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#253746] transition-colors" size={16} />
                        <input
                            type="date"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm text-left font-black text-[10px] uppercase tracking-widest text-gray-500 outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#253746] transition-all"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>

                {/* Audit Repository: Interactive Documentation Table */}
                <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em] text-center w-16">#</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]"><div className="flex items-center gap-2">{t('reports.col.entity')}<ArrowUpDown size={10} /></div></th>
                                    <th className="hidden lg:table-cell px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]">{t('reports.col.health')}</th>
                                    <th className="hidden sm:table-cell px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em] text-center">{t('reports.col.grade')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]">{t('dash.cols.status')}</th>
                                    <th className="hidden xl:table-cell px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]">{t('dash.cols.behavior')}</th>
                                    <th className="hidden md:table-cell px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em]">{t('reports.col.period')}</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-[#11303B] uppercase tracking-[0.15em] text-right">{t('reports.col.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-[#11303B]/20 border-t-[#11303B] rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black text-[#11303B] uppercase tracking-widest">{t('reports.loading')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAnalyses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"><Search size={24} className="text-gray-400" /></div>
                                                <p className="text-gray-400 font-bold text-sm">{t('reports.noResults.title')}</p>
                                                <button onClick={() => { setSearchTerm(''); setFilterCategory('All'); }} className="text-[#11303B] text-[10px] font-black uppercase tracking-widest hover:underline">{t('reports.noResults.clear')}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentAnalyses.map((analysis) => (
                                        <tr key={analysis.id} className="hover:bg-gray-50/50 transition-all group border-b border-gray-50 last:border-0">
                                            <td className="px-6 py-4 text-center"><span className="text-[10px] font-black text-gray-400">{(filteredAnalyses.indexOf(analysis) + 1).toString().padStart(2, '0')}</span></td>
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/analysis/${analysis.id}`)}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-gray-100 flex items-center justify-center font-black text-[#11303B] text-sm group-hover:bg-white group-hover:shadow-md group-hover:scale-105 transition-all">{analysis.company_name.charAt(0)}</div>
                                                    <div>
                                                        <div className="text-xs font-black text-[#1A1A1A] group-hover:text-[#11303B] transition-colors">{analysis.company_name}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">ID: {analysis.id.toString().padStart(6, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell px-6 py-4 cursor-pointer" onClick={() => navigate(`/analysis/${analysis.id}`)}>
                                                <div className="flex flex-col gap-1 w-32">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[9px] font-black text-[#1A1A1A] uppercase">{t('reports.col.health')}</span>
                                                        <span className="text-[10px] font-black text-[#11303B]">{analysis.credit_score.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#11303B] to-[#76d2b1] rounded-full transition-all duration-1000" style={{ width: `${analysis.credit_score}%` }}></div></div>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-6 py-4 cursor-pointer" onClick={() => navigate(`/analysis/${analysis.id}`)}>
                                                <div className="flex justify-center"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black border tracking-wider transition-all ${getCategoryStyles(analysis.category)} shadow-sm`}>{t('reports.filter.grade').replace('{grade}', analysis.category)}</span></div>
                                            </td>
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={analysis.application_status}
                                                    onChange={(e) => handleStatusUpdate(analysis.id, e.target.value, analysis.payment_behavior)}
                                                    className={`w-full px-3 py-1.5 rounded-lg text-[10px] font-black border tracking-wider cursor-pointer shadow-sm outline-none transition-all ${analysis.application_status === 'APPROVED' ? 'bg-[#5aac44] text-white border-[#5aac44]' : analysis.application_status === 'REJECTED' ? 'bg-[#ef4444] text-white border-[#ef4444]' : 'bg-[#fbbf24] text-white border-[#fbbf24]'}`}
                                                >
                                                    <option value="UNDER_REVIEW" className="bg-white text-gray-800">{t('status.UNDER_REVIEW')}</option>
                                                    <option value="APPROVED" className="bg-white text-gray-800">{t('status.APPROVED')}</option>
                                                    <option value="REJECTED" className="bg-white text-gray-800">{t('status.REJECTED')}</option>
                                                </select>
                                            </td>
                                            <td className="hidden xl:table-cell px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    disabled={analysis.application_status !== 'APPROVED'}
                                                    value={analysis.payment_behavior}
                                                    onChange={(e) => handleBehaviorUpdate(analysis.id, e.target.value)}
                                                    className={`w-full px-3 py-1.5 rounded-lg text-[10px] font-black border tracking-wider shadow-sm outline-none transition-all appearance-none cursor-pointer ${analysis.application_status !== 'APPROVED' ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-[#11303B] border-[#11303B]/20 hover:border-[#11303B] hover:shadow-md'}`}
                                                >
                                                    <option value="NA">{t('behavior.NA')}</option>
                                                    <option value="ON_TIME">{t('behavior.ON_TIME')}</option>
                                                    <option value="DELINQUENT">{t('behavior.DELINQUENT')}</option>
                                                </select>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4"><div className="flex items-center gap-2 text-[#11303B]"><Calendar size={12} className="text-[#11303B]/60" /><span className="text-[11px] font-black">{new Date(analysis.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => navigate(`/analysis/${analysis.id}`)} className="w-8 h-8 flex items-center justify-center bg-[#0d9488] text-white rounded-lg hover:bg-[#0f766e] transition-all shadow-sm group" title={t('dash.viewReport')}><Eye size={14} strokeWidth={2.5} /></button>
                                                    <div className="relative">
                                                        <button onClick={(e) => { e.stopPropagation(); setActiveDownloadId(activeDownloadId === analysis.id ? null : analysis.id); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm ${activeDownloadId === analysis.id ? 'bg-[#111827] text-white' : 'bg-[#1e293b] text-white hover:bg-[#0f172a]'}`} title={t('common.download_report')}><FileDown size={14} strokeWidth={2.5} /></button>
                                                        {activeDownloadId === analysis.id && (
                                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                                                <button onClick={(e) => { e.stopPropagation(); handleDownload(analysis.id, 'pdf', analysis.company_name); setActiveDownloadId(null); }} className="w-full text-left px-4 py-2 text-[10px] font-black text-[#11303B] hover:bg-gray-50 flex items-center gap-2 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />{t('common.pdf_version')}</button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleDownload(analysis.id, 'excel', analysis.company_name); setActiveDownloadId(null); }} className="w-full text-left px-4 py-2 text-[10px] font-black text-[#5aac44] hover:bg-gray-50 flex items-center gap-2 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-[#5aac44]" />{t('common.excel_version')}</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => navigate('/dashboard/upload')} className="w-8 h-8 flex items-center justify-center bg-[#e5e7eb] text-[#374151] rounded-lg hover:bg-gray-300 transition-all shadow-sm" title={t('dash.updateEdit')}><RefreshCcw size={14} strokeWidth={2.5} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Context Bar */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                            <div className="text-[10px] font-bold text-gray-500">Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAnalyses.length)} of {filteredAnalyses.length}</div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-500"><ChevronLeft size={14} /></button>
                                {Array.from({ length: totalPages }).map((_, index) => (
                                    <button key={index} onClick={() => paginate(index + 1)} className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${currentPage === index + 1 ? 'bg-[#11303B] text-white shadow-md shadow-[#11303B]/20' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>{index + 1}</button>
                                ))}
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-500"><ChevronRight size={14} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};


import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
    BookOpen,
    Upload,
    BarChart3,
    FileText,
    Users,
    Shield,
    Zap,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    ChevronDown,
    Globe,
    Settings,
    Download,
    Eye,
    Edit,
    Trash2,
    Search,
    Database,
    Cpu,
    ArrowRight,
    Lock,
    Scale,
    Activity
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('getting-started');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const sections = [
        { id: 'getting-started', icon: Zap, label: t('docs.gettingStarted') },
        { id: 'upload', icon: Upload, label: t('docs.uploadGuide') },
        { id: 'methodology', icon: Scale, label: 'Credit Methodology' },
        { id: 'analysis', icon: BarChart3, label: t('docs.analysisGuide') },
        { id: 'reports', icon: FileText, label: t('docs.reportsGuide') },
        { id: 'users', icon: Users, label: t('docs.userManagement') },
        { id: 'faq', icon: HelpCircle, label: t('docs.faq') },
    ];

    const faqs = [
        { q: t('docs.faq1Q'), a: t('docs.faq1A') },
        { q: t('docs.faq2Q'), a: t('docs.faq2A') },
        { q: t('docs.faq3Q'), a: t('docs.faq3A') },
        { q: t('docs.faq4Q'), a: t('docs.faq4A') },
        { q: t('docs.faq5Q'), a: t('docs.faq5A') },
        { q: t('docs.faq6Q'), a: t('docs.faq6A') },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8">
                {/* Header */}
                <div className="mb-10 animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#11303B] font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                        <BookOpen size={14} className="animate-pulse" />
                        {t('docs.title')}
                    </div>
                    <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight leading-none mb-3">
                        {t('docs.heading')}
                    </h1>
                    <p className="text-gray-500 font-bold text-sm max-w-2xl">{t('docs.subtitle')}</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white rounded-2xl border-4 border-[#11303B]/5 shadow-xl p-5 sticky top-8">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Search size={12} />
                                {t('docs.sections')}
                            </h3>
                            <nav className="space-y-1.5">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black transition-all ${activeSection === section.id
                                            ? 'bg-[#11303B] text-white shadow-lg shadow-blue-900/20 translate-x-1'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#11303B]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <section.icon size={16} strokeWidth={activeSection === section.id ? 3 : 2} />
                                            <span className="uppercase tracking-tight">{section.label}</span>
                                        </div>
                                        {activeSection === section.id && <div className="w-1.5 h-1.5 bg-[#6ECEB2] rounded-full shadow-[0_0_8px_rgba(110,206,178,0.8)]" />}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-8 pt-6 border-t border-gray-100 px-2">
                                <div className="flex items-center gap-2 text-[10px] font-black text-[#11303B]/40 uppercase mb-3">
                                    <Lock size={12} />
                                    Security Level
                                </div>
                                <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-[10px] font-black flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    SSL-ENCRYPTED TERMINAL
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white rounded-[2rem] sm:rounded-3xl border border-gray-100 shadow-2xl p-6 sm:p-8 md:p-12 min-h-[700px]">
                            {/* Getting Started */}
                            {activeSection === 'getting-started' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="flex items-center justify-between border-b-4 border-[#11303B] pb-6 mb-8">
                                        <h2 className="text-3xl font-black text-[#11303B] uppercase tracking-tighter flex items-center gap-4">
                                            <Zap size={32} className="text-[#6ECEB2]" strokeWidth={3} />
                                            {t('docs.gettingStarted')}
                                        </h2>
                                        <div className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 tracking-widest">{t('docs.v2_1')}</div>
                                    </div>

                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 text-base font-bold leading-relaxed mb-10">{t('docs.gsIntro')}</p>

                                        {/* Visual Workflow Diagram */}
                                        <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-200 mb-12">
                                            <h4 className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10">{t('docs.workflow')}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                                                {[
                                                    { icon: Upload, label: 'Data Ingestion', desc: 'Secure File Upload' },
                                                    { icon: Cpu, label: 'Neural Parsing', desc: 'Fuzzy Match Extract' },
                                                    { icon: Database, label: 'Risk Modeling', desc: '40-30-30 Ponderation' },
                                                    { icon: FileText, label: 'Stratification', desc: 'Final Report Gen' }
                                                ].map((step, idx) => (
                                                    <div key={idx} className="flex flex-col items-center text-center relative z-10 group">
                                                        <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4 border border-gray-100 group-hover:-translate-y-1 transition-transform">
                                                            <step.icon size={24} className="text-[#11303B]" />
                                                        </div>
                                                        <div className="text-[10px] sm:text-[11px] font-black text-[#11303B] uppercase mb-1">{step.label}</div>
                                                        <div className="text-[8px] sm:text-[9px] font-bold text-gray-500 px-2 sm:px-4">{step.desc}</div>
                                                        {idx < 3 && (
                                                            <div className="hidden md:block absolute top-7 left-full w-full h-[2px] bg-gradient-to-r from-[#11303B]/20 to-transparent -ml-2">
                                                                <ArrowRight size={14} className="absolute -right-2 -top-1.5 text-[#11303B]/20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-[#1A1A1A] mt-10 mb-6 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#11303B] text-white rounded-lg flex items-center justify-center text-sm">1</div>
                                            {t('docs.gsStep1Title')}
                                        </h3>
                                        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm space-y-4">
                                            {[t('docs.gsStep1_1'), t('docs.gsStep1_2'), t('docs.gsStep1_3')].map((step, i) => (
                                                <div key={i} className="flex items-center gap-4 group">
                                                    <div className="w-2 h-2 bg-[#6ECEB2] rounded-full group-hover:scale-150 transition-transform" />
                                                    <span className="text-sm font-bold text-gray-700">{step}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <h3 className="text-xl font-black text-[#1A1A1A] mt-12 mb-6 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#11303B] text-white rounded-lg flex items-center justify-center text-sm">2</div>
                                            {t('docs.gsStep2Title')}
                                        </h3>
                                        <div className="bg-[#11303B] rounded-2xl p-8 border-l-[12px] border-[#6ECEB2] shadow-xl text-white">
                                            <div className="flex items-start gap-5">
                                                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                                    <Shield size={24} className="text-[#6ECEB2]" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold leading-relaxed">{t('docs.gsStep2Desc')}</p>
                                                    <div className="mt-4 flex gap-4">
                                                        <div className="px-3 py-1 bg-white/10 rounded text-[10px] font-black tracking-widest uppercase">{t('docs.adminVerified')}</div>
                                                        <div className="px-3 py-1 bg-white/10 rounded text-[10px] font-black tracking-widest uppercase">{t('docs.encryptionActive')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload Guide */}
                            {activeSection === 'upload' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="flex items-center justify-between border-b-4 border-[#11303B] pb-6 mb-8">
                                        <h2 className="text-3xl font-black text-[#11303B] uppercase tracking-tighter flex items-center gap-4">
                                            <Upload size={32} className="text-[#6ECEB2]" strokeWidth={3} />
                                            {t('docs.uploadGuide')}
                                        </h2>
                                    </div>

                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 text-base font-bold leading-relaxed mb-8">{t('docs.uploadIntro')}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#6ECEB2] transition-colors group">
                                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-[#6ECEB2]/10 transition-colors">
                                                    <FileText size={20} className="text-[#11303B]" />
                                                </div>
                                                <h3 className="text-lg font-black text-[#1A1A1A] mb-4 uppercase tracking-tight">{t('docs.uploadMethod1')}</h3>
                                                <div className="space-y-3">
                                                    {[t('docs.uploadMethod1Step1'), t('docs.uploadMethod1Step2'), t('docs.uploadMethod1Step3'), t('docs.uploadMethod1Step4')].map((step, i) => (
                                                        <div key={i} className="flex gap-3 items-start">
                                                            <div className="w-5 h-5 bg-[#11303B] text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i + 1}</div>
                                                            <span className="text-xs font-bold text-gray-600">{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#6ECEB2] transition-colors group">
                                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-[#6ECEB2]/10 transition-colors">
                                                    <Database size={20} className="text-[#11303B]" />
                                                </div>
                                                <h3 className="text-lg font-black text-[#1A1A1A] mb-4 uppercase tracking-tight">{t('docs.uploadMethod2')}</h3>
                                                <div className="space-y-3">
                                                    {[t('docs.uploadMethod2Step1'), t('docs.uploadMethod2Step2'), t('docs.uploadMethod2Step3')].map((step, i) => (
                                                        <div key={i} className="flex gap-3 items-start">
                                                            <div className="w-5 h-5 bg-[#11303B] text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i + 1}</div>
                                                            <span className="text-xs font-bold text-gray-600">{step}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 bg-red-50 border-2 border-red-200 rounded-2xl p-8 flex items-start gap-6">
                                            <div className="bg-red-500 text-white p-3 rounded-xl shadow-lg shadow-red-500/20">
                                                <AlertCircle size={24} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-red-900 uppercase tracking-tight mb-2">{t('docs.uploadImportant')}</h4>
                                                <p className="text-sm font-bold text-red-700 leading-relaxed">{t('docs.uploadImportantDesc')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Methodology Visuals */}
                            {activeSection === 'methodology' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="flex items-center justify-between border-b-4 border-[#11303B] pb-6 mb-8">
                                        <h2 className="text-3xl font-black text-[#11303B] uppercase tracking-tighter flex items-center gap-4">
                                            <Scale size={32} className="text-[#6ECEB2]" strokeWidth={3} />
                                            40-30-30 Model
                                        </h2>
                                    </div>

                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 text-base font-bold leading-relaxed mb-10">
                                            The core of FinAI Agent's intelligence is our proprietary ponderated scoring model.
                                            This framework balances quantitative performance with historical trust markers.
                                        </p>

                                        {/* Visualization Grid */}
                                        <div className="space-y-6">
                                            {[
                                                { label: 'Credit History & Administration', weight: '40%', color: 'bg-indigo-600', desc: 'Weighted score based on historical payment behavior and institutional trust datasets.' },
                                                { label: 'Solvency & Viability', weight: '30%', color: 'bg-[#11303B]', desc: 'Calculated using Current Ratio, Debt-to-Assets, and Interest Coverage metrics.' },
                                                { label: 'Profitability & Momentum', weight: '30%', color: 'bg-[#6ECEB2]', desc: 'Measured via ROE, Net Margin, and 3-Year growth trends.' }
                                            ].map((comp, idx) => (
                                                <div key={idx} className="bg-white border-2 border-gray-100 rounded-3xl p-8 transition-all hover:translate-x-2">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="text-lg font-black text-[#1A1A1A] uppercase tracking-tight">{comp.label}</h4>
                                                        <div className={`${comp.color} text-white px-4 py-1 rounded-full text-xs font-black`}>{comp.weight} WEIGHT</div>
                                                    </div>
                                                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-4 shadow-inner">
                                                        <div className={`${comp.color} h-full`} style={{ width: comp.weight }} />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-500">{comp.desc}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-12 bg-gray-50 rounded-3xl p-10 border-2 border-gray-100">
                                            <h3 className="text-xl font-black text-[#11303B] text-center mb-8 uppercase tracking-widest">{t('docs.swotSynthesis')}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="flex items-start gap-5">
                                                    <div className="w-10 h-10 bg-[#6ECEB2] text-[#11303B] rounded-xl flex items-center justify-center font-black flex-shrink-0">{t('docs.ai')}</div>
                                                    <div>
                                                        <h5 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-tight">{t('docs.contextMapping')}</h5>
                                                        <p className="text-xs font-bold text-gray-500 leading-relaxed">{t('docs.contextMappingDesc')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-5">
                                                    <div className="w-10 h-10 bg-[#11303B] text-white rounded-xl flex items-center justify-center font-black flex-shrink-0">{t('docs.g')}</div>
                                                    <div>
                                                        <h5 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-tight">{t('docs.narrativeGen')}</h5>
                                                        <p className="text-xs font-bold text-gray-500 leading-relaxed">{t('docs.narrativeGenDesc')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Analysis Guide */}
                            {activeSection === 'analysis' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-3xl font-black text-[#11303B] uppercase tracking-tighter flex items-center gap-4 border-b-4 border-[#11303B] pb-6 mb-8">
                                        <BarChart3 size={32} className="text-[#6ECEB2]" strokeWidth={3} />
                                        {t('docs.analysisGuide')}
                                    </h2>

                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 text-base font-bold leading-relaxed mb-10">{t('docs.analysisIntro')}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { title: t('docs.analysisComp1'), desc: t('docs.analysisComp1Desc'), icon: Activity },
                                                { title: t('docs.analysisComp2'), desc: t('docs.analysisComp2Desc'), icon: Cpu },
                                                { title: t('docs.analysisComp3'), desc: t('docs.analysisComp3Desc'), icon: BarChart3 },
                                                { title: t('docs.analysisComp4'), desc: t('docs.analysisComp4Desc'), icon: CheckCircle2 }
                                            ].map((comp, i) => (
                                                <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:translate-y-[-4px] transition-all">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-5 border border-gray-100">
                                                        <comp.icon size={18} className="text-[#11303B]" />
                                                    </div>
                                                    <h4 className="text-sm font-black text-[#11303B] mb-3 uppercase tracking-tight">{comp.title}</h4>
                                                    <p className="text-xs font-medium text-gray-500 leading-relaxed">{comp.desc}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <h3 className="text-xl font-black text-[#1A1A1A] mt-12 mb-8 uppercase tracking-widest text-center">{t('docs.analysisCreditCategories')}</h3>
                                        <div className="flex flex-col md:flex-row gap-4 items-center justify-center px-4">
                                            {[
                                                { grade: 'A', label: t('docs.categoryA'), color: 'bg-emerald-500', bgLight: 'bg-emerald-50' },
                                                { grade: 'B', label: t('docs.categoryB'), color: 'bg-blue-500', bgLight: 'bg-blue-50' },
                                                { grade: 'C', label: t('docs.categoryC'), color: 'bg-amber-500', bgLight: 'bg-amber-50' },
                                                { grade: 'D', label: t('docs.categoryD'), color: 'bg-orange-500', bgLight: 'bg-orange-50' },
                                                { grade: 'E', label: t('docs.categoryE'), color: 'bg-red-500', bgLight: 'bg-red-50' }
                                            ].map((cat, i) => (
                                                <div key={i} className={`flex-1 w-full md:w-auto ${cat.bgLight} border border-gray-100 rounded-2xl p-5 text-center transition-all hover:scale-105`}>
                                                    <div className={`w-10 h-10 ${cat.color} text-white rounded-lg flex items-center justify-center text-lg font-black mx-auto mb-3 shadow-lg`}>{cat.grade}</div>
                                                    <div className="text-[10px] font-black text-gray-700 uppercase tracking-tighter line-clamp-2 md:h-8 flex items-center justify-center">{cat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reports Guide */}
                            {activeSection === 'reports' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-3xl font-black text-[#11303B] uppercase tracking-tighter flex items-center gap-4 border-b-4 border-[#11303B] pb-6 mb-8">
                                        <FileText size={32} className="text-[#6ECEB2]" strokeWidth={3} />
                                        {t('docs.reportsGuide')}
                                    </h2>

                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 text-base font-bold leading-relaxed mb-10">{t('docs.reportsIntro')}</p>

                                        <div className="space-y-4">
                                            {[
                                                { icon: Eye, title: t('docs.reportsView'), desc: t('docs.reportsViewDesc') },
                                                { icon: Search, title: t('docs.reportsSearch'), desc: t('docs.reportsSearchDesc') },
                                                { icon: Download, title: t('docs.reportsExport'), desc: t('docs.reportsExportDesc') }
                                            ].map((action, i) => (
                                                <div key={i} className="flex items-center gap-6 p-6 bg-white border-2 border-gray-50 rounded-3xl hover:border-[#6ECEB2] transition-colors">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                                                        <action.icon size={20} className="text-[#11303B]" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-[#1A1A1A] mb-1 uppercase tracking-tight">{action.title}</h4>
                                                        <p className="text-xs font-bold text-gray-500">{action.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Management */}
                            {activeSection === 'users' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-3xl font-black text-[#11303B] uppercase tracking-tighter flex items-center gap-4 border-b-4 border-[#11303B] pb-6 mb-8">
                                        <Users size={32} className="text-[#6ECEB2]" strokeWidth={3} />
                                        {t('docs.userManagement')}
                                    </h2>

                                    <div className="bg-[#11303B] rounded-2xl p-8 border-l-[12px] border-[#6ECEB2] shadow-xl text-white mb-8">
                                        <div className="flex items-start gap-4">
                                            <Shield size={22} className="text-[#6ECEB2] mt-1" />
                                            <p className="text-sm font-bold leading-relaxed">{t('docs.usersAdminOnly')}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { icon: Users, title: t('docs.usersCreate'), desc: t('docs.usersCreateDesc'), color: 'text-blue-600' },
                                            { icon: Edit, title: t('docs.usersEdit'), desc: t('docs.usersEditDesc'), color: 'text-amber-600' },
                                            { icon: Settings, title: t('docs.usersToggle'), desc: t('docs.usersToggleDesc'), color: 'text-emerald-600' },
                                            { icon: Trash2, title: t('docs.usersDelete'), desc: t('docs.usersDeleteDesc'), color: 'text-red-600' }
                                        ].map((action, i) => (
                                            <div key={i} className="bg-white border-2 border-gray-50 rounded-3xl p-6 hover:shadow-lg transition-all group">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-5 border border-gray-100 group-hover:bg-gray-100 transition-colors">
                                                    <action.icon size={18} className={action.color} />
                                                </div>
                                                <h4 className="text-sm font-black text-[#11303B] mb-2 uppercase tracking-tight">{action.title}</h4>
                                                <p className="text-xs font-medium text-gray-500 leading-relaxed">{action.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FAQ */}
                            {activeSection === 'faq' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-3xl font-black text-[#11303B] uppercase tracking-tighter flex items-center gap-4 border-b-4 border-[#11303B] pb-6 mb-8">
                                        <HelpCircle size={32} className="text-[#6ECEB2]" strokeWidth={3} />
                                        {t('docs.faq')}
                                    </h2>

                                    <p className="text-gray-500 text-lg font-bold leading-relaxed">{t('docs.faqIntro')}</p>

                                    <div className="space-y-4">
                                        {faqs.map((faq, index) => (
                                            <div key={index} className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm transition-all hover:border-[#6ECEB2]">
                                                <button
                                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                                    className="w-full flex items-center justify-between px-8 py-6 bg-white hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <span className="text-sm font-black text-[#1A1A1A] text-left uppercase tracking-tight">{faq.q}</span>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedFaq === index ? 'bg-[#11303B] text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                                                        <ChevronDown size={14} strokeWidth={4} />
                                                    </div>
                                                </button>
                                                {expandedFaq === index && (
                                                    <div className="px-8 pb-8 bg-gray-50/50 animate-in slide-in-from-top duration-300">
                                                        <div className="h-0.5 w-10 bg-[#6ECEB2] mb-6 rounded-full" />
                                                        <p className="text-sm text-gray-700 leading-relaxed font-bold">{faq.a}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-[#11303B] rounded-[2.5rem] p-12 mt-16 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors" />
                                        <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
                                            <div className="max-w-xl">
                                                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">{t('docs.needHelp')}</h3>
                                                <p className="text-gray-400 text-sm font-bold leading-relaxed">{t('docs.needHelpDesc')}</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                                                <a
                                                    href="mailto:support@moskalti.com"
                                                    className="px-8 py-4 bg-[#6ECEB2] text-[#11303B] rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#6ECEB2]/10"
                                                >
                                                    {t('docs.contactSupport')}
                                                </a>
                                                <a
                                                    href="https://moskalti.com"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-8 py-4 bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3 justify-center"
                                                >
                                                    <Globe size={16} />
                                                    {t('docs.visitWebsite')}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

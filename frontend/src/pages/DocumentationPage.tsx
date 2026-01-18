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
    ChevronRight,
    Globe,
    Settings,
    Download,
    Eye,
    Edit,
    Trash2,
    Search
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('getting-started');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const sections = [
        { id: 'getting-started', icon: Zap, label: t('docs.gettingStarted') },
        { id: 'upload', icon: Upload, label: t('docs.uploadGuide') },
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
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8 animate-in fade-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-2 text-[#253746] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                        <BookOpen size={14} />
                        {t('docs.title')}
                    </div>
                    <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight leading-none mb-2">
                        {t('docs.heading')}
                    </h1>
                    <p className="text-gray-500 font-medium text-xs">{t('docs.subtitle')}</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sticky top-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                                {t('docs.sections')}
                            </h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeSection === section.id
                                                ? 'bg-[#253746] text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-[#253746]'
                                            }`}
                                    >
                                        <section.icon size={14} />
                                        {section.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                            {/* Getting Started */}
                            {activeSection === 'getting-started' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-xl font-black text-[#253746] flex items-center gap-2">
                                        <Zap size={20} />
                                        {t('docs.gettingStarted')}
                                    </h2>

                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 leading-relaxed">{t('docs.gsIntro')}</p>

                                        <h3 className="text-base font-black text-[#1A1A1A] mt-6 mb-3">{t('docs.gsStep1Title')}</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                                <li>{t('docs.gsStep1_1')}</li>
                                                <li>{t('docs.gsStep1_2')}</li>
                                                <li>{t('docs.gsStep1_3')}</li>
                                            </ol>
                                        </div>

                                        <h3 className="text-base font-black text-[#1A1A1A] mt-6 mb-3">{t('docs.gsStep2Title')}</h3>
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                            <div className="flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-[#253746] flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-gray-700">{t('docs.gsStep2Desc')}</p>
                                            </div>
                                        </div>

                                        <h3 className="text-base font-black text-[#1A1A1A] mt-6 mb-3">{t('docs.gsQuickTips')}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                                    <span className="text-xs font-black text-emerald-900">{t('docs.tip1Title')}</span>
                                                </div>
                                                <p className="text-xs text-gray-600">{t('docs.tip1Desc')}</p>
                                            </div>
                                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                                    <span className="text-xs font-black text-emerald-900">{t('docs.tip2Title')}</span>
                                                </div>
                                                <p className="text-xs text-gray-600">{t('docs.tip2Desc')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload Guide */}
                            {activeSection === 'upload' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-xl font-black text-[#253746] flex items-center gap-2">
                                        <Upload size={20} />
                                        {t('docs.uploadGuide')}
                                    </h2>

                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 leading-relaxed">{t('docs.uploadIntro')}</p>

                                        <h3 className="text-base font-black text-[#1A1A1A] mt-6 mb-3">{t('docs.uploadMethod1')}</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                                <li>{t('docs.uploadMethod1Step1')}</li>
                                                <li>{t('docs.uploadMethod1Step2')}</li>
                                                <li>{t('docs.uploadMethod1Step3')}</li>
                                                <li>{t('docs.uploadMethod1Step4')}</li>
                                            </ol>
                                        </div>

                                        <h3 className="text-base font-black text-[#1A1A1A] mt-6 mb-3">{t('docs.uploadMethod2')}</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                                <li>{t('docs.uploadMethod2Step1')}</li>
                                                <li>{t('docs.uploadMethod2Step2')}</li>
                                                <li>{t('docs.uploadMethod2Step3')}</li>
                                            </ol>
                                        </div>

                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black text-amber-900 mb-1">{t('docs.uploadImportant')}</p>
                                                    <p className="text-xs text-gray-700">{t('docs.uploadImportantDesc')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Analysis Guide */}
                            {activeSection === 'analysis' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-xl font-black text-[#253746] flex items-center gap-2">
                                        <BarChart3 size={20} />
                                        {t('docs.analysisGuide')}
                                    </h2>

                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 leading-relaxed">{t('docs.analysisIntro')}</p>

                                        <h3 className="text-base font-black text-[#1A1A1A] mt-6 mb-3">{t('docs.analysisComponents')}</h3>

                                        <div className="space-y-3">
                                            <div className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="text-sm font-black text-[#253746] mb-2">{t('docs.analysisComp1')}</h4>
                                                <p className="text-xs text-gray-600">{t('docs.analysisComp1Desc')}</p>
                                            </div>
                                            <div className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="text-sm font-black text-[#253746] mb-2">{t('docs.analysisComp2')}</h4>
                                                <p className="text-xs text-gray-600">{t('docs.analysisComp2Desc')}</p>
                                            </div>
                                            <div className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="text-sm font-black text-[#253746] mb-2">{t('docs.analysisComp3')}</h4>
                                                <p className="text-xs text-gray-600">{t('docs.analysisComp3Desc')}</p>
                                            </div>
                                            <div className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="text-sm font-black text-[#253746] mb-2">{t('docs.analysisComp4')}</h4>
                                                <p className="text-xs text-gray-600">{t('docs.analysisComp4Desc')}</p>
                                            </div>
                                        </div>

                                        <h3 className="text-base font-black text-[#1A1A1A] mt-6 mb-3">{t('docs.analysisCreditCategories')}</h3>
                                        <div className="grid grid-cols-5 gap-2">
                                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                                                <div className="text-xl font-black text-emerald-700">A</div>
                                                <div className="text-[9px] font-bold text-gray-600 mt-1">{t('docs.categoryA')}</div>
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                                <div className="text-xl font-black text-blue-700">B</div>
                                                <div className="text-[9px] font-bold text-gray-600 mt-1">{t('docs.categoryB')}</div>
                                            </div>
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                                                <div className="text-xl font-black text-amber-700">C</div>
                                                <div className="text-[9px] font-bold text-gray-600 mt-1">{t('docs.categoryC')}</div>
                                            </div>
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                                                <div className="text-xl font-black text-orange-700">D</div>
                                                <div className="text-[9px] font-bold text-gray-600 mt-1">{t('docs.categoryD')}</div>
                                            </div>
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                                <div className="text-xl font-black text-red-700">E</div>
                                                <div className="text-[9px] font-bold text-gray-600 mt-1">{t('docs.categoryE')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reports Guide */}
                            {activeSection === 'reports' && (
                                <div className="space-y-6 animate-in fade-in-slide-in-from-right duration-500">
                                    <h2 className="text-xl font-black text-[#253746] flex items-center gap-2">
                                        <FileText size={20} />
                                        {t('docs.reportsGuide')}
                                    </h2>

                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 leading-relaxed">{t('docs.reportsIntro')}</p>

                                        <h3 className="text-base font-black text-[#1A1A1A] mt-6 mb-3">{t('docs.reportsActions')}</h3>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <Eye className="w-4 h-4 text-[#253746] flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black text-[#1A1A1A]">{t('docs.reportsView')}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{t('docs.reportsViewDesc')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <Search className="w-4 h-4 text-[#253746] flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black text-[#1A1A1A]">{t('docs.reportsSearch')}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{t('docs.reportsSearchDesc')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <Download className="w-4 h-4 text-[#253746] flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black text-[#1A1A1A]">{t('docs.reportsExport')}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{t('docs.reportsExportDesc')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Management Guide */}
                            {activeSection === 'users' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-xl font-black text-[#253746] flex items-center gap-2">
                                        <Users size={20} />
                                        {t('docs.userManagement')}
                                    </h2>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-[#253746] flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-gray-700">{t('docs.usersAdminOnly')}</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-sm max-w-none">
                                        <h3 className="text-base font-black text-[#1A1A1A] mt-6 mb-3">{t('docs.usersActions')}</h3>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <Users className="w-4 h-4 text-[#253746] flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black text-[#1A1A1A]">{t('docs.usersCreate')}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{t('docs.usersCreateDesc')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <Edit className="w-4 h-4 text-[#253746] flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black text-[#1A1A1A]">{t('docs.usersEdit')}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{t('docs.usersEditDesc')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <Settings className="w-4 h-4 text-[#253746] flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black text-[#1A1A1A]">{t('docs.usersToggle')}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{t('docs.usersToggleDesc')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <Trash2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black text-[#1A1A1A]">{t('docs.usersDelete')}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{t('docs.usersDeleteDesc')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FAQ */}
                            {activeSection === 'faq' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                    <h2 className="text-xl font-black text-[#253746] flex items-center gap-2">
                                        <HelpCircle size={20} />
                                        {t('docs.faq')}
                                    </h2>

                                    <p className="text-gray-700 text-sm leading-relaxed">{t('docs.faqIntro')}</p>

                                    <div className="space-y-3">
                                        {faqs.map((faq, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="text-xs font-black text-[#1A1A1A] text-left">{faq.q}</span>
                                                    {expandedFaq === index ? (
                                                        <ChevronDown className="w-4 h-4 text-[#253746] flex-shrink-0" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    )}
                                                </button>
                                                {expandedFaq === index && (
                                                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                                        <p className="text-xs text-gray-700 leading-relaxed pt-3">{faq.a}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-[#253746] rounded-lg p-6 mt-8">
                                        <h3 className="text-white font-black text-sm mb-2">{t('docs.needHelp')}</h3>
                                        <p className="text-gray-300 text-xs mb-4">{t('docs.needHelpDesc')}</p>
                                        <div className="flex gap-3">
                                            <a
                                                href="mailto:support@moskalti.com"
                                                className="px-4 py-2 bg-white text-[#253746] rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                                            >
                                                {t('docs.contactSupport')}
                                            </a>
                                            <a
                                                href="https://moskalti.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-[#1A2630] text-white rounded-lg text-xs font-bold hover:bg-opacity-80 transition-colors flex items-center gap-2"
                                            >
                                                <Globe size={14} />
                                                {t('docs.visitWebsite')}
                                            </a>
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

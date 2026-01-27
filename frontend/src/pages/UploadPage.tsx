import * as React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FileUpload } from '../components/upload/FileUpload';
import { useTranslation } from 'react-i18next';
import { CloudIcon, Zap } from 'lucide-react';

export const UploadPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <DashboardLayout>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[#11303B] font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                            <CloudIcon size={14} />
                            {t('upload.ingestionTerminal')}
                        </div>
                        <h1 className="text-[#1A1A1A] text-2xl font-black tracking-tight leading-none mb-2">
                            {t('upload.initScan')}
                        </h1>
                        <p className="text-gray-500 font-medium text-xs">
                            {t('upload.desc')}
                        </p>
                    </div>
                    <div className="hidden sm:flex w-12 h-12 bg-white rounded-2xl border border-gray-100 items-center justify-center text-[#6ECEB2] shadow-sm">
                        <Zap size={24} />
                    </div>
                </div>

                <div className="w-full">
                    <FileUpload />
                </div>
            </div>
        </DashboardLayout>
    );
};

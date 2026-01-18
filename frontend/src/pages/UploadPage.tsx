import * as React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { SplitFileUpload } from '../components/upload/SplitFileUpload';

export const UploadPage: React.FC = () => {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[85vh] w-full p-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-full max-w-5xl">
                    <SplitFileUpload />
                </div>
            </div>
        </DashboardLayout>
    );
};

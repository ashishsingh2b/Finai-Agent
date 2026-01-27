import * as React from 'react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle,
    Zap,
    ArrowUpRight,
    Loader2,
    X,
    RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { analysisAPI } from '../../services/api';

type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadFile {
    file: File;
    id: string;
    status: FileStatus;
    progress: number;
    error?: string;
    analysisId?: number;
    retryCount: number;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_RETRIES = 2;

export const FileUpload: React.FC = () => {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [validationAlerts, setValidationAlerts] = useState<any[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Loan details state
    const [loanAmount, setLoanAmount] = useState<number>(0);
    const [loanTerm, setLoanTerm] = useState<number>(12);
    const [creditType, setCreditType] = useState<string>('NEW');
    const [creditScore, setCreditScore] = useState<number>(75);

    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const validateFile = (file: File): string | null => {
        if (!file.name.match(/\.(xlsx|xls|pdf)$/i)) {
            return t('upload.errFileType');
        }
        if (file.size > MAX_FILE_SIZE) {
            return t('upload.errFileSize', { size: MAX_FILE_SIZE / 1024 / 1024 });
        }
        if (file.size === 0) {
            return t('upload.errEmpty');
        }
        return null;
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, [files]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);
        e.target.value = ''; // Reset input
    };

    const addFiles = (newFiles: File[]) => {
        setGlobalError('');
        setValidationAlerts([]);

        if (files.length + newFiles.length > MAX_FILES) {
            setGlobalError(t('upload.errMaxFiles', { max: MAX_FILES }));
            return;
        }

        const validatedFiles: UploadFile[] = [];
        let hasError = false;

        newFiles.forEach(file => {
            const error = validateFile(file);
            if (error) {
                setGlobalError(error);
                hasError = true;
            } else {
                validatedFiles.push({
                    file,
                    id: `${Date.now()}-${Math.random()}`,
                    status: 'pending',
                    progress: 0,
                    retryCount: 0
                });
            }
        });

        if (!hasError) {
            setFiles([...files, ...validatedFiles]);
        }
    };

    const removeFile = (id: string) => {
        setFiles(files.filter(f => f.id !== id));
        setGlobalError('');
        setValidationAlerts([]);
    };

    const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id
                ? { ...f, status: 'uploading' as FileStatus, progress: 0 }
                : f
        ));

        try {
            const response = await analysisAPI.uploadFile(
                uploadFile.file,
                i18n.language,
                loanAmount,
                loanTerm,
                creditType,
                creditScore
            );
            const { analysis_id } = response.data;

            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                    ? { ...f, status: 'success' as FileStatus, progress: 100, analysisId: analysis_id }
                    : f
            ));
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            const errorMessage = typeof detail === 'string' ? detail : detail?.message || t('upload.errFailed');

            if (detail?.alerts) {
                setValidationAlerts(detail.alerts);
            }

            if (uploadFile.retryCount < MAX_RETRIES && !detail?.alerts) {
                // Retry only if not a validation error
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, retryCount: f.retryCount + 1 }
                        : f
                ));
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                return uploadSingleFile(uploadFile);
            } else {
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id
                        ? { ...f, status: 'error' as FileStatus, error: errorMessage }
                        : f
                ));
            }
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setGlobalError('');
        setValidationAlerts([]);

        try {
            let response;
            if (files.length === 1) {
                // Single file analysis
                response = await analysisAPI.uploadFile(
                    files[0].file,
                    i18n.language,
                    loanAmount,
                    loanTerm,
                    creditType,
                    creditScore
                );
            } else {
                // Merged analysis for multiple files
                response = await analysisAPI.uploadSplitFiles(
                    files.map(f => f.file),
                    i18n.language,
                    loanAmount,
                    loanTerm,
                    creditType,
                    creditScore
                );
            }

            const { analysis_id } = response.data;
            setFiles(prev => prev.map(f => ({ ...f, status: 'success' as FileStatus, progress: 100 })));

            // Redirect to the single consolidated report
            navigate(`/analysis/${analysis_id}`);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            const errorMessage = typeof detail === 'string' ? detail : detail?.message || t('upload.errFailed');

            if (detail?.alerts) {
                setValidationAlerts(detail.alerts);
            }
            setGlobalError(errorMessage);
            setFiles(prev => prev.map(f => ({ ...f, status: 'error' as FileStatus, error: errorMessage })));
        } finally {
            setUploading(false);
        }
    };

    const retryFailed = () => {
        setFiles(prev => prev.map(f =>
            f.status === 'error'
                ? { ...f, status: 'pending' as FileStatus, error: undefined, retryCount: 0 }
                : f
        ));
    };

    const getStatusIcon = (status: FileStatus) => {
        switch (status) {
            case 'pending': return <FileSpreadsheet className="w-4 h-4 text-gray-400" />;
            case 'uploading': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
        }
    };

    const getStatusText = (uploadFile: UploadFile) => {
        switch (uploadFile.status) {
            case 'pending': return t('upload.status.ready');
            case 'uploading': return `${t('upload.status.processing')} ${uploadFile.retryCount > 0 ? `(Retry ${uploadFile.retryCount})` : ''} `;
            case 'success': return t('upload.status.complete');
            case 'error': return uploadFile.error || t('upload.status.failed');
        }
    };

    const errorCount = files.filter(f => f.status === 'error').length;
    const canUpload = files.length > 0 && !uploading && files.some(f => f.status === 'pending' || f.status === 'error');

    return (
        <div className="w-full">

            {/* Loan Details Form */}
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#11303B] font-black text-[10px] uppercase tracking-[0.2em] mb-6">
                    <Zap size={14} />
                    {t('analysis.creditDetails')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            {t('analysis.approvedAmount')} (MXN)
                        </label>
                        <input
                            type="number"
                            value={loanAmount || ''}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            placeholder="e.g. 1000000"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#11303B] focus:bg-white focus:ring-2 focus:ring-[#6ECEB2]/20 focus:border-[#6ECEB2] outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            {t('analysis.term')} (Months)
                        </label>
                        <select
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#11303B] focus:bg-white focus:ring-2 focus:ring-[#6ECEB2]/20 focus:border-[#6ECEB2] outline-none transition-all"
                        >
                            {[6, 12, 18, 24, 36, 48].map(m => (
                                <option key={m} value={m}>{m} {t('analysis.monthsUnit', { count: m })}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            {t('analysis.creditType')}
                        </label>
                        <select
                            value={creditType}
                            onChange={(e) => setCreditType(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#11303B] focus:bg-white focus:ring-2 focus:ring-[#6ECEB2]/20 focus:border-[#6ECEB2] outline-none transition-all"
                        >
                            <option value="NEW">{t('analysis.types.new')}</option>
                            <option value="RENEWAL">{t('analysis.types.renewal')}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            {t('analysis.creditScore')}
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={creditScore}
                            onChange={(e) => setCreditScore(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#11303B] focus:bg-white focus:ring-2 focus:ring-[#6ECEB2]/20 focus:border-[#6ECEB2] outline-none transition-all"
                        />
                    </div>
                </div>
            </div>


            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                className={`group relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-500 cursor-pointer overflow-hidden ${isDragging
                    ? 'border-[#253746] bg-[#253746]/5 shadow-2xl'
                    : 'border-gray-200 bg-white hover:border-[#253746] hover:bg-gray-50/50 hover:shadow-xl'
                    } `}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#253746]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 transition-all ${files.length > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-[#F1F5F9] text-[#253746] group-hover:scale-110'
                        }`}>
                        <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <p className="text-lg sm:text-xl font-black text-[#1A1A1A] tracking-tight mb-1">
                        {t('split.dropDesc')}
                    </p>
                    <p className="text-gray-400 font-medium text-xs sm:text-sm mb-4">{t('upload.clickBrowse')}</p>

                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase">.XLSX</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase">.XLS</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase">.PDF</span>
                    </div>
                </div>

                <input
                    type="file"
                    accept=".xlsx,.xls,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                    multiple
                />
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-black text-sm text-[#1A1A1A] uppercase tracking-wider">
                            {t('upload.files')} ({files.length})
                        </h3>
                    </div>
                    {files.map(uploadFile => (
                        <div
                            key={uploadFile.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                        >
                            <div className="flex-shrink-0">
                                {getStatusIcon(uploadFile.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-[#1A1A1A] truncate">
                                    {uploadFile.file.name}
                                </p>
                                <p className={`text - xs font - medium ${uploadFile.status === 'error' ? 'text-red-500' : 'text-gray-500'
                                    } `}>
                                    {getStatusText(uploadFile)}
                                </p>
                            </div>
                            {uploadFile.status === 'pending' && !uploading && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(uploadFile.id);
                                    }}
                                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Validation Errors */}
            {validationAlerts.length > 0 && (
                <div className="mt-5 bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 text-red-700 font-extrabold text-xs uppercase tracking-widest mb-4">
                        <AlertCircle className="w-5 h-5" />
                        Analysis Blocked: Mandatory Rules Failed
                    </div>
                    <div className="space-y-3">
                        {validationAlerts.map((alert, idx) => (
                            <div key={idx} className="bg-white/50 border border-red-100 rounded-xl p-4">
                                <p className="text-[#11303B] font-bold text-sm mb-1">{alert.message}</p>
                                <p className="text-red-600/70 text-[10px] font-medium uppercase tracking-wider">{alert.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Global Error */}
            {globalError && (
                <div className="mt-5 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-bold">{globalError}</span>
                </div>
            )}

            {/* Retry Button */}
            {errorCount > 0 && !uploading && (
                <button
                    onClick={retryFailed}
                    className="mt-5 w-full py-4 bg-orange-500 text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-orange-600 transition"
                >
                    <RefreshCw className="w-5 h-5" />
                    {t('upload.retryFailed', { count: errorCount })}
                </button>
            )}

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!canUpload}
                className={`mt-8 w-full rounded-2xl py-4 sm:py-6 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${!canUpload
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#1A1A1A] text-white hover:bg-[#1A2630] shadow-2xl shadow-gray-900/20 hover:scale-[1.01]'
                    }`}
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('upload.processingNeural')}
                    </>
                ) : (
                    <>
                        {t('upload.runAnalysis')}
                        <ArrowUpRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </div>
    );
};

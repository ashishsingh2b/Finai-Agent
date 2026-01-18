import * as React from 'react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle,
    CloudIcon,
    Zap,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { analysisAPI } from '../../services/api';

export const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();

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
        const droppedFile = e.dataTransfer.files[0];

        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
            setFile(droppedFile);
            setError('');
        } else {
            setError('Please upload an Excel file (.xlsx or .xls)');
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const response = await analysisAPI.uploadFile(file);
            const { analysis_id } = response.data;
            navigate(`/analysis/${analysis_id}`);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Upload failed. Please contact the neural link support.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-12">
            <div className="flex items-start justify-between mb-10">
                <div>
                    <div className="flex items-center gap-2 text-[#253746] font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        <CloudIcon size={14} />
                        Data Ingestion Terminal
                    </div>
                    <h1 className="text-[#1A1A1A] text-3xl font-black tracking-tight leading-none mb-3">Initialize Neural Scan</h1>
                    <p className="text-gray-500 font-medium">Upload financial statements for instant risk stratification.</p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                    <Zap size={24} />
                </div>
            </div>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                className={`group relative border-2 border-dashed rounded-[2.5rem] p-16 text-center transition-all duration-500 cursor-pointer overflow-hidden ${isDragging
                    ? 'border-[#253746] bg-[#253746]/5 shadow-2xl shadow-blue-900/10'
                    : 'border-gray-200 bg-white hover:border-[#253746] hover:bg-gray-50/50 hover:shadow-xl hover:shadow-gray-200/50'
                    }`}
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#253746]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 transition-all duration-300 ${file ? 'bg-emerald-50 text-emerald-500 scale-110' : 'bg-[#F1F5F9] text-[#253746] group-hover:scale-110 group-hover:shadow-lg'
                        }`}>
                        {file ? <FileSpreadsheet className="w-8 h-8" /> : <Upload className="w-8 h-8 transition-transform group-hover:translate-y-[-4px]" />}
                    </div>

                    {file ? (
                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-[#1A1A1A] tracking-tight">{file.name}</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Ready for transition</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-[#253746] font-black text-[10px] uppercase tracking-widest">
                                <CheckCircle size={14} />
                                Excel Structure Validated
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <p className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-1">
                                    Drop your statement here
                                </p>
                                <p className="text-gray-400 font-medium">or click to browse local files</p>
                            </div>
                            <div className="flex items-center justify-center gap-4 pt-4">
                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest">.XLSX</span>
                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest">.XLS</span>
                            </div>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                />
            </div>

            {error && (
                <div className="mt-6 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-[1.5rem] flex items-center gap-3 animate-in slide-in-from-top-4">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-black tracking-tight">{error}</span>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`mt-10 w-full rounded-2xl py-6 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${!file || uploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#1A1A1A] text-white hover:bg-[#1A2630] shadow-2xl shadow-gray-900/20 hover:scale-[1.01]'
                    }`}
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Neural Signal...
                    </>
                ) : (
                    <>
                        Run Deep Analysis
                        <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                )}
            </button>
        </div>
    );
};

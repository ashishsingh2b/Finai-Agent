import * as React from 'react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CloudIcon,
    Upload,
    FileSpreadsheet,
    X,
    CheckCircle,
    Loader2,
    AlertCircle,
    FileText,
    Trash2
} from 'lucide-react';
import { analysisAPI } from '../../services/api';

export const SplitFileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();

    // Simulate progress
    React.useEffect(() => {
        if (uploading && progress < 90) {
            const timer = setTimeout(() => setProgress(prev => prev + 10), 200);
            return () => clearTimeout(timer);
        }
    }, [uploading, progress]);

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
        validateAndSetFile(droppedFile);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (f: File) => {
        if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
            setFile(f);
            setError('');
            setProgress(0);
        } else {
            setError('Invalid format. Please use .xlsx or .xls');
        }
    };

    const removeFile = () => {
        setFile(null);
        setError('');
        setProgress(0);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');

        try {
            const response = await analysisAPI.uploadFile(file);
            setProgress(100);
            setTimeout(() => {
                const { analysis_id } = response.data;
                navigate(`/analysis/${analysis_id}`);
            }, 500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Upload failed.');
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row h-[500px]">
            {/* Left: Drop Zone */}
            <div className={`flex-1 p-8 border-r border-gray-100 flex flex-col relative transition-colors ${isDragging ? 'bg-blue-50/50' : 'bg-white'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}>

                <h2 className="text-[#253746] font-black text-xl mb-2 tracking-tight">Upload Files</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Upload documents you want to share with your team</p>

                <div
                    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer group 
                    ${isDragging ? 'border-[#253746] bg-[#253746]/5' : 'border-gray-200 hover:border-[#253746] hover:bg-gray-50'}`}
                    onClick={() => document.getElementById('split-file-input')?.click()}
                >
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-400 group-hover:scale-110 transition-transform group-hover:text-[#253746]">
                        <CloudIcon size={32} />
                    </div>
                    <p className="text-[#253746] font-black text-sm mb-2">Drag and drop files here</p>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">- OR -</p>
                    <button className="bg-[#253746] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1A2630] transition-colors shadow-lg shadow-blue-900/20">
                        Browse Files
                    </button>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="split-file-input"
                    />
                </div>
            </div>

            {/* Right: Uploaded Files List */}
            <div className="w-full md:w-[450px] bg-gray-50/50 p-8 flex flex-col">
                <h3 className="text-[#1A1A1A] font-black text-lg mb-8 tracking-tight">Uploaded Files</h3>

                <div className="space-y-4 flex-1 overflow-y-auto">
                    {file ? (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group animate-in slide-in-from-right duration-300">
                            <button
                                onClick={removeFile}
                                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>

                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-[#253746]/10 rounded-lg flex items-center justify-center text-[#253746]">
                                    <FileSpreadsheet size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-black text-gray-800 truncate">{file.name}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                </div>
                            </div>

                            {/* Progress / Status */}
                            {uploading ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-[#253746]">Uploading...</span>
                                        <span className="text-gray-400">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#253746] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                        <CheckCircle size={12} strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ready to Process</span>
                                    </div>
                                    <button
                                        onClick={handleUpload}
                                        className="text-[10px] font-black text-[#253746] uppercase tracking-widest hover:underline"
                                    >
                                        Start Analysis
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <FileText size={48} className="text-gray-300 mb-4" />
                            <p className="text-sm font-bold text-gray-400">No files selected</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600 animate-in slide-in-from-right">
                            <AlertCircle size={16} />
                            <span className="text-xs font-bold">{error}</span>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>System Status</span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Online
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

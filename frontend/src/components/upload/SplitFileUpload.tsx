import * as React from 'react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CloudIcon,
    FileSpreadsheet,
    AlertCircle,
    FileText,
    Trash2
} from 'lucide-react';
import { analysisAPI } from '../../services/api';

export const SplitFileUpload: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
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
        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach(f => validateAndSetFile(f));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        selectedFiles.forEach(f => validateAndSetFile(f));
    };

    const validateAndSetFile = (f: File) => {
        const allowed = ['.xlsx', '.xls', '.pdf'];
        const isAllowed = allowed.some(ext => f.name.toLowerCase().endsWith(ext));

        if (f && isAllowed) {
            setFiles(prev => [...prev, f]);
            setError('');
            setProgress(0);
        } else {
            setError(`Format not supported for ${f.name}`);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        if (files.length <= 1) {
            setError('');
            setProgress(0);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setError('');

        try {
            const response = files.length === 1
                ? await analysisAPI.uploadFile(files[0])
                : await analysisAPI.uploadSplitFiles(files);

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
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row h-[550px]">
            {/* Left: Drop Zone */}
            <div className={`flex-1 p-8 border-r border-gray-100 flex flex-col relative transition-colors ${isDragging ? 'bg-blue-50/50' : 'bg-white'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}>

                <h2 className="text-[#11303B] font-black text-xl mb-2 tracking-tight">Financial Terminal</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Upload one or multiple files for consolidated analysis</p>

                <div
                    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer group 
                    ${isDragging ? 'border-[#11303B] bg-[#11303B]/5' : 'border-gray-200 hover:border-[#11303B] hover:bg-gray-50'}`}
                    onClick={() => document.getElementById('split-file-input')?.click()}
                >
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-400 group-hover:scale-110 transition-transform group-hover:text-[#11303B]">
                        <CloudIcon size={32} />
                    </div>
                    <p className="text-[#11303B] font-black text-sm mb-2">Drop Balance Sheet, P&L, etc.</p>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">- OR -</p>
                    <button className="bg-[#6ECEB2] text-[#11303B] px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5bc1a6] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#6ECEB2]/20 group">
                        <FileText className="w-3.5 h-3.5 group-hover:-translate-y-1 transition-transform duration-300" />
                        Select Documents
                    </button>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.pdf"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="split-file-input"
                    />
                </div>
            </div>

            {/* Right: Uploaded Files List */}
            <div className="w-full md:w-[450px] bg-gray-50/50 p-8 flex flex-col">
                <h3 className="text-[#1A1A1A] font-black text-lg mb-8 tracking-tight">Package Queue</h3>

                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                    {files.map((f, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group animate-in slide-in-from-right duration-300">
                            <button
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-[#11303B]/10 rounded-lg flex items-center justify-center text-[#11303B]">
                                    {f.name.toLowerCase().endsWith('.pdf') ? <FileText size={16} /> : <FileSpreadsheet size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-black text-gray-800 truncate">{f.name}</div>
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                        {(f.size / 1024).toFixed(1)} KB
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {files.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <FileText size={48} className="text-gray-300 mb-4" />
                            <p className="text-sm font-bold text-gray-400">Queue is empty</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    {files.length > 0 && !uploading && (
                        <button
                            onClick={handleUpload}
                            className="w-full mb-6 bg-[#ef6b6b] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#d95d5d] transition-all transform hover:scale-[1.02] shadow-xl shadow-red-900/20"
                        >
                            Execute Analysis ({files.length} Files)
                        </button>
                    )}

                    {uploading && (
                        <div className="mb-6 space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-[#11303B]">Processing Package...</span>
                                <span className="text-gray-400">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#11303B] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
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

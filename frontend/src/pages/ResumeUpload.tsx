import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle2, SkipForward } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const ResumeUpload: React.FC = () => {
    const navigate = useNavigate();
    const { setResumeProcessed } = useAuthStore();

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') setResumeFile(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') setResumeFile(file);
    };

    const handleUpload = async () => {
        if (!resumeFile) return;
        setUploadState('uploading');
        setUploadError(null);

        const formData = new FormData();
        formData.append('resume', resumeFile);

        try {
            await api.post('/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadState('done');
            setResumeProcessed(true);
            setTimeout(() => navigate('/dashboard'), 1400);
        } catch (err: any) {
            const status = err.response?.status;
            const serverMsg = err.response?.data?.message || err.response?.data?.error || 'Something went wrong.';
            let displayError = `Server Error: ${serverMsg}`;
            if (status === 400) {
                displayError = `⚠️ ${serverMsg}\n\nTip: Try saving your CV as a plain text-based PDF (not a scanned image).`;
            }
            setUploadError(displayError);
            setUploadState('error');
        }
    };

    const handleSkip = () => navigate('/dashboard');

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0b14] px-4 py-12">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative w-full max-w-lg z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-4">
                        <span>One last step</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Upload Your Resume</h1>
                    <p className="text-white/50 text-base">
                        We'll analyze it with AI to generate your ATS score, skill profile, and personalized recommendations.
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#3B82F6] rounded-2xl blur opacity-20" />
                    <div className="relative bg-[#12131b]/80 border border-white/[0.08] rounded-2xl backdrop-blur-xl p-8 shadow-2xl">

                        {/* Drop Zone */}
                        {uploadState !== 'done' && (
                            <div
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 ${isDragging
                                        ? 'border-indigo-400 bg-indigo-500/10'
                                        : resumeFile
                                            ? 'border-indigo-400/60 bg-indigo-500/5'
                                            : 'border-white/20 hover:border-white/40 hover:bg-white/[0.03]'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileInput}
                                />
                                {resumeFile ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <FileText size={40} className="text-indigo-400" />
                                        <p className="text-white font-semibold">{resumeFile.name}</p>
                                        <p className="text-white/40 text-sm">{(resumeFile.size / 1024).toFixed(1)} KB — Click to change</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <Upload size={40} className="text-white/30" />
                                        <p className="text-white/70 font-medium">Drag & drop your PDF here</p>
                                        <p className="text-white/40 text-sm">or click to browse · Max 5MB</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Uploading State */}
                        {uploadState === 'uploading' && (
                            <div className="mt-6 flex flex-col items-center gap-3 text-white/70">
                                <Loader2 size={32} className="animate-spin text-indigo-400" />
                                <p className="text-sm">Analyzing your resume with AI...</p>
                                <p className="text-xs text-white/40">Extracting skills, ATS score, market gaps — ~15 seconds</p>
                            </div>
                        )}

                        {/* Done State */}
                        <AnimatePresence>
                            {uploadState === 'done' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-6 flex flex-col items-center gap-3"
                                >
                                    <CheckCircle2 size={48} className="text-emerald-400" />
                                    <p className="text-white font-semibold text-lg">Resume analyzed!</p>
                                    <p className="text-white/50 text-sm">Redirecting to your dashboard...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error State */}
                        {uploadState === 'error' && (
                            <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300 whitespace-pre-line">
                                {uploadError}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button
                                        onClick={() => { setUploadState('idle'); setUploadError(null); }}
                                        className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 text-xs transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={handleSkip}
                                        className="px-4 py-1.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs transition-colors"
                                    >
                                        Go to Dashboard anyway →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {uploadState !== 'done' && (
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                                <button
                                    onClick={handleSkip}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-white/40 hover:text-white/70 transition-colors"
                                >
                                    <SkipForward size={14} /> Skip for now
                                </button>

                                <button
                                    onClick={handleUpload}
                                    disabled={!resumeFile || uploadState === 'uploading'}
                                    className={`relative h-11 px-8 rounded-full font-semibold text-sm transition-all duration-300 ${!resumeFile || uploadState === 'uploading'
                                            ? 'opacity-40 cursor-not-allowed bg-white/10 text-white/40'
                                            : 'text-white hover:scale-[1.03]'
                                        }`}
                                >
                                    {resumeFile && uploadState !== 'uploading' && (
                                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#3B82F6]" />
                                    )}
                                    <span className="relative flex items-center gap-2">
                                        {uploadState === 'uploading' ? (
                                            <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
                                        ) : (
                                            'Analyze Resume'
                                        )}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResumeUpload;

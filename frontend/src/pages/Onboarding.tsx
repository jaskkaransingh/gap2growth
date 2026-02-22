import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ShaderBackground } from '../components/ui/neural-network-hero';
import { useAuthStore } from '../store/useAuthStore';
import { Upload, FileText, CheckCircle2, Loader2, ArrowRight, SkipForward } from 'lucide-react';

type Question = {
    id: string;
    title: string;
    subtitle: string;
    options: { label: string; value: string; icon?: string }[];
};

const questions: Question[] = [
    {
        id: 'interest',
        title: 'What is your primary tech interest?',
        subtitle: 'Let us customize your roadmap.',
        options: [
            { label: 'Frontend & UI Engineering', value: 'frontend', icon: '🎨' },
            { label: 'Backend & Systems', value: 'backend', icon: '⚙️' },
            { label: 'AI & Machine Learning', value: 'ai', icon: '🧠' },
            { label: 'Cloud & DevOps', value: 'cloud', icon: '☁️' },
        ]
    },
    {
        id: 'level',
        title: 'What\'s your current skill level?',
        subtitle: 'Be honest, we start from where you are.',
        options: [
            { label: 'Absolute Beginner', value: 'beginner', icon: '🌱' },
            { label: 'Some Experience (Junior)', value: 'junior', icon: '🚀' },
            { label: 'Solid Foundation (Mid)', value: 'mid', icon: '⚡' },
            { label: 'Advanced / Senior', value: 'senior', icon: '👑' },
        ]
    },
    {
        id: 'goal',
        title: 'What is your primary goal?',
        subtitle: 'What are we working towards?',
        options: [
            { label: 'Land my first tech job', value: 'first_job', icon: '💼' },
            { label: 'Upskill for a promotion', value: 'promotion', icon: '📈' },
            { label: 'Switch specializations', value: 'switch', icon: '🔄' },
            { label: 'Just learning for fun', value: 'fun', icon: '🎮' },
        ]
    },
    {
        id: 'style',
        title: 'How do you prefer to learn?',
        subtitle: 'We will adapt the content to your style.',
        options: [
            { label: 'Video Courses & Tutorials', value: 'video', icon: '📺' },
            { label: 'Reading Docs & Articles', value: 'reading', icon: '📚' },
            { label: 'Building Projects', value: 'projects', icon: '🛠️' },
            { label: 'Interactive Quizzes', value: 'quizzes', icon: '✨' },
        ]
    }
];

// --- Resume Upload Step ---
const RESUME_STEP = questions.length; // index 4

export const Onboarding: React.FC = () => {
    const { user, hasCompletedOnboarding, completeOnboarding, setResumeProcessed } = useAuthStore();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Resume step state (kept for legacy but not used in quiz flow)
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isResumeStep = currentStep === RESUME_STEP;

    // When onboarding completes (now or on re-mount), navigate away
    useEffect(() => {
        if (hasCompletedOnboarding) {
            // hasCompletedOnboarding is the store-level flag set by completeOnboarding()
            if (user?.resumeProcessed) {
                navigate('/dashboard');
            } else {
                navigate('/upload-resume');
            }
        }
    }, [hasCompletedOnboarding]);

    // ── Question Handlers ──────────────────────────────────────
    const handleSelect = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleNext = async () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
            return;
        }
        // Last question — save answers and complete onboarding
        // Navigation is handled by the useEffect watching hasCompletedOnboarding
        setIsSaving(true);
        try {
            await api.post('/auth/onboarding', answers);
        } catch (err) {
            console.error('Onboarding save failed (non-fatal):', err);
        } finally {
            completeOnboarding(); // triggers useEffect → navigate
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    // ── Resume Handlers ────────────────────────────────────────
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

    const handleResumeUpload = async () => {
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
            completeOnboarding();
            setResumeProcessed(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1200);
        } catch (err: any) {
            const status = err.response?.status;
            const serverMsg = err.response?.data?.message || err.response?.data?.error || 'Something went wrong.';
            let displayError = `Server Error: ${serverMsg}`;
            if (status === 400) {
                // PDF was unreadable — give a clear hint
                displayError = `⚠️ ${serverMsg}\n\nTip: Try saving your CV as a plain PDF (not scanned/image). You can also proceed to the dashboard and upload later.`;
            }
            setUploadError(displayError);
            setUploadState('error');
        }
    };

    const handleSkipResume = () => {
        completeOnboarding();
        navigate('/dashboard');
    };

    // ── Render ─────────────────────────────────────────────────
    const currentQ = questions[currentStep];
    const canProceed = isResumeStep ? false : !!answers[currentQ?.id];
    const totalSteps = questions.length + 1; // 4 questions + 1 resume

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#12131b] text-white overflow-hidden font-sans selection:bg-white/20">
            <ShaderBackground />

            <div className="w-full max-w-2xl z-10 relative">
                {/* Progress Bar */}
                <div className="mb-8 max-w-md mx-auto">
                    <div className="flex justify-between text-xs text-white/50 mb-2 font-medium tracking-wide">
                        <span>Step {currentStep + 1} of {totalSteps}</span>
                        <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* ── Question Cards ── */}
                    {!isResumeStep && (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="relative"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#3B82F6] rounded-[2rem] blur opacity-20" />
                            <div className="relative bg-[#12131b]/60 border border-white/[0.08] rounded-[2rem] backdrop-blur-2xl p-8 md:p-12 shadow-2xl flex flex-col min-h-[400px]">

                                <div className="text-center mb-10">
                                    <h1 className="text-3xl md:text-4xl font-bold pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#818CF8] via-[#6366F1] to-[#3B82F6]">
                                        {currentQ.title}
                                    </h1>
                                    <p className="text-white/60 text-base">{currentQ.subtitle}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-center">
                                    {currentQ.options.map((opt) => {
                                        const isSelected = answers[currentQ.id] === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleSelect(currentQ.id, opt.value)}
                                                className={`relative group p-4 rounded-xl border text-left flex items-center gap-4 transition-all duration-300 ${isSelected
                                                    ? 'bg-white/[0.06] border-[#818CF8]/60 shadow-[0_0_20px_rgba(129,140,248,0.15)]'
                                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <span className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/10 to-transparent rounded-xl pointer-events-none" />
                                                )}
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 transition-colors ${isSelected ? 'bg-[#6366F1]/20 text-white' : 'bg-white/5 text-white/70 group-hover:bg-white/10'}`}>
                                                    {opt.icon}
                                                </div>
                                                <span className={`font-medium ${isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                                                    {opt.label}
                                                </span>
                                                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#818CF8]' : 'border-white/20 group-hover:border-white/40'}`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 bg-[#818CF8] rounded-full" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/5">
                                    <button
                                        onClick={handleBack}
                                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${currentStep === 0
                                            ? 'opacity-0 pointer-events-none'
                                            : 'text-white/60 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        ← Back
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        disabled={!canProceed || isSaving}
                                        className={`group relative h-11 px-8 rounded-full font-semibold text-sm transition-all duration-300 ${(!canProceed || isSaving)
                                            ? 'opacity-50 cursor-not-allowed bg-white/10 text-white/40'
                                            : 'text-white hover:scale-[1.05]'
                                            }`}
                                    >
                                        {(canProceed && !isSaving) && (
                                            <>
                                                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#3B82F6]" />
                                                <span className="absolute inset-x-0 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                            </>
                                        )}
                                        <span className="relative flex items-center gap-2">
                                            {isSaving ? 'Saving...' : (currentStep === questions.length - 1 ? 'Continue' : 'Continue')}
                                            {(!isSaving) && <ArrowRight size={14} />}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Resume Upload Step ── */}
                    {isResumeStep && (
                        <motion.div
                            key="resume"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="relative"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#3B82F6] rounded-[2rem] blur opacity-20" />
                            <div className="relative bg-[#12131b]/60 border border-white/[0.08] rounded-[2rem] backdrop-blur-2xl p-8 md:p-12 shadow-2xl">

                                <div className="text-center mb-8">
                                    <h1 className="text-3xl md:text-4xl font-bold pb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#818CF8] via-[#6366F1] to-[#3B82F6]">
                                        Upload Your Resume
                                    </h1>
                                    <p className="text-white/60 text-base">
                                        We'll analyze it with AI to generate your skill profile, ATS score, and personalized recommendations.
                                    </p>
                                </div>

                                {/* Drop Zone */}
                                {uploadState !== 'done' && (
                                    <div
                                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${isDragging
                                            ? 'border-[#818CF8] bg-[#6366F1]/10'
                                            : resumeFile
                                                ? 'border-[#818CF8]/60 bg-[#6366F1]/5'
                                                : 'border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04]'
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
                                                <FileText size={40} className="text-[#818CF8]" />
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

                                {/* Uploading / Done State */}
                                {uploadState === 'uploading' && (
                                    <div className="mt-6 flex flex-col items-center gap-3 text-white/70">
                                        <Loader2 size={32} className="animate-spin text-[#818CF8]" />
                                        <p className="text-sm">Analyzing your resume with AI...</p>
                                        <p className="text-xs text-white/40">Extracting skills, ATS score, market gaps — this takes ~15 seconds</p>
                                    </div>
                                )}

                                {uploadState === 'done' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-6 flex flex-col items-center gap-3"
                                    >
                                        <CheckCircle2 size={48} className="text-emerald-400" />
                                        <p className="text-white font-semibold text-lg">Resume analyzed successfully!</p>
                                        <p className="text-white/50 text-sm">Redirecting to your dashboard...</p>
                                    </motion.div>
                                )}

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
                                                onClick={() => { completeOnboarding(); navigate('/dashboard'); }}
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
                                            onClick={handleSkipResume}
                                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium text-white/40 hover:text-white/70 transition-colors"
                                        >
                                            <SkipForward size={14} /> Skip for now
                                        </button>

                                        <button
                                            onClick={handleResumeUpload}
                                            disabled={!resumeFile || uploadState === 'uploading'}
                                            className={`group relative h-11 px-8 rounded-full font-semibold text-sm transition-all duration-300 ${(!resumeFile || uploadState === 'uploading')
                                                ? 'opacity-50 cursor-not-allowed bg-white/10 text-white/40'
                                                : 'text-white hover:scale-[1.05]'
                                                }`}
                                        >
                                            {resumeFile && uploadState === 'idle' && (
                                                <>
                                                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#3B82F6]" />
                                                    <span className="absolute inset-x-0 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                                </>
                                            )}
                                            <span className="relative flex items-center gap-2">
                                                {uploadState === 'uploading' ? (
                                                    <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
                                                ) : (
                                                    <><Upload size={14} /> Analyze Resume</>
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

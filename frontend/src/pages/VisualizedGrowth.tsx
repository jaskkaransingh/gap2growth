import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import {
    Video,
    Sparkles,
    Loader2,
    Play,
    Download,
    RotateCcw,
    ShieldCheck,
    Trophy,
    Star,
    Zap
} from 'lucide-react';

export const VisualizedGrowth: React.FC = () => {
    const { user } = useAuthStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    // Map user skills to Manim payload
    const getSkillsData = () => {
        if (!user?.careerProfile?.skills) return { before: {}, after: {} };

        const { languages = [], frameworks = [], tools = [] } = user.careerProfile.skills;
        const allSkills = [...languages, ...frameworks, ...tools].slice(0, 5);

        const before: Record<string, number> = {};
        const after: Record<string, number> = {};

        allSkills.forEach(skill => {
            before[skill] = Math.floor(Math.random() * 4) + 2; // Mock before data
            after[skill] = Math.floor(Math.random() * 4) + 7;  // Mock after data
        });

        return { before, after };
    };

    const generateVideo = async () => {
        setIsGenerating(true);
        setError(null);
        setProgress(0);
        setVideoUrl(null);

        // Simulation of progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev;
                return prev + (Math.random() * 5);
            });
        }, 1000);

        try {
            const { before, after } = getSkillsData();
            const achievements = user?.careerProfile?.recommendations?.map(r => r.title).slice(0, 2) || ["Mastered Core Concepts"];

            const response = await fetch('http://127.0.0.1:8002/generate-growth-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: user?.name || 'Developer',
                    skills_before: before,
                    skills_after: after,
                    achievements: achievements,
                    certification_title: "AI-Powered Career Evolution"
                }),
            });

            if (!response.ok) throw new Error('Failed to generate video');

            const data = await response.json();
            if (data.error) throw new Error(data.details || data.error);

            // Manim backend returns video url relative to its media folder
            // Adding a cache-buster timestamp to ensure the latest render is fetched
            setVideoUrl(`http://127.0.0.1:8002${data.video_url}?t=${Date.now()}`);
            setProgress(100);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during rendering');
        } finally {
            clearInterval(interval);
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <header className="mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-4"
                >
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <Video className="text-indigo-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">Visualized Growth</h1>
                        <p className="text-white/50 text-sm mt-1">See your career transformation in motion through AI-generated animations.</p>
                    </div>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Video Player Area */}
                <div className="lg:col-span-8">
                    <div className="relative aspect-video bg-[#1a1b26]/50 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl group">
                        <AnimatePresence mode="wait">
                            {!videoUrl && !isGenerating ? (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <Play className="text-white/20 ml-1" size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Ready to Visualize?</h3>
                                    <p className="text-white/40 text-sm max-w-sm mb-8">
                                        We'll analyze your skills and create a high-quality Manim animation documenting your growth journey.
                                    </p>
                                    <button
                                        onClick={generateVideo}
                                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        <Sparkles size={18} /> Generate My Video
                                    </button>
                                </motion.div>
                            ) : isGenerating ? (
                                <motion.div
                                    key="generating"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-black/40 backdrop-blur-xl"
                                >
                                    <div className="relative w-32 h-32 mb-8">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="60"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="transparent"
                                                className="text-white/5"
                                            />
                                            <motion.circle
                                                cx="64"
                                                cy="64"
                                                r="60"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="transparent"
                                                strokeDasharray="377"
                                                initial={{ strokeDashoffset: 377 }}
                                                animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
                                                className="text-indigo-500"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-black text-white">{Math.round(progress)}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-300 font-bold mb-2">
                                        <Loader2 size={18} className="animate-spin" />
                                        Rendering Animation
                                    </div>
                                    <p className="text-white/40 text-sm animate-pulse">Manim is crafting your career story...</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="video"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black"
                                >
                                    <video
                                        src={videoUrl || ''}
                                        controls
                                        autoPlay
                                        muted
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/80 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest shadow-lg pointer-events-none animate-bounce">
                                        <Sparkles size={12} /> Render Complete
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm leading-relaxed">
                            <Zap size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Right: Info & Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-md">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest text-white/30 flex items-center gap-2">
                            <Sparkles size={14} className="text-indigo-400" />
                            Personalization
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <Trophy size={18} className="text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white/90">Skill Transformation</p>
                                    <p className="text-xs text-white/40 leading-relaxed">Visualizes the "before and after" of your core competencies.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Star size={18} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white/90">Achievement Radar</p>
                                    <p className="text-xs text-white/40 leading-relaxed">Charts your progress across 5 key industry domains.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck size={18} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white/90">Certification Card</p>
                                    <p className="text-xs text-white/40 leading-relaxed">Dynamic generation of your career master certification.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-md">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest text-white/30 flex items-center gap-2">
                            <Zap size={14} className="text-indigo-400" />
                            Actions
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                disabled={!videoUrl || isGenerating}
                                onClick={() => videoUrl && window.open(videoUrl, '_blank')}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download size={18} /> Download MP4
                            </button>
                            <button
                                onClick={generateVideo}
                                disabled={isGenerating}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white font-bold transition-all disabled:opacity-50"
                            >
                                <RotateCcw size={18} /> Regenerate
                            </button>
                        </div>

                        {/* Mini Preview Section */}
                        {videoUrl && (
                            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                                <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">Preview</p>
                                <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg aspect-video bg-black/50">
                                    <video
                                        src={videoUrl}
                                        autoPlay
                                        muted
                                        loop
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

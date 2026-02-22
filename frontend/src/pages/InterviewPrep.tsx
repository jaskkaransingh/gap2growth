import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    FileText,
    X,
    PlayCircle,
    ChevronRight,
    Sparkles,
    Brain,
    ShieldCheck,
    Clock,
    Star,
    Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import logo from '../assets/logo.png';

type InterviewMode = 'voice' | 'test' | null;

const FEATURES = [
    { icon: Brain, label: 'AI-Powered', desc: 'Gemini + GPT-4 driven questions tailored to your role' },
    { icon: Clock, label: 'Real-time', desc: 'Instant feedback on every answer as you speak' },
    { icon: Star, label: 'Scored', desc: 'Detailed category scores with actionable insights' },
    { icon: ShieldCheck, label: 'Proctored', desc: 'Anti-cheat mock tests mirroring real assessments' },
];

export const InterviewPrep: React.FC = () => {
    const token = useAuthStore(state => state.token);
    const user = useAuthStore(state => state.user);
    const [activeMode, setActiveMode] = useState<InterviewMode>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const BASE_URL = 'http://localhost:3000';

    const getIframeUrl = (mode: InterviewMode) => {
        const path = mode === 'voice' ? '/interview' : '/mock-test';
        return `${BASE_URL}${path}?token=${token || ''}`;
    };

    const openMode = (mode: InterviewMode) => {
        setIframeLoaded(false);
        setActiveMode(mode);
    };

    const closeMode = () => {
        setActiveMode(null);
        setIframeLoaded(false);
    };

    return (
        <div className="relative min-h-screen text-white">

            {/* ── Hero Section ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10 flex items-center justify-between gap-6"
            >
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#8B5CF6] to-[#2DD4BF] rounded-lg blur opacity-30" />
                            <img src={logo} alt="G2G" className="w-9 h-9 object-contain relative" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
                                G2G
                            </span>
                            <Sparkles size={14} className="text-teal-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2 leading-tight">
                        Mock Interview <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Studio</span>
                    </h1>
                    <p className="text-white/50 text-base max-w-xl leading-relaxed">
                        Practice with an AI interviewer, get instant scored feedback, and land your next role with confidence.
                    </p>
                </div>

                {/* Live badge */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Live</span>
                </div>
            </motion.div>

            {/* ── Feature Pills ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
            >
                {FEATURES.map(({ icon: Icon, label, desc }) => (
                    <div
                        key={label}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300"
                    >
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mt-0.5">
                            <Icon size={15} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white mb-0.5">{label}</p>
                            <p className="text-[11px] text-white/40 leading-snug">{desc}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── Mode Cards ───────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

                {/* Voice Interview Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => openMode('voice')}
                    className="group relative p-8 bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-300"
                >
                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-blue-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Mic size={26} className="text-indigo-400" />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                <Zap size={11} className="text-indigo-400" />
                                <span className="text-[11px] font-bold text-indigo-400">VAPI Powered</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-2">AI Voice Interview</h2>
                        <p className="text-white/50 text-sm mb-6 leading-relaxed">
                            Have a real-time voice conversation with our AI interviewer. Get scored on communication, technical depth, and confidence.
                        </p>

                        <ul className="space-y-2 mb-7">
                            {['Real-time voice conversation', 'Role-specific questions', 'Detailed feedback report'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                                    <ChevronRight size={14} className="text-indigo-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.35)] text-sm">
                            <PlayCircle size={18} />
                            Start Voice Interview
                        </button>
                    </div>
                </motion.div>

                {/* Mock Test Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    onClick={() => openMode('test')}
                    className="group relative p-8 bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:border-purple-500/30 hover:bg-white/[0.05] transition-all duration-300"
                >
                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-2xl border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <FileText size={26} className="text-purple-400" />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                <ShieldCheck size={11} className="text-purple-400" />
                                <span className="text-[11px] font-bold text-purple-400">Proctored</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-2">Mock Proctored Test</h2>
                        <p className="text-white/50 text-sm mb-6 leading-relaxed">
                            A fully proctored mock assessment with anti-cheat features, simulating the real hiring test experience.
                        </p>

                        <ul className="space-y-2 mb-7">
                            {['Anti-cheat monitoring', 'Timed assessments', 'Instant score breakdown'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                                    <ChevronRight size={14} className="text-purple-400 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] text-sm">
                            <FileText size={18} />
                            Start Mock Test
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* ── Tips Strip ───────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-5 bg-gradient-to-r from-indigo-500/5 via-teal-500/5 to-transparent border border-white/8 rounded-2xl flex items-center gap-4"
            >
                <div className="shrink-0 w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-teal-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white mb-0.5">Pro Tip</p>
                    <p className="text-xs text-white/50 leading-relaxed">
                        Complete at least 3 mock interviews before applying. Users who do this get <span className="text-teal-400 font-bold">2.4× more callbacks</span> on average.
                    </p>
                </div>
            </motion.div>

            {/* ── Embedded Interview Panel (Fullscreen Overlay) ── */}
            <AnimatePresence>
                {activeMode && (
                    <motion.div
                        key="interview-panel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col"
                    >
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-[#12131b]/95 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="G2G" className="w-7 h-7 object-contain" />
                                <div>
                                    <p className="text-sm font-black text-white">
                                        {activeMode === 'voice' ? 'AI Voice Interview' : 'Mock Proctored Test'}
                                    </p>
                                    <p className="text-xs text-white/40">
                                        {user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'G2G Interview Studio'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {!iframeLoaded && (
                                    <div className="flex items-center gap-2 text-xs text-white/40">
                                        <div className="w-3 h-3 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
                                        Loading…
                                    </div>
                                )}
                                <button
                                    onClick={closeMode}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all"
                                >
                                    <X size={14} />
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* iFrame */}
                        <div className="flex-1 relative">
                            {!iframeLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#0c0d14] z-10">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-2xl blur opacity-20 animate-pulse" />
                                            <img src={logo} alt="G2G" className="w-14 h-14 object-contain relative" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-bold text-base mb-1">Starting Interview Studio</p>
                                            <p className="text-white/40 text-xs">Make sure the interview server is running on port 3000</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2].map(i => (
                                                <div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                                                    style={{ animationDelay: `${i * 0.15}s` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <iframe
                                src={getIframeUrl(activeMode)}
                                className="w-full h-full border-0"
                                title="G2G Interview Studio"
                                allow="microphone; camera"
                                onLoad={() => setIframeLoaded(true)}
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

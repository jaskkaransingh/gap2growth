import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { GlassCard } from '../components/ui/GlassCard';
import {
    ArrowLeft, Code2, Layers, Wrench, Heart,
    TrendingUp, TrendingDown, Minus, Loader2,
    Award, Target, Zap, Mail, User,
} from 'lucide-react';

// ─── Skill pill with optional demand badge ──────────────────────────────────────
const SkillPill: React.FC<{ name: string; demand?: string; color: string; bg: string }> = ({ name, demand, color, bg }) => (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 cursor-default"
        style={{ background: bg, border: `1px solid ${color}25`, color }}>
        {name}
        {demand === 'High' && <TrendingUp size={11} className="text-emerald-400 shrink-0" />}
        {demand === 'Medium' && <Minus size={11} className="text-amber-400 shrink-0" />}
        {demand === 'Low' && <TrendingDown size={11} className="text-red-400 shrink-0" />}
    </div>
);

// ─── Animated score ring ────────────────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; color: string; label: string }> = ({ score, color, label }) => {
    const r = 34;
    const circ = 2 * Math.PI * r;
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
                    <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
                        strokeLinecap="round" strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
                        transition={{ duration: 1.1, ease: 'easeOut' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-white">{score}</span>
                </div>
            </div>
            <span className="text-xs text-white/40">{label}</span>
        </div>
    );
};

// ─── Profile Page ───────────────────────────────────────────────────────────────
export const Profile: React.FC = () => {
    const { user, setCareerProfile } = useAuthStore();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(
        user?.careerProfile ? { careerProfile: user.careerProfile, marketTrends: {} } : null
    );
    const [loading, setLoading] = useState(!user?.careerProfile);

    useEffect(() => {
        api.get('/auth/me')
            .then(res => {
                setData(res.data);
                if (res.data.careerProfile) setCareerProfile(res.data.careerProfile);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const cp = data?.careerProfile || {};
    const metrics = cp.metrics || {};
    const skills = cp.skills || {};
    const mt = data?.marketTrends || {};

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const expEmoji =
        metrics.experienceLevel === 'Senior' || metrics.experienceLevel === 'Lead' ? '👑'
            : metrics.experienceLevel === 'Mid-Level' ? '⚡' : '🌱';

    const skillCategories = [
        { label: 'Languages', icon: Code2, color: '#A78BFA', bg: 'rgba(124,58,237,0.12)', items: skills.languages || [] },
        { label: 'Frameworks', icon: Layers, color: '#2DD4BF', bg: 'rgba(20,184,166,0.1)', items: skills.frameworks || [] },
        { label: 'Tools & Platforms', icon: Wrench, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', items: skills.tools || [] },
        { label: 'Soft Skills', icon: Heart, color: '#F472B6', bg: 'rgba(244,114,182,0.1)', items: skills.softSkills || [] },
    ];

    const totalSkills = (skills.languages?.length ?? 0) + (skills.frameworks?.length ?? 0) + (skills.tools?.length ?? 0);

    return (
        <div className="min-h-full py-10 px-4 md:px-8 max-w-5xl mx-auto">

            {/* Back button */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-8 group"
            >
                <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-1" />
                Back to Dashboard
            </motion.button>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">My Profile</h1>
                <p className="text-white/35 mt-1 text-sm">Your skills and career snapshot from resume analysis.</p>
            </motion.div>

            {loading && !data ? (
                <div className="flex items-center gap-3 text-white/40 mt-12 justify-center">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Loading profile...</span>
                </div>
            ) : !data?.careerProfile ? (
                <div className="text-center py-20">
                    <p className="text-white/30 text-lg">No resume data yet.</p>
                    <p className="text-white/20 text-sm mt-2">Upload your resume from the dashboard first.</p>
                    <button onClick={() => navigate('/dashboard')}
                        className="mt-6 px-6 py-2 rounded-full text-sm font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)' }}>
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                <div className="space-y-6">

                    {/* ── Row 1: Identity + Scores ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* Identity */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                            <GlassCard className="!p-6 h-full" hoverEffect={false}>
                                <div className="flex flex-col items-center gap-3 pb-5 border-b border-white/[0.05]">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(45,212,191,0.4))',
                                                border: '2px solid rgba(139,92,246,0.35)',
                                                boxShadow: '0 0 24px rgba(124,58,237,0.25)',
                                                color: '#fff',
                                            }}>
                                            {initials}
                                        </div>
                                        {metrics.experienceLevel && (
                                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                                                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                {expEmoji}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-lg font-bold text-white">{user?.name || 'User'}</h2>
                                        {metrics.experienceLevel && (
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-block"
                                                style={{ background: 'rgba(124,58,237,0.18)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.25)' }}>
                                                {metrics.experienceLevel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2.5">
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <User size={13} className="text-white/25 shrink-0" />
                                        <span className="text-white/55 truncate">{user?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Mail size={13} className="text-white/25 shrink-0" />
                                        <span className="text-white/55 truncate">{user?.email}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Score rings + stat chips */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="lg:col-span-2 space-y-4">

                            {/* Rings */}
                            <GlassCard className="!p-5" hoverEffect={false}>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Score Overview</p>
                                <div className="flex items-center justify-around">
                                    <ScoreRing score={metrics.skillHealth ?? 0} color="#A78BFA" label="ATS Score" />
                                    <div className="w-px h-16 bg-white/[0.06]" />
                                    <ScoreRing score={metrics.marketRelevance ?? 0} color="#2DD4BF" label="Market Match" />
                                    <div className="w-px h-16 bg-white/[0.06]" />
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                                            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                                            {expEmoji}
                                        </div>
                                        <span className="text-xs text-white/40">{metrics.experienceLevel || 'N/A'}</span>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Stat chips */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'ATS Score', value: metrics.skillHealth ?? '—', icon: Award, color: '#A78BFA' },
                                    { label: 'Market Match', value: `${metrics.marketRelevance ?? '—'}%`, icon: Target, color: '#2DD4BF' },
                                    { label: 'Total Skills', value: totalSkills, icon: Zap, color: '#60A5FA' },
                                ].map(stat => (
                                    <GlassCard key={stat.label} className="!p-3.5" hoverEffect>
                                        <stat.icon size={15} style={{ color: stat.color }} className="mb-2" />
                                        <p className="text-xl font-black text-white">{stat.value}</p>
                                        <p className="text-xs text-white/35 mt-0.5">{stat.label}</p>
                                    </GlassCard>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Row 2: Skills by category ── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <h2 className="text-base font-bold text-white mb-4">Skills from Your Resume</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {skillCategories.map(cat => (
                                <GlassCard key={cat.label} className="!p-5" hoverEffect={false}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <cat.icon size={14} style={{ color: cat.color }} />
                                        <h3 className="text-sm font-bold text-white">{cat.label}</h3>
                                        <span className="ml-auto text-xs text-white/25">{cat.items.length}</span>
                                    </div>
                                    {cat.items.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {cat.items.map((skill: string, i: number) => (
                                                <SkillPill
                                                    key={i} name={skill}
                                                    demand={mt[skill]?.activeJobs}
                                                    color={cat.color} bg={cat.bg}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-white/20 text-xs">None detected.</p>
                                    )}
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>

                </div>
            )}
        </div>
    );
};

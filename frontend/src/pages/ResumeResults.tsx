import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    RadarChart, PolarGrid, PolarAngleAxis, Radar,
    ResponsiveContainer, Tooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
    Activity, Target, Zap, Award, AlertTriangle,
    CheckCircle2, ArrowRight, LayoutDashboard, Code, Wrench, Heart,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CareerProfile {
    personalInfo?: { name?: string; email?: string; phone?: string };
    skills?: {
        languages?: string[];
        frameworks?: string[];
        tools?: string[];
        softSkills?: string[];
    };
    metrics?: {
        skillHealth?: number;
        marketRelevance?: number;
        experienceLevel?: string;
    };
    gaps?: string[];
    recommendations?: { title: string; reason: string }[];
}

// ─── Score Ring ────────────────────────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; label: string; color: string }> = ({ score, label, color }) => {
    const r = 44;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                    <circle
                        cx="50" cy="50" r={r} fill="none"
                        stroke={color} strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-white">{score}</span>
                </div>
            </div>
            <span className="text-xs font-medium text-white/50 text-center">{label}</span>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const ResumeResults: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Profile data passed via navigate state or read from storage
    const profile: CareerProfile = location.state?.profile || {};

    const metrics = profile.metrics || {};
    const skills = profile.skills || {};
    const gaps = profile.gaps || [];
    const recommendations = profile.recommendations || [];

    // ── Radar chart data ──
    const radarData = [
        ...(skills.languages || []).map(s => ({ subject: s, A: 100 })),
        ...(skills.frameworks || []).map(s => ({ subject: s, A: 90 })),
        ...(skills.tools || []).map(s => ({ subject: s, A: 75 })),
    ].slice(0, 7);

    const effectiveRadar = radarData.length > 2 ? radarData : [
        { subject: 'React', A: 90 }, { subject: 'Node', A: 80 },
        { subject: 'Python', A: 70 }, { subject: 'Docker', A: 65 },
        { subject: 'SQL', A: 85 },
    ];

    // ── Simulated growth trend (based on skill health score) ──
    const base = metrics.skillHealth || 65;
    const growthData = [
        { month: 'Before', score: Math.max(base - 25, 30) },
        { month: 'Target', score: Math.min(base + 15, 99) },
    ];

    const skillHealth = metrics.skillHealth ?? 0;
    const marketRelevance = metrics.marketRelevance ?? 0;
    const totalSkills = (skills.languages?.length ?? 0) + (skills.frameworks?.length ?? 0) + (skills.tools?.length ?? 0);

    const statCards = [
        { label: 'ATS Score', value: `${skillHealth}%`, icon: Activity, color: '#A78BFA', bg: 'rgba(124,58,237,0.15)', desc: skillHealth >= 70 ? 'Pass threshold' : 'Needs improvement' },
        { label: 'Market Match', value: `${marketRelevance}%`, icon: Target, color: '#2DD4BF', bg: 'rgba(20,184,166,0.12)', desc: 'Industry relevance' },
        { label: 'Experience Level', value: metrics.experienceLevel || 'N/A', icon: Zap, color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', desc: 'Current tier' },
        { label: 'Total Skills', value: totalSkills.toString(), icon: Award, color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', desc: 'Detected from resume' },
    ];

    return (
        <div className="min-h-full py-10 px-6 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Analysis Complete</p>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        Your{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #A78BFA 0%, #6366F1 50%, #2DD4BF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>Resume Report</span>
                    </h1>
                    {profile.personalInfo?.name && (
                        <p className="text-white/50 mt-1">Analyzed for: <span className="text-white/70 font-medium">{profile.personalInfo.name}</span></p>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dashboard')}
                    className="group relative h-12 px-8 rounded-full font-bold text-white flex items-center gap-2 shrink-0"
                >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#6366F1]" />
                    <span className="absolute inset-x-0 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <span className="relative flex items-center gap-2">
                        <LayoutDashboard size={16} /> Go to Dashboard
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                </motion.button>
            </motion.div>

            {/* Score Rings */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
            >
                <GlassCard className="!p-6">
                    <div className="flex flex-wrap items-center justify-around gap-8">
                        <ScoreRing score={skillHealth} label="ATS Score" color="#A78BFA" />
                        <div className="hidden md:block w-px h-20 bg-white/10" />
                        <ScoreRing score={marketRelevance} label="Market Relevance" color="#2DD4BF" />
                        <div className="hidden md:block w-px h-20 bg-white/10" />
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                                style={{ background: 'rgba(251,191,36,0.12)', border: '2px solid rgba(251,191,36,0.3)' }}>
                                {metrics.experienceLevel === 'Senior' ? '👑' : metrics.experienceLevel === 'Mid-Level' ? '⚡' : '🌱'}
                            </div>
                            <span className="text-xs font-medium text-white/50 text-center">Experience</span>
                            <span className="text-sm font-bold text-white">{metrics.experienceLevel || 'N/A'}</span>
                        </div>
                        <div className="hidden md:block w-px h-20 bg-white/10" />
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center"
                                style={{ background: 'rgba(96,165,250,0.12)', border: '2px solid rgba(96,165,250,0.3)' }}>
                                <span className="text-3xl font-black text-white">{totalSkills}</span>
                            </div>
                            <span className="text-xs font-medium text-white/50">Total Skills</span>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Stat Cards */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {statCards.map((s, i) => (
                    <GlassCard key={i} hoverEffect className="!p-5">
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-white/50 text-xs font-medium uppercase tracking-wide">{s.label}</span>
                            <div className="p-2 rounded-lg" style={{ background: s.bg }}>
                                <s.icon size={16} style={{ color: s.color }} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                        <p className="text-xs text-white/40 mt-1">{s.desc}</p>
                    </GlassCard>
                ))}
            </motion.div>

            {/* Charts Row */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                {/* Growth Trajectory */}
                <GlassCard className="lg:col-span-2 !p-6">
                    <h3 className="text-base font-bold text-white mb-1">Skill Health Score</h3>
                    <p className="text-xs text-white/40 mb-4">Current vs. potential with upskilling</p>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="col" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="month" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '10px', color: '#fff' }} />
                                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fill="url(#col)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Skills Radar */}
                <GlassCard className="!p-6">
                    <h3 className="text-base font-bold text-white mb-1">Skill Radar</h3>
                    <p className="text-xs text-white/40 mb-4">Top detected technologies</p>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={effectiveRadar}>
                                <PolarGrid stroke="#ffffff15" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 10 }} />
                                <Radar name="Skills" dataKey="A" stroke="#2DD4BF" strokeWidth={2} fill="#2DD4BF" fillOpacity={0.2} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '10px', color: '#fff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Skills Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {[
                    { label: 'Languages', items: skills.languages || [], icon: Code, color: '#A78BFA', bg: 'rgba(124,58,237,0.1)' },
                    { label: 'Frameworks', items: skills.frameworks || [], icon: Activity, color: '#2DD4BF', bg: 'rgba(20,184,166,0.1)' },
                    { label: 'Tools', items: skills.tools || [], icon: Wrench, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
                    { label: 'Soft Skills', items: skills.softSkills || [], icon: Heart, color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
                ].map((cat, i) => (
                    <GlassCard key={i} className="!p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg" style={{ background: cat.bg }}>
                                <cat.icon size={14} style={{ color: cat.color }} />
                            </div>
                            <h4 className="text-sm font-bold text-white">{cat.label}</h4>
                        </div>
                        {cat.items.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {cat.items.map((item, j) => (
                                    <span key={j} className="text-xs px-2 py-1 rounded-full text-white/70 font-medium"
                                        style={{ background: cat.bg, border: `1px solid ${cat.color}30` }}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/30 text-xs">None detected</p>
                        )}
                    </GlassCard>
                ))}
            </motion.div>

            {/* Skill Gaps */}
            {gaps.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <GlassCard className="!p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={18} className="text-amber-400" />
                            <h3 className="text-base font-bold text-white">Skill Gaps to Close</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {gaps.map((gap, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium text-amber-300"
                                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
                                    {gap}
                                </span>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                >
                    <GlassCard className="!p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <CheckCircle2 size={18} className="text-[#A78BFA]" />
                            <h3 className="text-base font-bold text-white">AI Recommendations</h3>
                        </div>
                        <div className="space-y-3">
                            {recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-[#A78BFA]"
                                        style={{ background: 'rgba(124,58,237,0.15)' }}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{rec.title}</p>
                                        <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{rec.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Bottom CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex justify-center pb-4"
            >
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dashboard')}
                    className="group relative h-14 px-12 rounded-full font-bold text-white flex items-center gap-3 text-base"
                >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#2DD4BF]" />
                    <span className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-[#7C3AED]/40 to-[#2DD4BF]/30 scale-90" />
                    <span className="absolute inset-x-0 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <span className="relative flex items-center gap-2">
                        <LayoutDashboard size={18} /> Go to Dashboard
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                </motion.button>
            </motion.div>
        </div>
    );
};

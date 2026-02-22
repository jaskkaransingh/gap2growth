import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import {
    ShieldAlert, TrendingUp, BookOpen, Loader2, Code2,
    Layers, Wrench, Cpu, RefreshCw, Flame, Clock,
    CheckCircle2, ArrowRight, Trophy, ZapIcon, BarChart2, AlertTriangle, Map,
} from 'lucide-react';

// Real brand SVG icons from Simple Icons
import {
    SiRust, SiGo, SiNextdotjs, SiKubernetes, SiOpenai,
    SiTerraform, SiTypescript, SiFastapi,
    SiDocker, SiAmazonwebservices, SiGraphql, SiGithubactions,
    SiPostgresql, SiRedis, SiReact, SiPython, SiJavascript,
    SiNodedotjs, SiAngular, SiVuedotjs, SiDjango,
} from 'react-icons/si';

import { GlassCard } from '../components/ui/GlassCard';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

/* ─── Brand icon registry ─────────────────────────────────────── */
const BRAND_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
    'Rust': SiRust,
    'Go': SiGo,
    'Next.js': SiNextdotjs,
    'Kubernetes': SiKubernetes,
    'LLM APIs': SiOpenai,
    'Terraform': SiTerraform,
    'TypeScript': SiTypescript,
    'FastAPI': SiFastapi,
    'Docker': SiDocker,
    'AWS': SiAmazonwebservices,
    'GraphQL': SiGraphql,
    'CI/CD': SiGithubactions,
    'PostgreSQL': SiPostgresql,
    'Redis': SiRedis,
    'React': SiReact,
    'Python': SiPython,
    'JavaScript': SiJavascript,
    'Node.js': SiNodedotjs,
    'Angular': SiAngular,
    'Vue': SiVuedotjs,
    'Django': SiDjango,
};

const getBrandIcon = (name: string) => {
    // Exact match
    if (BRAND_ICONS[name]) return BRAND_ICONS[name];
    // Partial match
    const key = Object.keys(BRAND_ICONS).find(k => name.toLowerCase().includes(k.toLowerCase()));
    return key ? BRAND_ICONS[key] : null;
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const getRisk = (skillHealth: number) => {
    if (skillHealth >= 75) return { label: 'Low', color: 'text-emerald-400', stroke: '#34d399', pct: 20 };
    if (skillHealth >= 50) return { label: 'Medium', color: 'text-yellow-400', stroke: '#facc15', pct: 50 };
    return { label: 'High', color: 'text-red-400', stroke: '#f87171', pct: 80 };
};

const SKILL_TAG_COLORS: Record<string, string> = {
    languages: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    frameworks: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    tools: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    softSkills: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
};

const LEARNING_MAP: Record<string, { time: string; resource: string; level: string }> = {
    'Docker': { time: '3 weeks', resource: 'Docker Official Docs + Play with Docker', level: 'Beginner' },
    'Kubernetes': { time: '6 weeks', resource: 'KubeAcademy + CKA Certification', level: 'Intermediate' },
    'TypeScript': { time: '2 weeks', resource: 'TypeScript Official Handbook', level: 'Beginner' },
    'AWS': { time: '8 weeks', resource: 'AWS Cloud Practitioner / SAA Cert', level: 'Intermediate' },
    'GraphQL': { time: '3 weeks', resource: 'GraphQL.org + Apollo Studio', level: 'Beginner' },
    'System Design': { time: '10 weeks', resource: 'Grokking System Design Interview', level: 'Advanced' },
    'CI/CD': { time: '3 weeks', resource: 'GitHub Actions + Jenkins Pipeline', level: 'Intermediate' },
    'PostgreSQL': { time: '4 weeks', resource: 'PostgreSQL Tutorial + pgExercises', level: 'Beginner' },
    'Redis': { time: '2 weeks', resource: 'Redis University (free)', level: 'Beginner' },
    'Terraform': { time: '4 weeks', resource: 'HashiCorp Learn + Terraform Docs', level: 'Intermediate' },
};

const TRENDING_TECH = [
    { name: 'Rust', demand: 94, hot: true },
    { name: 'Go', demand: 88, hot: true },
    { name: 'Next.js', demand: 91, hot: false },
    { name: 'Kubernetes', demand: 87, hot: false },
    { name: 'LLM APIs', demand: 99, hot: true },
    { name: 'Terraform', demand: 82, hot: false },
    { name: 'TypeScript', demand: 96, hot: false },
    { name: 'FastAPI', demand: 85, hot: true },
];

/* ─── Animated SVG Dial ───────────────────────────────────────── */
const ScoreDial: React.FC<{ value: number; label: string; color: string; size?: number }> = ({
    value, label, color, size = 120,
}) => {
    const r = 44;
    const circ = 2 * Math.PI * r;
    const dash = (value / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#ffffff10" strokeWidth="8" />
                <motion.circle
                    cx="50" cy="50" r={r}
                    fill="none" stroke={color} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDashoffset={circ / 4}
                    initial={{ strokeDasharray: `0 ${circ}` }}
                    animate={{ strokeDasharray: `${dash} ${circ}` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
                <text x="50" y="54" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
                    {value}%
                </text>
            </svg>
            <p className="text-xs text-white/50 text-center">{label}</p>
        </div>
    );
};

export const SkillAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'gaps' | 'learning'>('overview');

    useEffect(() => {
        api.get('/auth/me')
            .then(res => setProfile(res.data?.careerProfile || null))
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-white/40">
            <Loader2 size={36} className="animate-spin text-indigo-400" />
            <p>Analyzing your skills…</p>
        </div>
    );

    if (!profile) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-white/40 text-center">
            <ShieldAlert size={48} className="text-white/20" />
            <p className="text-lg font-medium text-white/60">No resume data yet</p>
            <p className="text-sm">Upload your resume to unlock skill analysis.</p>
            <button
                onClick={() => navigate('/upload-resume')}
                className="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:scale-105 transition-transform"
            >
                Upload Resume
            </button>
        </div>
    );

    const metrics = profile.metrics || {};
    const skills = profile.skills || {};
    const gaps: string[] = profile.gaps || [];
    const recommendations: { title: string; reason: string }[] = profile.recommendations || [];
    const risk = getRisk(metrics.skillHealth || 0);

    const gapData = gaps.map((g, i) => ({
        name: g.length > 16 ? g.slice(0, 14) + '…' : g,
        current: Math.max(10, 60 - i * 12),
        required: 85,
    }));

    const allSkills = [
        ...(skills.languages || []).map((s: string) => ({ subject: s, A: 100, fullMark: 150 })),
        ...(skills.frameworks || []).map((s: string) => ({ subject: s, A: 90, fullMark: 150 })),
        ...(skills.tools || []).map((s: string) => ({ subject: s, A: 80, fullMark: 150 })),
    ].slice(0, 8);

    const radarData = allSkills.length > 0 ? allSkills : [{ subject: 'No Data', A: 0, fullMark: 150 }];

    const skillCategories = [
        { label: 'Languages', icon: Code2, key: 'languages', color: SKILL_TAG_COLORS.languages },
        { label: 'Frameworks', icon: Layers, key: 'frameworks', color: SKILL_TAG_COLORS.frameworks },
        { label: 'Tools & Platforms', icon: Wrench, key: 'tools', color: SKILL_TAG_COLORS.tools },
        { label: 'Soft Skills', icon: Cpu, key: 'softSkills', color: SKILL_TAG_COLORS.softSkills },
    ];

    const strengthData = [
        { label: 'Languages', count: (skills.languages || []).length, max: 15, color: '#3b82f6' },
        { label: 'Frameworks', count: (skills.frameworks || []).length, max: 12, color: '#a855f7' },
        { label: 'Tools', count: (skills.tools || []).length, max: 15, color: '#06b6d4' },
    ];

    const totalSkills = strengthData.reduce((a, c) => a + c.count, 0);

    const TABS = [
        { id: 'overview', label: 'Overview', Icon: BarChart2 },
        { id: 'gaps', label: 'Gaps', Icon: AlertTriangle },
        { id: 'learning', label: 'Learning Path', Icon: Map },
    ] as const;

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Skill Analysis</h1>
                    <p className="text-white/40 mt-1">AI-powered deep dive into your technical profile</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                        <Code2 size={11} /> {totalSkills} skills detected
                    </div>
                    <button
                        onClick={() => navigate('/upload-resume')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50 hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw size={13} /> Update Resume
                    </button>
                </div>
            </motion.div>

            {/* Tab Bar — Lucide icons, no emoji */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
                className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl w-fit">
                {TABS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-white/40 hover:text-white/70'}`}
                    >
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </motion.div>

            {/* ─── TAB: Overview ─────────────────────────────────────── */}
            {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                    {/* Score Dials + Strength Bars */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <GlassCard>
                            <h3 className="text-sm font-bold text-white/60 mb-6">Performance Scores</h3>
                            <div className="flex items-center justify-around flex-wrap gap-6">
                                <ScoreDial value={metrics.skillHealth || 0} label="ATS / Skill Health" color="#6366f1" />
                                <ScoreDial value={metrics.marketRelevance || 0} label="Market Relevance" color="#34d399" />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-[120px] h-[120px] rounded-full border-8 flex items-center justify-center"
                                        style={{ borderColor: risk.stroke }}>
                                        <span className={`text-2xl font-bold ${risk.color}`}>{risk.label}</span>
                                    </div>
                                    <p className="text-xs text-white/50">Career Risk</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-sm font-bold text-white/60 mb-5">Skill Strength Breakdown</h3>
                            <div className="space-y-5">
                                {strengthData.map(({ label, count, max, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-white/60">{label}</span>
                                            <span className="text-white/40">{count}/{max}</span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: color }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((count / max) * 100, 100)}%` }}
                                                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                    <span className="text-white/40">Experience Level</span>
                                    <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                                        {metrics.experienceLevel || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Radar + Trending Tech */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <GlassCard>
                            <h3 className="text-sm font-bold text-white/60 mb-5">Competency Radar</h3>
                            <div className="h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                        <PolarGrid stroke="#ffffff12" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff55', fontSize: 11 }} />
                                        <Radar name="Skills" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.2} />
                                        <Tooltip contentStyle={{ backgroundColor: '#12131b', borderColor: '#ffffff12', borderRadius: '10px', color: '#fff', fontSize: 11 }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Trending Tech — real brand icons */}
                        <GlassCard>
                            <h3 className="text-sm font-bold text-white/60 mb-4 flex items-center gap-2">
                                <Flame size={14} className="text-orange-400" /> Trending in Job Market
                            </h3>
                            <div className="space-y-3">
                                {TRENDING_TECH.map(({ name, demand, hot }) => {
                                    const BrandIcon = getBrandIcon(name);
                                    const userHas = [
                                        ...(skills.languages || []),
                                        ...(skills.frameworks || []),
                                        ...(skills.tools || []),
                                    ].some((s: string) => s.toLowerCase().includes(name.toLowerCase()));
                                    return (
                                        <div key={name} className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 w-36 shrink-0">
                                                {BrandIcon
                                                    ? <BrandIcon size={16} className="text-white/60 shrink-0" />
                                                    : <Code2 size={14} className="text-white/30 shrink-0" />
                                                }
                                                <span className="text-xs text-white/70">{name}</span>
                                                {hot && <Flame size={10} className="text-orange-400" />}
                                            </div>
                                            <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${demand}%` }}
                                                    transition={{ duration: 0.8, delay: 0.1 }}
                                                />
                                            </div>
                                            <span className="text-xs text-white/30 w-8">{demand}%</span>
                                            {userHas
                                                ? <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                                : <div className="w-[13px] h-[13px] rounded-full border border-white/20 shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-white/20 mt-3 flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-emerald-400" /> = you have this skill
                            </p>
                        </GlassCard>
                    </div>

                    {/* Skill Tags by category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {skillCategories.map(({ label, icon: Icon, key, color }) => {
                            const list: string[] = skills[key] || [];
                            if (!list.length) return null;
                            return (
                                <GlassCard key={key}>
                                    <h3 className="text-xs font-bold text-white/50 mb-3 flex items-center gap-2">
                                        <Icon size={13} className="text-white/30" /> {label}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {list.map(skill => {
                                            const BrandIcon = getBrandIcon(skill);
                                            return (
                                                <span key={skill} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${color}`}>
                                                    {BrandIcon ? <BrandIcon size={11} /> : null}
                                                    {skill}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ─── TAB: Gaps ─────────────────────────────────────────── */}
            {activeTab === 'gaps' && (
                <motion.div key="gaps" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    {gapData.length > 0 ? (
                        <>
                            <GlassCard>
                                <h3 className="text-sm font-bold text-white/60 mb-5">Skill Gap vs. Market Requirement</h3>
                                <div style={{ height: Math.max(220, gapData.length * 52) }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={gapData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff08" />
                                            <XAxis type="number" stroke="#ffffff30" fontSize={11} domain={[0, 100]} />
                                            <YAxis dataKey="name" type="category" stroke="#ffffff50" fontSize={11} width={110} />
                                            <Tooltip contentStyle={{ backgroundColor: '#12131b', borderColor: '#ffffff12', borderRadius: '10px', color: '#fff', fontSize: 11 }} cursor={{ fill: '#ffffff05' }} />
                                            <Bar dataKey="current" name="Your Level" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                                            <Bar dataKey="required" name="Market Required" fill="#ffffff15" radius={[0, 4, 4, 0]} barSize={16} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </GlassCard>

                            <GlassCard className="border-red-500/15">
                                <h3 className="text-sm font-bold text-white/60 mb-4 flex items-center gap-2">
                                    <ShieldAlert size={14} className="text-red-400" /> Missing / Underdeveloped Skills
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {gaps.map(skill => {
                                        const BrandIcon = getBrandIcon(skill);
                                        return (
                                            <span key={skill} className="px-3 py-1 bg-red-500/10 text-red-300 rounded-full text-xs border border-red-500/20 flex items-center gap-1.5 group cursor-pointer hover:bg-red-500/20 transition-colors">
                                                {BrandIcon ? <BrandIcon size={11} /> : null}
                                                {skill}
                                                <BookOpen size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </span>
                                        );
                                    })}
                                </div>
                                <div className="p-3 bg-red-500/8 rounded-lg text-xs text-red-300/70 border border-red-500/12">
                                    Bridging these gaps can significantly improve your match rate for senior roles.
                                </div>
                            </GlassCard>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-white/30 text-sm gap-3">
                            <Trophy size={36} className="text-yellow-400/50" />
                            <p>No significant skill gaps detected — great profile!</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ─── TAB: Learning Path ────────────────────────────────── */}
            {activeTab === 'learning' && (
                <motion.div key="learning" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gaps.map((gap, i) => {
                            const info = LEARNING_MAP[gap] || { time: '4 weeks', resource: 'Online courses & official documentation', level: 'Intermediate' };
                            const BrandIcon = getBrandIcon(gap);
                            const levelColors: Record<string, string> = {
                                Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                Intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                                Advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
                            };
                            return (
                                <motion.div key={gap} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                    <GlassCard className="h-full">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                                                    {BrandIcon
                                                        ? <BrandIcon size={18} className="text-white/70" />
                                                        : <Code2 size={16} className="text-white/40" />}
                                                </div>
                                                <h3 className="text-sm font-bold text-white">{gap}</h3>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${levelColors[info.level] || levelColors.Intermediate}`}>
                                                {info.level}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                                            <Clock size={11} />
                                            <span>Est. {info.time} to proficiency</span>
                                        </div>
                                        <p className="text-xs text-white/50 mb-4">
                                            {info.resource}
                                        </p>
                                        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs hover:bg-indigo-500/20 transition-colors">
                                            <ZapIcon size={11} /> Start Learning <ArrowRight size={11} />
                                        </button>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>

                    {recommendations.length > 0 && (
                        <GlassCard>
                            <h3 className="text-sm font-bold text-white/60 mb-4 flex items-center gap-2">
                                <TrendingUp size={14} className="text-indigo-400" /> AI Action Plan
                            </h3>
                            <div className="space-y-3">
                                {recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 text-xs font-bold">{i + 1}</div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
                                            <p className="text-xs text-white/35 mt-0.5">{rec.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {gaps.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-white/30 gap-3">
                            <Trophy size={40} className="text-yellow-400/50" />
                            <p className="text-sm">No skill gaps found — you're on track!</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default SkillAnalysis;

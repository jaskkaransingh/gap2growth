import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Zap, BarChart3, Film, Target, Search, GitCompare, TrendingUp, Trophy } from 'lucide-react';
import { ShaderBackground } from '../components/ui/neural-network-hero';
import logo from '../assets/logo.png';
import awsLogo from '../assets/aws.png';
import dockerLogo from '../assets/docker.png';
import gitLogo from '../assets/git.png';
import nodeLogo from '../assets/node.png';
import pythonLogo from '../assets/python.png';
import reactLogo from '../assets/react.png';
import sqlLogo from '../assets/sql.png';
import tsLogo from '../assets/typescript.png';

const brandLogos = [
    awsLogo, dockerLogo, gitLogo, nodeLogo, pythonLogo, reactLogo, sqlLogo, tsLogo
];


const steps = [
    { number: '01', title: 'Analyze', desc: 'Take an adaptive assessment and upload your resume for AI parsing.', icon: <Search size={22} /> },
    { number: '02', title: 'Compare', desc: 'We benchmark your skills against current market demand.', icon: <GitCompare size={22} /> },
    { number: '03', title: 'Improve', desc: 'Receive a personalized roadmap with clear timelines and project guidance.', icon: <TrendingUp size={22} /> },
    { number: '04', title: 'Achieve', desc: 'Generate your AI-powered growth summary showcasing measurable progress.', icon: <Trophy size={22} /> },
];

const intelligencePoints = [
    'Skill gap percentage analysis',
    'Market demand comparison',
    'Improvement timeline estimation',
    'Before vs After tracking',
    'Project-based validation',
];

const growthPoints = [
    'Initial skill baseline',
    'Improvement milestones',
    'Projects completed',
    'Performance growth metrics',
    'Shareable career summary',
];

const differentiators = [
    { icon: <Zap size={18} className="text-[#818CF8]" />, title: 'Adaptive Intelligence', desc: 'Our system evolves with your progress.' },
    { icon: <BarChart3 size={18} className="text-[#818CF8]" />, title: 'Market Alignment', desc: 'Skills are measured against real industry benchmarks.' },
    { icon: <Film size={18} className="text-[#818CF8]" />, title: 'Visualized Growth', desc: 'See measurable transformation, not just course completion.' },
];

const gapItems = [
    { skill: 'System Design', current: 55, market: 90 },
    { skill: 'Machine Learning', current: 40, market: 80 },
    { skill: 'Docker / DevOps', current: 70, market: 88 },
    { skill: 'SQL & Databases', current: 80, market: 85 },
];

const summaryItems = [
    { label: 'Skill Baseline', value: 'Established', grad: 'from-[#4F46E5] to-[#6366F1]' },
    { label: 'Milestones Hit', value: '12 / 15', grad: 'from-[#6366F1] to-[#818CF8]' },
    { label: 'Projects Validated', value: '4 Projects', grad: 'from-[#818CF8] to-[#3B82F6]' },
    { label: 'Growth Score', value: '+34%', grad: 'from-[#3B82F6] to-[#6366F1]' },
];

// Shared animation preset
const anim = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#818CF8] mb-3">
        <span className="w-4 h-px bg-[#818CF8]/60" />{children}<span className="w-4 h-px bg-[#818CF8]/60" />
    </p>
);

const Card = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
    <div className={`group relative bg-white/[0.04] border border-white/[0.08] rounded-3xl backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.07] hover:border-white/[0.15] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6),0_0_30px_-10px_rgba(99,102,241,0.2)] hover:-translate-y-2 active:scale-[0.98] ${className}`}>
        {/* Glass highlight effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/15 to-transparent opacity-30" />
        {children}
    </div>
);

const GradientBtn = ({ onClick, label, large = false, className = '' }: { onClick: () => void; label: string; large?: boolean; className?: string }) => (
    <button
        onClick={onClick}
        className={`group relative ${large ? 'h-14 px-10 text-base' : 'h-11 px-7 text-sm'} rounded-full font-semibold text-white overflow-hidden transition-all duration-200 hover:scale-[1.05] hover:-translate-y-px active:scale-100 ${className}`}
    >
        <span className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#3B82F6]" />
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <span className="relative">{label}</span>
    </button>
);

const LogoMarquee = () => {
    return (
        <div className="relative w-full pt-10 pb-0 z-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Powering personalized growth with industry-leading stacks</p>
            </div>
            <div className="relative flex overflow-hidden">
                <motion.div
                    className="flex whitespace-nowrap gap-24 items-center"
                    animate={{ x: [0, -2000] }}
                    transition={{
                        duration: 50,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {[...brandLogos, ...brandLogos, ...brandLogos, ...brandLogos, ...brandLogos, ...brandLogos].map((src, i) => (
                        <img key={i} src={src} alt="tool" className="h-10 w-auto object-contain opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300" />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export const Landing: React.FC = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 0.3], [0, 60]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#12131b] text-white overflow-x-hidden font-sans selection:bg-white/20">
            <ShaderBackground />

            {/* ── NAV ──────────────────────────────────────────────── */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'backdrop-blur-xl' : ''}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        <img src={logo} alt="G2G" className="w-15 h-15 object-contain shrink-0" />
                        <span style={{
                            fontFamily: "'Yona', sans-serif",
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 50%, #C7D2FE 80%, #818CF8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',

                            letterSpacing: '0.01em',
                            fontSize: '1.75rem',
                            fontWeight: 900,
                            lineHeight: 1,
                        }}>Gap2Growth</span>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { href: '#how-it-works', label: 'How It Works' },
                            { href: '#intelligence', label: 'Intelligence' },
                            { href: '#why-g2g', label: 'Why G2G' },
                        ].map(({ href, label }) => (
                            <a key={href} href={href}
                                className="relative group px-4 py-2 text-base font-semibold text-white/70 hover:text-white transition-all duration-200 hover:-translate-y-px">
                                {label}
                                <span className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-[#6366F1] to-[#3B82F6] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/auth')}
                            className="h-9 px-5 rounded-full text-sm font-semibold text-white border border-white/20 hover:border-white/40 hover:-translate-y-px hover:shadow-[0_0_16px_rgba(255,255,255,0.12)] active:translate-y-0 transition-all duration-200"
                            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                            Sign In
                        </button>
                        <GradientBtn onClick={() => navigate('/auth')} label="Get Started →" />
                    </div>
                </div>
            </nav>

            {/* ── HERO ─────────────────────────────────────────────── */}
            <motion.section style={{ y: yHero, opacity: opacityHero }}
                className="relative pt-44 pb-16 px-6 max-w-6xl mx-auto min-h-[75vh] flex flex-col items-center justify-center z-10 text-center">

                <motion.div {...anim(0)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 text-white/80 text-xs font-medium uppercase tracking-widest mb-8">
                    AI-Powered Career Intelligence
                </motion.div>

                <motion.h1 {...anim(0.08)}
                    className="font-bold leading-[1.2] tracking-tight text-white mb-9">
                    <span className="text-4xl md:text-5xl lg:text-7xl block opacity-90">Bridge Your Skill Gap with</span>
                    <span className="text-5xl md:text-6xl lg:text-8xl block mt-2 pb-5" style={{
                        background: 'linear-gradient(135deg,#818CF8 0%,#6366F1 50%,#3B82F6 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>Intelligent AI</span>
                </motion.h1>

                <motion.p {...anim(0.16)} className="text-xl text-white/60 max-w-2xl leading-relaxed mb-4">
                    Adaptive skill assessment, market-aligned analysis, and measurable career growth.
                </motion.p>

                <motion.p {...anim(0.2)} className="text-sm text-white/35 font-light tracking-wide mb-10">
                    Know where you stand. Improve strategically. Visualize your transformation.
                </motion.p>

                <motion.div {...anim(0.26)} className="flex flex-wrap items-center justify-center gap-4">
                    <GradientBtn onClick={() => navigate('/auth')} label="Start Skill Assessment" large className="opacity-80" />
                    <button
                        onClick={() => document.getElementById('growth-story')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group relative h-12 pl-2 pr-6 rounded-full flex items-center gap-3 transition-all duration-300 hover:scale-[1.04] hover:-translate-y-px active:scale-100"
                        style={{
                            background: 'rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(64px)',
                            WebkitBackdropFilter: 'blur(64px)',


                        }}
                    >
                        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <span className="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 0 10px rgba(255,255,255,0.15)' }}>
                            <Play size={10} fill="currentColor" className="text-white ml-0.5" />
                        </span>
                        <span className="relative text-sm font-semibold text-white tracking-wide">Watch Growth Story</span>
                    </button>
                </motion.div>
            </motion.section>

            <LogoMarquee />



            {/* ── HOW IT WORKS (Graphical Flowchart) ────────────────── */}
            <section id="how-it-works" className="relative z-10 py-32 px-6 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <motion.div className="text-center mb-24" {...anim()}>
                        <SectionLabel>Process</SectionLabel>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">How G2G Works</h2>
                        <p className="text-white/40 text-lg max-w-2xl mx-auto italic">Four steps from insight to professional achievement.</p>
                    </motion.div>

                    <div className="relative">
                        {/* Connecting Line (Desktop: Horizontal) */}
                        <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-white/[0.05] z-0">
                            <motion.div
                                className="h-full bg-gradient-to-r from-transparent via-[#4F46E5] to-[#3B82F6]"
                                initial={{ scaleX: 0, originX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                            />
                        </div>

                        {/* Connecting Line (Mobile: Vertical) */}
                        <div className="md:hidden absolute top-0 bottom-0 left-[43px] w-[2px] bg-white/[0.05] z-0">
                            <motion.div
                                className="w-full bg-gradient-to-b from-transparent via-[#4F46E5] to-[#3B82F6]"
                                initial={{ scaleY: 0, originY: 0 }}
                                whileInView={{ scaleY: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.number}
                                    {...anim(i * 0.2)}
                                    className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-6 md:gap-8 group"
                                >
                                    {/* Icon Node */}
                                    <div className="relative shrink-0">
                                        <div className="absolute inset-0 bg-[#4F46E5]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
                                        <div className="relative w-22 h-22 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#4F46E5] to-[#3B82F6] border border-white/20 flex items-center justify-center shadow-2xl group-hover:scale-[1.05] group-hover:-translate-y-2 transition-all duration-300">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl pointer-events-none" />
                                            <div className="text-white group-hover:scale-110 transition-all duration-300">
                                                {step.icon}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 mt-1 md:mt-0">
                                        <div className="flex items-center gap-2 mb-3 md:justify-center">
                                            <span className="text-[10px] font-black tracking-widest text-[#4F46E5] uppercase bg-[#4F46E5]/10 px-2 py-0.5 rounded-full">Step {step.number}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{step.title}</h3>
                                        <p className="text-sm text-white/70 leading-relaxed font-light">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SKILL INTELLIGENCE ───────────────────────────────── */}
            <section id="intelligence" className="relative z-10 py-28 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div {...anim()}>
                            <SectionLabel>Intelligence</SectionLabel>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Real Skill Intelligence</h2>
                            <p className="text-xl text-white/40 font-light mb-10">We don't guess. We quantify.</p>
                            <ul className="space-y-5">
                                {intelligencePoints.map((point, i) => (
                                    <motion.li key={point} {...anim(i * 0.07)} className="flex items-center gap-3 text-white/70">
                                        <CheckCircle2 size={16} className="text-[#6366F1] shrink-0" />
                                        <span className="text-sm">{point}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div {...anim(0.15)}>
                            <Card className="p-8 space-y-6">
                                <div className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Skill Gap Report</div>
                                {gapItems.map((item) => (
                                    <div key={item.skill} className="space-y-2">
                                        <div className="flex justify-between text-xs text-white/50">
                                            <span>{item.skill}</span>
                                            <span className="text-[#818CF8]">Gap: {item.market - item.current}%</span>
                                        </div>
                                        <div className="relative h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.market}%` }}
                                                viewport={{ once: true }} transition={{ duration: 1.4, ease: 'easeOut' }}
                                                className="absolute top-0 left-0 h-full rounded-full bg-white/10" />
                                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.current}%` }}
                                                viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut' }}
                                                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#4F46E5]"
                                                style={{ boxShadow: '0 0 8px rgba(99,102,241,0.6)' }} />
                                        </div>
                                    </div>
                                ))}
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── GROWTH SUMMARY ───────────────────────────────────── */}
            <section id="growth-story" className="relative z-10 py-28 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div {...anim()}>
                            <Card className="p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <Target size={16} className="text-[#818CF8]" />
                                    <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Growth Summary</span>
                                    <span className="ml-auto text-[10px] text-white/25">AI-generated</span>
                                </div>
                                <div className="space-y-4">
                                    {summaryItems.map((item) => (
                                        <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.025] border border-white/[0.05]">
                                            <span className="text-sm text-white/50">{item.label}</span>
                                            <span className={`text-sm font-semibold bg-gradient-to-r ${item.grad} bg-clip-text text-transparent`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
                                    <p className="text-xs text-white/30 tracking-widest uppercase">Your progress. Visualized.</p>
                                </div>
                            </Card>
                        </motion.div>
                        <motion.div {...anim(0.15)}>
                            <SectionLabel>Differentiator</SectionLabel>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Your AI-Generated Career Documentary</h2>
                            <p className="text-white/50 text-lg mb-10 leading-relaxed">
                                Track your journey from skill gaps to mastery with a cinematic growth summary.
                            </p>
                            <ul className="space-y-4">
                                {growthPoints.map((point, i) => (
                                    <motion.li key={point} {...anim(i * 0.07)} className="flex items-center gap-3 text-white/65 text-sm">
                                        <CheckCircle2 size={15} className="text-[#6366F1] shrink-0" />
                                        {point}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── WHY G2G (Graphical Flowchart) ────────────────────── */}
            <section id="why-g2g" className="relative z-10 py-32 px-6 overflow-hidden">
                {/* Technical Background Grid */}
                <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none opacity-[0.03] z-0"
                    style={{
                        backgroundImage: `linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div {...anim()} className="text-center mb-24">
                        <SectionLabel>Architecture</SectionLabel>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">The G2G Ecosystem</h2>
                        <p className="text-white/40 text-lg max-w-2xl mx-auto italic">A structured roadmap to professional excellence.</p>
                    </motion.div>

                    <div className="relative min-h-[600px] md:min-h-[450px]">
                        {/* Connection Paths (Desktop) */}
                        <svg className="absolute inset-0 w-full h-full hidden md:block" viewBox="0 0 1200 450" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#4F46E5" />
                                </marker>
                                <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
                                </linearGradient>
                            </defs>

                            {/* Geometric Lines with Arrows */}
                            <motion.line
                                x1="280" y1="200" x2="480" y2="200"
                                stroke="url(#line-grad)" strokeWidth="2" strokeDasharray="8 4"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                markerEnd="url(#arrowhead)"
                            />

                            <motion.line
                                x1="680" y1="200" x2="880" y2="200"
                                stroke="url(#line-grad)" strokeWidth="2" strokeDasharray="8 4"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: 1.5 }}
                                markerEnd="url(#arrowhead)"
                            />

                            {/* Connection Details Labels */}
                            <motion.text x="340" y="185" fill="#4F46E5/40" fontSize="10" fontWeight="bold" className="uppercase tracking-widest opacity-30">Integration</motion.text>
                            <motion.text x="740" y="185" fill="#3B82F6/40" fontSize="10" fontWeight="bold" className="uppercase tracking-widest opacity-30">Visualization</motion.text>
                        </svg>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-0 h-full">
                            {differentiators.map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    {...anim(i * 0.4)}
                                    className="flex flex-col items-center text-center px-10"
                                >
                                    <div className="relative group cursor-default mb-10">
                                        {/* Step Number Indicator */}
                                        <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-[#12131b] border border-white/20 flex items-center justify-center text-[10px] font-black text-[#818CF8] z-20 shadow-xl">
                                            0{i + 1}
                                        </div>

                                        <div className="absolute -inset-8 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                            {/* Outer Ring */}
                                            <div className="absolute inset-0 border border-white/10 rounded-full group-hover:border-[#4F46E5]/40 transition-colors duration-500" />
                                            <div className="absolute inset-2 border border-white/5 rounded-full group-hover:scale-110 transition-transform duration-700" />

                                            {/* Node Core */}
                                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                <div className="absolute inset-0 bg-[#4F46E5] opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity" />
                                                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32, className: "text-white group-hover:text-[#818CF8] transition-colors" })}
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-4 tracking-tighter uppercase">{item.title}</h3>
                                    <div className="h-px w-8 bg-indigo-500/40 mb-4" />
                                    <p className="text-sm text-white/40 leading-relaxed font-medium uppercase tracking-wider h-12">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ────────────────────────────────────────── */}
            <section className="relative z-10 py-32 px-6 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 blur-3xl opacity-20 bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] pointer-events-none" />
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div {...anim()}>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                            Ready to Transform<br />Your Skill Journey?
                        </h2>
                        <p className="text-white/40 mb-10 text-sm tracking-wide">Assessment takes less than 5 minutes.</p>
                        <GradientBtn onClick={() => navigate('/auth')} label="Start My Growth Journey →" large />
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <div className="border-t border-white/[0.04] py-8 px-6 z-10 relative">
                <p className="text-center text-xs text-white/20">© 2026 Gap2Growth · AI Skill Intelligence Platform</p>
            </div>
        </div>
    );
};

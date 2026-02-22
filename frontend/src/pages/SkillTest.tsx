import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, ArrowLeft, BrainCircuit, Star, AlertCircle, CameraOff, ShieldAlert, Clock, Eye, Maximize } from 'lucide-react';
import Webcam from 'react-webcam';
import { api } from '../services/api';

// ─────────────────────────────────────────────────────────────
//  SECURITY CLASSES (adapted from proctoring.ts — no Next.js)
// ─────────────────────────────────────────────────────────────

class BrowserLockdown {
    private onViolation: (msg: string) => void;
    constructor(onViolation: (msg: string) => void) { this.onViolation = onViolation; }

    start() {
        document.addEventListener('contextmenu', this.noCtx);
        document.addEventListener('keydown', this.noKey);
        document.addEventListener('selectstart', this.noSelect);
        document.addEventListener('dragstart', this.noDrag);
    }
    stop() {
        document.removeEventListener('contextmenu', this.noCtx);
        document.removeEventListener('keydown', this.noKey);
        document.removeEventListener('selectstart', this.noSelect);
        document.removeEventListener('dragstart', this.noDrag);
    }

    private noCtx = (e: MouseEvent) => { e.preventDefault(); this.onViolation('Right-click is disabled during the test.'); };
    private noDrag = (e: DragEvent) => { e.preventDefault(); };
    private noSelect = (e: Event) => {
        const t = e.target as HTMLElement;
        if (!t.matches('input, textarea')) e.preventDefault();
    };
    private noKey = (e: KeyboardEvent) => {
        // Block DevTools, View Source, Print, Select All
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase()))) {
            e.preventDefault(); this.onViolation('Developer tools are disabled during the test.'); return;
        }
        if (e.ctrlKey && ['u', 'p', 'a', 's'].includes(e.key.toLowerCase())) {
            e.preventDefault(); if (e.key !== 'a') this.onViolation(`Ctrl+${e.key.toUpperCase()} is disabled during the test.`);
        }
        if (e.key === 'PrintScreen') { this.onViolation('Screenshot attempt detected!'); }
    };
}

class MultiTabDetector {
    private channel: BroadcastChannel;
    private onDetected: () => void;
    private active = true;

    constructor(sessionId: string, onDetected: () => void) {
        this.onDetected = onDetected;
        this.channel = new BroadcastChannel(`g2g_test_${sessionId}`);
    }
    start() {
        this.channel.addEventListener('message', this.onMsg);
        this.channel.postMessage({ type: 'tab_opened' });
        setInterval(() => { if (this.active) this.channel.postMessage({ type: 'heartbeat' }); }, 2000);
    }
    stop() { this.active = false; this.channel.close(); }
    private onMsg = (e: MessageEvent) => {
        if (e.data.type === 'tab_opened' || e.data.type === 'heartbeat') this.onDetected();
    };
}

// ─────────────────────────────────────────────────────────────
//  WATERMARK OVERLAY
// ─────────────────────────────────────────────────────────────
const Watermark: React.FC<{ text: string }> = ({ text }) => (
    <div className="fixed inset-0 pointer-events-none z-[9998] select-none overflow-hidden" style={{ userSelect: 'none' }}>
        <div className="absolute inset-0 flex items-center justify-center">
            <div style={{ fontSize: 'clamp(2rem,7vw,5rem)', opacity: 0.05, transform: 'rotate(-45deg)', whiteSpace: 'nowrap', color: '#818cf8', letterSpacing: '0.5rem', fontWeight: 'bold' }}>
                {text}
            </div>
        </div>
        {Array.from({ length: 20 }).map((_, i) => {
            const row = Math.floor(i / 5); const col = i % 5;
            return (
                <div key={i} className="absolute text-xs font-semibold whitespace-nowrap"
                    style={{ top: `${(row / 4) * 100 + 10}%`, left: `${(col / 5) * 100 + 8}%`, transform: 'translate(-50%,-50%) rotate(-45deg)', opacity: 0.06, color: '#818cf8', pointerEvents: 'none' }}>
                    {text}
                </div>
            );
        })}
    </div>
);

// ─────────────────────────────────────────────────────────────
//  WEBCAM FEED (corner overlay)
// ─────────────────────────────────────────────────────────────
const CameraFeed: React.FC<{ visible: boolean }> = ({ visible }) => {
    const [err, setErr] = useState(false);
    const [ready, setReady] = useState(false);
    if (!visible) return null;
    return (
        <div className="fixed bottom-6 right-6 z-50 group">
            <div className="relative w-44 h-32 rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black/60 backdrop-blur-md transition-all group-hover:scale-105 group-hover:border-indigo-500/50">
                {!err ? (
                    <>
                        <Webcam audio={false} videoConstraints={{ width: 176, height: 128, facingMode: 'user' }}
                            onUserMedia={() => setReady(true)} onUserMediaError={() => setErr(true)}
                            className="w-full h-full object-cover" />
                        {!ready && <div className="absolute inset-0 flex items-center justify-center text-white/50"><Loader2 size={20} className="animate-spin" /></div>}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/80 text-white text-[9px] font-bold uppercase animate-pulse">
                            <div className="w-1 h-1 rounded-full bg-white" /> Live
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1 text-white/30">
                        <CameraOff size={20} />
                        <p className="text-[9px] text-center px-2">Camera unavailable</p>
                    </div>
                )}
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-[#0f111a] shadow-lg" />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
//  VIOLATION TOAST
// ─────────────────────────────────────────────────────────────
const ViolationToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-5 left-1/2 z-[99999] flex items-center gap-3 px-5 py-3 bg-red-500/90 backdrop-blur-sm text-white rounded-xl font-semibold text-sm shadow-2xl border border-red-400/30">
            <ShieldAlert size={18} /> {message}
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────
interface Question { question: string; options: string[]; correct_answer: string; }

const PASS_THRESHOLD = 0.7;
const SECONDS_PER_QUESTION = 60;
const MAX_VIOLATIONS = 5;

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export const SkillTest: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const topic = searchParams.get('topic') || 'General Knowledge';
    const sessionId = useRef(`g2g_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`).current;
    const username = 'G2G Student'; // watermark text

    // Quiz state
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [skillAwarded, setSkillAwarded] = useState(false);
    const [awardingSkill, setAwardingSkill] = useState(false);

    // New State for Fullscreen & Start
    const [isStarted, setIsStarted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Security state
    const [violations, setViolations] = useState(0);
    const [toast, setToast] = useState<string | null>(null);
    const [disqualified, setDisqualified] = useState(false);
    const [tabViolation, setTabViolation] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Security refs
    const lockdownRef = useRef<BrowserLockdown | null>(null);
    const multiTabRef = useRef<MultiTabDetector | null>(null);

    const showViolation = useCallback((msg: string) => {
        setToast(msg);
        setViolations(prev => {
            const next = prev + 1;
            if (next >= MAX_VIOLATIONS) setDisqualified(true);
            return next;
        });
    }, []);

    // ─── Start security on mount ───
    useEffect(() => {
        if (!isStarted) return;

        lockdownRef.current = new BrowserLockdown(showViolation);
        lockdownRef.current.start();

        multiTabRef.current = new MultiTabDetector(sessionId, () => {
            setTabViolation(true);
            setDisqualified(true);
        });
        multiTabRef.current.start();

        // Stricter Tab Switch & Blur detection
        const handleVisibilityChange = () => {
            if (document.hidden && !submitted) {
                showViolation('Tab switch detected! Stay on this page.');
            }
        };
        const handleBlur = () => {
            if (!submitted && isStarted) {
                showViolation('Window lost focus! Focus away is not allowed.');
            }
        };
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            if (!document.fullscreenElement && !submitted && isStarted) {
                showViolation('Fullscreen mode exited! Fullscreen is required.');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            lockdownRef.current?.stop();
            multiTabRef.current?.stop();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [showViolation, submitted, isStarted, sessionId]);

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
    };

    const startTest = () => {
        enterFullscreen();
        setIsStarted(true);
    };

    // ─── Reset timer on question change ───
    useEffect(() => {
        if (submitted || loading) return;
        setTimeLeft(SECONDS_PER_QUESTION);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    // Auto-advance on timeout
                    if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
                    return SECONDS_PER_QUESTION;
                }
                return t - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [currentIndex, submitted, loading, questions.length]);

    const fetchQuestions = async () => {
        setLoading(true); setError(null); setCurrentIndex(0);
        setSelectedAnswers({}); setSubmitted(false); setSkillAwarded(false);
        setViolations(0); setDisqualified(false); setTabViolation(false);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/generate-test', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });
            if (!res.ok) throw new Error('Failed to generate test');
            const data = await res.json();
            if (!data.questions?.length) throw new Error('No questions returned');
            setQuestions(data.questions);
        } catch (e: any) { setError(e.message || 'Something went wrong'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchQuestions(); }, [topic]);

    const handleSelect = (option: string) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));
    };

    const handleSubmit = async () => {
        if (timerRef.current) clearInterval(timerRef.current);

        // Exit fullscreen on submit
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error('Error exiting fullscreen:', err));
        }

        // Add submitted param to show nav bar in DashboardLayout
        const params = new URLSearchParams(window.location.search);
        params.set('submitted', 'true');
        navigate(`${window.location.pathname}?${params.toString()}`, { replace: true });

        let correct = 0;
        questions.forEach((q, i) => { if (selectedAnswers[i] === q.correct_answer) correct++; });
        const pct = correct / questions.length;
        setScore(correct); setSubmitted(true);

        if (pct >= PASS_THRESHOLD && !disqualified) {
            setAwardingSkill(true);
            try { await api.post('/auth/award-skill', { skill: topic }); setSkillAwarded(true); }
            catch (e) { console.error('Failed to award skill', e); }
            finally { setAwardingSkill(false); }
        }
    };

    const answeredAll = Object.keys(selectedAnswers).length === questions.length;
    const pct = submitted ? Math.round((score / questions.length) * 100) : 0;
    const passed = submitted && pct >= PASS_THRESHOLD * 100 && !disqualified;
    const timerPct = (timeLeft / SECONDS_PER_QUESTION) * 100;
    const timerColor = timeLeft > 30 ? 'from-indigo-500 to-teal-400' : timeLeft > 10 ? 'from-amber-500 to-orange-400' : 'from-red-500 to-rose-400';

    // ─── Start Screen (Instructions) ───
    if (!isStarted && !loading && !error) return (
        <div className="fixed inset-0 z-[55] bg-[#12131b] overflow-y-auto p-8 flex flex-col items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full p-8 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl text-center">
                <ShieldAlert size={48} className="text-indigo-400 mx-auto mb-4" />
                <h1 className="text-3xl font-black text-white mb-2">{topic} Mock Test</h1>
                <p className="text-white/50 mb-8 font-medium">Please read the following security requirements before starting:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
                    {[
                        { icon: Maximize, title: 'Fullscreen Required', desc: 'The test must be completed in fullscreen mode.' },
                        { icon: Eye, title: 'Webcam Proctoring', desc: 'Active webcam feed is required for monitoring.' },
                        { icon: ShieldAlert, title: 'Focus Lock', desc: 'Tab switching or focusing away will record violations.' },
                        { icon: Clock, title: 'Time Bound', desc: '10 questions, 60 seconds each. Passes at 70%.' }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <item.icon className="text-indigo-400 shrink-0" size={20} />
                            <div>
                                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                                <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-200 text-xs text-left mb-8">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>Exceeding 5 violations will result in auto-disqualification. System monitors for DevTools, screenshots, and right-click attempts.</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => navigate('/roadmap')} className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={startTest}
                        className="flex-[2] flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/20"
                    >
                        Start Proctored Test <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );

    // ─── Disqualified Screen ───
    if (disqualified && !submitted) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 text-white max-w-md mx-auto text-center">
            <ShieldAlert size={64} className="text-red-400" />
            <h2 className="text-2xl font-black text-red-400">Test Terminated</h2>
            <p className="text-white/60">
                {tabViolation
                    ? 'Multiple browser tabs detected. You cannot take the test in multiple tabs.'
                    : `You exceeded ${MAX_VIOLATIONS} security violations. Your test has been terminated.`}
            </p>
            <button onClick={() => navigate('/roadmap')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors">
                <ArrowLeft size={16} /> Back to Roadmap
            </button>
        </div>
    );

    // ─── Loading ───
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-white">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <BrainCircuit className="absolute inset-0 m-auto text-indigo-400" size={28} />
            </div>
            <p className="text-indigo-300 font-medium animate-pulse text-lg">Generating your {topic} test...</p>
            <p className="text-white/40 text-sm">Crafting 10 challenging questions with AI</p>
        </div>
    );

    // ─── Error ───
    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-white">
            <AlertCircle size={48} className="text-red-400" />
            <p className="text-red-300 font-medium">{error}</p>
            <button onClick={fetchQuestions} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-500 transition-colors">
                <RotateCcw size={16} /> Retry
            </button>
        </div>
    );

    // ─── Results ───
    if (submitted) return (
        <>
            <Watermark text={`G2G • ${username}`} />
            <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto gap-6">
                <motion.div initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="w-full">
                    <div className={`relative rounded-3xl overflow-hidden border p-8 text-center ${passed ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-violet-900/20 pointer-events-none" />
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="relative z-10">
                            {passed ? <Trophy size={56} className="text-yellow-400 mx-auto mb-4 drop-shadow-lg" /> : <XCircle size={56} className="text-red-400 mx-auto mb-4" />}
                        </motion.div>
                        <h2 className="text-3xl font-black text-white mb-1">
                            {disqualified ? '⚠️ Disqualified' : passed ? '🎉 You Passed!' : 'Keep Practicing'}
                        </h2>
                        <p className="text-white/50 mb-6">
                            {disqualified ? 'Security violations were detected during your test.'
                                : passed ? `You've demonstrated solid knowledge of ${topic}.`
                                    : 'You need 70% to earn this skill. Keep learning!'}
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className={`text-7xl font-black ${passed ? 'text-indigo-400' : 'text-red-400'}`}>{pct}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-6">
                            <motion.div className={`h-full rounded-full ${passed ? 'bg-gradient-to-r from-indigo-500 to-teal-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.4 }} />
                        </div>
                        <p className="text-white/60 text-sm mb-2">{score} / {questions.length} correct answers</p>
                        {violations > 0 && <p className="text-red-400/80 text-xs mb-4">⚠️ {violations} security violation{violations > 1 ? 's' : ''} recorded</p>}
                        <AnimatePresence>
                            {passed && (awardingSkill ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-indigo-300 mb-6">
                                    <Loader2 size={16} className="animate-spin" /> Adding skill to profile...
                                </motion.div>
                            ) : skillAwarded ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 font-semibold mb-6">
                                    <Star size={18} fill="currentColor" /> "{topic}" skill added to your profile!
                                </motion.div>
                            ) : null)}
                        </AnimatePresence>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={fetchQuestions} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition-colors">
                                <RotateCcw size={16} /> Retake Test
                            </button>
                            <button onClick={() => navigate('/roadmap')} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
                                Back to Roadmap <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                    {/* Answer Review */}
                    <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-bold text-white/80">Answer Review</h3>
                        {questions.map((q, i) => {
                            const chosen = selectedAnswers[i];
                            const isCorrect = chosen === q.correct_answer;
                            return (
                                <div key={i} className={`p-4 rounded-xl border ${isCorrect ? 'bg-teal-500/5 border-teal-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <p className="text-sm font-semibold text-white/80 mb-2">{i + 1}. {q.question}</p>
                                    {!isCorrect && chosen && <p className="text-xs text-red-400 flex items-center gap-1"><XCircle size={12} /> Your answer: {chosen}</p>}
                                    <p className="text-xs text-teal-400 flex items-center gap-1 mt-1"><CheckCircle2 size={12} /> Correct: {q.correct_answer}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </>
    );

    // ─── Quiz Screen ───
    const currentQ = questions[currentIndex];
    const currentSelected = selectedAnswers[currentIndex];
    // Hide nav bar when not submitted, unless there is an error/loading
    const showNavHeader = submitted || loading || error;

    return (
        <>
            {/* Security overlays */}
            <Watermark text={`G2G • ${username}`} />
            <CameraFeed visible={isStarted && !submitted} />

            {/* Fullscreen Required Overlay */}
            {isStarted && !isFullscreen && !submitted && !disqualified && (
                <div className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <Maximize size={48} className="text-indigo-400 mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-white mb-2">Fullscreen Required</h2>
                    <p className="text-white/60 mb-8 max-w-sm">To ensure test integrity, you must remain in fullscreen mode. This incident has been logged.</p>
                    <button onClick={enterFullscreen} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all">
                        Re-enter Fullscreen
                    </button>
                </div>
            )}

            {/* Violation toast */}
            <AnimatePresence>
                {toast && <ViolationToast message={toast} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* Main Wrapper */}
            <div className={`${!showNavHeader ? 'bg-[#12131b] min-h-full py-8' : 'max-w-3xl mx-auto pb-16'}`}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => {
                            if (document.fullscreenElement) document.exitFullscreen();
                            navigate('/roadmap');
                        }} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="flex items-center gap-3">
                            {violations > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-bold">
                                    <ShieldAlert size={12} /> {violations} violation{violations > 1 ? 's' : ''}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs font-bold">
                                <Eye size={12} /> Proctored
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className={!showNavHeader ? 'max-w-xl' : ''}>
                            <h1 className="text-2xl font-black text-white flex items-center gap-3">
                                <BrainCircuit className="text-indigo-400" size={28} /> {topic} Test
                            </h1>
                            <p className="text-white/40 mt-1 text-sm">Score ≥ 70% to earn the skill badge · No cheating 😉</p>
                        </div>
                        <div className="text-right">
                            <span className="text-indigo-400 font-black text-2xl">{currentIndex + 1}</span>
                            <span className="text-white/30 font-semibold text-lg"> / {questions.length}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
                    </div>

                    {/* Timer Bar */}
                    <div className="flex items-center gap-3 mt-3">
                        <Clock size={14} className={`${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white/40'}`} />
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div className={`h-full rounded-full bg-gradient-to-r ${timerColor}`}
                                animate={{ width: `${timerPct}%` }} transition={{ duration: 0.5 }} />
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-400' : 'text-white/40'}`}>{timeLeft}s</span>
                    </div>
                </motion.div>

                {/* Question Card Wrapper - constrained max width in fullscreen */}
                <div className={!showNavHeader ? 'max-w-3xl mx-auto' : ''}>
                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div key={currentIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 mb-6 shadow-2xl backdrop-blur-md">
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Question {currentIndex + 1}</p>
                                <h2 className="text-lg font-bold text-white leading-relaxed">{currentQ.question}</h2>
                            </div>
                            <div className="space-y-3">
                                {currentQ.options.map((option, i) => {
                                    const letters = ['A', 'B', 'C', 'D'];
                                    const isSelected = currentSelected === option;
                                    return (
                                        <motion.button key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                            onClick={() => handleSelect(option)}
                                            className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${isSelected ? 'bg-indigo-500/15 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}>
                                            <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/50'}`}>{letters[i]}</span>
                                            <span className={`text-sm leading-relaxed pt-1 transition-colors ${isSelected ? 'text-white font-medium' : 'text-white/60'}`}>{option}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                        <button onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))} disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white rounded-xl text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <ArrowLeft size={16} /> Previous
                        </button>

                        <div className="flex items-center gap-1.5">
                            {questions.map((_, i) => (
                                <button key={i} onClick={() => setCurrentIndex(i)}
                                    className={`rounded-full transition-all ${i === currentIndex ? 'bg-indigo-400 w-5 h-2' : selectedAnswers[i] !== undefined ? 'bg-indigo-500/50 w-2 h-2' : 'bg-white/20 w-2 h-2'}`} />
                            ))}
                        </div>

                        {currentIndex < questions.length - 1 ? (
                            <button onClick={() => setCurrentIndex(i => i + 1)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors">
                                Next <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={!answeredAll}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20">
                                Submit Test <CheckCircle2 size={16} />
                            </button>
                        )}
                    </div>

                    {!answeredAll && currentIndex === questions.length - 1 && (
                        <p className="text-center text-white/40 text-xs mt-4">
                            Answer all questions before submitting ({Object.keys(selectedAnswers).length}/{questions.length} answered)
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default SkillTest;

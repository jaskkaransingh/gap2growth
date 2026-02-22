import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, Map, Zap, CheckCircle2, Circle, ChevronDown, Youtube, BookOpen, Clock, Trophy, ArrowRight, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ResourceLink {
    title: string;
    url: string;
}

interface Checkpoint {
    id: string;
    title: string;
    description: string;
    youtube_links: ResourceLink[];
    doc_links: ResourceLink[];
}

interface WeekPlan {
    week_number: number;
    focus: string;
    checkpoints: Checkpoint[];
}

interface RoadmapData {
    title: string;
    weeks: WeekPlan[];
}

interface SavedRoadmap {
    id: string;
    topic: string;
    roadmapData: RoadmapData;
    completedCheckpoints: string[];
    progressPercentage: number;
    createdAt: string;
}

export const Roadmap: React.FC = () => {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeRoadmap, setActiveRoadmap] = useState<SavedRoadmap | null>(null);
    const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Track checked progress
    const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));

    useEffect(() => {
        fetchSavedRoadmaps();
    }, []);

    const fetchSavedRoadmaps = async () => {
        try {
            const res = await api.get('/roadmaps');
            setSavedRoadmaps(res.data.roadmaps || []);
        } catch (err) {
            console.error('Failed to fetch roadmaps', err);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsGenerating(true);
        setError(null);
        setActiveRoadmap(null);
        setExpandedWeeks(new Set([1]));

        try {
            // Hit the FastAPI backend directly to generate JSON roadmap
            const res = await fetch('http://127.0.0.1:8000/generate-roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_input: topic }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.detail || `Server error: ${res.status}`);
            }

            const data = await res.json();

            // Save to frontend/backend database
            const saveRes = await api.post('/roadmaps/save', {
                topic,
                roadmapData: data
            });

            setActiveRoadmap(saveRes.data.roadmap);
            setSavedRoadmaps(prev => [...prev, saveRes.data.roadmap]);
        } catch (err: any) {
            console.error('Roadmap error:', err);
            setError(err.message || 'Failed to generate roadmap. Is the Python backend running?');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleCheckpoint = async (checkpointId: string) => {
        if (!activeRoadmap) return;

        const updatedCheckpoints = new Set(activeRoadmap.completedCheckpoints || []);
        if (updatedCheckpoints.has(checkpointId)) {
            updatedCheckpoints.delete(checkpointId);
        } else {
            updatedCheckpoints.add(checkpointId);
        }

        const completedArray = Array.from(updatedCheckpoints);
        const totalCheckpoints = activeRoadmap.roadmapData.weeks.reduce((acc, w) => acc + w.checkpoints.length, 0);
        const progressPercentage = totalCheckpoints > 0 ? Math.round((completedArray.length / totalCheckpoints) * 100) : 0;

        // Optimistic UI Update
        const updatedRoadmap = { ...activeRoadmap, completedCheckpoints: completedArray, progressPercentage };
        setActiveRoadmap(updatedRoadmap);

        // Update list
        setSavedRoadmaps(prev => prev.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r));

        // Save to backend
        try {
            await api.put(`/roadmaps/${activeRoadmap.id}/progress`, {
                completedCheckpoints: completedArray,
                progressPercentage
            });
        } catch (err) {
            console.error('Failed to save progress', err);
        }
    };

    const toggleWeek = (weekNumber: number) => {
        setExpandedWeeks(prev => {
            const next = new Set(prev);
            if (next.has(weekNumber)) next.delete(weekNumber);
            else next.add(weekNumber);
            return next;
        });
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.delete(`/roadmaps/${id}`);
            setSavedRoadmaps(prev => prev.filter(r => r.id !== id));
            if (activeRoadmap?.id === id) {
                setActiveRoadmap(null);
            }
        } catch (err) {
            console.error('Failed to delete roadmap', err);
        }
    };

    const roadmapData = activeRoadmap?.roadmapData;
    const progressPercentage = activeRoadmap?.progressPercentage || 0;
    const isCompleted = progressPercentage === 100;

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-80px)] w-full max-w-[1400px] mx-auto pb-10">
            {/* Sidebar: Saved Roadmaps */}
            <div className="w-full lg:w-80 shrink-0 space-y-4">
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-indigo-400" /> Previous Roadmaps
                    </h2>

                    {savedRoadmaps.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-4">No saved roadmaps yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {savedRoadmaps.map(rm => (
                                <div
                                    key={rm.id}
                                    onClick={() => { setActiveRoadmap(rm); setExpandedWeeks(new Set([1])); setTopic(''); }}
                                    className={`relative p-3 rounded-xl cursor-pointer transition-all border ${activeRoadmap?.id === rm.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-semibold text-white/90 truncate pr-6">{rm.topic}</h3>
                                        <button onClick={(e) => handleDelete(rm.id, e)} className="absolute top-3 right-3 text-white/30 hover:text-red-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div className={`h-full ${rm.progressPercentage === 100 ? 'bg-teal-400' : 'bg-indigo-500'}`} style={{ width: `${rm.progressPercentage}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col space-y-8">
                {/* Header & Input */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-4 justify-between md:items-end shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Map className="text-indigo-400" size={28} /> AI Roadmap Generator
                        </h1>
                        <p className="text-white/50 mt-1">Generate a 4-week checkpoint learning plan</p>
                    </div>

                    <form onSubmit={handleGenerate} className="flex gap-2 w-full md:w-auto relative">
                        <div className="relative w-full md:w-80">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-white/30" />
                            </div>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. System Design, React.js..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                                disabled={isGenerating}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isGenerating || !topic.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shrink-0 shadow-lg shadow-indigo-500/20"
                        >
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                            Generate
                        </button>
                    </form>
                </motion.div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {isGenerating && (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white/[0.02] border border-white/5 rounded-3xl gap-3 text-indigo-300">
                        <Loader2 size={40} className="animate-spin" />
                        <p className="font-medium animate-pulse">Designing your curriculum with AI...</p>
                    </div>
                )}

                {!activeRoadmap && !isGenerating && !error && (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white/[0.02] border border-white/5 rounded-3xl text-white/30">
                        <Map size={48} className="mb-4 opacity-50" />
                        <p>Select a previous roadmap or generate a new one</p>
                    </div>
                )}

                {!isGenerating && activeRoadmap && roadmapData && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative">

                        <div className={`bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md transition-all ${isCompleted ? 'ring-2 ring-indigo-500/50 opacity-50' : ''}`}>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{roadmapData.title}</h2>
                                    <p className="text-sm text-white/50">4-Week Completion Tracking</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-indigo-400">{progressPercentage}%</span>
                                    <span className="text-sm text-white/40 block">Completed</span>
                                </div>
                            </div>
                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full relative"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                >
                                    {isCompleted && (
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    )}
                                </motion.div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {roadmapData.weeks.map((week) => {
                                const isExpanded = expandedWeeks.has(week.week_number);
                                const weekCompleted = week.checkpoints.filter(cp => activeRoadmap.completedCheckpoints?.includes(cp.id)).length;
                                const weekTotal = week.checkpoints.length;
                                const isAllDone = weekTotal > 0 && weekCompleted === weekTotal;

                                return (
                                    <div key={week.week_number} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => toggleWeek(week.week_number)}
                                            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${isAllDone ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/10 text-white/50'}`}>
                                                    <span className="text-sm font-bold">{week.week_number}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-white">Week {week.week_number}: {week.focus}</h3>
                                                    <p className="text-xs text-white/40 mt-0.5">{weekCompleted} of {weekTotal} tasks completed</p>
                                                </div>
                                            </div>
                                            <ChevronDown size={20} className={`text-white/30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="border-t border-white/5"
                                                >
                                                    <div className="p-2 space-y-1">
                                                        {week.checkpoints.map(cp => {
                                                            const isChecked = activeRoadmap.completedCheckpoints?.includes(cp.id);
                                                            return (
                                                                <div
                                                                    key={cp.id}
                                                                    onClick={() => toggleCheckpoint(cp.id)}
                                                                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${isChecked ? 'bg-white/[0.01] opacity-60' : 'hover:bg-white/[0.04]'}`}
                                                                >
                                                                    <button className="flex-shrink-0 mt-0.5 focus:outline-none">
                                                                        {isChecked ? (
                                                                            <CheckCircle2 size={22} className="text-teal-400" />
                                                                        ) : (
                                                                            <Circle size={22} className="text-white/20 hover:text-white/40" />
                                                                        )}
                                                                    </button>
                                                                    <div className="w-full">
                                                                        <p className={`text-sm font-semibold transition-colors ${isChecked ? 'text-white/50 line-through' : 'text-white/90'}`}>
                                                                            {cp.title}
                                                                        </p>
                                                                        <p className="text-xs text-white/40 mt-1 leading-relaxed">
                                                                            {cp.description}
                                                                        </p>
                                                                        {!isChecked && (
                                                                            <div className="flex flex-wrap gap-2 mt-3 mb-1">
                                                                                {cp.youtube_links?.slice(0, 2).map((link, idx) => (
                                                                                    <a
                                                                                        key={`yt-${idx}`}
                                                                                        href={link.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-wide transition-colors"
                                                                                    >
                                                                                        <Youtube size={12} />
                                                                                        <span className="truncate max-w-[150px]">{link.title || 'Watch Tutorial'}</span>
                                                                                    </a>
                                                                                ))}
                                                                                {cp.doc_links?.slice(0, 2).map((link, idx) => (
                                                                                    <a
                                                                                        key={`doc-${idx}`}
                                                                                        href={link.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-wide transition-colors"
                                                                                    >
                                                                                        <BookOpen size={12} />
                                                                                        <span className="truncate max-w-[150px]">{link.title || 'Read Docs'}</span>
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Final Celebration Popup when 100% Complete */}
                        <AnimatePresence>
                            {isCompleted && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="pt-6 pb-2 flex flex-col items-center justify-center z-20 relative w-full"
                                >
                                    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 p-[1px] rounded-2xl shadow-2xl shadow-indigo-500/20">
                                        <div className="bg-[#12131b] px-6 py-4 rounded-2xl flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-3">
                                                <Trophy size={28} className="text-yellow-400" />
                                                <h3 className="text-lg font-bold text-white">Congratulations!</h3>
                                            </div>
                                            <p className="text-sm text-white/70 text-center max-w-[280px]">You have successfully mastered {activeRoadmap.topic}. Ready for the real challenge?</p>
                                            <button
                                                onClick={() => navigate(`/test?topic=${encodeURIComponent(activeRoadmap.topic)}`)}
                                                className="mt-3 flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                                            >
                                                Take the Test <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Simulating confetti particles using framer-motion */}
                                    {[...Array(24)].map((_, i) => (
                                        <motion.div
                                            key={`confetti-${i}`}
                                            initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                                            animate={{
                                                opacity: 0,
                                                y: -150 - Math.random() * 100,
                                                x: (Math.random() - 0.5) * 400,
                                                rotate: Math.random() * 360,
                                                scale: 0.5
                                            }}
                                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                                            className="absolute w-2 h-2 rounded-full pointer-events-none"
                                            style={{ backgroundColor: ['#818cf8', '#a78bfa', '#60a5fa', '#fbbf24'][i % 4] }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Roadmap;

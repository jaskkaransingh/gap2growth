import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Building2, Calendar, Search, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    link: string;
    date: string;
    match_score: number;
}

export const JobRecommendations: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('Worldwide');
    const [triggerSearch, setTriggerSearch] = useState(0);

    useEffect(() => {
        const fetchProfileAndJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch user's parsed skills from Node backend
                const profileRes = await api.get('/auth/me');
                let skillsQuery = 'Software Engineer'; // fallback

                const profile = profileRes.data.careerProfile;
                if (profile && profile.skills) {
                    const allSkills = [
                        ...(profile.skills.languages || []),
                        ...(profile.skills.frameworks || []),
                        ...(profile.skills.tools || [])
                    ].slice(0, 4);

                    if (allSkills.length > 0) {
                        skillsQuery = allSkills.join(' ');
                    }
                }

                // If user typed something manually, override
                const finalQuery = searchQuery.trim() || skillsQuery;
                if (!searchQuery) setSearchQuery(finalQuery);

                // 2. Hit the Python Job Scraper Service
                const jobsRes = await fetch('http://127.0.0.1:8001/jobs/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ keywords: finalQuery, location: location })
                });

                if (!jobsRes.ok) {
                    throw new Error('Failed to fetch jobs from scraping service');
                }

                const jobsData = await jobsRes.json();
                setJobs(jobsData);
            } catch (err: any) {
                console.error('Job fetching error:', err);
                setError('Failed to load job recommendations. Is the scraping service running?');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndJobs();
    }, [triggerSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setTriggerSearch(prev => prev + 1);
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto min-h-[calc(100vh-80px)] pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Briefcase className="text-indigo-400" size={32} />
                        AI Job Matches
                    </h1>
                    <p className="text-white/50 mt-2">Real-time roles scraped based on your resume skills.</p>
                </div>

                <form onSubmit={handleSearch} className="w-full md:w-auto flex gap-2">
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-white/30" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search roles or skills..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 shadow-inner"
                        />
                    </div>

                    {/* Region Filter Dropdown */}
                    <div className="relative w-full md:w-48">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <MapPin size={16} className="text-white/30" />
                        </div>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-indigo-500/50 shadow-inner cursor-pointer"
                        >
                            <option value="Worldwide" className="bg-[#12131b]">Worldwide</option>
                            <option value="United States" className="bg-[#12131b]">United States</option>
                            <option value="Europe" className="bg-[#12131b]">Europe</option>
                            <option value="Asia" className="bg-[#12131b]">Asia</option>
                            <option value="Remote" className="bg-[#12131b]">Remote</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/[0.02] border border-white/5 rounded-3xl gap-4">
                    <Loader2 size={40} className="text-indigo-400 animate-spin" />
                    <p className="text-indigo-300 font-medium animate-pulse">Scraping live job boards...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-500/5 border border-red-500/20 rounded-3xl gap-3 text-red-400 p-8 text-center">
                    <AlertCircle size={48} className="opacity-50 blur-[1px] absolute" />
                    <AlertCircle size={48} className="mb-2 relative z-10" />
                    <h3 className="text-lg font-bold">Scraping Unavailable</h3>
                    <p className="max-w-md">{error}</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/[0.02] border border-white/5 rounded-3xl text-white/40 p-8 text-center">
                    <Briefcase size={64} className="mb-4 opacity-20" />
                    <p>No jobs found for the current query. Try adjusting your skills search.</p>
                </div>
            ) : (
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    {jobs.map((job) => (
                        <motion.a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={job.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                            className="group block bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 transition-all hover:bg-white/[0.04] relative overflow-hidden flex flex-col h-full"
                        >
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 pr-12 relative z-10">
                                    {job.title}
                                </h3>
                                <div className="absolute top-6 right-6 shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <ArrowUpRight size={18} />
                                </div>
                            </div>

                            <div className="space-y-3 mt-auto relative z-10">
                                <div className="flex items-center gap-2 text-white/60 text-sm">
                                    <Building2 size={16} className="text-white/40" />
                                    <span className="truncate">{job.company}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/50 text-xs">
                                        <MapPin size={14} className="text-white/30" />
                                        <span className="truncate max-w-[120px]">{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs">
                                        <Calendar size={14} className="text-white/20" />
                                        <span>{job.date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Skill Match</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${job.match_score >= 80 ? 'bg-teal-400' : job.match_score >= 50 ? 'bg-indigo-400' : 'bg-orange-400'}`}
                                            style={{ width: `${job.match_score}%` }}
                                        />
                                    </div>
                                    <span className={`text-sm font-bold ${job.match_score >= 80 ? 'text-teal-400' : job.match_score >= 50 ? 'text-indigo-400' : 'text-orange-400'}`}>
                                        {job.match_score}%
                                    </span>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default JobRecommendations;

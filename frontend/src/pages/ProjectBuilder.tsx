import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Code2, Folder, FileCode2, Download, ArrowLeft, Loader2, Target, Zap, CheckCircle2, Database, X } from 'lucide-react';
import { api } from '../services/api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Github, Send, MessageSquare } from 'lucide-react';

// Define TS Interfaces
interface ProjectIdea {
    id: string;
    title: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    tech_stack: string[];
}

interface FileNode {
    type: 'file' | 'folder';
    name: string;
    content?: string;
    children?: FileNode[];
}

// Helper to determine difficulty color
const getDiffColor = (diff: string) => {
    switch (diff.toLowerCase()) {
        case 'beginner': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        case 'intermediate': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        case 'advanced': return 'text-red-400 bg-red-400/10 border-red-400/20';
        default: return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    }
};

export const ProjectBuilder: React.FC = () => {
    // Stage 1: Ideation
    const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
    const [loadingIdeas, setLoadingIdeas] = useState(false);

    // Stage 2: Selection & Generation
    const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null);
    const [fileTree, setFileTree] = useState<FileNode[] | null>(null);
    const [loadingTree, setLoadingTree] = useState(false);

    // Stage 3: Viewing
    const [activeFile, setActiveFile] = useState<FileNode | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // RAG Chatbot & Ingestion State
    const [repoUrl, setRepoUrl] = useState('');
    const [isIngesting, setIsIngesting] = useState(false);
    const [ingestedRepo, setIngestedRepo] = useState(false);
    const [repoTechStack, setRepoTechStack] = useState('');

    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const fetchProjectIdeas = async (additionalContext: string = '') => {
        setLoadingIdeas(true);
        try {
            // 1. Get parsed skills
            const profileRes = await api.get('/auth/me');
            const profile = profileRes.data.careerProfile;
            let skillsQuery = 'Javascript HTML CSS';

            if (profile && profile.skills) {
                const allSkills = [
                    ...(profile.skills.languages || []),
                    ...(profile.skills.frameworks || []),
                    ...(profile.skills.tools || [])
                ].slice(0, 10);
                if (allSkills.length > 0) skillsQuery = allSkills.join(', ');
            }

            if (additionalContext) {
                skillsQuery += ` Additional Context - The generated project ideas must heavily align with this tech stack: ${additionalContext}`;
            }

            // 2. Query Project Ideas from Python API
            const res = await fetch('http://127.0.0.1:8000/api/project-ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills_context: skillsQuery })
            });

            if (!res.ok) throw new Error('Failed to generate ideas');
            const data = await res.json();

            if (data.projects) setIdeas(data.projects);
        } catch (err) {
            console.error("Error fetching ideas:", err);
        } finally {
            setLoadingIdeas(false);
        }
    };

    // Initial load: Fetch skills and generate ideas
    useEffect(() => {
        fetchProjectIdeas(repoTechStack);
    }, []);

    // Handle Project Selection & Boilerplate Generation
    const handleSelectProject = async (idea: ProjectIdea) => {
        setSelectedIdea(idea);
        setLoadingTree(true);
        setFileTree(null);
        setActiveFile(null);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/project-boilerplate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_idea: idea })
            });

            if (!res.ok) throw new Error("Failed to generate boilerplate");
            const data = await res.json();

            if (data.fileTree) {
                setFileTree(data.fileTree);
                // Auto-select first file if available
                const firstFile = findFirstFile(data.fileTree);
                if (firstFile) setActiveFile(firstFile);
            }
        } catch (err) {
            console.error("Error generating tree:", err);
        } finally {
            setLoadingTree(false);
        }
    };

    // Handle GitHub Repository Ingestion
    const handleIngestRepo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;

        setIsIngesting(true);
        try {
            // 1. Ingest repo
            const res = await fetch('http://127.0.0.1:8010/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo_url: repoUrl })
            });
            if (!res.ok) throw new Error('Failed to ingest repository');

            // 2. Query tech stack
            const stackRes = await fetch('http://127.0.0.1:8010/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: 'List all major programming languages, frameworks, and libraries used in this repository as a comma-separated list.' })
            });
            if (stackRes.ok) {
                const stackData = await stackRes.json();
                setRepoTechStack(stackData.answer);
                setIngestedRepo(true);
                // Trigger an idea re-fetch with the new tech stack context
                setIdeas([]); // Clear old ideas to show loading spinner properly
                await fetchProjectIdeas(stackData.answer);
            }

        } catch (err) {
            console.error("Ingestion error:", err);
            alert("Failed to ingest repository. Ensure the URL is valid and public.");
        } finally {
            setIsIngesting(false);
        }
    };

    // Handle RAG Chat Question
    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isThinking || !ingestedRepo) return;

        const userMessage = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatInput('');
        setIsThinking(true);

        try {
            const res = await fetch('http://127.0.0.1:8010/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userMessage })
            });

            if (!res.ok) throw new Error('Failed to get an answer');
            const data = await res.json();

            setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (err) {
            console.error("Chat error:", err);
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error scanning the repository.' }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Helper to find the first file to display
    const findFirstFile = (nodes: FileNode[]): FileNode | null => {
        for (const node of nodes) {
            if (node.type === 'file') return node;
            if (node.children) {
                const found = findFirstFile(node.children);
                if (found) return found;
            }
        }
        return null;
    };

    // Handle ZIP Download
    const generateZip = async () => {
        if (!fileTree) return;
        setIsDownloading(true);

        try {
            const zip = new JSZip();

            // Recursive function to add folder/files to JSZip instance
            const addToZip = (nodes: FileNode[], folderPath: JSZip) => {
                nodes.forEach(node => {
                    if (node.type === 'file') {
                        folderPath.file(node.name, node.content || '');
                    } else if (node.type === 'folder' && node.children) {
                        const newFolder = folderPath.folder(node.name);
                        if (newFolder) addToZip(node.children, newFolder);
                    }
                });
            };

            addToZip(fileTree, zip);

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${selectedIdea?.title.replace(/\s+/g, '-').toLowerCase() || 'project'}-boilerplate.zip`);

        } catch (err) {
            console.error("ZIP Generation error:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    // Recursive File Tree Renderer
    const renderFileTree = (nodes: FileNode[], depth = 0) => {
        return (
            <div className="space-y-1" style={{ paddingLeft: depth > 0 ? '1rem' : '0' }}>
                {nodes.map((node, i) => (
                    <div key={i}>
                        {node.type === 'folder' ? (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 px-2 py-1.5 text-white/70 font-semibold select-none group">
                                    <Folder size={16} className="text-indigo-400/70 group-hover:text-indigo-400 transition-colors" />
                                    <span className="text-[13px]">{node.name}</span>
                                </div>
                                {node.children && renderFileTree(node.children, depth + 1)}
                            </div>
                        ) : (
                            <div
                                onClick={() => setActiveFile(node)}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-[13px] transition-colors ${activeFile?.name === node.name
                                    ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                                    }`}
                            >
                                <FileCode2 size={16} className={activeFile?.name === node.name ? 'text-indigo-400' : 'text-white/30'} />
                                <span>{node.name}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto min-h-[calc(100vh-80px)] pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-indigo-400" size={32} />
                        AI Project Builder
                    </h1>
                    <p className="text-white/50 mt-2">Generate custom project ideas based on your skills, complete with starter boilerplate code.</p>
                </div>

                {/* GitHub Ingestion Form */}
                <div className="w-full md:w-auto bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-3 min-w-[320px]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                        <Github size={16} /> Optional: Align with a GitHub Repository
                    </div>
                    <form onSubmit={handleIngestRepo} className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            disabled={isIngesting || ingestedRepo}
                            placeholder="https://github.com/user/repo"
                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 flex-1 md:w-64 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isIngesting || !repoUrl || ingestedRepo}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${ingestedRepo
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50'
                                }`}
                        >
                            {isIngesting ? <Loader2 size={16} className="animate-spin" /> : ingestedRepo ? <CheckCircle2 size={16} /> : <Database size={16} />}
                            {ingestedRepo ? 'Ingested' : 'Ingest'}
                        </button>
                    </form>
                    {ingestedRepo && (
                        <p className="text-[10px] text-emerald-400 font-medium">Ideas will now be tailored to the repo's stack.</p>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* ── STAGE 1: Ideation (Card Grid) ── */}
                {!selectedIdea && (
                    <motion.div
                        key="ideation-stage"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full"
                    >
                        {loadingIdeas ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white/[0.02] border border-white/5 rounded-3xl gap-4">
                                <Loader2 size={40} className="text-indigo-400 animate-spin" />
                                <p className="text-indigo-300 font-medium animate-pulse">Analyzing your skills and generating concepts...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {ideas.map((idea, i) => (
                                    <motion.div
                                        key={idea.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => handleSelectProject(idea)}
                                        className="group cursor-pointer bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 transition-all hover:bg-white/[0.04] relative overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors pr-12 line-clamp-2">
                                                {idea.title}
                                            </h3>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getDiffColor(idea.difficulty)} shrink-0`}>
                                                {idea.difficulty}
                                            </span>
                                        </div>

                                        <p className="text-white/50 text-sm leading-relaxed mb-6 relative z-10">
                                            {idea.description}
                                        </p>

                                        <div className="mt-auto relative z-10">
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                <Target size={12} /> Tech Stack
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {idea.tech_stack.map(tech => (
                                                    <span key={tech} className="px-2.5 py-1 bg-white/5 text-white/60 rounded-md text-xs border border-white/5">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Hover Overlay Button */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-gradient-to-t from-[#12131b] to-transparent pt-12">
                                            <div className="w-full py-2.5 bg-indigo-600/90 text-white rounded-xl text-center font-bold text-sm shadow-xl flex items-center justify-center gap-2">
                                                <Zap size={16} /> Generate Boilerplate
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── STAGE 2 & 3: Boilerplate Generation & IDE View ── */}
                {selectedIdea && (
                    <motion.div
                        key="generation-stage"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full flex gap-6 h-[calc(100vh-200px)] min-h-[600px]"
                    >
                        {/* ── Left Sidebar: File Tree ── */}
                        <div className="w-[300px] shrink-0 bg-[#0d0e15] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-white/5">
                                <button
                                    onClick={() => setSelectedIdea(null)}
                                    className="flex items-center gap-2 text-white/40 hover:text-white mb-6 text-sm transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back to Projects
                                </button>
                                <h3 className="font-bold text-indigo-300 text-sm">{selectedIdea.title}</h3>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Generated Sandbox</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {loadingTree ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                        <div className="relative w-12 h-12">
                                            <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
                                            <div className="absolute inset-0 border-2 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                                            <Code2 className="absolute inset-0 m-auto text-indigo-400" size={20} />
                                        </div>
                                        <p className="text-white/50 text-xs mt-2">Writing project code...</p>
                                    </div>
                                ) : fileTree ? (
                                    <div className="font-mono">
                                        {renderFileTree(fileTree)}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* ── Right Area: Code Viewer ── */}
                        <div className="flex-1 bg-[#1a1b26] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
                            {/* Toolbar */}
                            <div className="h-14 border-b border-white/5 bg-[#0d0e15]/50 flex items-center justify-between px-4 shrink-0">
                                <div className="flex items-center gap-2 text-white/60">
                                    <FileCode2 size={16} />
                                    <span className="font-mono text-sm font-bold text-white/80">{activeFile?.name || 'No file selected'}</span>
                                </div>

                                {fileTree && (
                                    <button
                                        onClick={generateZip}
                                        disabled={isDownloading}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-semibold transition-all"
                                    >
                                        {isDownloading ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Download size={16} />
                                        )}
                                        {isDownloading ? 'Zipping...' : 'Download ZIP'}
                                    </button>
                                )}
                            </div>

                            {/* Editor Body */}
                            <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-[#0f111a]">
                                {loadingTree ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="opacity-10 pointer-events-none">
                                            {/* Dummy code skeleton lines */}
                                            {Array.from({ length: 15 }).map((_, i) => (
                                                <div key={i} className={`h-4 bg-white rounded-full mb-3 ${i % 3 === 0 ? 'w-1/3' : i % 2 === 0 ? 'w-2/3' : 'w-1/2'} ${i % 4 === 0 && 'ml-8'}`} />
                                            ))}
                                        </div>
                                    </div>
                                ) : activeFile ? (
                                    <pre className="text-sm font-mono text-white/80 whitespace-pre-wrap focus:outline-none">
                                        <code>{activeFile.content}</code>
                                    </pre>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-white/20 gap-4">
                                        <Code2 size={64} className="opacity-50" />
                                        <p>Select a file from the tree to view its contents.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── STAGE 4: RAG Chatbot Integration ── */}
            {selectedIdea && ingestedRepo && (
                <>
                    {/* Floating Chat Button */}
                    {!chatOpen && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => setChatOpen(true)}
                            className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-colors z-50 text-white"
                        >
                            <MessageSquare size={24} />
                        </motion.button>
                    )}

                    {/* Chat Window */}
                    <AnimatePresence>
                        {chatOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                className="fixed bottom-8 right-8 w-80 sm:w-96 h-[500px] bg-[#1a1b26]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
                            >
                                {/* Chat Header */}
                                <div className="h-14 border-b border-white/10 bg-white/5 flex items-center justify-between px-4 shrink-0">
                                    <div className="flex items-center gap-2 text-white">
                                        <Github size={18} className="text-indigo-400" />
                                        <span className="font-bold text-sm">Repo Assistant</span>
                                    </div>
                                    <button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
                                    {chatMessages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-white/40 gap-3">
                                            <Github size={32} />
                                            <p className="text-xs">Ask me anything about the ingested GitHub repository!</p>
                                        </div>
                                    )}
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-white/5 text-white/90 rounded-bl-none border border-white/5 whitespace-pre-wrap'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isThinking && (
                                        <div className="flex w-full justify-start">
                                            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100" />
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Chat Input */}
                                <form onSubmit={handleChatSubmit} className="p-3 bg-black/20 border-t border-white/5 flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Ask about the codebase..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || isThinking}
                                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
};

export default ProjectBuilder;

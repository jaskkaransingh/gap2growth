import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PageTransition } from '../components/ui/PageTransition';
import { useAuthStore } from '../store/useAuthStore';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LayoutDashboard,
    Target,
    Briefcase,
    Video,
    GraduationCap,
    Map,
    Menu,
    LogOut,
    Settings,
    User,
    ChevronDown,
    Trash2,
    X
} from 'lucide-react';
import { api } from '../services/api';
import { FloatingBackground } from '../components/ui/FloatingBackground';
import logo from '../assets/logo.png';

const NAVIGATION_LINKS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Skills Analysis', path: '/skills', icon: Target },
    { name: 'Roadmap', path: '/roadmap', icon: Map },
    { name: 'Project Builder', path: '/project-builder', icon: Briefcase },
    { name: 'Job Recommendation', path: '/jobs', icon: Target },
    { name: 'Test', path: '/test', icon: GraduationCap },
    { name: 'Growth', path: '/vg', icon: Video },
    { name: 'Mock Interview', path: '/interview', icon: Video },
];

export const DashboardLayout: React.FC = () => {
    const { user, logout, hasCompletedOnboarding } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isTestPage = location.pathname === '/test';
    const isTestSubmitted = searchParams.get('submitted') === 'true';
    const shouldHideNav = isTestPage && !isTestSubmitted;

    // Mobile sidebar state
    const [mobileOpen, setMobileOpen] = useState(false);

    // Profile Dropdown state
    const [dropOpen, setDropOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
                setDropOpen(false);
                setShowDeleteConfirm(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Enforce onboarding completion before entering the dashboard
    useEffect(() => {
        if (user && !hasCompletedOnboarding) {
            navigate('/onboarding');
        }
    }, [user, hasCompletedOnboarding, navigate]);

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const firstName = user?.name?.split(' ')[0] || 'User';



    const handleDeleteAccount = async () => {
        if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
        setIsDeleting(true);
        try {
            await api.delete('/auth/delete');
            logout();
            navigate('/auth');
        } catch {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Shared Sidebar Content
    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#12131b]/80 border-r border-white/5 backdrop-blur-3xl pt-6 pb-4">
            {/* Logo */}
            <div
                className="flex items-center gap-3 px-6 mb-10 cursor-pointer select-none group"
                onClick={() => navigate('/dashboard')}
            >
                <div className="relative shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#8B5CF6] to-[#2DD4BF] rounded-lg blur opacity-25 group-hover:opacity-50 transition-all duration-300" />
                    <img src={logo} alt="Gap2Growth" className="w-8 h-8 object-contain relative transition-transform duration-300 group-hover:scale-105" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                    Gap2Growth
                </span>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {NAVIGATION_LINKS.map((link) => {
                    const isActive = location.pathname === link.path || (link.path === '/dashboard' && location.pathname === '/');
                    const Icon = link.icon;
                    return (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                ? 'bg-gradient-to-r from-indigo-500/10 to-teal-500/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/10'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div layoutId="activeNavBg" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B5CF6] to-[#2DD4BF] rounded-r-full" />
                            )}
                            <Icon size={18} className={`shrink-0 transition-colors ${isActive ? 'text-[#A78BFA]' : 'group-hover:text-white'}`} />
                            <span className="text-[13px] font-semibold tracking-wide truncate">{link.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Profile Dropdown Area */}
            <div className="px-4 pt-4 mt-auto">
                <div className="relative" ref={dropRef}>
                    <button
                        onClick={() => { setDropOpen(!dropOpen); setShowDeleteConfirm(false); }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0">
                                {initials}
                            </div>
                            <span className="text-sm font-bold text-white/90 truncate">
                                {firstName}
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-white/40 shrink-0 transition-transform duration-300 ${dropOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {dropOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="absolute bottom-full mb-2 left-0 w-full min-w-[200px] bg-[#1a1b26]/95 border border-white/10 rounded-2xl backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-2 z-50 origin-bottom"
                            >
                                <button
                                    onClick={() => { navigate('/profile'); setDropOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#8B5CF6]/20 group-hover:text-[#8B5CF6] transition-colors">
                                        <User size={15} />
                                    </div>
                                    My Profile
                                </button>
                                <button
                                    onClick={() => { navigate('/settings'); setDropOpen(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#8B5CF6]/20 group-hover:text-[#8B5CF6] transition-colors">
                                        <Settings size={15} />
                                    </div>
                                    Settings
                                </button>
                                <div className="h-px bg-white/5 my-2 mx-2" />
                                <button
                                    onClick={() => { logout(); navigate('/auth'); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-400/5 flex items-center justify-center group-hover:bg-red-400/10 transition-colors">
                                        <LogOut size={15} />
                                    </div>
                                    Sign Out
                                </button>
                                <div className="h-px bg-white/5 my-2 mx-2" />
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                                            <Trash2 size={15} />
                                        </div>
                                        Delete Account
                                    </button>
                                ) : (
                                    <div className="px-3 py-2 space-y-2">
                                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider text-center">Are you sure?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white/40 bg-white/5 hover:bg-white/10"
                                            >
                                                No
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={isDeleting}
                                                className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500/80 hover:bg-red-500"
                                            >
                                                {isDeleting ? '...' : 'Yes'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen w-full relative selection:bg-white/20 text-white font-sans flex overflow-hidden"
            style={{ backgroundColor: '#12131b' }}>

            {/* Ambient gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute w-[500px] h-[500px] rounded-full top-[-100px] left-[-100px] bg-[radial-gradient(circle,rgba(124,58,237,0.4)_0%,transparent_70%)] blur-[80px]" />
                <div className="absolute w-[400px] h-[400px] rounded-full top-[-80px] right-[50px] bg-[radial-gradient(circle,rgba(20,184,166,0.35)_0%,transparent_70%)] blur-[70px]" />
                <div className="absolute w-[600px] h-[600px] rounded-full bottom-[-100px] right-[-100px] bg-[radial-gradient(circle,rgba(139,92,246,0.2)_0%,transparent_70%)] blur-[100px]" />
            </div>

            {/* Floating Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <FloatingBackground />
            </div>

            {/* Frosted overlay */}
            <div className="fixed inset-0 z-0 backdrop-blur-[60px] bg-black/20 pointer-events-none" />

            {/* Mobile Header & Toggle */}
            {!shouldHideNav && (
                <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#12131b]/90 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <img src={logo} alt="Gap2Growth" className="w-7 h-7" />
                        <span className="text-lg font-black tracking-tight">G2G</span>
                    </div>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 -mr-2 text-white/70 hover:text-white"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex w-64 h-screen shrink-0 relative z-40 bg-black/20 backdrop-blur-xl border-r border-white/5 flex-col ${shouldHideNav ? 'hidden' : ''}`}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] z-50 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className={`flex-1 min-w-0 flex flex-col relative h-screen overflow-hidden ${shouldHideNav ? 'z-[60]' : 'z-10'}`}>
                {/* Header removed as requested */}

                <div className="w-full flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10">
                    {/* Resume Processed Badge (Global Banner style) */}
                    {user?.resumeProcessed && (
                        <div className="w-full bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-emerald-500/10 px-8 py-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-bold text-emerald-400/90 uppercase tracking-wider">Resume Analysis Active</span>
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        <PageTransition>
                            <Outlet />
                        </PageTransition>
                    </div>
                </div>
            </main>
        </div>
    );
};

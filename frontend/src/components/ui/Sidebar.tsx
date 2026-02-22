import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Target, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

export const Sidebar: React.FC = () => {
    const { logout } = useAuthStore();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BookOpen, label: 'Courses', path: '/courses' },
        { icon: Target, label: 'Quests', path: '/quests' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="w-64 h-screen fixed top-0 left-0 flex flex-col pt-6 z-40 transition-transform"
            style={{
                background: 'rgba(0, 10, 30, 0.55)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '4px 0 40px rgba(0,0,0,0.6), inset 0 0 80px rgba(59,130,246,0.04)',
            }}
        >
            <div className="px-6 mb-10 flex items-center gap-3 cursor-pointer select-none">
                <img src={logo} alt="G2G" className="w-10 h-10 object-contain shrink-0" />
                <span style={{
                    fontFamily: "'Yona', sans-serif",
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 50%, #C7D2FE 80%, #818CF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.01em',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    lineHeight: 1,
                }}>Gap2Growth</span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden",
                            isActive
                                ? "text-white"
                                : "text-white/50 hover:text-white/80"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <>
                                        <span className="absolute inset-0 rounded-xl" style={{ background: 'rgba(59,130,246,0.13)', border: '1px solid rgba(59,130,246,0.2)' }} />
                                        <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-[#3B82F6] to-[#6366F1] rounded-r-full" style={{ boxShadow: '0 0 12px rgba(59,130,246,0.7)' }} />
                                    </>
                                )}
                                {!isActive && (
                                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(255,255,255,0.04)' }} />
                                )}
                                <item.icon size={20} className={cn("relative z-10 transition-colors", isActive ? "text-[#60A5FA]" : "group-hover:text-white/80")} />
                                <span className="font-medium relative z-10 text-sm tracking-wide">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/40 hover:text-red-400 rounded-xl transition-all duration-300 group"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </motion.div>
    );
};

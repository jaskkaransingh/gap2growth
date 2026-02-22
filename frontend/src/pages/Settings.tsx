import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

import { GlassCard } from '../components/ui/GlassCard';

export const Settings: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteAccount = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            await api.delete('/auth/delete');
            logout(); // Clears store and localStorage
            navigate('/auth');
        } catch (err: any) {
            console.error('Failed to delete account:', err);
            setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
            setIsDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#818CF8] via-[#6366F1] to-[#3B82F6]">
                    Settings
                </h1>
                <p className="text-white/60 mt-1">Manage your account preferences and data.</p>
            </motion.div>

            {/* Profile Information Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <GlassCard className="p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
                        Profile Information
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-white/50 block mb-1">Username</label>
                            <div className="text-white font-medium bg-white/5 px-4 py-2 rounded-lg border border-white/5 inline-block min-w-[200px]">
                                {user?.name}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-white/50 block mb-1">Email Address</label>
                            <div className="text-white font-medium bg-white/5 px-4 py-2 rounded-lg border border-white/5 inline-block min-w-[200px]">
                                {user?.email}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative group"
            >
                {/* Red warning glow behind the card */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-rose-500/10 rounded-2xl blur opacity-50" />
                <GlassCard className="!border-red-500/30 overflow-hidden">
                    {/* Subtle red tint background */}
                    <div className="absolute inset-0 bg-red-500/[0.04] pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-red-400 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Danger Zone
                            </h2>
                            <p className="text-white/60 text-sm max-w-lg">
                                Once you delete your account, there is no going back. Please be certain.
                                This will permanently erase your profile, progression, and learning data from our servers.
                            </p>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-3">
                            <AnimatePresence mode="wait">
                                {!confirmDelete ? (
                                    <motion.button
                                        key="delete-init"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={handleDeleteAccount}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                                    >
                                        <Trash2 size={18} />
                                        Delete Account
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        key="delete-confirm"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex flex-col items-end gap-3"
                                    >
                                        <span className="text-sm text-red-300 font-medium">Are you absolutely sure?</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfirmDelete(false)}
                                                disabled={isDeleting}
                                                className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={isDeleting}
                                                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all disabled:opacity-70 disabled:hover:bg-red-500"
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Deleting...
                                                    </>
                                                ) : 'Yes, Delete My Account'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-sm mt-1"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

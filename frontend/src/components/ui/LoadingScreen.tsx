import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0F1F]">
            <motion.div
                className="relative flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="absolute w-24 h-24 border-t-2 border-r-2 border-[#818CF8] rounded-full animate-spin" />
                <div className="absolute w-16 h-16 border-b-2 border-l-2 border-[#6366F1] rounded-full animate-spin animate-reverse" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-[#3B82F6] font-bold text-xl tracking-wider"
                >
                    G2G
                </motion.div>
            </motion.div>
        </div>
    );
};

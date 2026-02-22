import React from 'react';
import { motion } from 'framer-motion';

export const SubtleBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0A0F1F]">
            {/* Very slow moving grid pattern for structural tech feel */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Slow moving, highly blurred gradient orbs for dynamic color without distraction */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -100, 50, 0],
                    scale: [1, 1.2, 0.9, 1]
                }}
                transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-r from-[#4F46E5]/10 to-[#3B82F6]/10 blur-[120px] rounded-full"
            />

            <motion.div
                animate={{
                    x: [0, -80, 60, 0],
                    y: [0, 100, -40, 0],
                    scale: [1, 1.3, 0.8, 1]
                }}
                transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-[#7C3AED]/10 to-[#6366F1]/10 blur-[120px] rounded-full"
            />

            <motion.div
                animate={{
                    x: [0, 50, -30, 0],
                    y: [0, 50, -50, 0],
                    scale: [1, 1.1, 0.9, 1]
                }}
                transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-indigo-500/[0.05] blur-[100px] rounded-full"
            />

            {/* Center vignette to ensure content remains readable */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0A0F1F]/60 to-[#0A0F1F] opacity-90" />
        </div>
    );
};

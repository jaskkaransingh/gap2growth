import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { motion } from 'framer-motion';

export interface SkillCardProps {
    title: string;
    description: string;
    progress: number;
    icon: React.ReactNode;
    colorHex?: string;
    delay?: number;
}

export const SkillCard: React.FC<SkillCardProps> = ({
    title,
    description,
    progress,
    icon,
    colorHex = '#14B8A6',
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <GlassCard className="flex flex-col gap-4 h-full">
                <div className="flex items-start justify-between">
                    <div
                        className="p-3 rounded-lg flex items-center justify-center bg-white/5 border border-white/10"
                        style={{ color: colorHex }}
                    >
                        {icon}
                    </div>
                    <span className="text-2xl font-bold" style={{ color: colorHex }}>
                        {progress}%
                    </span>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-1 text-white">{title}</h3>
                    <p className="text-[#F8FAFC]/70 text-sm line-clamp-2">
                        {description}
                    </p>
                </div>

                <div className="mt-auto pt-4">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: colorHex }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { TrendingUp, Users, Target, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export const GrowthSummary: React.FC = () => {
    const metrics = [
        { label: 'Weekly Growth', value: '+14%', icon: <TrendingUp size={20} />, color: 'text-[#818CF8]' },
        { label: 'Quests Completed', value: '24', icon: <Target size={20} />, color: 'text-[#6366F1]' },
        { label: 'Study Hours', value: '18.5', icon: <BookOpen size={20} />, color: 'text-[#3B82F6]' },
        { label: 'Peer Rank', value: 'Top 5%', icon: <Users size={20} />, color: 'text-indigo-400' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <GlassCard className="p-4 h-full">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${metric.color}`}>
                                {metric.icon}
                            </div>
                            <div>
                                <p className="text-sm text-white/60">{metric.label}</p>
                                <p className="text-xl font-bold text-white">{metric.value}</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            ))}
        </div>
    );
};

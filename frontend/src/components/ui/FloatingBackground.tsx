import React from 'react';
import { motion } from 'framer-motion';
import { Book, GraduationCap, Cpu, Code2, Brain, Sparkles, Binary, Atom } from 'lucide-react';

const icons = [
    { Icon: Book, color: '#A78BFA' },
    { Icon: GraduationCap, color: '#2DD4BF' },
    { Icon: Cpu, color: '#60A5FA' },
    { Icon: Code2, color: '#F472B6' },
    { Icon: Brain, color: '#FCD34D' },
    { Icon: Sparkles, color: '#A78BFA' },
    { Icon: Binary, color: '#2DD4BF' },
    { Icon: Atom, color: '#60A5FA' },
];

const FloatingIcon = ({ Icon, color, delay, x, y, size }: any) => (
    <motion.div
        className="absolute pointer-events-none select-none opacity-[0.03]"
        initial={{ x, y, rotate: 0 }}
        animate={{
            y: [y - 20, y + 20],
            rotate: [0, 10, -10, 0],
        }}
        transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay,
        }}
        style={{ color }}
    >
        <Icon size={size} strokeWidth={1.5} />
    </motion.div>
);

export const FloatingBackground: React.FC = () => {
    // Generate static-ish random positions to avoid hydration mismatch if using random()
    // In a real app, use a seed or a fixed set for consistency
    const decorativeIcons = [
        { id: 1, ...icons[0], x: '10%', y: '15%', size: 40, delay: 0 },
        { id: 2, ...icons[1], x: '85%', y: '10%', size: 50, delay: 2 },
        { id: 3, ...icons[2], x: '75%', y: '80%', size: 45, delay: 4 },
        { id: 4, ...icons[3], x: '15%', y: '75%', size: 35, delay: 1 },
        { id: 5, ...icons[4], x: '50%', y: '20%', size: 60, delay: 3 },
        { id: 6, ...icons[5], x: '90%', y: '40%', size: 30, delay: 5 },
        { id: 7, ...icons[6], x: '5%', y: '45%', size: 42, delay: 2.5 },
        { id: 8, ...icons[7], x: '45%', y: '85%', size: 48, delay: 0.5 },
        { id: 9, ...icons[0], x: '30%', y: '50%', size: 38, delay: 1.5 },
        { id: 10, ...icons[2], x: '65%', y: '35%', size: 55, delay: 3.5 },
    ];

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {decorativeIcons.map(item => (
                <FloatingIcon key={item.id} {...item} />
            ))}
        </div>
    );
};

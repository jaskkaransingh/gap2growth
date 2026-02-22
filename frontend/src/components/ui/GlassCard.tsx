import React from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    hoverEffect = true,
    ...props
}) => {
    return (
        <div
            className={cn(
                "rounded-2xl p-8 relative overflow-hidden z-10",
                hoverEffect && "transition-all duration-500 ease-out hover:-translate-y-1",
                className
            )}
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
            onMouseEnter={hoverEffect ? (e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.5), 0 0 30px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.35)';
            } : undefined}
            onMouseLeave={hoverEffect ? (e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.2)';
            } : undefined}
            {...props}
        >
            {/* Top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col">
                {children}
            </div>
        </div>
    );
};

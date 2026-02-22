import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

        const baseStyles = [
            "inline-flex items-center justify-center",
            "font-['Inter',system-ui,sans-serif] font-medium tracking-[-0.01em] text-sm",
            "rounded-md border",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1F]",
            "disabled:opacity-40 disabled:pointer-events-none",
            "select-none",
        ].join(' ');

        const variants = {
            // Glassmorphic blue-purple gradient — matches the shader BG palette
            primary: [
                "bg-gradient-to-br from-[#4F46E5]/40 via-[#6366F1]/30 to-[#06B6D4]/20",
                "backdrop-blur-md",
                "text-white",
                "border-[#6366F1]/30",
                "shadow-[0_2px_16px_rgba(79,70,229,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]",
                "hover:from-[#4F46E5]/60 hover:via-[#6366F1]/50 hover:to-[#06B6D4]/35",
                "hover:border-[#6366F1]/60",
                "hover:shadow-[0_4px_24px_rgba(79,70,229,0.5),0_0_40px_rgba(6,182,212,0.2),inset_0_1px_0_rgba(255,255,255,0.16)]",
                "hover:-translate-y-px",
                "active:translate-y-0 active:shadow-none",
                "focus-visible:ring-[#6366F1]/60",
            ].join(' '),

            // Softer glass — same palette, more transparent
            secondary: [
                "bg-gradient-to-br from-[#4F46E5]/10 to-[#06B6D4]/10",
                "backdrop-blur-sm",
                "text-white/75",
                "border-white/10",
                "hover:from-[#4F46E5]/25 hover:to-[#06B6D4]/20",
                "hover:border-[#6366F1]/35",
                "hover:text-white",
                "hover:-translate-y-px",
                "active:translate-y-0",
                "focus-visible:ring-[#6366F1]/40",
            ].join(' '),

            outline: [
                "bg-transparent",
                "text-white/60",
                "border-[#6366F1]/30",
                "hover:bg-[#4F46E5]/15 hover:text-white hover:border-[#6366F1]/60",
                "hover:-translate-y-px active:translate-y-0",
                "focus-visible:ring-[#6366F1]/40",
            ].join(' '),

            ghost: [
                "bg-transparent border-transparent",
                "text-white/50",
                "hover:bg-[#4F46E5]/10 hover:text-white",
                "focus-visible:ring-white/20",
            ].join(' '),

            link: [
                "bg-transparent border-transparent p-0 h-auto",
                "text-white/50 hover:text-[#06B6D4]",
                "underline-offset-4 hover:underline",
                "focus-visible:ring-white/20",
            ].join(' '),
        };

        const sizes = {
            sm: "h-8 px-3.5 text-xs gap-1.5",
            md: "h-9 px-4 text-sm gap-2",
            lg: "h-11 px-6 text-sm gap-2",
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';

export const NeonButton = Button;

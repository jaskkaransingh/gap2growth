import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AxiosError } from 'axios';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShaderBackground } from '../components/ui/neural-network-hero';

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type AuthFormValues = LoginFormValues & Partial<RegisterFormValues>;

export const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const [apiError, setApiError] = useState<string | null>(null);
    const [apiSuccess, setApiSuccess] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AuthFormValues>({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    });

    const onSubmit = async (data: AuthFormValues) => {
        setApiError(null);
        setApiSuccess(null);
        try {
            if (isLogin) {
                const response = await api.post('/auth/login', {
                    email: data.email,
                    password: data.password,
                });

                const { token, user } = response.data;
                login({
                    id: user.id,
                    name: user.username,
                    email: user.email,
                    hasCompletedOnboarding: user.hasCompletedOnboarding
                }, token);

                // Read from store state instantly by ignoring the cached hook
                const store = useAuthStore.getState();
                if (store.hasCompletedOnboarding) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            } else {
                await api.post('/auth/signup', {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                });

                // Switch to login view and show success message
                setIsLogin(true);
                reset(); // Clear the form
                setApiSuccess('Account created successfully! Please log in.');
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                setApiError(error.response?.data?.message || 'An error occurred during authentication');
            } else {
                setApiError('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#12131b] text-white overflow-hidden font-sans selection:bg-white/20">
            <ShaderBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md z-10 relative"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#3B82F6] rounded-3xl blur opacity-20" />
                <div className="relative bg-[#12131b]/60 border border-white/[0.08] rounded-3xl backdrop-blur-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold pb-1 bg-clip-text text-transparent bg-gradient-to-r from-[#818CF8] via-[#6366F1] to-[#3B82F6]">
                            {isLogin ? 'Welcome User' : 'Create Account'}
                        </h2>
                        <p className="text-white/60 mt-2">
                            {isLogin ? 'Enter your credentials to access your dashboard' : 'Sign up to start your learning journey'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <label className="block text-sm font-medium text-white/80 mb-1">Username</label>
                                <input
                                    type="text"
                                    {...register('username')}
                                    className="w-full bg-[#0B132B]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F472B6] focus:ring-1 focus:ring-[#F472B6] transition-all"
                                    placeholder="johndoe"
                                />
                                {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full bg-[#0B132B]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F472B6] focus:ring-1 focus:ring-[#F472B6] transition-all"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
                            <input
                                type="password"
                                {...register('password')}
                                className="w-full bg-[#0B132B]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F472B6] focus:ring-1 focus:ring-[#F472B6] transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        {apiError && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {apiError}
                            </div>
                        )}

                        {apiSuccess && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                                {apiSuccess}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full h-11 px-7 text-sm rounded-full font-semibold text-white overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:-translate-y-px active:scale-100 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:translate-y-0"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#3B82F6]" />
                            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            <span className="relative flex items-center justify-center gap-2">
                                {isSubmitting && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isLogin ? 'Sign In' : 'Sign Up'}
                            </span>
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                reset();
                                setApiError(null);
                                setApiSuccess(null);
                            }}
                            className="text-[#6366F1] hover:text-white transition-colors text-sm font-medium hover:underline underline-offset-4"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

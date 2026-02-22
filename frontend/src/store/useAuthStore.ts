import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CareerProfile {
    personalInfo?: { name?: string; email?: string; phone?: string };
    skills?: {
        languages?: string[];
        frameworks?: string[];
        tools?: string[];
        softSkills?: string[];
    };
    metrics?: {
        skillHealth?: number;
        marketRelevance?: number;
        experienceLevel?: string;
    };
    gaps?: string[];
    recommendations?: { title: string; reason: string }[];
}

interface User {
    id: string;
    name: string;
    email: string;
    hasCompletedOnboarding?: boolean;
    resumeProcessed?: boolean;
    careerProfile?: CareerProfile;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    completeOnboarding: () => void;
    setResumeProcessed: (value: boolean) => void;
    setCareerProfile: (profile: CareerProfile) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            login: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    hasCompletedOnboarding: !!user.hasCompletedOnboarding
                });
                localStorage.setItem('g2g_token', token);
            },
            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('g2g_token');
            },
            completeOnboarding: () => {
                set({ hasCompletedOnboarding: true });
            },
            setResumeProcessed: (value: boolean) => {
                set(state => ({
                    user: state.user ? { ...state.user, resumeProcessed: value } : null
                }));
            },
            setCareerProfile: (profile: CareerProfile) => {
                set(state => ({
                    user: state.user ? { ...state.user, careerProfile: profile } : null
                }));
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

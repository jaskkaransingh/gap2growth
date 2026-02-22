import React from 'react';
import { Outlet } from 'react-router-dom';
import { PageTransition } from '../components/ui/PageTransition';

export const RootLayout: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-[#12131b] text-white overflow-x-hidden selection:bg-white/20">
            <PageTransition className="w-full h-full">
                <Outlet />
            </PageTransition>
        </div>
    );
};

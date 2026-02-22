'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface CameraFeedProps {
    isVisible: boolean;
}

export default function CameraFeed({ isVisible }: CameraFeedProps) {
    const [hasError, setHasError] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    const handleUserMediaError = useCallback((error: string | DOMException) => {
        console.error('Webcam error:', error);
        setHasError(true);
    }, []);

    const handleUserMedia = useCallback(() => {
        setIsReady(true);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 group">
            <div className="relative w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl bg-black/50 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-blue-500/50">
                {!hasError ? (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                width: 192,
                                height: 144,
                                facingMode: 'user',
                            }}
                            onUserMedia={handleUserMedia}
                            onUserMediaError={handleUserMediaError}
                            className="w-full h-full object-cover"
                        />
                        {!isReady && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-[10px] uppercase tracking-wider font-medium">Starting...</span>
                            </div>
                        )}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/80 text-white/90 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            Live
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <CameraOff className="w-8 h-8 text-white/30 mb-2" />
                        <p className="text-[10px] text-white/50 leading-tight">
                            Camera access required for proctoring
                        </p>
                    </div>
                )}
            </div>

            {/* Status indicator on the edge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg z-[51]" />
        </div>
    );
}

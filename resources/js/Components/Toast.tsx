import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ToastProps {
    message: string | null;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 5000 }: ToastProps) {
    const [progress, setProgress] = useState(100);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            setProgress(100);
            
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300); // Allow exit animation
            }, duration);

            const interval = setInterval(() => {
                setProgress((prev) => Math.max(0, prev - (100 / (duration / 100))));
            }, 100);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        }
    }, [message, duration, onClose]);

    if (!message || !visible) return null;

    const styles = {
        success: {
            bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 backdrop-blur-md',
            border: 'border-emerald-500/20 dark:border-emerald-500/30',
            text: 'text-emerald-800 dark:text-emerald-200',
            progressBg: 'bg-emerald-500',
            icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
        },
        error: {
            bg: 'bg-rose-500/10 dark:bg-rose-500/20 backdrop-blur-md',
            border: 'border-rose-500/20 dark:border-rose-500/30',
            text: 'text-rose-800 dark:text-rose-200',
            progressBg: 'bg-rose-500',
            icon: <AlertTriangle className="w-5 h-5 text-rose-500" />
        },
        info: {
            bg: 'bg-blue-500/10 dark:bg-blue-500/20 backdrop-blur-md',
            border: 'border-blue-500/20 dark:border-blue-500/30',
            text: 'text-blue-800 dark:text-blue-200',
            progressBg: 'bg-blue-500',
            icon: <Info className="w-5 h-5 text-blue-500" />
        }
    }[type];

    return (
        <div className="fixed top-5 right-5 z-[200] max-w-sm w-full animate-slide-in pointer-events-auto">
            <div className={`relative overflow-hidden rounded-2xl border ${styles.border} ${styles.bg} p-4 shadow-xl flex items-start gap-3`}>
                <div className="flex-shrink-0 mt-0.5">
                    {styles.icon}
                </div>
                <div className="flex-1">
                    <p className={`text-xs font-black leading-relaxed ${styles.text}`}>
                        {message}
                    </p>
                </div>
                <button 
                    onClick={() => {
                        setVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-gray-200/20 w-full">
                    <div 
                        className={`h-full ${styles.progressBg} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    isDanger = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-150">
                <div className="space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                        isDanger ? 'bg-rose-500/10 text-rose-600' : 'bg-orange-500/10 text-orange-600'
                    }`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-4">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 justify-center pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 px-4 text-white text-xs font-black rounded-xl transition-all shadow-md ${
                            isDanger 
                                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-650/10' 
                                : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/10'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    title: string;
    totalAmount: number;
    onConfirm: (receivedAmount: number, changeAmount: number) => void;
    onCancel: () => void;
}

export default function PaymentModal({ isOpen, title, totalAmount, onConfirm, onCancel }: PaymentModalProps) {
    const [receivedStr, setReceivedStr] = useState('');
    const [change, setChange] = useState<number | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            setReceivedStr('');
            setChange(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;
    if (!mounted) return null;

    const receivedNum = parseFloat(receivedStr) || 0;
    const computedChange = receivedNum >= totalAmount ? receivedNum - totalAmount : 0;
    const isValid = receivedNum >= totalAmount;

    // Generate smart preset cash buttons
    const getPresets = () => {
        const presets = [totalAmount];
        const options = [5, 10, 20, 50, 100];
        
        options.forEach(opt => {
            if (opt > totalAmount && !presets.includes(opt)) {
                presets.push(opt);
            }
        });
        
        // Sort and limit to 4 presets
        return presets.sort((a, b) => a - b).slice(0, 4);
    };

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) {
            onConfirm(receivedNum, computedChange);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6 transform scale-100 transition-all duration-300">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h3 className="text-base font-black flex items-center gap-2 text-gray-900 dark:text-white">
                        <CreditCard className="w-5 h-5 text-orange-500" />
                        {title}
                    </h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleConfirm} className="space-y-4">
                    {/* Total Amount Alert */}
                    <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-850 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-450 uppercase">Total a Cobrar</span>
                        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                            ${totalAmount.toFixed(2)}
                        </span>
                    </div>

                    {/* Received Amount Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-500 dark:text-gray-450 uppercase block">
                            Monto Recibido ($)
                        </label>
                        <div className="relative">
                            <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="number"
                                step="any"
                                value={receivedStr}
                                onChange={(e) => setReceivedStr(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 text-sm font-extrabold rounded-2xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {getPresets().map((val, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setReceivedStr(val.toFixed(2))}
                                className="flex-1 min-w-[70px] py-1.5 text-[10px] font-black rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all shadow-sm"
                            >
                                {val === totalAmount ? 'Exacto' : `$${val.toFixed(0)}`}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Change Calculation */}
                    {receivedStr !== '' && (
                        <div className={`p-4 rounded-2xl border transition-all duration-300 flex justify-between items-center ${
                            isValid
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-450'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-455'
                        }`}>
                            <span className="text-xs font-black uppercase">
                                {isValid ? 'Cambio a Devolver' : 'Monto Insuficiente'}
                            </span>
                            <span className="text-xl font-black">
                                {isValid ? `$${computedChange.toFixed(2)}` : `Faltan $${(totalAmount - receivedNum).toFixed(2)}`}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-250 text-xs font-bold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid}
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/10 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <CreditCard className="w-4 h-4" />
                            Confirmar Cobro
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return require('react-dom').createPortal(modalContent, document.body);
}

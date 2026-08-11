import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, X, HelpCircle } from 'lucide-react';

type DialogType = 'alert' | 'confirm';

interface DialogState {
    isOpen: boolean;
    type: DialogType;
    message: string;
    resolve: ((value: boolean | void) => void) | null;
}

const DialogContext = createContext<{
    showAlert: (message: string) => Promise<void>;
    showConfirm: (message: string) => Promise<boolean>;
} | null>(null);

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        type: 'alert',
        message: '',
        resolve: null,
    });

    useEffect(() => {
        // Expose to window so it can be called from anywhere
        window.showAlert = async (message: string) => {
            return new Promise<void>((resolve) => {
                setDialog({ isOpen: true, type: 'alert', message, resolve: resolve as any });
            });
        };

        window.showConfirm = async (message: string) => {
            return new Promise<boolean>((resolve) => {
                setDialog({ isOpen: true, type: 'confirm', message, resolve: resolve as any });
            });
        };
    }, []);

    const handleClose = (value: boolean) => {
        if (dialog.resolve) {
            if (dialog.type === 'confirm') {
                dialog.resolve(value);
            } else {
                dialog.resolve();
            }
        }
        setDialog((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <DialogContext.Provider value={{ showAlert: window.showAlert, showConfirm: window.showConfirm }}>
            {children}
            <AnimatePresence>
                {dialog.isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => dialog.type === 'alert' ? handleClose(true) : handleClose(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dialog.type === 'alert' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {dialog.type === 'alert' ? <AlertCircle size={20} /> : <HelpCircle size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {dialog.type === 'alert' ? 'Pemberitahuan' : 'Konfirmasi'}
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{dialog.message}</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    {dialog.type === 'confirm' && (
                                        <button
                                            type="button"
                                            onClick={() => handleClose(false)}
                                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                        >
                                            <X size={16} /> Batal
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleClose(true)}
                                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                                    >
                                        <Check size={16} /> {dialog.type === 'confirm' ? 'Ya, Lanjutkan' : 'Mengerti'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DialogContext.Provider>
    );
};

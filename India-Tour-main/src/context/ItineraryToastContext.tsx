import React, { createContext, useCallback, useContext, useState } from 'react';

interface ItineraryToast {
  id: string;
  message: string;
}

interface ItineraryToastContextValue {
  showToast: (message: string) => void;
}

const ItineraryToastContext = createContext<ItineraryToastContextValue | undefined>(undefined);

export const useItineraryToast = (): ItineraryToastContextValue => {
  const ctx = useContext(ItineraryToastContext);
  if (!ctx) {
    throw new Error('useItineraryToast must be used within an ItineraryToastProvider');
  }
  return ctx;
};

export const ItineraryToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ItineraryToast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);

    // Auto-dismiss after 2.4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ItineraryToastContext.Provider value={{ showToast }}>
      {children}
      {/* Simple bottom-center toast stack */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 space-y-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2 text-sm text-slate-50 shadow-lg shadow-slate-900/30 ring-1 ring-slate-700/60"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/90 text-[10px] font-semibold text-white">
              ✓
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ItineraryToastContext.Provider>
  );
};

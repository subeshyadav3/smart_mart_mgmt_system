  import { createContext, useContext, useMemo, useState } from 'react';

  const ToastContext = createContext(null);

  export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);

    const showToast = (message, tone = 'success') => {
      setToast({ message, tone });
      window.clearTimeout(showToast._timer);
      showToast._timer = window.setTimeout(() => setToast(null), 3200);
    };

    const value = useMemo(
      () => ({
        toast,
        showToast,
        clearToast: () => setToast(null),
      }),
      [toast],
    );

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
  }

  export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
      throw new Error('useToast must be used inside ToastProvider');
    }
    return context;
  }

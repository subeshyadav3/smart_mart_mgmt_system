import { useToast } from '../../context/ToastContext';

export default function Toast() {
  const { toast, clearToast } = useToast();

  if (!toast) return null;

  // Map systemic contextual aliases directly into explicit structural token variations
  const dynamicTone = toast.tone === 'danger' ? 'danger' : toast.tone || 'info';

  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="fixed bottom-6 right-6 z-50 pointer-events-none"
    >
      <button 
        className={`toast toast-${dynamicTone} pointer-events-auto shadow-custom animate-in fade-in slide-in-from-bottom-4 duration-200`} 
        onClick={clearToast} 
        type="button"
        title="Dismiss message"
      >
        <span className="flex items-center gap-2 font-medium">
          {toast.message}
        </span>
      </button>
    </div>
  );
}
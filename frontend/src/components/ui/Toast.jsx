import { useToast } from '../../context/ToastContext';

export default function Toast() {
  const { toast, clearToast } = useToast();

  if (!toast) return null;

  return (
    <button className={`toast toast-${toast.tone}`} onClick={clearToast} type="button">
      {toast.message}
    </button>
  );
}

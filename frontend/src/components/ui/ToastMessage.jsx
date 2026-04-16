function ToastMessage({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="fixed right-4 top-4 z-50 w-full max-w-sm">
      <div className={['rounded-xl border px-4 py-3 shadow-[var(--shadow-md)]', styles[type] || styles.error].join(' ')}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium">{message}</p>
          <button type="button" className="text-xs font-semibold uppercase tracking-wide" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ToastMessage;

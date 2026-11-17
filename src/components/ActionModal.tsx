import { X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

interface ActionModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmTone?: 'danger' | 'warning' | 'primary';
  requireReason?: boolean;
  reasonLabel?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  children?: ReactNode;
}

export function ActionModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'إلغاء',
  confirmTone = 'primary',
  requireReason = false,
  reasonLabel = 'السبب / الملاحظات',
  onClose,
  onConfirm,
  children,
}: ActionModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const toneClass =
    confirmTone === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : confirmTone === 'warning'
        ? 'bg-amber-600 hover:bg-amber-700'
        : 'bg-primary hover:bg-primary-dark';

  const hasBody = Boolean(children) || requireReason;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="relative px-5 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute start-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="px-8 text-center">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            {description && (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {hasBody && (
          <div className="space-y-4 px-5 pb-2">
            {children}
            {requireReason && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  {reasonLabel} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="اكتب التفاصيل هنا..."
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center gap-2 px-5 pb-5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              if (requireReason && !reason.trim()) {
                setError('هذا الحقل إلزامي');
                return;
              }
              onConfirm(reason.trim());
            }}
            className={`rounded-lg px-4 py-2 text-sm font-bold text-white ${toneClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

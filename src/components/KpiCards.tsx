import { CheckCircle2, ClipboardList, RotateCcw, ThumbsDown, Timer } from 'lucide-react';

interface KpiCardsProps {
  total: number;
  inReview: number;
  accepted: number;
  rejected: number;
  returned: number;
}

const items = [
  {
    key: 'total',
    label: 'إجمالي الطلبات',
    icon: ClipboardList,
    color: 'text-primary bg-primary-light',
  },
  {
    key: 'inReview',
    label: 'قيد المراجعة',
    icon: Timer,
    color: 'text-status-review bg-blue-50',
  },
  {
    key: 'accepted',
    label: 'مقبولة',
    icon: CheckCircle2,
    color: 'text-status-accepted bg-green-50',
  },
  {
    key: 'rejected',
    label: 'مرفوضة',
    icon: ThumbsDown,
    color: 'text-status-rejected bg-red-50',
  },
  {
    key: 'returned',
    label: 'مُرجعة',
    icon: RotateCcw,
    color: 'text-status-returned bg-amber-50',
  },
] as const;

export function KpiCards(props: KpiCardsProps) {
  const values = {
    total: props.total,
    inReview: props.inReview,
    accepted: props.accepted,
    rejected: props.rejected,
    returned: props.returned,
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {values[key]}
              </p>
            </div>
            <div className={`rounded-lg p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

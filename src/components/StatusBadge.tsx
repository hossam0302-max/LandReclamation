import type { RequestStatus } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/status';

export function StatusBadge({
  status,
  forBeneficiary = false,
  label,
}: {
  status: RequestStatus;
  forBeneficiary?: boolean;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex h-8 min-w-48 items-center justify-center rounded-md border px-3 text-center text-xs font-semibold whitespace-nowrap ${getStatusColor(status, forBeneficiary)}`}
    >
      {label ?? getStatusLabel(status, forBeneficiary)}
    </span>
  );
}

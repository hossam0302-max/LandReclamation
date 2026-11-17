import type { ReclamationRequest, RequestStatus, Role } from '../types';

export function isReferredToAgency(
  request: ReclamationRequest,
  agency: 'land' | 'industry',
): boolean {
  const explicit =
    agency === 'land' ? request.referredToLand : request.referredToIndustry;
  if (typeof explicit === 'boolean') return explicit;

  const opinion =
    agency === 'land' ? request.landAgencyOpinion : request.industryOpinion;
  return (
    request.status === 'referred_to_agencies' ||
    request.status === 'pending_final_decision' ||
    Boolean(opinion)
  );
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'مسودة',
  pending_branch_officer: 'قيد المراجعة - موظف الفرع',
  pending_branch_manager: 'قيد المراجعة - مدير الفرع',
  referred_to_agencies: 'محال للجهات للإفادة',
  pending_final_decision: 'بانتظار القرار النهائي لمدير الفرع',
  returned_to_beneficiary: 'مرجع للمستفيد',
  returned_to_officer: 'مُرجع لموظف الفرع',
  accepted: 'طلب مقبول',
  rejected: 'طلب مرفوض',
};

/** تسميات مبسطة للمستفيد بدون ذكر الدور */
export function getStatusLabel(
  status: RequestStatus,
  forBeneficiary = false,
): string {
  if (!forBeneficiary) return STATUS_LABELS[status];

  switch (status) {
    case 'pending_branch_officer':
    case 'pending_branch_manager':
    case 'referred_to_agencies':
    case 'pending_final_decision':
    case 'returned_to_officer':
      return 'تحت الاجراء';
    case 'returned_to_beneficiary':
      return 'طلب مرجع للمستفيد';
    default:
      return STATUS_LABELS[status];
  }
}

/** طلبات المستفيد التي تُعرض بكل حقول الطلب الجديد للقراءة فقط */
export function isBeneficiaryReadOnlyRequest(status: RequestStatus) {
  switch (status) {
    case 'accepted':
    case 'rejected':
    case 'pending_branch_officer':
    case 'pending_branch_manager':
    case 'referred_to_agencies':
    case 'pending_final_decision':
    case 'returned_to_officer':
      return true;
    default:
      return false;
  }
}

export const STATUS_COLORS: Record<RequestStatus, string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  pending_branch_officer: 'bg-blue-50 text-status-review border-blue-200',
  pending_branch_manager: 'bg-blue-50 text-status-review border-blue-200',
  referred_to_agencies: 'bg-sky-50 text-status-referred border-sky-200',
  pending_final_decision: 'bg-sky-50 text-status-referred border-sky-200',
  returned_to_beneficiary: 'bg-amber-50 text-status-returned border-amber-200',
  returned_to_officer: 'bg-amber-50 text-status-returned border-amber-200',
  accepted: 'bg-green-50 text-status-accepted border-green-200',
  rejected: 'bg-red-50 text-status-rejected border-red-200',
};

/** لون موحّد لشارة «تحت الاجراء» في لوحة المستفيد */
export const BENEFICIARY_IN_PROGRESS_COLOR =
  'bg-blue-50 text-status-review border-blue-200';

export function getStatusColor(
  status: RequestStatus,
  forBeneficiary = false,
): string {
  if (!forBeneficiary) return STATUS_COLORS[status];

  switch (status) {
    case 'pending_branch_officer':
    case 'pending_branch_manager':
    case 'referred_to_agencies':
    case 'pending_final_decision':
    case 'returned_to_officer':
      return BENEFICIARY_IN_PROGRESS_COLOR;
    default:
      return STATUS_COLORS[status];
  }
}

export const APPLICANT_TYPE_LABELS = {
  owner: 'مالك',
  tenant: 'مستأجر',
  agent: 'وكيل شرعي',
} as const;

export const RECOMMENDATION_LABELS = {
  approve: 'موافقة',
  reject: 'عدم موافقة',
  conditional: 'موافقة مشروطة',
} as const;

export const ROLE_DASHBOARD_TITLES: Record<Role, string> = {
  beneficiary: 'لوحة المستفيد',
  branch_officer: 'لوحة موظف الفرع',
  branch_manager: 'لوحة مدير الفرع',
  land_agency: 'لوحة موظف وكالة الأراضي',
  industry_ministry: 'لوحة ممثل وزارة الصناعة',
};

export const STEPPER_STEPS = [
  { key: 'submit', label: 'تقديم الطلب' },
  { key: 'officer', label: 'موظف الفرع' },
  { key: 'manager', label: 'مدير الفرع' },
  { key: 'agencies', label: 'إفادات الجهات' },
  { key: 'final', label: 'القرار النهائي' },
] as const;

export function getActiveStepIndex(status: RequestStatus): number {
  switch (status) {
    case 'draft':
    case 'returned_to_beneficiary':
      return 0;
    case 'pending_branch_officer':
    case 'returned_to_officer':
      return 1;
    case 'pending_branch_manager':
      return 2;
    case 'referred_to_agencies':
      return 3;
    case 'pending_final_decision':
      return 4;
    case 'accepted':
    case 'rejected':
      return 4;
    default:
      return 0;
  }
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

export function formatArea(area: number, unit: 'hectare' | 'sqm'): string {
  return unit === 'hectare' ? `${area} هكتار` : `${area} م²`;
}

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Factory,
  FileText,
  RotateCcw,
  Send,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ActionModal } from '../components/ActionModal';
import { HistoryTable } from '../components/HistoryTable';
import { StatusBadge } from '../components/StatusBadge';
import { Stepper } from '../components/Stepper';
import { useApp } from '../context/AppContext';
import { AGRICULTURAL_RECORDS } from '../data/agriculturalRecords';
import type { AgencyOpinion, Recommendation } from '../types';
import { openAttachmentInNewTab } from '../utils/attachmentPreview';
import {
  APPLICANT_TYPE_LABELS,
  formatArea,
  formatDate,
  formatFileSize,
  isBeneficiaryReadOnlyRequest,
  isReferredToAgency,
  RECOMMENDATION_LABELS,
} from '../utils/status';

type ModalKind =
  | 'officer-forward'
  | 'officer-reject'
  | 'officer-return'
  | 'manager-refer-land'
  | 'manager-refer-industry'
  | 'manager-accept'
  | 'manager-reject'
  | 'manager-return'
  | 'manager-final-reject'
  | 'manager-return-land'
  | 'manager-return-industry'
  | 'manager-return-officer'
  | 'agency-opinion'
  | null;

const ACTION_BTN_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white whitespace-nowrap';

function equalActionMinWidth(labels: string[]) {
  const widest = labels.reduce(
    (max, label) => (label.length > max.length ? label : max),
    '',
  );
  return `${Math.max(widest.length, 1) + 6}ch`;
}

const OFFICER_ACTION_MIN_WIDTH = equalActionMinWidth([
  'قبول وتحويل لمدير الفرع',
  'إرجاع للمستفيد',
  'رفض الطلب',
]);

const LAND_REFERRAL_LABEL = 'إحالة إلى موظف وكالة الأراضي';
const INDUSTRY_REFERRAL_LABEL = 'إحالة إلى ممثل وزارة الصناعة';

const MANAGER_ACTION_MIN_WIDTH = equalActionMinWidth([
  'قبول مباشرة',
  LAND_REFERRAL_LABEL,
  INDUSTRY_REFERRAL_LABEL,
  'إرجاع لموظف الفرع',
  'رفض مباشرة',
]);

const RETURN_TO_LAND_LABEL = 'إرجاع إلى موظف وكالة الأراضي';
const RETURN_TO_INDUSTRY_LABEL = 'إرجاع إلى ممثل وزارة الصناعة';
const RETURN_TO_OFFICER_LABEL = 'إرجاع إلى موظف الفرع';

const MANAGER_FINAL_ACTION_MIN_WIDTH = equalActionMinWidth([
  'قبول الطلب (قرار نهائي)',
  'رفض الطلب (قرار نهائي)',
  RETURN_TO_LAND_LABEL,
  RETURN_TO_INDUSTRY_LABEL,
  RETURN_TO_OFFICER_LABEL,
]);

function ManagerAgencyCard({
  title,
  icon,
  tone,
  opinion,
  waitingLabel,
}: {
  title: string;
  icon: ReactNode;
  tone: 'land' | 'industry';
  opinion?: AgencyOpinion;
  waitingLabel: string;
}) {
  const isLand = tone === 'land';
  const waiting = !opinion;
  const useBlue =
    opinion != null && (!isLand || opinion.recommendation === 'approve');
  const shell = waiting
    ? 'border-yellow-200 bg-yellow-50 shadow-yellow-100'
    : useBlue
      ? 'border-sky-500 bg-sky-50 shadow-sky-100'
      : 'border-emerald-500 bg-emerald-50 shadow-emerald-100';
  const titleColor = waiting
    ? 'text-yellow-900'
    : useBlue
      ? 'text-sky-900'
      : 'text-emerald-900';
  const valueColor = waiting
    ? 'text-yellow-800'
    : useBlue
      ? 'text-sky-700'
      : 'text-emerald-700';
  const iconWrap = waiting
    ? 'bg-yellow-400'
    : useBlue
      ? 'bg-sky-600'
      : 'bg-emerald-600';

  return (
    <article className={`rounded-2xl border-2 p-5 shadow-md ${shell}`}>
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${iconWrap}`}
        >
          {icon}
        </span>
        <h3 className={`text-lg font-extrabold ${titleColor}`}>{title}</h3>
      </div>
      {opinion ? (
        <>
          <p className={`mt-4 text-sm font-extrabold ${valueColor}`}>
            تم الاستلام — {RECOMMENDATION_LABELS[opinion.recommendation]}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-800">{opinion.text}</p>
          <p className="mt-3 text-xs text-slate-600">
            بواسطة {opinion.submittedBy} — {formatDate(opinion.submittedAt)}
          </p>
        </>
      ) : (
        <p className={`mt-4 text-sm font-extrabold ${valueColor}`}>
          {waitingLabel}
        </p>
      )}
    </article>
  );
}

export function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentUser,
    requests,
    officerDecision,
    managerDecision,
    submitAgencyOpinion,
    managerFinalDecision,
  } = useApp();

  const request = useMemo(
    () => requests.find((r) => r.id === id) ?? null,
    [id, requests],
  );

  const [modal, setModal] = useState<ModalKind>(null);
  const [agencyRec, setAgencyRec] = useState<Recommendation>('approve');
  const [toast, setToast] = useState('');
  const [actionSuccess, setActionSuccess] = useState<{
    title: string;
    message: string;
    details?: string[];
  } | null>(null);
  const [requestTab, setRequestTab] = useState<'details' | 'procedures'>(
    'details',
  );

  useEffect(() => {
    setRequestTab('details');
  }, [request?.id]);

  useEffect(() => {
    if (!actionSuccess) return;
    // نوافذ نجاح أدوار الموظفين تُغلق بعد ثانيتين ثم تعود للوحة
    const timer = window.setTimeout(() => {
      setActionSuccess(null);
      navigate('/app');
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [actionSuccess, navigate]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!request) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <p className="text-slate-600">الطلب غير موجود</p>
        <Link to="/app" className="mt-3 inline-block text-primary font-bold">
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const showActionSuccess = (
    title: string,
    message: string,
    details?: string[],
  ) => {
    setActionSuccess({ title, message, details });
  };

  const canOfficerAct =
    currentUser.role === 'branch_officer' &&
    (request.status === 'pending_branch_officer' ||
      request.status === 'returned_to_officer');

  const canManagerAct =
    currentUser.role === 'branch_manager' &&
    request.status === 'pending_branch_manager';

  const canReferLand =
    currentUser.role === 'branch_manager' &&
    (request.status === 'pending_branch_manager' ||
      request.status === 'referred_to_agencies') &&
    !isReferredToAgency(request, 'land');

  const canReferIndustry =
    currentUser.role === 'branch_manager' &&
    (request.status === 'pending_branch_manager' ||
      request.status === 'referred_to_agencies') &&
    !isReferredToAgency(request, 'industry');

  const canManagerFinal =
    currentUser.role === 'branch_manager' &&
    request.status === 'pending_final_decision' &&
    (!isReferredToAgency(request, 'land') ||
      Boolean(request.landAgencyOpinion)) &&
    (!isReferredToAgency(request, 'industry') ||
      Boolean(request.industryOpinion));

  const canLandOpinion =
    currentUser.role === 'land_agency' &&
    request.status === 'referred_to_agencies' &&
    !request.landAgencyOpinion;

  const canIndustryOpinion =
    currentUser.role === 'industry_ministry' &&
    request.status === 'referred_to_agencies' &&
    !request.industryOpinion;

  const canBeneficiaryEdit =
    currentUser.role === 'beneficiary' &&
    request.status === 'returned_to_beneficiary';
  const showBeneficiaryFullEntry =
    currentUser.role === 'beneficiary' &&
    (request.status === 'accepted' ||
      request.status === 'rejected' ||
      request.status === 'draft');
  const farmRecord =
    AGRICULTURAL_RECORDS.find(
      (record) => record.id === request.agriculturalRecordId,
    ) ??
    AGRICULTURAL_RECORDS.find(
      (record) => record.recordNumber === request.agriculturalRecordNumber,
    ) ??
    AGRICULTURAL_RECORDS.find(
      (record) =>
        record.region === request.region &&
        record.governorate === request.governorate &&
        (record.siteName === request.siteName ||
          record.farmName === request.siteName ||
          record.deedNumber === request.deedNumber),
    ) ??
    AGRICULTURAL_RECORDS.find(
      (record) =>
        record.latitude === request.latitude &&
        record.longitude === request.longitude,
    ) ??
    null;
  const isBranchManager = currentUser.role === 'branch_manager';
  const isBranchOfficer = currentUser.role === 'branch_officer';
  const usesRequestTabs =
    isBranchManager ||
    isBranchOfficer ||
    currentUser.role === 'land_agency' ||
    currentUser.role === 'industry_ministry';
  const showRequestDetails = !usesRequestTabs || requestTab === 'details';
  const showRequestProcedures = usesRequestTabs && requestTab === 'procedures';

  // الطلب المُرجع للمستفيد يُفتح في شاشة التعديل بدون مراحل
  if (canBeneficiaryEdit) {
    return <Navigate to={`/requests/${request.id}/edit`} replace />;
  }

  if (
    currentUser.role === 'beneficiary' &&
    isBeneficiaryReadOnlyRequest(request.status)
  ) {
    return <Navigate to={`/requests/${request.id}/view`} replace />;
  }

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: ReactNode;
  }) => (
    <div className="rounded-lg border border-border bg-surface/60 px-3 py-2.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm font-semibold text-slate-800">
        {value}
      </dd>
    </div>
  );

  return (
    <div className="space-y-5">
      {currentUser.role !== 'beneficiary' && request.status !== 'draft' && (
        <Stepper status={request.status} />
      )}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-800">
              {request.requestNumber}
            </h2>
            <StatusBadge
              status={request.status}
              forBeneficiary={currentUser.role === 'beneficiary'}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {currentUser.role === 'beneficiary' &&
              request.status === 'draft' && (
                <Link
                  to={`/requests/${request.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-sm font-bold text-primary hover:bg-primary-light"
                >
                  استكمال الطلب
                </Link>
              )}
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-dark"
            >
              <ArrowRight className="h-4 w-4" />
              رجوع
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          آخر تحديث: {formatDate(request.updatedAt)}
        </p>
      </div>

      {actionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">
              {actionSuccess.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {actionSuccess.message}
            </p>
            {actionSuccess.details && actionSuccess.details.length > 0 && (
              <ul className="mt-4 space-y-2 rounded-xl border border-border bg-surface px-4 py-3 text-right">
                {actionSuccess.details.map((item) => (
                  <li
                    key={item}
                    className="text-sm font-bold text-slate-800"
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {toast}
        </div>
      )}

      {request.status === 'returned_to_beneficiary' && request.returnReason && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-bold">تنبيه: تم إرجاع الطلب إليك</p>
          <p className="mt-1 leading-6">{request.returnReason}</p>
        </div>
      )}

      {request.status === 'returned_to_officer' &&
        currentUser.role === 'branch_officer' &&
        request.returnReason && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-bold">تنبيه: تم إرجاع الطلب إليك</p>
            <p className="mt-1 leading-6">{request.returnReason}</p>
          </div>
        )}

      {request.status === 'rejected' && request.rejectReason && (
        <article className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 shadow-md shadow-red-100">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400 text-white">
              <ThumbsDown className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-extrabold text-red-900">سبب الرفض</h3>
          </div>
          <p className="mt-4 text-sm font-extrabold leading-7 text-red-800">
            {request.rejectReason}
          </p>
        </article>
      )}

      <div
        className={
          usesRequestTabs
            ? 'space-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm'
            : 'contents'
        }
      >
      {usesRequestTabs && (
        <div className="flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setRequestTab('details')}
            className={`px-4 py-2.5 text-sm font-extrabold ${
              requestTab === 'details'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            تفاصيل الطلب
          </button>
          <button
            type="button"
            onClick={() => setRequestTab('procedures')}
            className={`px-4 py-2.5 text-sm font-extrabold ${
              requestTab === 'procedures'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            إجراءات الطلب
          </button>
        </div>
      )}

      {isBranchManager &&
        showRequestDetails &&
        (isReferredToAgency(request, 'land') ||
          isReferredToAgency(request, 'industry') ||
          request.landAgencyOpinion ||
          request.industryOpinion) && (
          <section className="grid gap-4 sm:grid-cols-2">
            {(isReferredToAgency(request, 'land') ||
              request.landAgencyOpinion) && (
              <ManagerAgencyCard
                title="إفادة وكالة الأراضي"
                icon={<Building2 className="h-5 w-5" />}
                tone="land"
                opinion={request.landAgencyOpinion}
                waitingLabel="بانتظار إفادة وكالة الأراضي"
              />
            )}
            {(isReferredToAgency(request, 'industry') ||
              request.industryOpinion) && (
              <ManagerAgencyCard
                title="إفادة وزارة الصناعة"
                icon={<Factory className="h-5 w-5" />}
                tone="industry"
                opinion={request.industryOpinion}
                waitingLabel="بانتظار إفادة وزارة الصناعة"
              />
            )}
          </section>
        )}

      {showRequestDetails &&
        currentUser.role !== 'beneficiary' &&
        currentUser.role !== 'branch_manager' &&
        (request.status === 'referred_to_agencies' ||
          request.status === 'pending_final_decision') && (
          <div
            className={`grid gap-3 ${
              currentUser.role === 'land_agency' ||
              currentUser.role === 'industry_ministry'
                ? 'grid-cols-1'
                : 'sm:grid-cols-2'
            }`}
          >
            {currentUser.role !== 'industry_ministry' &&
              isReferredToAgency(request, 'land') && (
              <div
                className={`rounded-xl border p-4 ${
                  request.landAgencyOpinion
                    ? 'border-green-200 bg-green-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Building2 className="h-4 w-4" />
                  إفادة وكالة الأراضي
                </div>
                <p className="mt-2 text-sm">
                  {request.landAgencyOpinion
                    ? currentUser.role === 'land_agency' &&
                      request.landAgencyOpinion.recommendation === 'approve'
                      ? 'تم تسليم الافادة - موافقة'
                      : `تم الاستلام — ${RECOMMENDATION_LABELS[request.landAgencyOpinion.recommendation]}`
                    : 'بانتظار إفادة وكالة الأراضي'}
                </p>
              </div>
            )}
            {currentUser.role !== 'land_agency' &&
              isReferredToAgency(request, 'industry') && (
              <div
                className={`rounded-xl border p-4 ${
                  request.industryOpinion
                    ? 'border-green-200 bg-green-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Factory className="h-4 w-4" />
                  إفادة وزارة الصناعة
                </div>
                <p className="mt-2 text-sm">
                  {request.industryOpinion
                    ? currentUser.role === 'industry_ministry' &&
                      request.industryOpinion.recommendation === 'approve'
                      ? 'تم تسليم الافادة - موافقة'
                      : `تم الاستلام — ${RECOMMENDATION_LABELS[request.industryOpinion.recommendation]}`
                    : 'بانتظار إفادة وزارة الصناعة'}
                </p>
              </div>
            )}
          </div>
        )}

      {showRequestDetails && (
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-primary">بيانات الطلب</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="مقدم الطلب" value={request.fullName} />
          <InfoRow label="رقم الهوية" value={request.nationalId} />
          <InfoRow label="الجوال" value={request.mobile} />
          <InfoRow label="البريد" value={request.email} />
          <InfoRow
            label="الصفة"
            value={APPLICANT_TYPE_LABELS[request.applicantType]}
          />
          <InfoRow label="المنطقة" value={request.region} />
          <InfoRow label="المحافظة / المركز" value={request.governorate} />
          <InfoRow label="اسم الموقع" value={request.siteName} />
          <InfoRow label="رقم الصك / المستند" value={request.deedNumber} />
          {(showBeneficiaryFullEntry || request.agriculturalRecordNumber) && (
            <InfoRow
              label="رقم السجل الزراعي"
              value={
                request.agriculturalRecordNumber ||
                farmRecord?.recordNumber ||
                '—'
              }
            />
          )}
          {showBeneficiaryFullEntry && (
            <>
              <InfoRow
                label="اسم المزرعة"
                value={farmRecord?.farmName || '—'}
              />
              <InfoRow label="المالك" value={farmRecord?.ownerName || '—'} />
              <InfoRow
                label="نوع المحصول"
                value={farmRecord?.cropType || '—'}
              />
            </>
          )}
          {(showBeneficiaryFullEntry || request.surveyNumber) && (
            <InfoRow
              label={
                showBeneficiaryFullEntry
                  ? 'الرقم المرجعي للرفع المساحي'
                  : 'الرقم المساحي'
              }
              value={
                request.surveyNumber
                  ? `${request.surveyNumber}${request.surveyVerified ? ' (تم التحقق)' : ''}`
                  : '—'
              }
            />
          )}
          <InfoRow
            label="المساحة"
            value={formatArea(request.area, request.areaUnit)}
          />
          <InfoRow
            label="الإحداثيات"
            value={`${request.latitude} ، ${request.longitude}`}
          />
          <InfoRow label="مصدر المياه" value={request.waterSource} />
        </div>
        <div className="mt-4 grid gap-3">
          <InfoRow
            label="الاستخدام الحالي"
            value={request.currentUse?.trim() || (showBeneficiaryFullEntry ? '—' : request.currentUse)}
          />
          <InfoRow
            label="خطة الاستصلاح والمحاصيل"
            value={
              request.reclamationPlan?.trim() ||
              (showBeneficiaryFullEntry ? '—' : request.reclamationPlan)
            }
          />
        </div>

        {(showBeneficiaryFullEntry || request.obstacles?.trim()) && (
          <div className="mt-4">
            <InfoRow
              label="المعوقات"
              value={request.obstacles?.trim() || '—'}
            />
          </div>
        )}

        {showBeneficiaryFullEntry && (
          <div className="mt-4">
            <InfoRow
              label="وصف المرفق"
              value={
                request.attachmentDescription?.trim() ||
                request.surveyReport?.description ||
                '—'
              }
            />
          </div>
        )}

        {request.surveyReport && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-light p-2 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {request.attachmentDescription ||
                    request.surveyReport.description ||
                    'مرفق الطلب'}
                </p>
                <p className="text-xs text-slate-500">
                  {request.surveyReport.name} —{' '}
                  {formatFileSize(request.surveyReport.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                openAttachmentInNewTab({
                  ...request.surveyReport!,
                  description:
                    request.attachmentDescription ||
                    request.surveyReport!.description ||
                    'مرفق الطلب',
                })
              }
              className="rounded-lg bg-water px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-800"
            >
              معاينة الملف
            </button>
          </div>
        )}

        {(showBeneficiaryFullEntry || request.notes?.trim()) && (
          <div className="mt-4">
            <InfoRow label="ملاحظات" value={request.notes?.trim() || '—'} />
          </div>
        )}
      </section>
      )}

      {isBranchManager && showRequestDetails && (
        <HistoryTable history={request.history} />
      )}

      {usesRequestTabs && showRequestDetails && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setRequestTab('procedures')}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            التالي
          </button>
        </div>
      )}

      {showRequestDetails &&
        currentUser.role !== 'beneficiary' &&
        currentUser.role !== 'branch_manager' &&
        ((currentUser.role !== 'industry_ministry' &&
          request.landAgencyOpinion) ||
          (currentUser.role !== 'land_agency' && request.industryOpinion)) && (
          <section
            className={`grid gap-3 ${
              currentUser.role === 'land_agency' ||
              currentUser.role === 'industry_ministry'
                ? 'grid-cols-1'
                : 'lg:grid-cols-2'
            }`}
          >
            {currentUser.role !== 'industry_ministry' &&
              request.landAgencyOpinion && (
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                  <h4 className="font-bold text-primary">إفادة وكالة الأراضي</h4>
                  <p className="mt-2 text-sm">
                    التوصية:{' '}
                    <strong>
                      {
                        RECOMMENDATION_LABELS[
                          request.landAgencyOpinion.recommendation
                        ]
                      }
                    </strong>
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {request.landAgencyOpinion.text}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    بواسطة {request.landAgencyOpinion.submittedBy} —{' '}
                    {formatDate(request.landAgencyOpinion.submittedAt)}
                  </p>
                </div>
              )}
            {currentUser.role !== 'land_agency' && request.industryOpinion && (
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <h4 className="font-bold text-primary">إفادة وزارة الصناعة</h4>
                <p className="mt-2 text-sm">
                  التوصية:{' '}
                  <strong>
                    {
                      RECOMMENDATION_LABELS[
                        request.industryOpinion.recommendation
                      ]
                    }
                  </strong>
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {request.industryOpinion.text}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  بواسطة {request.industryOpinion.submittedBy} —{' '}
                  {formatDate(request.industryOpinion.submittedAt)}
                </p>
              </div>
            )}
          </section>
        )}

      {((showRequestProcedures && canOfficerAct) ||
        (showRequestProcedures && (canLandOpinion || canIndustryOpinion)) ||
        (showRequestProcedures &&
          (canManagerAct ||
            canReferLand ||
            canReferIndustry ||
            canManagerFinal))) && (
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">اتخاذ إجراء</h3>

          {canOfficerAct && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setModal('officer-forward')}
                style={{ minWidth: OFFICER_ACTION_MIN_WIDTH }}
                className={`${ACTION_BTN_BASE} bg-primary hover:bg-primary-dark`}
              >
                <Send className="h-4 w-4 shrink-0" />
                قبول وتحويل لمدير الفرع
              </button>
              <button
                type="button"
                onClick={() => setModal('officer-return')}
                style={{ minWidth: OFFICER_ACTION_MIN_WIDTH }}
                className={`${ACTION_BTN_BASE} bg-amber-600 hover:bg-amber-700`}
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                إرجاع للمستفيد
              </button>
              <button
                type="button"
                onClick={() => setModal('officer-reject')}
                style={{ minWidth: OFFICER_ACTION_MIN_WIDTH }}
                className={`${ACTION_BTN_BASE} bg-red-600 hover:bg-red-700`}
              >
                <ThumbsDown className="h-4 w-4 shrink-0" />
                رفض الطلب
              </button>
            </div>
          )}

          {(canManagerAct || canReferLand || canReferIndustry) && (
            <div className="flex flex-wrap gap-2">
              {canManagerAct && (
                <button
                  type="button"
                  onClick={() => setModal('manager-accept')}
                  style={{ minWidth: MANAGER_ACTION_MIN_WIDTH }}
                  className={`${ACTION_BTN_BASE} bg-green-700 hover:bg-green-800`}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  قبول مباشرة
                </button>
              )}
              {canReferLand && (
                <button
                  type="button"
                  onClick={() => setModal('manager-refer-land')}
                  style={{ minWidth: MANAGER_ACTION_MIN_WIDTH }}
                  className={`${ACTION_BTN_BASE} bg-water hover:bg-cyan-800`}
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  {LAND_REFERRAL_LABEL}
                </button>
              )}
              {canReferIndustry && (
                <button
                  type="button"
                  onClick={() => setModal('manager-refer-industry')}
                  style={{ minWidth: MANAGER_ACTION_MIN_WIDTH }}
                  className={`${ACTION_BTN_BASE} bg-water hover:bg-cyan-800`}
                >
                  <Factory className="h-4 w-4 shrink-0" />
                  {INDUSTRY_REFERRAL_LABEL}
                </button>
              )}
              {canManagerAct && (
                <button
                  type="button"
                  onClick={() => setModal('manager-return')}
                  style={{ minWidth: MANAGER_ACTION_MIN_WIDTH }}
                  className={`${ACTION_BTN_BASE} bg-amber-600 hover:bg-amber-700`}
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  إرجاع لموظف الفرع
                </button>
              )}
              {canManagerAct && (
                <button
                  type="button"
                  onClick={() => setModal('manager-reject')}
                  style={{ minWidth: MANAGER_ACTION_MIN_WIDTH }}
                  className={`${ACTION_BTN_BASE} bg-red-600 hover:bg-red-700`}
                >
                  <ThumbsDown className="h-4 w-4 shrink-0" />
                  رفض مباشرة
                </button>
              )}
            </div>
          )}

          {canManagerFinal && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const res = managerFinalDecision(request.id, 'accept');
                  if (res.ok) {
                    showActionSuccess(
                      'تم قبول الطلب',
                      'تم قبول الطلب نهائياً بعد الاطلاع على الإفادتين',
                    );
                  }
                }}
                style={{ minWidth: MANAGER_FINAL_ACTION_MIN_WIDTH }}
                className={`${ACTION_BTN_BASE} bg-green-700 hover:bg-green-800`}
              >
                <ThumbsUp className="h-4 w-4 shrink-0" />
                قبول الطلب (قرار نهائي)
              </button>
              <button
                type="button"
                onClick={() => setModal('manager-final-reject')}
                style={{ minWidth: MANAGER_FINAL_ACTION_MIN_WIDTH }}
                className={`${ACTION_BTN_BASE} bg-red-600 hover:bg-red-700`}
              >
                <ThumbsDown className="h-4 w-4 shrink-0" />
                رفض الطلب (قرار نهائي)
              </button>
              {request.landAgencyOpinion && request.industryOpinion && (
                <>
                  <button
                    type="button"
                    onClick={() => setModal('manager-return-land')}
                    style={{ minWidth: MANAGER_FINAL_ACTION_MIN_WIDTH }}
                    className={`${ACTION_BTN_BASE} bg-amber-600 hover:bg-amber-700`}
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    {RETURN_TO_LAND_LABEL}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal('manager-return-industry')}
                    style={{ minWidth: MANAGER_FINAL_ACTION_MIN_WIDTH }}
                    className={`${ACTION_BTN_BASE} bg-amber-600 hover:bg-amber-700`}
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    {RETURN_TO_INDUSTRY_LABEL}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal('manager-return-officer')}
                    style={{ minWidth: MANAGER_FINAL_ACTION_MIN_WIDTH }}
                    className={`${ACTION_BTN_BASE} bg-amber-600 hover:bg-amber-700`}
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    {RETURN_TO_OFFICER_LABEL}
                  </button>
                </>
              )}
            </div>
          )}

          {(canLandOpinion || canIndustryOpinion) && (
            <button
              type="button"
              onClick={() => setModal('agency-opinion')}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
            >
              <FileText className="h-4 w-4" />
              تقديم الإفادة
            </button>
          )}
        </section>
      )}

      {showRequestProcedures &&
        !(
          canOfficerAct ||
          canLandOpinion ||
          canIndustryOpinion ||
          canManagerAct ||
          canReferLand ||
          canReferIndustry ||
          canManagerFinal
        ) && (
          <p className="rounded-xl border border-border bg-white px-4 py-6 text-sm text-slate-600">
            لا توجد إجراءات متاحة على هذا الطلب.
          </p>
        )}

      {showRequestProcedures && (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => setRequestTab('details')}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            السابق
          </button>
        </div>
      )}
      </div>

      <ActionModal
        open={modal === 'officer-forward'}
        title="تأكيد التحويل لمدير الفرع"
        description="هل أنت متأكد من قبول الطلب وتحويله إلى مدير الفرع؟"
        confirmLabel="نعم"
        cancelLabel="لا"
        onClose={() => setModal(null)}
        onConfirm={() => {
          const res = officerDecision(request.id, 'forward');
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تمت العملية بنجاح',
            'تم قبول الطلب وتحويله إلى مدير الفرع بنجاح',
          );
        }}
      />

      <ActionModal
        open={modal === 'officer-reject'}
        title="رفض الطلب"
        description="يرجى كتابة شرح سبب الرفض بشكل واضح"
        confirmLabel="تأكيد الرفض"
        confirmTone="danger"
        requireReason
        reasonLabel="شرح سبب الرفض"
        onClose={() => setModal(null)}
        onConfirm={(reason) => {
          const res = officerDecision(request.id, 'reject', reason);
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess('تمت العملية بنجاح', 'تم رفض الطلب بنجاح');
        }}
      />

      <ActionModal
        open={modal === 'officer-return'}
        title="إرجاع الطلب للمستفيد"
        description="يرجى توضيح الملاحظات المطلوب استكمالها"
        confirmLabel="تأكيد الإرجاع"
        confirmTone="warning"
        requireReason
        reasonLabel="شرح سبب الإرجاع"
        onClose={() => setModal(null)}
        onConfirm={(reason) => {
          const res = officerDecision(request.id, 'return', reason);
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تمت العملية بنجاح',
            'تم إرجاع الطلب إلى المستفيد بنجاح',
          );
        }}
      />

      <ActionModal
        open={modal === 'manager-accept'}
        title="تأكيد قبول الطلب"
        description="هل أنت متأكد من قبول الطلب مباشرة واكتمال المعالجة؟"
        confirmLabel="نعم"
        cancelLabel="لا"
        onClose={() => setModal(null)}
        onConfirm={() => {
          const res = managerDecision(request.id, 'accept');
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تم قبول الطلب',
            'تم قبول الطلب بنجاح واكتمال المعالجة',
          );
        }}
      />

      <ActionModal
        open={modal === 'manager-refer-land'}
        title="تأكيد الإحالة إلى موظف وكالة الأراضي"
        description="هل أنت متأكد من إحالة الطلب إلى موظف وكالة الأراضي؟"
        confirmLabel="نعم"
        cancelLabel="لا"
        onClose={() => setModal(null)}
        onConfirm={() => {
          const res = managerDecision(request.id, 'refer-land');
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تم الإحالة بنجاح',
            'تم إحالة الطلب إلى موظف وكالة الأراضي',
          );
        }}
      />

      <ActionModal
        open={modal === 'manager-refer-industry'}
        title="تأكيد الإحالة إلى ممثل وزارة الصناعة"
        description="هل أنت متأكد من إحالة الطلب إلى ممثل وزارة الصناعة؟"
        confirmLabel="نعم"
        cancelLabel="لا"
        onClose={() => setModal(null)}
        onConfirm={() => {
          const res = managerDecision(request.id, 'refer-industry');
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تم الإحالة بنجاح',
            'تم إحالة الطلب إلى ممثل وزارة الصناعة',
          );
        }}
      />

      <ActionModal
        open={modal === 'manager-reject'}
        title="رفض الطلب مباشرة"
        confirmLabel="تأكيد الرفض"
        confirmTone="danger"
        requireReason
        reasonLabel="شرح سبب الرفض"
        onClose={() => setModal(null)}
        onConfirm={(reason) => {
          const res = managerDecision(request.id, 'reject', reason);
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تم رفض الطلب',
            'تم رفض الطلب بنجاح وإنهاء العملية',
          );
        }}
      />

      <ActionModal
        open={modal === 'manager-return'}
        title="إرجاع الطلب لموظف الفرع"
        confirmLabel="تأكيد الإرجاع"
        confirmTone="warning"
        requireReason
        reasonLabel="شرح سبب الإرجاع"
        onClose={() => setModal(null)}
        onConfirm={(reason) => {
          const res = managerDecision(request.id, 'return', reason);
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showToast('تم إرجاع الطلب لموظف الفرع');
        }}
      />

      <ActionModal
        open={modal === 'manager-return-land'}
        title="إرجاع إلى موظف وكالة الأراضي"
        description="سيتم حذف إفادة وكالة الأراضي وإعادة الطلب إليها لتقديم إفادة جديدة"
        confirmLabel="تأكيد الإرجاع"
        confirmTone="warning"
        requireReason
        reasonLabel="شرح سبب الإرجاع"
        onClose={() => setModal(null)}
        onConfirm={(reason) => {
          const res = managerFinalDecision(request.id, 'return-land', reason);
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تم الإرجاع بنجاح',
            'تم إرجاع الطلب إلى موظف وكالة الأراضي',
          );
        }}
      />

      <ActionModal
        open={modal === 'manager-return-industry'}
        title="إرجاع إلى ممثل وزارة الصناعة"
        description="سيتم حذف إفادة وزارة الصناعة وإعادة الطلب إليه لتقديم إفادة جديدة"
        confirmLabel="تأكيد الإرجاع"
        confirmTone="warning"
        requireReason
        reasonLabel="شرح سبب الإرجاع"
        onClose={() => setModal(null)}
        onConfirm={(reason) => {
          const res = managerFinalDecision(
            request.id,
            'return-industry',
            reason,
          );
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تم الإرجاع بنجاح',
            'تم إرجاع الطلب إلى ممثل وزارة الصناعة',
          );
        }}
      />

      <ActionModal
        open={modal === 'manager-return-officer'}
        title="إرجاع إلى موظف الفرع"
        description="سيتم إرجاع الطلب إلى موظف الفرع مع الإبقاء على إفادتي الجهتين"
        confirmLabel="تأكيد الإرجاع"
        confirmTone="warning"
        requireReason
        reasonLabel="شرح سبب الإرجاع"
        onClose={() => setModal(null)}
        onConfirm={(reason) => {
          const res = managerFinalDecision(
            request.id,
            'return-officer',
            reason,
          );
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تم الإرجاع بنجاح',
            'تم إرجاع الطلب إلى موظف الفرع',
          );
        }}
      />

      <ActionModal
        open={modal === 'manager-final-reject'}
        title="رفض الطلب بعد الإفادتين"
        confirmLabel="تأكيد الرفض النهائي"
        confirmTone="danger"
        requireReason
        reasonLabel="شرح سبب الرفض"
        onClose={() => setModal(null)}
        onConfirm={(reason) => {
          const res = managerFinalDecision(request.id, 'reject', reason);
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showActionSuccess(
            'تم رفض الطلب',
            'تم رفض الطلب نهائياً بعد الاطلاع على الإفادتين',
          );
        }}
      />

      <ActionModal
        open={modal === 'agency-opinion'}
        title={
          canLandOpinion
            ? 'تقديم إفادة وكالة الأراضي'
            : 'تقديم إفادة وزارة الصناعة'
        }
        description="اختر التوصية واكتب نص الإفادة التفصيلي"
        confirmLabel="إرسال الإفادة"
        requireReason
        reasonLabel="نص الإفادة التفصيلي"
        onClose={() => setModal(null)}
        onConfirm={(text) => {
          const agency = canLandOpinion ? 'land' : 'industry';
          const res = submitAgencyOpinion(
            request.id,
            agency,
            agencyRec,
            text,
          );
          if (!res.ok) {
            alert(res.message);
            return;
          }
          setModal(null);
          showToast('تم إرسال الإفادة بنجاح');
        }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            التوصية <span className="text-red-500">*</span>
          </label>
          <select
            value={agencyRec}
            onChange={(e) =>
              setAgencyRec(e.target.value as Recommendation)
            }
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="approve">موافقة</option>
            <option value="reject">عدم موافقة</option>
            <option value="conditional">موافقة مشروطة</option>
          </select>
        </div>
      </ActionModal>
    </div>
  );
}

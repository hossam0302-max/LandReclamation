import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FileText,
  FilePenLine,
  MapPin,
  Save,
  ShieldCheck,
  X,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AGRICULTURAL_RECORDS } from '../data/agriculturalRecords';
import { DEFAULT_SURVEY_ATTACHMENT } from '../data/mockData';
import { useApp } from '../context/AppContext';
import type {
  Attachment,
  ReclamationRequest,
  RequestFormData,
} from '../types';
import { ActionModal } from '../components/ActionModal';
import { StatusBadge } from '../components/StatusBadge';
import { openAttachmentInNewTab } from '../utils/attachmentPreview';
import { formatArea, formatFileSize, isBeneficiaryReadOnlyRequest } from '../utils/status';

const ACCEPTED = 'application/pdf,image/png,image/jpeg,image/jpg,image/webp';

function formatSurveyDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

const emptyForm = (defaults?: Partial<RequestFormData>): RequestFormData => ({
  fullName: '',
  nationalId: '',
  mobile: '',
  email: '',
  applicantType: 'owner',
  agriculturalRecordId: '',
  region: '',
  governorate: '',
  siteName: '',
  deedNumber: '',
  area: '',
  areaUnit: 'hectare',
  latitude: '',
  longitude: '',
  currentUse: '',
  waterSource: '',
  reclamationPlan: '',
  surveyNumber: '',
  surveyVerified: false,
  attachmentDescription: '',
  obstacles: '',
  notes: '',
  surveyReport: null,
  ...defaults,
});

function resolveAgriculturalRecord(request: ReclamationRequest) {
  if (request.agriculturalRecordId) {
    const byId = AGRICULTURAL_RECORDS.find(
      (r) => r.id === request.agriculturalRecordId,
    );
    if (byId) return byId;
  }

  return (
    AGRICULTURAL_RECORDS.find(
      (r) =>
        r.region === request.region &&
        r.governorate === request.governorate &&
        (r.deedNumber === request.deedNumber ||
          r.siteName === request.siteName),
    ) ??
    AGRICULTURAL_RECORDS.find(
      (r) =>
        r.region === request.region && r.governorate === request.governorate,
    ) ??
    null
  );
}

function formFromRequest(request: ReclamationRequest): RequestFormData {
  const record = resolveAgriculturalRecord(request);
  const surveyReport =
    request.surveyReport ??
    ({
      ...DEFAULT_SURVEY_ATTACHMENT,
      description:
        request.attachmentDescription ||
        DEFAULT_SURVEY_ATTACHMENT.description,
    } satisfies Attachment);

  return emptyForm({
    fullName: request.fullName,
    nationalId: request.nationalId,
    mobile: request.mobile,
    email: request.email,
    applicantType: request.applicantType,
    agriculturalRecordId: record?.id ?? request.agriculturalRecordId ?? '',
    region: request.region,
    governorate: request.governorate,
    siteName: request.siteName,
    deedNumber: request.deedNumber,
    area: String(request.area),
    areaUnit: request.areaUnit,
    latitude: request.latitude,
    longitude: request.longitude,
    currentUse: request.currentUse,
    waterSource: request.waterSource,
    reclamationPlan: request.reclamationPlan,
    surveyNumber:
      request.surveyNumber || record?.suggestedSurveyNumber || '',
    surveyVerified:
      Boolean(request.surveyVerified) ||
      Boolean(request.surveyNumber || record?.suggestedSurveyNumber),
    attachmentDescription:
      request.attachmentDescription ||
      surveyReport.description ||
      'تقرير رفع مساحي للأرض المراد استصلاحها',
    obstacles: request.obstacles ?? '',
    notes: request.notes ?? '',
    surveyReport,
  });
}

type FormErrors = Partial<Record<keyof RequestFormData | 'agriculturalRecordId', string>>;

function validate(data: RequestFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.agriculturalRecordId) {
    errors.agriculturalRecordId = 'يجب اختيار سجل زراعي';
  }

  const required: (keyof RequestFormData)[] = [
    'fullName',
    'nationalId',
    'mobile',
    'email',
    'region',
    'governorate',
    'siteName',
    'deedNumber',
    'area',
    'latitude',
    'longitude',
    'currentUse',
    'waterSource',
    'reclamationPlan',
    'surveyNumber',
    'attachmentDescription',
  ];

  for (const key of required) {
    if (!String(data[key] ?? '').trim()) {
      errors[key] = 'هذا الحقل إلزامي';
    }
  }

  if (data.area && Number.isNaN(Number(data.area))) {
    errors.area = 'أدخل مساحة رقمية صحيحة';
  }
  if (data.area && Number(data.area) <= 0) {
    errors.area = 'المساحة يجب أن تكون أكبر من صفر';
  }
  if (!data.surveyVerified) {
    errors.surveyNumber = 'يجب التحقق من الرقم المساحي أولاً';
  }
  if (!data.surveyReport) {
    errors.surveyReport = 'يجب اختيار مرفق للرفع';
  }

  return errors;
}

export function RequestFormPage({ readOnly = false }: { readOnly?: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentUser,
    requests,
    createRequest,
    saveDraft,
    updateReturnedRequest,
  } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editing = useMemo(() => {
    if (!id) return null;
    return requests.find((r) => r.id === id) ?? null;
  }, [id, requests]);

  const [form, setForm] = useState<RequestFormData>(() => {
    if (editing) return formFromRequest(editing);
    return emptyForm({
      fullName: currentUser?.name ?? '',
      nationalId: currentUser?.nationalId ?? '',
      mobile: currentUser?.mobile ?? '',
      email: currentUser?.email ?? '',
    });
  });

  useEffect(() => {
    if (!editing) return;
    setForm(formFromRequest(editing));
  }, [editing?.id]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [showVerifyToast, setShowVerifyToast] = useState(false);
  const [submitPopup, setSubmitPopup] = useState<{
    requestNumber: string;
    fullName: string;
    isEdit: boolean;
    fromDraft: boolean;
  } | null>(null);
  const [showDraftPopup, setShowDraftPopup] = useState(false);
  const [showResubmitConfirm, setShowResubmitConfirm] = useState(false);
  const [farmMapPhase, setFarmMapPhase] = useState<FarmMapPhase>('closed');

  const selectedRecord = useMemo(
    () =>
      AGRICULTURAL_RECORDS.find((r) => r.id === form.agriculturalRecordId) ??
      null,
    [form.agriculturalRecordId],
  );

  useEffect(() => {
    setFarmMapPhase('closed');
  }, [selectedRecord?.id]);

  useEffect(() => {
    if (farmMapPhase !== 'closing') return;
    const timer = window.setTimeout(
      () => setFarmMapPhase('closed'),
      FARM_MAP_MOTION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [farmMapPhase]);

  useEffect(() => {
    if (!showVerifyToast) return;
    const timer = window.setTimeout(() => setShowVerifyToast(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showVerifyToast]);

  useEffect(() => {
    if (!submitPopup) return;
    const timer = window.setTimeout(() => {
      setSubmitPopup(null);
      if (submitPopup.isEdit && editing) {
        navigate(`/requests/${editing.id}`);
      } else {
        navigate('/app');
      }
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [submitPopup, editing, navigate]);

  useEffect(() => {
    if (!showDraftPopup) return;
    const timer = window.setTimeout(() => {
      setShowDraftPopup(false);
      navigate('/app');
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [showDraftPopup, navigate]);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'beneficiary') return <Navigate to="/app" replace />;
  if (readOnly) {
    if (!editing || !isBeneficiaryReadOnlyRequest(editing.status)) {
      return <Navigate to="/app" replace />;
    }
  } else if (
    id &&
    !submitPopup &&
    (!editing ||
      (editing.status !== 'returned_to_beneficiary' &&
        editing.status !== 'draft'))
  ) {
    return <Navigate to="/app" replace />;
  }

  const isDraft = editing?.status === 'draft';

  const setField = <K extends keyof RequestFormData>(
    key: K,
    value: RequestFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyAgriculturalRecord = (recordId: string) => {
    const record = AGRICULTURAL_RECORDS.find((r) => r.id === recordId);
    if (!record) {
      setForm((prev) => ({
        ...prev,
        agriculturalRecordId: '',
        surveyVerified: false,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      agriculturalRecordId: record.id,
      region: record.region,
      governorate: record.governorate,
      siteName: record.siteName,
      deedNumber: record.deedNumber,
      area: String(record.area),
      areaUnit: record.areaUnit,
      latitude: record.latitude,
      longitude: record.longitude,
      currentUse: record.currentUse,
      waterSource: record.waterSource,
      reclamationPlan: `استصلاح مزرعة «${record.farmName}» وزراعة ${record.cropType} وفق الخطة المعتمدة.`,
      surveyNumber: record.suggestedSurveyNumber,
      surveyVerified: false,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.agriculturalRecordId;
      return next;
    });
  };

  const verifySurveyNumber = () => {
    if (!form.surveyNumber.trim()) {
      setErrors((prev) => ({
        ...prev,
        surveyNumber: 'أدخل الرقم المساحي أولاً',
      }));
      return;
    }
    setForm((prev) => ({ ...prev, surveyVerified: true }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.surveyNumber;
      return next;
    });
    setShowVerifyToast(true);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!form.attachmentDescription.trim()) return;
    if (
      !ACCEPTED.split(',').includes(file.type) &&
      !file.type.startsWith('image/')
    ) {
      alert('يُسمح فقط بملفات PDF أو الصور');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف يجب ألا يتجاوز 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const attachment: Attachment = {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: String(reader.result),
        description: form.attachmentDescription,
      };
      setField('surveyReport', attachment);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.surveyReport;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const buildPayload = (): RequestFormData => ({
    ...form,
    surveyReport: form.surveyReport
      ? { ...form.surveyReport, description: form.attachmentDescription }
      : null,
  });

  const submitValidatedRequest = () => {
    const payload = buildPayload();

    if (editing) {
      updateReturnedRequest(editing.id, payload);
      setShowResubmitConfirm(false);
      setSubmitPopup({
        requestNumber: editing.requestNumber,
        fullName: payload.fullName,
        isEdit: true,
        fromDraft: editing.status === 'draft',
      });
      return;
    }

    const number = createRequest(payload);
    setSubmitPopup({
      requestNumber: number,
      fullName: payload.fullName,
      isEdit: false,
      fromDraft: false,
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    if (editing) {
      setShowResubmitConfirm(true);
      return;
    }

    submitValidatedRequest();
  };

  const onSaveDraft = () => {
    const payload: RequestFormData = {
      ...form,
      surveyReport: form.surveyReport
        ? { ...form.surveyReport, description: form.attachmentDescription }
        : null,
    };
    saveDraft(payload);
    setShowDraftPopup(true);
  };

  const fieldClass = (key: keyof RequestFormData) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 ${
      errors[key]
        ? 'border-red-300 focus:border-red-400'
        : 'border-border focus:border-primary'
    }`;

  const lockedFieldClass =
    'w-full cursor-not-allowed rounded-lg border border-border bg-slate-50 px-3 py-2.5 text-sm text-slate-700';

  const editableClass = (key: keyof RequestFormData) =>
    readOnly ? lockedFieldClass : fieldClass(key);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {showVerifyToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">
              تم التحقق بنجاح
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-7">
              <div>
                <p className="font-bold text-slate-800">رقم الرفع المساحي</p>
                <p className="font-bold text-secondary">
                  {form.surveyNumber.trim()}
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  الجهة المصدرة للرقم المرجعي للرفع المساحي
                </p>
                <p className="font-bold text-secondary">
                  {selectedRecord?.surveyIssuer}
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-800">تاريخ الرفع المساحي</p>
                <p className="font-bold text-secondary">
                  {selectedRecord
                    ? formatSurveyDate(selectedRecord.surveyDate)
                    : ''}
                </p>
              </div>
              <p className="text-slate-600">
                تم التحقق من الرقم ووجد انه صحيح
              </p>
            </div>
          </div>
        </div>
      )}

      <ActionModal
        open={showResubmitConfirm}
        title={isDraft ? 'تأكيد إرسال الطلب' : 'تأكيد إعادة إرسال الطلب'}
        description={
          isDraft
            ? 'هل أنت متأكد من إرسال الطلب إلى موظف الفرع؟'
            : 'هل أنت متأكد من إعادة إرسال الطلب بعد استكمال الملاحظات؟'
        }
        confirmLabel="نعم"
        cancelLabel="لا"
        onClose={() => setShowResubmitConfirm(false)}
        onConfirm={() => submitValidatedRequest()}
      />

      {submitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">
              {submitPopup.isEdit && !submitPopup.fromDraft
                ? 'تم إعادة إرسال الطلب بنجاح'
                : 'تم إرسال الطلب بنجاح'}
            </h3>
            <div className="mt-4 space-y-3 rounded-xl border border-border bg-surface px-4 py-3 text-right">
              <div>
                <p className="text-xs text-slate-500">رقم الطلب</p>
                <p className="text-base font-extrabold text-primary">
                  {submitPopup.requestNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">اسم مقدم الطلب</p>
                <p className="text-base font-bold text-slate-800">
                  {submitPopup.fullName}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDraftPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <FilePenLine className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">
              تم حفظ الطلب كمسودة
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              يمكنك الرجوع لاحقاً واستكمال بيانات الطلب من قائمة طلباتك
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {editing ? (
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-800">
              {editing.requestNumber}
            </h2>
            <StatusBadge status={editing.status} forBeneficiary />
          </div>
        ) : (
          <h2 className="text-2xl font-extrabold text-slate-800">
            طلب استصلاح زراعي جديد
          </h2>
        )}
        <Link
          to="/app"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-dark"
        >
          <ArrowRight className="h-4 w-4" />
          رجوع
        </Link>
      </div>

      {editing?.returnReason && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-bold">سبب الإرجاع</p>
          <p className="mt-1 leading-6">{editing.returnReason}</p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"
      >
        <section className="space-y-4">
          <h3 className="border-b border-border pb-2 text-lg font-bold text-primary">
            بيانات مقدم الطلب
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                الاسم الكامل *
              </label>
              <input
                className={lockedFieldClass}
                value={form.fullName}
                disabled
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                رقم الهوية الوطنية *
              </label>
              <input
                className={lockedFieldClass}
                value={form.nationalId}
                disabled
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                رقم الجوال *
              </label>
              <input
                className={lockedFieldClass}
                value={form.mobile}
                disabled
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                className={lockedFieldClass}
                value={form.email}
                disabled
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                صفة مقدم الطلب *
              </label>
              <select
                className={lockedFieldClass}
                value={form.applicantType}
                disabled
              >
                <option value="owner">مالك</option>
                <option value="tenant">مستأجر</option>
                <option value="agent">وكيل شرعي</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="border-b border-border pb-2 text-lg font-bold text-primary">
            السجل الزراعي وبيانات المزرعة
          </h3>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              السجلات الزراعية *
            </label>
            <select
              className={
                readOnly
                  ? lockedFieldClass
                  : `w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.agriculturalRecordId
                        ? 'border-red-300'
                        : 'border-border focus:border-primary'
                    }`
              }
              value={form.agriculturalRecordId}
              disabled={readOnly}
              onChange={(e) => applyAgriculturalRecord(e.target.value)}
            >
              <option value="">اختر سجلاً زراعياً</option>
              {AGRICULTURAL_RECORDS.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.recordNumber} — {record.farmName}
                </option>
              ))}
            </select>
            {errors.agriculturalRecordId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.agriculturalRecordId}
              </p>
            )}
          </div>

          {selectedRecord && (
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary-light/40 p-4">
              <p className="mb-3 text-sm font-bold text-primary">
                بيانات المزرعة المرتبطة بالسجل
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="اسم المزرعة" value={selectedRecord.farmName} />
                <InfoItem
                  label="رقم السجل"
                  value={selectedRecord.recordNumber}
                />
                <InfoItem label="المالك" value={selectedRecord.ownerName} />
                <InfoItem label="المنطقة" value={selectedRecord.region} />
                <InfoItem
                  label="المحافظة / المركز"
                  value={selectedRecord.governorate}
                />
                <InfoItem label="اسم الموقع" value={selectedRecord.siteName} />
                <InfoItem
                  label="رقم الصك"
                  value={selectedRecord.deedNumber}
                />
                <InfoItem
                  label="المساحة"
                  value={formatArea(
                    selectedRecord.area,
                    selectedRecord.areaUnit,
                  )}
                />
                <div className="flex flex-col gap-2">
                  <InfoItem
                    label="الإحداثيات"
                    value={`${selectedRecord.latitude} ، ${selectedRecord.longitude}`}
                  />
                  <button
                    type="button"
                    onClick={() => setFarmMapPhase('open')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-dark"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    عرض على الخريطة
                  </button>
                </div>
                <InfoItem
                  label="الاستخدام الحالي"
                  value={selectedRecord.currentUse}
                />
                <InfoItem
                  label="مصدر المياه"
                  value={selectedRecord.waterSource}
                />
                <InfoItem
                  label="نوع المحصول"
                  value={selectedRecord.cropType}
                />
              </div>
              {farmMapPhase !== 'closed' && (
                <FarmMapPanel
                  latitude={selectedRecord.latitude}
                  longitude={selectedRecord.longitude}
                  farmName={selectedRecord.farmName}
                  closing={farmMapPhase === 'closing'}
                  onClose={() =>
                    setFarmMapPhase((phase) =>
                      phase === 'open' ? 'closing' : phase,
                    )
                  }
                />
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              الرقم المرجعي للرفع المساحي *
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={editableClass('surveyNumber')}
                value={form.surveyNumber}
                disabled={readOnly}
                onChange={(e) => {
                  setField('surveyNumber', e.target.value);
                  setField('surveyVerified', false);
                }}
                placeholder="ادخل الرقم المرجعي للرفع المساحي"
              />
              {!readOnly && (
              <button
                type="button"
                onClick={verifySurveyNumber}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-water px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-800"
              >
                <ShieldCheck className="h-4 w-4" />
                تحقق
              </button>
              )}
            </div>
            {form.surveyVerified && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                تم التحقق من الرقم المساحي
              </p>
            )}
            {errors.surveyNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.surveyNumber}</p>
            )}
            {selectedRecord && (
              <p className="mt-1 text-xs text-slate-500">
                مثال: {selectedRecord.suggestedSurveyNumber}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              خطة الاستصلاح والمحاصيل المستهدفة *
            </label>
            <textarea
              rows={3}
              className={editableClass('reclamationPlan')}
              value={form.reclamationPlan}
              disabled={readOnly}
              onChange={(e) => setField('reclamationPlan', e.target.value)}
            />
            {errors.reclamationPlan && (
              <p className="mt-1 text-xs text-red-600">
                {errors.reclamationPlan}
              </p>
            )}
          </div>
        </section>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">المعوقات</label>
          <textarea
            rows={3}
            className={editableClass('obstacles')}
            value={form.obstacles}
            disabled={readOnly}
            onChange={(e) => setField('obstacles', e.target.value)}
          />
        </div>

        <section className="space-y-4">
          <h3 className="border-b border-border pb-2 text-lg font-bold text-primary">
            المرفقات
          </h3>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-semibold">
                وصف المرفق *
              </label>
              <input
                className={editableClass('attachmentDescription')}
                value={form.attachmentDescription}
                disabled={readOnly}
                onChange={(e) =>
                  setField('attachmentDescription', e.target.value)
                }
                placeholder="مثال: تقرير رفع مساحي للأرض المراد استصلاحها"
              />
              {errors.attachmentDescription && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.attachmentDescription}
                </p>
              )}
            </div>
            {!readOnly && (
            <div className="sm:pt-7">
              <button
                type="button"
                disabled={!form.attachmentDescription.trim()}
                onClick={() => {
                  if (!form.attachmentDescription.trim()) return;
                  fileInputRef.current?.click();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300 sm:w-auto"
              >
                <Upload className="h-4 w-4" />
                اختيار مرفق للرفع
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
            )}
          </div>

          {form.surveyReport ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-light p-2 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {form.surveyReport.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(form.surveyReport.size)}
                    {form.attachmentDescription
                      ? ` — ${form.attachmentDescription}`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openAttachmentInNewTab({
                      ...form.surveyReport!,
                      description:
                        form.attachmentDescription ||
                        form.surveyReport!.description,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-water hover:bg-water-light"
                >
                  <Eye className="h-3.5 w-3.5" />
                  معاينة
                </button>
                {!readOnly && (
                <button
                  type="button"
                  onClick={() => setField('surveyReport', null)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </button>
                )}
              </div>
            </div>
          ) : (
            errors.surveyReport && (
              <p className="text-xs text-red-600">{errors.surveyReport}</p>
            )
          )}
        </section>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">ملاحظات</label>
          <textarea
            rows={3}
            className={editableClass('notes')}
            value={form.notes}
            disabled={readOnly}
            onChange={(e) => setField('notes', e.target.value)}
          />
        </div>

        {!readOnly && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Link
            to="/app"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </Link>
          {!editing && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100"
            >
              <FilePenLine className="h-4 w-4" />
              حفظ كمسودة
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            <Save className="h-4 w-4" />
            {isDraft ? 'إرسال الطلب' : editing ? 'إعادة إرسال الطلب' : 'إرسال الطلب'}
          </button>
        </div>
        )}
      </form>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function farmMapEmbedUrl(latitude: string, longitude: string) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const span = 0.03;
  const bbox = [lon - span, lat - span, lon + span, lat + span]
    .map((value) => value.toFixed(6))
    .join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;
}

type FarmMapPhase = 'closed' | 'open' | 'closing';

const FARM_MAP_MOTION_MS = 2000;

function FarmMapPanel({
  latitude,
  longitude,
  farmName,
  closing,
  onClose,
}: {
  latitude: string;
  longitude: string;
  farmName: string;
  closing: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`farm-map-panel absolute inset-0 z-20 bg-white${closing ? ' is-closing' : ''}`}
    >
      <iframe
        title={`خريطة ${farmName}`}
        src={farmMapEmbedUrl(latitude, longitude)}
        className="h-full w-full border-0"
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-md hover:bg-slate-50"
      >
        <X className="h-3.5 w-3.5" />
        إغلاق
      </button>
    </div>
  );
}

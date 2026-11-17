import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AGRICULTURAL_RECORDS } from '../data/agriculturalRecords';
import { isReferredToAgency } from '../utils/status';
import {
  createInitialState,
  createManagerStageRequests,
  createStaffInboxRequests,
  STORAGE_KEY,
  USERS,
} from '../data/mockData';
import type {
  AgencyOpinion,
  AppState,
  HistoryEntry,
  ReclamationRequest,
  Recommendation,
  RequestFormData,
  RequestStatus,
  Role,
  User,
} from '../types';

interface AppContextValue {
  users: User[];
  requests: ReclamationRequest[];
  currentUser: User | null;
  pendingLoginUserId: string | null;
  selectPendingLoginUser: (userId: string) => void;
  login: (nationalId: string, password: string) => { ok: boolean; message?: string };
  loginAs: (userId: string) => void;
  logout: () => void;
  createRequest: (data: RequestFormData) => string;
  saveDraft: (data: RequestFormData) => string;
  updateReturnedRequest: (requestId: string, data: RequestFormData) => void;
  officerDecision: (
    requestId: string,
    decision: 'forward' | 'reject' | 'return',
    reason?: string,
  ) => { ok: boolean; message?: string };
  managerDecision: (
    requestId: string,
    decision:
      | 'accept'
      | 'reject'
      | 'return'
      | 'refer-land'
      | 'refer-industry',
    reason?: string,
  ) => { ok: boolean; message?: string };
  submitAgencyOpinion: (
    requestId: string,
    agency: 'land' | 'industry',
    recommendation: Recommendation,
    text: string,
  ) => { ok: boolean; message?: string };
  managerFinalDecision: (
    requestId: string,
    decision:
      | 'accept'
      | 'reject'
      | 'return-land'
      | 'return-industry'
      | 'return-officer',
    reason?: string,
  ) => { ok: boolean; message?: string };
  getRequestsForRole: (role: Role, userId: string) => ReclamationRequest[];
  getKpis: (role: Role, userId: string) => {
    total: number;
    inReview: number;
    accepted: number;
    rejected: number;
    returned: number;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

const SESSION_USER_KEY = `${STORAGE_KEY}-session-user`;

function readSessionUserId(): string | null {
  try {
    return sessionStorage.getItem(SESSION_USER_KEY);
  } catch {
    return null;
  }
}

function writeSessionUserId(userId: string | null) {
  try {
    if (userId) sessionStorage.setItem(SESSION_USER_KEY, userId);
    else sessionStorage.removeItem(SESSION_USER_KEY);
  } catch {
    // تجاهل قيود التخزين في بعض أوضاع المتصفح
  }
}

function consumeRequestedUserId(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('login');
    if (!requested || !USERS.some((user) => user.id === requested)) return null;
    params.delete('login');
    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', nextUrl);
    writeSessionUserId(requested);
    return requested;
  } catch {
    return null;
  }
}

function loadState(): AppState {
  const requestedUserId = consumeRequestedUserId();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = createInitialState();
      return { ...fresh, currentUserId: requestedUserId ?? readSessionUserId() };
    }
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.users?.length || !Array.isArray(parsed.requests)) {
      const fresh = createInitialState();
      return requestedUserId ? { ...fresh, currentUserId: requestedUserId } : fresh;
    }

    // الجلسة تُحفظ في sessionStorage فقط:
    // - Refresh في نفس التبويب: تبقى داخل النظام
    // - فتح البرنامج من جديد: العودة لصفحة الدخول
    const sessionUserId = requestedUserId ?? readSessionUserId();
    const currentUserId =
      sessionUserId && USERS.some((u) => u.id === sessionUserId)
        ? sessionUserId
        : null;
    const savedIds = new Set(parsed.requests.map((request) => request.id));
    const seededRequests = [
      ...createManagerStageRequests(),
      ...createStaffInboxRequests(),
    ].filter((request) => !savedIds.has(request.id));

    return {
      ...parsed,
      users: USERS,
      requests: [...parsed.requests, ...seededRequests],
      currentUserId,
    };
  } catch {
    const fresh = createInitialState();
    return requestedUserId ? { ...fresh, currentUserId: requestedUserId } : fresh;
  }
}

function saveState(state: AppState) {
  writeSessionUserId(state.currentUserId);
  // لا نحفظ الجلسة في localStorage حتى لا تُستعاد بعد إغلاق البرنامج
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, currentUserId: null }),
  );
}

function nowIso() {
  return new Date().toISOString();
}

function makeHistory(
  stage: string,
  actor: User,
  action: string,
  notes?: string,
): HistoryEntry {
  return {
    id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stage,
    actorName: actor.name,
    actorRole: actor.roleLabel,
    date: nowIso(),
    action,
    notes,
  };
}

function updateRequest(
  state: AppState,
  requestId: string,
  updater: (req: ReclamationRequest, actor: User) => ReclamationRequest,
): AppState {
  const actor = state.users.find((u) => u.id === state.currentUserId);
  if (!actor) return state;

  const requests = state.requests.map((req) => {
    if (req.id !== requestId) return req;
    return updater(req, actor);
  });

  return { ...state, requests };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [pendingLoginUserId, setPendingLoginUserId] = useState<string | null>(
    'u-beneficiary',
  );

  const persist = useCallback((next: AppState) => {
    setState(next);
    saveState(next);
  }, []);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.currentUserId, state.users],
  );

  const selectPendingLoginUser = useCallback((userId: string) => {
    setPendingLoginUserId(userId);
  }, []);

  const login = useCallback((nationalId: string, password: string) => {
    let ok = false;
    let message: string | undefined;

    setState((prev) => {
      const user = prev.users.find(
        (u) => u.nationalId === nationalId.trim() && u.password === password,
      );
      if (!user) {
        message = 'رقم الهوية أو كلمة المرور غير صحيحة';
        return prev;
      }
      ok = true;
      const next = { ...prev, currentUserId: user.id };
      saveState(next);
      return next;
    });

    if (ok) setPendingLoginUserId(null);
    return ok ? { ok: true } : { ok: false, message };
  }, []);

  const loginAs = useCallback((userId: string) => {
    setState((prev) => {
      const user = prev.users.find((u) => u.id === userId);
      if (!user) return prev;
      const next = { ...prev, currentUserId: user.id };
      saveState(next);
      return next;
    });
    setPendingLoginUserId(null);
  }, []);

  const logout = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, currentUserId: null };
      saveState(next);
      return next;
    });
    setPendingLoginUserId('u-beneficiary');
  }, []);

  const createRequest = useCallback(
    (data: RequestFormData) => {
      if (!currentUser) throw new Error('يجب تسجيل الدخول أولاً');
      const seq = state.nextRequestSeq;
      const requestNumber = `REQ-2026-${String(seq).padStart(4, '0')}`;
      const request: ReclamationRequest = {
        id: `req-${Date.now()}`,
        requestNumber,
        status: 'pending_branch_officer',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        beneficiaryId: currentUser.id,
        fullName: data.fullName,
        nationalId: data.nationalId,
        mobile: data.mobile,
        email: data.email,
        applicantType: data.applicantType,
        region: data.region,
        governorate: data.governorate,
        siteName: data.siteName,
        deedNumber: data.deedNumber,
        area: Number(data.area),
        areaUnit: data.areaUnit,
        latitude: data.latitude,
        longitude: data.longitude,
        currentUse: data.currentUse,
        waterSource: data.waterSource,
        reclamationPlan: data.reclamationPlan,
        surveyReport: data.surveyReport
          ? {
              ...data.surveyReport,
              description: data.attachmentDescription || data.surveyReport.description,
            }
          : null,
        agriculturalRecordId: data.agriculturalRecordId,
        agriculturalRecordNumber:
          AGRICULTURAL_RECORDS.find((r) => r.id === data.agriculturalRecordId)
            ?.recordNumber,
        surveyNumber: data.surveyNumber,
        surveyVerified: data.surveyVerified,
        attachmentDescription: data.attachmentDescription,
        obstacles: data.obstacles.trim(),
        notes: data.notes.trim(),
        history: [
          makeHistory(
            'تقديم الطلب',
            currentUser,
            'تقديم طلب استصلاح زراعي جديد',
            'تم رفع تقرير الرفع المساحي',
          ),
        ],
      };

      persist({
        ...state,
        requests: [request, ...state.requests],
        nextRequestSeq: seq + 1,
      });

      return requestNumber;
    },
    [currentUser, persist, state],
  );

  const saveDraft = useCallback(
    (data: RequestFormData) => {
      if (!currentUser) throw new Error('يجب تسجيل الدخول أولاً');
      const seq = state.nextRequestSeq;
      const requestNumber = `REQ-2026-${String(seq).padStart(4, '0')}`;
      const areaValue = Number(data.area);
      const request: ReclamationRequest = {
        id: `req-${Date.now()}`,
        requestNumber,
        status: 'draft',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        beneficiaryId: currentUser.id,
        fullName: data.fullName || currentUser.name,
        nationalId: data.nationalId || currentUser.nationalId,
        mobile: data.mobile || currentUser.mobile || '',
        email: data.email || currentUser.email || '',
        applicantType: data.applicantType,
        region: data.region,
        governorate: data.governorate,
        siteName: data.siteName,
        deedNumber: data.deedNumber,
        area: Number.isFinite(areaValue) && areaValue > 0 ? areaValue : 0,
        areaUnit: data.areaUnit,
        latitude: data.latitude,
        longitude: data.longitude,
        currentUse: data.currentUse,
        waterSource: data.waterSource,
        reclamationPlan: data.reclamationPlan,
        surveyReport: data.surveyReport
          ? {
              ...data.surveyReport,
              description:
                data.attachmentDescription || data.surveyReport.description,
            }
          : null,
        agriculturalRecordId: data.agriculturalRecordId,
        agriculturalRecordNumber:
          AGRICULTURAL_RECORDS.find((r) => r.id === data.agriculturalRecordId)
            ?.recordNumber,
        surveyNumber: data.surveyNumber,
        surveyVerified: data.surveyVerified,
        attachmentDescription: data.attachmentDescription,
        obstacles: data.obstacles.trim(),
        notes: data.notes.trim(),
        history: [
          makeHistory(
            'مسودة',
            currentUser,
            'حفظ الطلب كمسودة',
            'يمكن استكمال الطلب لاحقاً',
          ),
        ],
      };

      persist({
        ...state,
        requests: [request, ...state.requests],
        nextRequestSeq: seq + 1,
      });

      return requestNumber;
    },
    [currentUser, persist, state],
  );

  const updateReturnedRequest = useCallback(
    (requestId: string, data: RequestFormData) => {
      if (!currentUser) return;
      const next = updateRequest(state, requestId, (req, actor) => ({
        ...req,
        fullName: data.fullName,
        nationalId: data.nationalId,
        mobile: data.mobile,
        email: data.email,
        applicantType: data.applicantType,
        region: data.region,
        governorate: data.governorate,
        siteName: data.siteName,
        deedNumber: data.deedNumber,
        area: Number(data.area),
        areaUnit: data.areaUnit,
        latitude: data.latitude,
        longitude: data.longitude,
        currentUse: data.currentUse,
        waterSource: data.waterSource,
        reclamationPlan: data.reclamationPlan,
        surveyReport: data.surveyReport
          ? {
              ...data.surveyReport,
              description: data.attachmentDescription || data.surveyReport.description,
            }
          : null,
        agriculturalRecordId: data.agriculturalRecordId,
        agriculturalRecordNumber:
          AGRICULTURAL_RECORDS.find((r) => r.id === data.agriculturalRecordId)
            ?.recordNumber,
        surveyNumber: data.surveyNumber,
        surveyVerified: data.surveyVerified,
        attachmentDescription: data.attachmentDescription,
        obstacles: data.obstacles.trim(),
        notes: data.notes.trim(),
        status: 'pending_branch_officer' as RequestStatus,
        returnReason: undefined,
        updatedAt: nowIso(),
        history: [
          ...req.history,
          req.status === 'draft'
            ? makeHistory(
                'تقديم الطلب',
                actor,
                'إرسال الطلب إلى موظف الفرع',
              )
            : makeHistory(
                'إعادة التقديم',
                actor,
                'تعديل الطلب وإعادة إرساله لموظف الفرع',
                'تم استكمال الملاحظات المطلوبة',
              ),
        ],
      }));
      persist(next);
    },
    [currentUser, persist, state],
  );

  const officerDecision = useCallback(
    (
      requestId: string,
      decision: 'forward' | 'reject' | 'return',
      reason?: string,
    ) => {
      if (decision !== 'forward' && !reason?.trim()) {
        return {
          ok: false,
          message:
            decision === 'reject'
              ? 'يجب كتابة شرح سبب الرفض'
              : 'يجب كتابة شرح سبب الإرجاع',
        };
      }

      const next = updateRequest(state, requestId, (req, actor) => {
        if (decision === 'forward') {
          const opinionsComplete =
            (isReferredToAgency(req, 'land') ||
              isReferredToAgency(req, 'industry')) &&
            (!isReferredToAgency(req, 'land') ||
              Boolean(req.landAgencyOpinion)) &&
            (!isReferredToAgency(req, 'industry') ||
              Boolean(req.industryOpinion));
          return {
            ...req,
            status: opinionsComplete
              ? 'pending_final_decision'
              : 'pending_branch_manager',
            returnReason: undefined,
            updatedAt: nowIso(),
            history: [
              ...req.history,
              makeHistory(
                'مراجعة موظف الفرع',
                actor,
                'قبول وتحويل إلى مدير الفرع',
              ),
            ],
          };
        }
        if (decision === 'reject') {
          return {
            ...req,
            status: 'rejected',
            rejectReason: reason!.trim(),
            updatedAt: nowIso(),
            history: [
              ...req.history,
              makeHistory(
                'مراجعة موظف الفرع',
                actor,
                'رفض الطلب وإنهاء العملية',
                reason!.trim(),
              ),
            ],
          };
        }
        return {
          ...req,
          status: 'returned_to_beneficiary',
          returnReason: reason!.trim(),
          updatedAt: nowIso(),
          history: [
            ...req.history,
            makeHistory(
              'مراجعة موظف الفرع',
              actor,
              'إرجاع الطلب إلى المستفيد',
              reason!.trim(),
            ),
          ],
        };
      });

      persist(next);
      return { ok: true };
    },
    [persist, state],
  );

  const managerDecision = useCallback(
    (
      requestId: string,
      decision:
        | 'accept'
        | 'reject'
        | 'return'
        | 'refer-land'
        | 'refer-industry',
      reason?: string,
    ) => {
      if ((decision === 'reject' || decision === 'return') && !reason?.trim()) {
        return {
          ok: false,
          message:
            decision === 'reject'
              ? 'يجب كتابة شرح سبب الرفض'
              : 'يجب كتابة شرح سبب الإرجاع',
        };
      }

      const target = state.requests.find((request) => request.id === requestId);
      if (!target) return { ok: false, message: 'الطلب غير موجود' };

      if (decision === 'refer-land' || decision === 'refer-industry') {
        const agency = decision === 'refer-land' ? 'land' : 'industry';
        const canRefer =
          target.status === 'pending_branch_manager' ||
          target.status === 'referred_to_agencies';
        if (!canRefer) {
          return { ok: false, message: 'لا يمكن إحالة الطلب في هذه المرحلة' };
        }
        if (isReferredToAgency(target, agency)) {
          return { ok: false, message: 'تم إحالة الطلب إلى هذه الجهة مسبقاً' };
        }
      }

      const next = updateRequest(state, requestId, (req, actor) => {
        if (decision === 'accept') {
          return {
            ...req,
            status: 'accepted',
            updatedAt: nowIso(),
            history: [
              ...req.history,
              makeHistory('مراجعة مدير الفرع', actor, 'قبول الطلب مباشرة'),
            ],
          };
        }
        if (decision === 'reject') {
          return {
            ...req,
            status: 'rejected',
            rejectReason: reason!.trim(),
            updatedAt: nowIso(),
            history: [
              ...req.history,
              makeHistory(
                'مراجعة مدير الفرع',
                actor,
                'رفض الطلب مباشرة وإنهاء العملية',
                reason!.trim(),
              ),
            ],
          };
        }
        if (decision === 'return') {
          return {
            ...req,
            status: 'returned_to_officer',
            returnReason: reason!.trim(),
            updatedAt: nowIso(),
            history: [
              ...req.history,
              makeHistory(
                'مراجعة مدير الفرع',
                actor,
                'إرجاع الطلب إلى موظف الفرع',
                reason!.trim(),
              ),
            ],
          };
        }
        const toLand = decision === 'refer-land';
        return {
          ...req,
          status: 'referred_to_agencies',
          referredToLand: toLand ? true : req.referredToLand === true,
          referredToIndustry: toLand ? req.referredToIndustry === true : true,
          updatedAt: nowIso(),
          history: [
            ...req.history,
            makeHistory(
              'مراجعة مدير الفرع',
              actor,
              toLand
                ? 'إحالة إلى موظف وكالة الأراضي'
                : 'إحالة إلى ممثل وزارة الصناعة',
              toLand
                ? 'طلب إفادة من موظف وكالة الأراضي'
                : 'طلب إفادة من ممثل وزارة الصناعة',
            ),
          ],
        };
      });

      persist(next);
      return { ok: true };
    },
    [persist, state],
  );

  const submitAgencyOpinion = useCallback(
    (
      requestId: string,
      agency: 'land' | 'industry',
      recommendation: Recommendation,
      text: string,
    ) => {
      if (!text.trim()) {
        return { ok: false, message: 'يجب كتابة نص الإفادة التفصيلي' };
      }

      const next = updateRequest(state, requestId, (req, actor) => {
        const opinion: AgencyOpinion = {
          recommendation,
          text: text.trim(),
          submittedAt: nowIso(),
          submittedBy: actor.name,
          submittedByRole: actor.roleLabel,
        };

        const landOpinion =
          agency === 'land' ? opinion : req.landAgencyOpinion;
        const industryOpinion =
          agency === 'industry' ? opinion : req.industryOpinion;
        const nextRequest = {
          ...req,
          landAgencyOpinion: landOpinion,
          industryOpinion,
        };
        const landReady =
          !isReferredToAgency(nextRequest, 'land') || Boolean(landOpinion);
        const industryReady =
          !isReferredToAgency(nextRequest, 'industry') ||
          Boolean(industryOpinion);
        const opinionsReady = landReady && industryReady;
        const stage =
          agency === 'land'
            ? 'إفادة وكالة الأراضي'
            : 'إفادة وزارة الصناعة';
        const action =
          agency === 'land'
            ? 'تقديم إفادة وكالة الأراضي'
            : 'تقديم إفادة وزارة الصناعة';

        return {
          ...nextRequest,
          status: opinionsReady
            ? ('pending_final_decision' as RequestStatus)
            : ('referred_to_agencies' as RequestStatus),
          updatedAt: nowIso(),
          history: [
            ...req.history,
            makeHistory(stage, actor, action, text.trim()),
          ],
        };
      });

      persist(next);
      return { ok: true };
    },
    [persist, state],
  );

  const managerFinalDecision = useCallback(
    (
      requestId: string,
      decision:
        | 'accept'
        | 'reject'
        | 'return-land'
        | 'return-industry'
        | 'return-officer',
      reason?: string,
    ) => {
      if (decision === 'reject' && !reason?.trim()) {
        return { ok: false, message: 'يجب كتابة شرح سبب الرفض' };
      }
      if (
        (decision === 'return-land' ||
          decision === 'return-industry' ||
          decision === 'return-officer') &&
        !reason?.trim()
      ) {
        return { ok: false, message: 'يجب كتابة شرح سبب الإرجاع' };
      }

      const target = state.requests.find((r) => r.id === requestId);
      const returning =
        decision === 'return-land' ||
        decision === 'return-industry' ||
        decision === 'return-officer';
      const landReady =
        !target ||
        !isReferredToAgency(target, 'land') ||
        Boolean(target.landAgencyOpinion);
      const industryReady =
        !target ||
        !isReferredToAgency(target, 'industry') ||
        Boolean(target.industryOpinion);
      const bothOpinions = Boolean(
        target?.landAgencyOpinion && target?.industryOpinion,
      );
      if (!target || (returning ? !bothOpinions : !landReady || !industryReady)) {
        return {
          ok: false,
          message: returning
            ? 'لا يمكن الإرجاع قبل وجود الإفادتين'
            : 'لا يمكن اتخاذ القرار النهائي قبل استلام إفادة الجهة المحال إليها',
        };
      }

      const next = updateRequest(state, requestId, (req, actor) => {
        if (decision === 'return-land' || decision === 'return-industry') {
          const toLand = decision === 'return-land';
          return {
            ...req,
            status: 'referred_to_agencies',
            referredToLand: true,
            referredToIndustry: true,
            landAgencyOpinion: toLand ? undefined : req.landAgencyOpinion,
            industryOpinion: toLand ? req.industryOpinion : undefined,
            updatedAt: nowIso(),
            history: [
              ...req.history,
              makeHistory(
                'مراجعة مدير الفرع',
                actor,
                toLand
                  ? 'إرجاع إلى موظف وكالة الأراضي'
                  : 'إرجاع إلى ممثل وزارة الصناعة',
                reason!.trim(),
              ),
            ],
          };
        }
        if (decision === 'return-officer') {
          return {
            ...req,
            status: 'returned_to_officer',
            returnReason: reason!.trim(),
            updatedAt: nowIso(),
            history: [
              ...req.history,
              makeHistory(
                'مراجعة مدير الفرع',
                actor,
                'إرجاع إلى موظف الفرع',
                reason!.trim(),
              ),
            ],
          };
        }
        if (decision === 'accept') {
          return {
            ...req,
            status: 'accepted',
            updatedAt: nowIso(),
            history: [
              ...req.history,
              makeHistory(
                'القرار النهائي لمدير الفرع',
                actor,
                'قبول الطلب بعد الاطلاع على الإفادتين',
              ),
            ],
          };
        }
        return {
          ...req,
          status: 'rejected',
          rejectReason: reason!.trim(),
          updatedAt: nowIso(),
          history: [
            ...req.history,
            makeHistory(
              'القرار النهائي لمدير الفرع',
              actor,
              'رفض الطلب بعد الاطلاع على الإفادتين',
              reason!.trim(),
            ),
          ],
        };
      });

      persist(next);
      return { ok: true };
    },
    [persist, state],
  );

  const getRequestsForRole = useCallback(
    (role: Role, userId: string) => {
      const list = state.requests;
      switch (role) {
        case 'beneficiary':
          return list.filter((r) => r.beneficiaryId === userId);
        case 'branch_officer':
          // فقط الطلبات في مرحلة موظف الفرع (من المستفيد أو مُرجعة من مدير الفرع)
          return list.filter(
            (r) =>
              r.status === 'pending_branch_officer' ||
              r.status === 'returned_to_officer',
          );
        case 'branch_manager':
          // طلبات مرحلة مدير الفرع: قيد الإجراء، محالة للجهات، مقبولة، أو مرفوضة
          return list.filter((r) => {
            const atManagerStage =
              r.status === 'pending_branch_manager' ||
              r.status === 'referred_to_agencies' ||
              r.status === 'pending_final_decision';
            const decidedByManager =
              (r.status === 'accepted' || r.status === 'rejected') &&
              r.history.some((h) => h.actorRole === 'مدير الفرع');
            return atManagerStage || decidedByManager;
          });
        case 'land_agency':
          return list.filter(
            (r) =>
              (r.status === 'referred_to_agencies' &&
                isReferredToAgency(r, 'land') &&
                !r.landAgencyOpinion) ||
              (r.status === 'pending_final_decision' &&
                Boolean(r.landAgencyOpinion)),
          );
        case 'industry_ministry':
          return list.filter(
            (r) =>
              (r.status === 'referred_to_agencies' &&
                isReferredToAgency(r, 'industry') &&
                !r.industryOpinion) ||
              (r.status === 'pending_final_decision' &&
                Boolean(r.industryOpinion)),
          );
        default:
          return [];
      }
    },
    [state.requests],
  );

  const getKpis = useCallback(
    (role: Role, userId: string) => {
      const list = getRequestsForRole(role, userId);
      const inReviewStatuses: RequestStatus[] = [
        'pending_branch_officer',
        'pending_branch_manager',
        'referred_to_agencies',
        'pending_final_decision',
      ];
      if (role === 'beneficiary') {
        inReviewStatuses.push('returned_to_officer');
      }
      const returnedStatuses: RequestStatus[] =
        role === 'beneficiary'
          ? ['returned_to_beneficiary']
          : ['returned_to_beneficiary', 'returned_to_officer'];
      return {
        total: list.length,
        inReview: list.filter((r) => inReviewStatuses.includes(r.status)).length,
        accepted: list.filter((r) => r.status === 'accepted').length,
        rejected: list.filter((r) => r.status === 'rejected').length,
        returned: list.filter((r) => returnedStatuses.includes(r.status)).length,
      };
    },
    [getRequestsForRole],
  );

  const value: AppContextValue = {
    users: state.users,
    requests: state.requests,
    currentUser,
    pendingLoginUserId,
    selectPendingLoginUser,
    login,
    loginAs,
    logout,
    createRequest,
    saveDraft,
    updateReturnedRequest,
    officerDecision,
    managerDecision,
    submitAgencyOpinion,
    managerFinalDecision,
    getRequestsForRole,
    getKpis,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

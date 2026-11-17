import { Plus } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { KpiCards } from '../components/KpiCards';
import { RequestList } from '../components/RequestList';
import { useApp } from '../context/AppContext';
import { ROLE_DASHBOARD_TITLES } from '../utils/status';

export function DashboardPage() {
  const { currentUser, getRequestsForRole, getKpis } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const requests = getRequestsForRole(currentUser.role, currentUser.id);
  const kpis = getKpis(currentUser.role, currentUser.id);
  const isBeneficiary = currentUser.role === 'beneficiary';

  const inboxHint = (() => {
    switch (currentUser.role) {
      case 'beneficiary':
        return 'طلباتك المقدمة ومتابعة حالتها';
      case 'branch_officer':
        return 'الطلبات الواردة من المستفيدين والطلبات المرجعة من مدير الفرع';
      case 'branch_manager':
        return 'الطلبات المحالة من موظف الفرع والطلبات بانتظار الإفادات أو القرار النهائي';
      case 'land_agency':
        return 'الطلبات المحالة لتقديم إفادة وكالة الأراضي';
      case 'industry_ministry':
        return 'الطلبات المحالة لتقديم إفادة وزارة الصناعة';
      default:
        return '';
    }
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            {ROLE_DASHBOARD_TITLES[currentUser.role]}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{inboxHint}</p>
        </div>
        {isBeneficiary && (
          <Link
            to="/requests/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            طلب استصلاح زراعي جديد
          </Link>
        )}
      </div>

      <KpiCards {...kpis} />

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-800">قائمة الطلبات</h3>
        <RequestList requests={requests} />
      </section>
    </div>
  );
}

import { Eye } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ReclamationRequest } from '../types';
import { formatArea, formatDate } from '../utils/status';
import { StatusBadge } from './StatusBadge';

const PAGE_SIZE = 10;

export function RequestList({
  requests,
  emptyMessage = 'لا توجد طلبات حالياً',
}: {
  requests: ReclamationRequest[];
  emptyMessage?: string;
}) {
  const { currentUser } = useApp();
  const isBeneficiary = currentUser?.role === 'beneficiary';
  const referralLabel =
    currentUser?.role === 'land_agency'
      ? 'محال إلى وكالة الاراضي للإفادة'
      : currentUser?.role === 'industry_ministry'
        ? 'محال إلى وزارة الصناعة للإفادة'
        : undefined;
  const [page, setPage] = useState(1);
  const requestKey = requests.map((request) => request.id).join('|');
  const pageCount = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRequests = useMemo(
    () =>
      requests.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [requests, currentPage],
  );

  useEffect(() => {
    setPage(1);
  }, [requestKey]);

  if (!requests.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right font-semibold">رقم الطلب</th>
              <th className="px-4 py-3 text-right font-semibold">الموقع</th>
              <th className="px-4 py-3 text-right font-semibold">المساحة</th>
              <th className="px-4 py-3 text-right font-semibold">تاريخ التحديث</th>
              <th className="px-4 py-3 text-right font-semibold">الحالة</th>
              <th className="px-4 py-3 text-right font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {pageRequests.map((req) => {
              const viewPath =
                isBeneficiary && req.status === 'returned_to_beneficiary'
                  ? `/requests/${req.id}/edit`
                  : `/requests/${req.id}`;

              return (
                <tr
                  key={req.id}
                  className="border-t border-border hover:bg-slate-50/70"
                >
                  <td className="px-4 py-3 font-bold whitespace-nowrap text-primary">
                    {req.requestNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium">{req.siteName}</div>
                    <div className="text-xs text-slate-500">
                      {req.region} — {req.governorate}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                    {formatArea(req.area, req.areaUnit)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {formatDate(req.updatedAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge
                      status={req.status}
                      forBeneficiary={isBeneficiary}
                      label={
                        referralLabel && req.status === 'referred_to_agencies'
                          ? referralLabel
                          : undefined
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={viewPath}
                      className="inline-flex h-9 w-32 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-xs font-bold text-white hover:bg-primary-dark"
                    >
                      <Eye className="h-3.5 w-3.5 shrink-0" />
                      {isBeneficiary &&
                      req.status === 'returned_to_beneficiary'
                        ? 'استكمال الطلب'
                        : 'عرض'}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-xs text-slate-500">
          صفحة {currentPage} من {pageCount}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            السابق
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold ${
                  pageNumber === currentPage
                    ? 'bg-primary text-white'
                    : 'border border-border text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}

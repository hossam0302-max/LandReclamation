import type { HistoryEntry } from '../types';

function formatActionDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function HistoryTable({ history }: { history: HistoryEntry[] }) {
  const rows = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-primary-light px-4 py-3 text-right">
        <h3 className="font-bold text-primary">إجراءات الطلب</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right font-semibold">
                تاريخ الاجراء
              </th>
              <th className="px-4 py-3 text-right font-semibold">
                الحاله السابقه
              </th>
              <th className="px-4 py-3 text-right font-semibold">
                الحاله الحالية
              </th>
              <th className="px-4 py-3 text-right font-semibold">
                منفذ الاجراء
              </th>
              <th className="px-4 py-3 text-right font-semibold">الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                  {formatActionDate(row.date)}
                </td>
                <td className="px-4 py-3 text-slate-800">{row.stage}</td>
                <td className="px-4 py-3 text-slate-800">{row.action}</td>
                <td className="px-4 py-3 text-slate-800">{row.actorName}</td>
                <td className="px-4 py-3 text-slate-600">{row.notes ?? ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td
                colSpan={5}
                className="px-4 py-2 text-left text-xs text-slate-500"
              >
                مجموع: {rows.length}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

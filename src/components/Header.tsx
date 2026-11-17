import { LogOut, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ADMIN_LOGOUT_PATH, setPendingLogoutPath } from '../logoutRedirect';
import type { Role } from '../types';

const STAFF_ROLES: Role[] = [
  'branch_officer',
  'branch_manager',
  'land_agency',
  'industry_ministry',
];

export function Header() {
  const { currentUser, logout } = useApp();

  return (
    <header className="border-b border-border bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to={currentUser ? '/app' : '/login'} className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow">
            <Sprout className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-medium text-water">
              وزارة البيئة والمياه والزراعة
            </p>
            <h1 className="text-lg font-extrabold text-primary sm:text-xl">
              نظام الاستصلاح الزراعي
            </h1>
          </div>
        </Link>

        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="inline-flex items-center justify-center rounded-md border border-white bg-slate-700 px-2.5 py-1 text-xs font-semibold text-white">
                {currentUser.roleLabel}
              </span>
              <p className="text-sm font-bold text-slate-800">
                {currentUser.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPendingLogoutPath(
                  currentUser.role === 'beneficiary'
                    ? '/'
                    : STAFF_ROLES.includes(currentUser.role)
                      ? ADMIN_LOGOUT_PATH
                      : '/login',
                );
                logout();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

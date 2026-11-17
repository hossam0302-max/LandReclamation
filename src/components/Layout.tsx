import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { RoleSwitcher } from './RoleSwitcher';

export function Layout() {
  return (
    <div className="min-h-screen bg-surface">
      <RoleSwitcher />
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-white py-4 text-center text-xs text-slate-500">
        وزارة البيئة والمياه والزراعة — نظام الاستصلاح الزراعي
      </footer>
    </div>
  );
}

import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Role } from '../types';

const SWITCHABLE_ROLES: Role[] = [
  'branch_officer',
  'branch_manager',
  'land_agency',
  'industry_ministry',
];

export function RoleSwitcher() {
  const {
    users,
    currentUser,
    pendingLoginUserId,
    selectPendingLoginUser,
    loginAs,
  } = useApp();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(currentUser);
  const canSwitchRoles = currentUser
    ? SWITCHABLE_ROLES.includes(currentUser.role)
    : false;
  const switchableUsers = users.filter((user) =>
    SWITCHABLE_ROLES.includes(user.role),
  );
  const visibleUsers = canSwitchRoles ? switchableUsers : users;

  const widestLabel = visibleUsers.reduce(
    (max, user) => (user.roleLabel.length > max.length ? user.roleLabel : max),
    '',
  );
  const equalMinWidth = `${Math.max(widestLabel.length, 1) + 2}ch`;

  function switchRole(userId: string) {
    if (currentUser?.id === userId) return;
    loginAs(userId);
    navigate('/app');
  }

  return (
    <div className="border-b border-emerald-900/20 bg-[#004d35] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <RoleSwitcherStatus
          isLoggedIn={isLoggedIn}
          canSwitchRoles={canSwitchRoles}
          roleLabel={currentUser?.roleLabel}
        />
        {!isLoggedIn && (
          <div className="flex flex-wrap items-center gap-2">
            {users.map((user) => (
              <RoleButton
                key={user.id}
                label={user.roleLabel}
                active={pendingLoginUserId === user.id}
                minWidth={equalMinWidth}
                onClick={() => selectPendingLoginUser(user.id)}
              />
            ))}
          </div>
        )}
        {canSwitchRoles && (
          <div className="flex flex-wrap items-center gap-2">
            {switchableUsers.map((user) => (
              <RoleButton
                key={user.id}
                label={user.roleLabel}
                active={currentUser?.id === user.id}
                minWidth={equalMinWidth}
                onClick={() => switchRole(user.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RoleSwitcherStatus({
  isLoggedIn,
  canSwitchRoles,
  roleLabel,
}: {
  isLoggedIn: boolean;
  canSwitchRoles: boolean;
  roleLabel?: string;
}) {
  const hint = !isLoggedIn
    ? 'اختر الدور ثم اضغط زر الدخول'
    : canSwitchRoles
      ? 'يمكنك التبديل بين أدوار الموظفين'
      : 'لتغيير الدور استخدم تسجيل الخروج ثم الدخول مجدداً';

  return (
    <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:gap-2">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 opacity-80" />
        <span className="font-medium opacity-90">
          {isLoggedIn
            ? `الجلسة الحالية: ${roleLabel}`
            : 'اختيار الدور'}
        </span>
      </div>
      <span className="text-xs text-emerald-100/90 sm:mr-2">{hint}</span>
    </div>
  );
}

function RoleButton({
  label,
  active,
  minWidth,
  onClick,
}: {
  label: string;
  active: boolean;
  minWidth: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ minWidth }}
      className={`inline-flex items-center justify-center rounded-md border border-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
        active
          ? 'bg-slate-700 text-white'
          : 'bg-emerald-50 text-emerald-800 hover:bg-slate-200 hover:text-slate-700'
      }`}
      title={active ? `الدور الحالي: ${label}` : `التبديل إلى: ${label}`}
    >
      {label}
    </button>
  );
}

import { KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function LoginPage() {
  const {
    loginAs,
    currentUser,
    users,
    pendingLoginUserId,
    selectPendingLoginUser,
  } = useApp();
  const navigate = useNavigate();
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const selectedUser = useMemo(
    () => users.find((u) => u.id === pendingLoginUserId) ?? users[0] ?? null,
    [pendingLoginUserId, users],
  );

  useEffect(() => {
    if (!selectedUser) return;
    setNationalId(selectedUser.nationalId);
    setPassword(selectedUser.password);
    setError('');
  }, [selectedUser]);

  if (currentUser) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('يرجى اختيار دور من الشريط العلوي أولاً');
      return;
    }

    if (!nationalId.trim() || !password.trim()) {
      setError('يرجى إدخال رقم الهوية وكلمة المرور');
      return;
    }

    // الدخول فقط بالدور المختار من الأعلى
    if (
      nationalId.trim() !== selectedUser.nationalId ||
      password !== selectedUser.password
    ) {
      setError(
        `بيانات الدخول غير مطابقة لدور «${selectedUser.roleLabel}». استخدم تعبئة بيانات الدور المختار أو اختر الدور الصحيح.`,
      );
      return;
    }

    loginAs(selectedUser.id);
    navigate('/app', { replace: true });
  };

  const fillDemo = () => {
    if (!selectedUser) {
      setError('يرجى اختيار دور من الشريط العلوي أولاً');
      return;
    }
    setNationalId(selectedUser.nationalId);
    setPassword(selectedUser.password);
    setError('');
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <section className="flex min-h-[28rem] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-8 text-center text-white shadow-lg">
        <div className="mb-6 inline-flex rounded-xl bg-white/15 p-3">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold leading-relaxed sm:text-3xl">
          <span className="block">مرحباً بك في</span>
          <span className="block">نظام الاستصلاح الزراعي</span>
        </h2>
        <ul className="mt-6 space-y-2 text-sm text-emerald-50">
          <li>• اختر الدور من الشريط العلوي</li>
          <li>• ثم اضغط زر الدخول للدخول بهذا الدور فقط</li>
          <li>• لا يتم الدخول بمجرد اختيار الدور</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-xl font-extrabold text-slate-800">تسجيل الدخول</h3>
        <p className="mt-1 text-sm text-slate-500">
          اختر الدور من الأعلى، ثم أكّد الدخول بالزر أدناه
        </p>

        {selectedUser && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary-light px-4 py-3">
            <p className="text-xs font-semibold text-primary">الدور المختار</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">
              {selectedUser.roleLabel}
            </p>
            <p className="text-xs text-slate-600">{selectedUser.name}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              رقم الهوية الوطنية
            </label>
            <input
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="أدخل رقم الهوية"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="أدخل كلمة المرور"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={fillDemo}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-water/30 bg-water-light px-4 py-2.5 text-sm font-bold text-water hover:bg-cyan-100"
          >
            <Sparkles className="h-4 w-4" />
            تعبئة بيانات الدور المختار
          </button>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            <KeyRound className="h-4 w-4" />
            {selectedUser
              ? `دخول كـ ${selectedUser.roleLabel}`
              : 'دخول'}
          </button>
        </form>

        <div className="mt-8 border-t border-border pt-5">
          <p className="mb-3 text-sm font-bold text-slate-700">
            أو اختر دوراً من هنا ثم اضغط الدخول
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {users.map((user) => {
              const active = pendingLoginUserId === user.id;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => selectPendingLoginUser(user.id)}
                      className={`group rounded-lg border px-3 py-2 text-right text-xs font-semibold transition ${
                    active
                      ? 'border-slate-700 bg-slate-700 text-white'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-700'
                  }`}
                >
                  <div>{user.roleLabel}</div>
                  <div
                    className={`mt-0.5 font-normal ${
                      active
                        ? 'text-slate-200'
                        : 'text-emerald-700/80 group-hover:text-slate-500'
                    }`}
                  >
                    {user.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

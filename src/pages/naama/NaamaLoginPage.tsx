import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import appGallery from '../../assets/naama/app-gallery.svg';
import appStore from '../../assets/naama/app-store.svg';
import googlePlay from '../../assets/naama/google-play.svg';
import loginBg from '../../assets/naama/main_login_bg.webp';
import visitorsIcon from '../../assets/naama/login-visitors.svg';
import namaLogo from '../../assets/naama/Nama-Logo.svg';
import nicLogo from '../../assets/naama/nic_logo_icon.webp';
import {
  ArrowLeftIcon,
  ChatIcon,
  HandIcon,
  LanguageIcon,
  PersonIcon,
  UserIcon,
  VolumeIcon,
} from './icons';
import './naama-login.css';

const REQUIRED_MESSAGE = 'هذا الحقل إلزامي';
const DIGITS_MESSAGE = 'من فضلك أدخل أرقام فقط';
const NAFATH_CODE = '78';
const NAFATH_SECONDS = 60;
const NAFATH_REDIRECT_MS = 1000;
const BENEFICIARY_USER_ID = 'u-beneficiary';

export function NaamaLoginPage() {
  const navigate = useNavigate();
  const { currentUser, loginAs } = useApp();
  const [redirecting, setRedirecting] = useState(false);
  const [nationalId, setNationalId] = useState('');
  const [idError, setIdError] = useState<'required' | 'digits' | null>(null);
  const [visitorOpen, setVisitorOpen] = useState(false);
  const [visitorId, setVisitorId] = useState('');
  const [password, setPassword] = useState('');
  const [visitorErrors, setVisitorErrors] = useState({ id: false, password: false });
  const [nafathOpen, setNafathOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(NAFATH_SECONDS);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'تسجيل الدخول | نما';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    if (!nafathOpen) return undefined;
    const redirect = window.setTimeout(() => {
      loginAs(BENEFICIARY_USER_ID);
      setRedirecting(true);
    }, NAFATH_REDIRECT_MS);
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => {
      window.clearTimeout(redirect);
      window.clearInterval(timer);
    };
  }, [loginAs, nafathOpen]);

  useEffect(() => {
    if (!redirecting || currentUser?.id !== BENEFICIARY_USER_ID) return;
    navigate('/app');
  }, [currentUser, navigate, redirecting]);

  const submitNationalId = (event: FormEvent) => {
    event.preventDefault();
    const value = nationalId.trim();
    if (!value) {
      setIdError('required');
      return;
    }
    if (!/^\d+$/.test(value)) {
      setIdError('digits');
      return;
    }
    setIdError(null);
    setSecondsLeft(NAFATH_SECONDS);
    setNafathOpen(true);
  };

  const cancelNafath = () => {
    setRedirecting(false);
    setNafathOpen(false);
    setSecondsLeft(NAFATH_SECONDS);
  };

  const submitVisitor = (event: FormEvent) => {
    event.preventDefault();
    setVisitorErrors({
      id: visitorId.trim().length === 0,
      password: password.trim().length === 0,
    });
  };

  return (
    <div
      className="naama-login-page"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <header className="login-header">
        <button type="button" className="login-logo" onClick={() => navigate('/')}>
          <img src={namaLogo} alt="منصة نما" />
        </button>
        <div className="login-actions">
          <button type="button" className="ghost-btn">
            <LanguageIcon />
            <span>English</span>
          </button>
          <button type="button" className="ghost-btn" onClick={() => navigate('/')}>
            <span>الرجوع إلى الرئيسية</span>
            <ArrowLeftIcon />
          </button>
        </div>
      </header>

      <main className="login-main">
        <section className="login-card" aria-label="دخول الأفراد من مواطنين ومقيمين">
          <div className="login-head">
            <div>
              <h1>دخول الأفراد من مواطنين ومقيمين</h1>
              <p>يمكنك الدخول بحسابك في منصة النفاذ الوطني الموحد</p>
            </div>
            <img className="nic-logo" src={nicLogo} alt="nic logo icon" />
          </div>

          {nafathOpen ? (
            <div className="nafath-panel">
              <p className="nafath-code">{NAFATH_CODE}</p>
              <p className="nafath-expire">تنتهي صلاحية الرقم خلال</p>
              <p className="nafath-seconds">{secondsLeft} ثانية</p>
              <button type="button" className="cancel-btn" onClick={cancelNafath}>
                إلغاء
              </button>
            </div>
          ) : (
            <form onSubmit={submitNationalId} noValidate>
              <div className={idError ? 'id-field has-error' : 'id-field'}>
                <UserIcon />
                <input
                  value={nationalId}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="off"
                  placeholder="رقم الهوية/ الاقامة"
                  aria-label="رقم الهوية/ الاقامة"
                  aria-invalid={idError !== null}
                  onChange={(event) => {
                    setNationalId(event.target.value.replace(/\D/g, '').slice(0, 10));
                    setIdError(null);
                  }}
                />
              </div>
              {idError === 'required' && (
                <div className="field-errors">
                  <ErrorLine text="رقم الهوية/ الاقامة" />
                  <ErrorLine text={REQUIRED_MESSAGE} />
                </div>
              )}
              {idError === 'digits' && (
                <div className="field-errors">
                  <ErrorLine text={DIGITS_MESSAGE} />
                </div>
              )}
              <button type="submit" className="check-btn">
                تحقق
              </button>
            </form>
          )}

          <div className="nafath-apps">
            <p>تحميل تطبيق نفاذ</p>
            <div className="store-row">
              <img src={googlePlay} alt="google play image" />
              <img src={appStore} alt="app store image" />
              <img src={appGallery} alt="app gallery image" />
            </div>
          </div>
          {!nafathOpen && (
            <p className="help-line">
              تحتاج إلى مساعدة؟{' '}
              <button type="button">تواصل معنا</button>
            </p>
          )}
        </section>

        <section className="visitor-card" aria-label="دخول الأفراد من زوار المملكة">
          <div
            role="button"
            tabIndex={0}
            className="visitor-toggle"
            aria-expanded={visitorOpen}
            onClick={() => setVisitorOpen((open) => !open)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setVisitorOpen((open) => !open);
              }
            }}
          >
            <span className="visitor-icon">
              <img src={visitorsIcon} alt="" />
            </span>
            <span className="visitor-copy">
              <h2>دخول الأفراد من زوار المملكة</h2>
              <p>تسجيل الدخول للوصول إلى الخدمات الإلكترونية المخصصة لزوار المملكة</p>
            </span>
            <ArrowLeftIcon className="arrow" />
          </div>
          {visitorOpen && (
            <form className="visitor-form" onSubmit={submitVisitor} noValidate>
              <div className={visitorErrors.id ? 'has-error' : undefined}>
                <label htmlFor="visitor-id">رقم التأشيرة / رقم الهوية الخليجية / رقم الحدود</label>
                <input
                  id="visitor-id"
                  value={visitorId}
                  maxLength={20}
                  placeholder="رقم التأشيرة / رقم الهوية الخليجية / رقم الحدود"
                  onChange={(event) => setVisitorId(event.target.value)}
                />
                {visitorErrors.id && (
                  <div className="field-errors">
                    <ErrorLine text={REQUIRED_MESSAGE} />
                  </div>
                )}
              </div>
              <div className={visitorErrors.password ? 'has-error' : undefined}>
                <label htmlFor="visitor-password">كلمة المرور</label>
                <input
                  id="visitor-password"
                  type="password"
                  value={password}
                  maxLength={50}
                  autoComplete="off"
                  placeholder="كلمة المرور"
                  onChange={(event) => setPassword(event.target.value)}
                />
                {visitorErrors.password && (
                  <div className="field-errors">
                    <ErrorLine text={REQUIRED_MESSAGE} />
                  </div>
                )}
              </div>
              <div className="visitor-links">
                <button type="button">نسيت كلمة المرور</button>
                <span>
                  ليس لديك حساب ؟ <button type="button">حساب جديد</button>
                </span>
              </div>
              <button type="submit" className="visitor-submit">
                تسجيل الدخول
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="login-footer">
        <p>وكالة الوزارة لتقنية المعلومات والتحول الرقمي</p>
        <p>جميع الحقوق محفوظة لوزارة البيئة والمياه والزراعة</p>
      </footer>

      <div className="login-floats">
        <button type="button" aria-label="استمع إلى هذه الصفحة">
          <VolumeIcon />
        </button>
        <button type="button" aria-label="أدوات الإتاحة والوصول">
          <PersonIcon />
        </button>
        <button type="button" aria-label="لغة الإشارة">
          <HandIcon />
        </button>
      </div>
      <div className="login-side">
        <button type="button" aria-label="نماء">
          نماء
        </button>
        <button type="button" aria-label="فتح المحادثة">
          <ChatIcon />
        </button>
      </div>
    </div>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p>
      <InfoIcon />
      <span>{text}</span>
    </p>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5M12 8h.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appGallery from '../../assets/naama/app-gallery.svg';
import appStoreLight from '../../assets/naama/app-store.svg';
import googlePlayLight from '../../assets/naama/google-play.svg';
import appStore from '../../assets/naama/appStore.svg';
import dgaLogo from '../../assets/naama/dgalogo.svg';
import googlePlay from '../../assets/naama/googlePlay.svg';
import mada from '../../assets/naama/pay-by-mada.png';
import visa from '../../assets/naama/pay-by-visa.png';
import namaLogo from '../../assets/naama/Nama-Logo.svg';
import saudiFlag from '../../assets/naama/flags.svg';
import { ACTIVE_NAV, NAV_ITEMS, SYSTEM_ENTRY_TITLE } from './naamaData';
import {
  ChatIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  EyeOffIcon,
  HandIcon,
  LanguageIcon,
  LinkIcon,
  LockIcon,
  PersonIcon,
  SearchIcon,
  UserIcon,
  VolumeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './icons';
import './naama-services.css';
import './naama-details.css';

const TABS = ['نظرة عامة', 'الخطوات', 'الشروط', 'المستندات المطلوبة'] as const;
type DetailsTab = (typeof TABS)[number];

const DESCRIPTION =
  'خدمة تمكّن المستفيد من تقديم طلب استصلاح أرض زراعية ومتابعة مسار اعتماده لدى الوزارة، بعد التحقق من استيفاء الاشتراطات والموافقات اللازمة لتهيئة الأرض وتحويلها إلى أرض منتجة.';

const STEPS = [
  'الدخول الى منصة نما.',
  'تسجيل الدخول عبر منصة النفاذ الوطني.',
  'النقر على "دليل الخدمات الإلكترونية".',
  'من قائمة تصفية البحث يتم اختيار "قطاع الزراعة".',
  'يتم النقر على "تفاصيل الخدمة" لخدمة نظام الاستصلاح الزراعي.',
  'من خلال صفحة الخدمة يتم النقر على "طلب الخدمة".',
  'الاطلاع والموافقة على الشروط والأحكام ثم النقر على التالي.',
  'تعبئة بيانات الأرض والموقع والمساحة المطلوب استصلاحها.',
  'الاطلاع على ملخص الطلب وتقديمه.',
  'سيتم استلام رسالة نصية برقم الطلب واسم الخدمة المطلوبة.',
];

const CONDITIONS = [
  'أن يكون مقدم الطلب مالكاً للأرض أو مفوضاً رسمياً',
  'أن تكون الأرض واقعة خارج النطاق العمراني وقابلة للاستصلاح الزراعي',
  'توفر مصدر مياه معتمد أو ما يثبت إمكانية توفيره',
  'عدم وجود نزاع قائم على ملكية الأرض',
  'الالتزام باشتراطات وزارة البيئة والمياه والزراعة',
];

const DOCUMENTS = ['صك الملكية أو وثيقة التخصيص', 'السجل الزراعي', 'مخطط الموقع والإحداثيات'];

export function NaamaServiceDetailsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<DetailsTab>('نظرة عامة');
  const [verifyOpen, setVerifyOpen] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `نما | ${SYSTEM_ENTRY_TITLE}`;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const requestService = () => {
    navigate('/account/login');
  };

  return (
    <div className="naama-page">
      <div className="stamp-bar">
        <div className="stamp-inner">
          <p className="stamp-title">
            <img src={saudiFlag} alt="" />
            <span>موقع حكومي مسجل لدى هيئة الحكومة الرقمية</span>
            <button type="button" className="verify-btn" onClick={() => setVerifyOpen((open) => !open)}>
              <span>كيف تتحقق؟</span>
              <ChevronDownIcon />
            </button>
          </p>
          <div className="a11y-tools">
            <button type="button" className="icon-btn" aria-label="وضع التدرج الرمادي"><EyeOffIcon /></button>
            <button type="button" className="icon-btn" aria-label="تكبير الخط"><ZoomInIcon /></button>
            <button type="button" className="icon-btn" aria-label="تصغير الخط"><ZoomOutIcon /></button>
          </div>
        </div>
        {verifyOpen && (
          <div className="verify-panel">
            <div className="naama-container">
              <p><LinkIcon />جميع روابط المواقع الرسمية للأنشطة والمبادرات في المملكة العربية السعودية تنتهي بـ sa.</p>
              <p><LockIcon />تحقق من أن الموقع يستخدم بروتوكول HTTPS</p>
            </div>
          </div>
        )}
      </div>

      <div className="util-bar">
        <div className="util-inner">
          <button type="button" className="util-btn"><LanguageIcon /><span>English</span></button>
          <button type="button" className="util-btn" onClick={() => navigate('/account/login')}>
            <UserIcon /><span>تسجيل الدخول</span>
          </button>
        </div>
      </div>

      <header className="site-nav">
        <div className="site-nav-inner">
          <button type="button" className="brand" onClick={() => navigate('/')}>
            <img src={namaLogo} alt="منصة نما" />
          </button>
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className={item === ACTIVE_NAV ? 'active' : undefined}
                  onClick={item === 'الرئيسية' || item === ACTIVE_NAV ? () => navigate('/') : undefined}
                >
                  {item}
                  {item === 'عن نما' && <ChevronDownIcon />}
                </button>
              </li>
            ))}
          </ul>
          <label className="nav-search">
            <SearchIcon />
            <input type="search" placeholder="ابحث هنا ..." aria-label="ابحث هنا ..." readOnly />
          </label>
        </div>
      </header>

      <div className="details-shell">
        <div className="naama-container details-grid">
          <div className="details-main">
            <p className="crumbs">
              <button type="button" onClick={() => navigate('/')}>الرئيسية</button>
              <ChevronLeftIcon />
              <button type="button" onClick={() => navigate('/')}>دليل الخدمات الإلكترونية</button>
              <ChevronLeftIcon />
              <span>{SYSTEM_ENTRY_TITLE}</span>
            </p>
            <h1>{SYSTEM_ENTRY_TITLE}</h1>
            <div className="detail-tags">
              <span>قطاع الزراعة</span>
              <span>استصلاح الأراضي</span>
              <span>خدمات زراعية</span>
            </div>
            <p className="lead">{DESCRIPTION}</p>
            <button type="button" className="sla">
              <DocIcon />
              اتفاقية مستوى الخدمة
            </button>

            <div className="tabs" role="tablist">
              {TABS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  className={tab === item ? 'active' : undefined}
                  onClick={() => setTab(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {tab === 'نظرة عامة' && <p className="overview-text">{DESCRIPTION}</p>}
            {tab === 'الخطوات' && STEPS.map((step, index) => (
              <div className="line-row" key={step}>
                <span className="step-no">{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
            {tab === 'الشروط' && CONDITIONS.map((item) => (
              <div className="line-row" key={item}>
                <span className="info-dot">i</span>
                <span>{item}</span>
              </div>
            ))}
            {tab === 'المستندات المطلوبة' && (
              <>
                <h2 className="doc-title">مستندات إلزامية</h2>
                {DOCUMENTS.map((item) => (
                  <div className="line-row" key={item}>
                    <span className="info-dot">i</span>
                    <span>{item}</span>
                  </div>
                ))}
              </>
            )}

            <div className="rating-block">
              <p className="no-rating">لا يوجد تقييمات على الخدمة</p>
              <p className="update-line">تاريخ آخر تحديث: 16/11/2026 - 08:47 بتوقيت المملكة العربية السعودية.</p>
              <div className="helpful">
                <div className="helpful-actions">
                  <span>هل كانت الصفحة مفيدة؟</span>
                  <button type="button">نعم</button>
                  <button type="button" className="no">لا</button>
                </div>
                <span>90% من المستخدمين قالوا نعم من 2264 تعليقاً</span>
              </div>
            </div>
          </div>

          <aside>
            <div className="side-top">
              <button type="button" className="request-btn" onClick={requestService}>طلب الخدمة</button>
            </div>
            <div className="side-card">
              <Meta icon="user" value="أفراد" label="العملاء المستهدفين" />
              <Meta icon="lang" value="العربية الإنجليزية" label="لغة الخدمة" />
              <Meta icon="time" value="15 يوم عمل يوم" label="المدة الزمنية" />
              <Meta icon="reply" value="فوري" label="مدة التجاوب" />
              <div className="meta-row">
                <MiniIcon name="fee" />
                <div>
                  <strong>مجاناً</strong>
                  <span>رسوم الخدمة</span>
                  <div className="pay-row">
                    <img src={visa} alt="" />
                    <img src={mada} alt="" />
                  </div>
                </div>
              </div>
              <Meta icon="date" value="1448/01/15" label="تاريخ اطلاق الخدمة" />
              <Meta icon="channel" value="منصة نما" label="قنوات تقديم الخدمة" />
              <div className="contact-block">
                <h3>الاسئلة الشائعة</h3>
                <div className="contact-line"><MiniIcon name="link" /><span>Ministry-FAQ's-page</span></div>
                <div className="contact-line"><MiniIcon name="phone" /><span>الهاتف</span><strong>939</strong></div>
                <div className="contact-line"><MiniIcon name="chat" /><span>واتساب</span><strong>0112038886</strong></div>
                <div className="contact-line"><MiniIcon name="x" /><span>منصة X</span><strong>@MEWA_KSA</strong></div>
                <div className="contact-line"><MiniIcon name="mail" /><span>البريد الالكتروني</span><strong>E-services@mewa.gov.sa</strong></div>
              </div>
              <div className="apps">
                <h3>تطبيقات الجوال</h3>
                <div className="app-badges">
                  <img className="dark-badge" src={googlePlay} alt="Google Play" />
                  <img className="dark-badge" src={appStore} alt="App Store" />
                  <img src={appGallery} alt="AppGallery" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer className="site-footer details-footer">
        <div className="naama-container">
          <div className="footer-grid">
            <div>
              <h2>روابط تهمك</h2>
              <ul>
                <li>ميثاق العملاء</li>
                <li>كيف تصل إلى مواقعنا</li>
                <li>المنصة الوطنية الموحدة</li>
                <li>وزارة البيئة والمياه والزراعة</li>
                <li>دليل منصة نما</li>
              </ul>
            </div>
            <div>
              <h2>أبرز خدمات الأفراد</h2>
              <ul>
                <li>إصدار سجل مربي</li>
                <li>طلب ترقيم الماشية</li>
                <li>برنامج دعم صغار مربي الماشية</li>
                <li>تسجيل موقع زراعي جديد</li>
              </ul>
            </div>
            <div>
              <h2>أبرز خدمات الأعمال</h2>
              <ul>
                <li>طلب عمالة زراعية</li>
                <li>إذن استيراد خضار وفواكه</li>
                <li>تسجيل موقع زراعي جديد</li>
                <li>حجز موعد مسلخ</li>
              </ul>
            </div>
            <div className="footer-brand">
              <h2>تواصل معنا</h2>
              <div className="social-row" aria-hidden="true">
                <span>in</span><span>ig</span><span>x</span><span>yt</span>
              </div>
              <h2>أدوات الإتاحة والوصول</h2>
              <p className="copy-line">تطبيق وزارة البيئة والمياه والزراعة (798000+)</p>
              <div className="store-row">
                <img src={googlePlayLight} alt="Google Play" />
                <img src={appStoreLight} alt="App Store" />
                <img src={appGallery} alt="AppGallery" />
              </div>
            </div>
          </div>
          <div className="legal-row">
            <span>سياسة الخصوصية</span>
            <span>سياسة الاستخدام</span>
            <span>إتفاقية مستوى الخدمة</span>
            <span>سياسة إخلاء المسؤولية</span>
            <span>أمان المنصة</span>
            <span>حق الحصول على المعلومات</span>
            <span>خريطة الموقع</span>
          </div>
          <p className="copy-line">جميع الحقوق محفوظة لوزارة البيئة والمياه والزراعة، وكالة الوزارة لتقنية المعلومات والتحول الرقمي</p>
          <div className="brand-row">
            <img src={namaLogo} alt="منصة نما" />
            <img src={dgaLogo} alt="هيئة الحكومة الرقمية" />
          </div>
        </div>
      </footer>

      <div className="float-tools">
        <button type="button" aria-label="استمع إلى هذه الصفحة"><VolumeIcon /></button>
        <button type="button" aria-label="أدوات الإتاحة والوصول"><PersonIcon /></button>
        <button type="button" aria-label="لغة الإشارة"><HandIcon /></button>
      </div>
      <button type="button" className="help-fab" aria-label="فتح المحادثة"><ChatIcon /></button>
    </div>
  );
}

function Meta({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="meta-row">
      <MiniIcon name={icon} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 3.8V8h4.2M8.5 12h7M8.5 15.5h7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MiniIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === 'user' && (
        <>
          <circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6.5 18.5c1.2-2.4 3.1-3.5 5.5-3.5s4.3 1.1 5.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {name === 'lang' && (
        <>
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 12h16M12 4c2.2 2.4 3.2 5 3.2 8s-1 5.6-3.2 8c-2.2-2.4-3.2-5-3.2-8s1-5.6 3.2-8Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </>
      )}
      {name === 'time' && (
        <>
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v4.2l2.6 1.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {name === 'reply' && (
        <path d="M7 8h7a4 4 0 0 1 0 8H8M7 8l2.4-2.4M7 8l2.4 2.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {name === 'fee' && (
        <>
          <rect x="3.5" y="6" width="17" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 10h17" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </>
      )}
      {name === 'date' && (
        <>
          <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 3.5V7M16 3.5V7M4 10h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {name === 'channel' && (
        <path d="M5 8.5 12 5l7 3.5v7L12 19l-7-3.5v-7Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      )}
      {name === 'phone' && (
        <path d="M8 4.5h2.2l1 3-1.6 1a9 9 0 0 0 4.9 4.9l1-1.6 3 1V16a1.5 1.5 0 0 1-1.6 1.5A12.5 12.5 0 0 1 6.5 6.1 1.5 1.5 0 0 1 8 4.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      )}
      {name === 'chat' && (
        <path d="M6 7.5h12v8H10l-4 3v-3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      )}
      {name === 'link' && (
        <path d="M10 13.5a3.2 3.2 0 0 0 4.6.2l2.2-2.2a3.2 3.2 0 0 0-4.5-4.5L11 8.3M14 10.5a3.2 3.2 0 0 0-4.6-.2L7.2 12.5a3.2 3.2 0 0 0 4.5 4.5L13 15.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {name === 'x' && (
        <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
      {name === 'mail' && (
        <>
          <rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 7.5 12 13l7-5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </>
      )}
    </svg>
  );
}

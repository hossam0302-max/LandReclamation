import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import namaLogo from '../../assets/naama/Nama-Logo.svg';
import saudiFlag from '../../assets/naama/flags.svg';
import {
  ACTIVE_NAV,
  CATALOG_SERVICES,
  FILTER_GROUPS,
  NAV_ITEMS,
  SORT_OPTIONS,
  SYSTEM_ENTRY_TITLE,
  filterServices,
  isChildCountTag,
  type CatalogService,
  type SortMode,
} from './naamaData';
import {
  ArrowLeftIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  DropletIcon,
  ExpandIcon,
  EyeOffIcon,
  HandIcon,
  LanguageIcon,
  LinkIcon,
  LockIcon,
  MicIcon,
  PersonIcon,
  PlantIcon,
  SearchIcon,
  SortIcon,
  UserIcon,
  VolumeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './icons';
import './naama-services.css';

const PAGES = ['1', '2', '3', '4', '5', '…', '46'] as const;

function ensureNaamaFont() {
  const id = 'naama-ibm-plex';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

export function NaamaServicesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [sort, setSort] = useState<SortMode | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [scale, setScale] = useState(1);
  const [verifyOpen, setVerifyOpen] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'نما | دليل الخدمات الإلكترونية';
    ensureNaamaFont();
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const services = useMemo(
    () => filterServices(CATALOG_SERVICES, query, selected, sort),
    [query, selected, sort],
  );

  const openServiceDetails = () => {
    navigate('/services/details');
  };

  const toggleFilter = (item: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  return (
    <div
      className="naama-page"
      style={{
        zoom: scale,
        filter: grayscale ? 'grayscale(1)' : undefined,
      }}
    >
      <StampBar
        verifyOpen={verifyOpen}
        onToggleVerify={() => setVerifyOpen((open) => !open)}
        onToggleGray={() => setGrayscale((value) => !value)}
        onIncrease={() => setScale((value) => Math.min(1.2, +(value + 0.06).toFixed(2)))}
        onDecrease={() => setScale((value) => Math.max(0.88, +(value - 0.06).toFixed(2)))}
      />
      <UtilityBar onLogin={() => navigate('/account/login')} />
      <SiteNav query={query} onQuery={setQuery} />
      <Hero />
      <main>
        <div className="naama-container">
          <MainSearch query={query} onQuery={setQuery} />
          <div className="content-grid">
            <FilterSidebar selected={selected} onToggle={toggleFilter} />
            <section aria-label="جميع الخدمات">
              <ServicesHead
                sort={sort}
                sortOpen={sortOpen}
                onToggleSort={() => setSortOpen((open) => !open)}
                onSort={(mode) => {
                  setSort(mode);
                  setSortOpen(false);
                }}
              />
              {services.length === 0 ? (
                <p className="empty-note">لا توجد خدمات مطابقة</p>
              ) : (
                <div className="cards">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.title}
                      service={service}
                      onOpen={
                        service.title === SYSTEM_ENTRY_TITLE
                          ? openServiceDetails
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
              <Pagination />
            </section>
          </div>
        </div>
        <Feedback />
      </main>
      <SiteFooter />
      <FloatingTools />
    </div>
  );
}

function StampBar({
  verifyOpen,
  onToggleVerify,
  onToggleGray,
  onIncrease,
  onDecrease,
}: {
  verifyOpen: boolean;
  onToggleVerify: () => void;
  onToggleGray: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <div className="stamp-bar">
      <div className="stamp-inner">
        <p className="stamp-title">
          <img src={saudiFlag} alt="" />
          <span>موقع حكومي مسجل لدى هيئة الحكومة الرقمية</span>
          <button
            type="button"
            className="verify-btn"
            aria-expanded={verifyOpen}
            onClick={onToggleVerify}
          >
            <span>كيف تتحقق؟</span>
            <ChevronDownIcon />
          </button>
        </p>
        <div className="a11y-tools">
          <button type="button" className="icon-btn" aria-label="وضع التدرج الرمادي" onClick={onToggleGray}>
            <EyeOffIcon />
          </button>
          <button type="button" className="icon-btn" aria-label="تكبير الخط" onClick={onIncrease}>
            <ZoomInIcon />
          </button>
          <button type="button" className="icon-btn" aria-label="تصغير الخط" onClick={onDecrease}>
            <ZoomOutIcon />
          </button>
        </div>
      </div>
      {verifyOpen && (
        <div className="verify-panel">
          <div className="naama-container">
            <p>
              <LinkIcon />
              جميع روابط المواقع الرسمية للأنشطة والمبادرات في المملكة العربية السعودية تنتهي بـ sa.
            </p>
            <p>
              <LockIcon />
              تحقق من أن الموقع يستخدم بروتوكول HTTPS
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function UtilityBar({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="util-bar">
      <div className="util-inner">
        <button type="button" className="util-btn">
          <LanguageIcon />
          <span>English</span>
        </button>
        <button type="button" className="util-btn" onClick={onLogin}>
          <UserIcon />
          <span>تسجيل الدخول</span>
        </button>
      </div>
    </div>
  );
}

function SiteNav({
  query,
  onQuery,
}: {
  query: string;
  onQuery: (value: string) => void;
}) {
  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <span className="brand">
          <img
            src={namaLogo}
            alt="Namaa E-Services Platform – Ministry of Environment, Water and Agriculture"
          />
        </span>
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item}>
              <button
                type="button"
                className={item === ACTIVE_NAV ? 'active' : undefined}
                aria-current={item === ACTIVE_NAV ? 'page' : undefined}
              >
                {item}
                {item === 'عن نما' && <ChevronDownIcon />}
              </button>
            </li>
          ))}
        </ul>
        <label className="nav-search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            placeholder="ابحث هنا ..."
            aria-label="ابحث هنا ..."
            onChange={(event) => onQuery(event.target.value)}
          />
        </label>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="naama-container hero-inner">
        <p className="crumbs">
          <span>الرئيسية</span>
          <ChevronLeftIcon />
          <span>دليل الخدمات الإلكترونية</span>
        </p>
        <h1>دليل الخدمات الإلكترونية</h1>
      </div>
    </section>
  );
}

function MainSearch({
  query,
  onQuery,
}: {
  query: string;
  onQuery: (value: string) => void;
}) {
  return (
    <div className="main-search-wrap">
      <label className="main-search">
        <button type="button" className="mic-btn" aria-label="البحث الصوتي">
          <MicIcon />
        </button>
        <input
          type="search"
          value={query}
          placeholder="ابحث هنا ..."
          aria-label="ابحث هنا ..."
          onChange={(event) => onQuery(event.target.value)}
        />
        <SearchIcon />
      </label>
    </div>
  );
}

function FilterSidebar({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (item: string) => void;
}) {
  return (
    <aside className="filters" aria-label="تصفية البحث">
      <h2>تصفية البحث</h2>
      {FILTER_GROUPS.map((group) => (
        <div key={group.title} className="filter-group">
          <h3>{group.title}</h3>
          {group.items.map((item) => (
            <label key={item} className="filter-item">
              <input
                type="checkbox"
                checked={selected.has(item)}
                onChange={() => onToggle(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      ))}
    </aside>
  );
}

function ServicesHead({
  sort,
  sortOpen,
  onToggleSort,
  onSort,
}: {
  sort: SortMode | null;
  sortOpen: boolean;
  onToggleSort: () => void;
  onSort: (mode: SortMode) => void;
}) {
  return (
    <div className="services-head">
      <h2 className="services-title">
        جميع الخدمات
        <span className="count-badge main">
          <span>(460)</span>
          خدمة رئيسية
        </span>
        <span className="count-badge sub">
          <span>(1189)</span>
          خدمة فرعية
        </span>
      </h2>
      <div className="sort-wrap">
        <button
          type="button"
          className="sort-btn"
          aria-expanded={sortOpen}
          onClick={onToggleSort}
        >
          <SortIcon />
          ترتيب الخدمات
        </button>
        {sortOpen && (
          <ul className="sort-menu">
            {SORT_OPTIONS.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className={sort === option.id ? 'active' : undefined}
                  onClick={() => onSort(option.id)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  onOpen,
}: {
  service: CatalogService;
  onOpen?: () => void;
}) {
  const Icon = service.icon === 'droplet' ? DropletIcon : PlantIcon;
  const isDetails = service.actionLabel === 'تفاصيل الخدمة';

  return (
    <article
      className={onOpen ? 'service-card is-entry' : 'service-card'}
      onClick={onOpen}
    >
      <div className="service-icon">
        <Icon />
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <div className="tags">
        {service.tags.map((tag) => (
          <span key={tag} className={isChildCountTag(tag) ? 'tag child' : 'tag'}>
            {tag}
          </span>
        ))}
      </div>
      <button
        type="button"
        className={isDetails ? 'card-action details' : 'card-action choose'}
      >
        {service.actionLabel}
        {isDetails ? <ArrowLeftIcon /> : <ExpandIcon />}
      </button>
    </article>
  );
}

function Pagination() {
  return (
    <nav className="pagination" aria-label="pagination">
      {PAGES.map((page) =>
        page === '…' ? (
          <span key={page}>{page}</span>
        ) : (
          <button
            key={page}
            type="button"
            className={page === '1' ? 'current' : undefined}
            aria-current={page === '1' ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}
    </nav>
  );
}

function Feedback() {
  return (
    <section className="feedback" aria-label="هل كانت الصفحة مفيدة؟">
      <div className="naama-container feedback-inner">
        <p>هل كانت الصفحة مفيدة؟</p>
        <div className="feedback-actions">
          <button type="button" className="yes">
            نعم
          </button>
          <button type="button">لا</button>
        </div>
        <p className="feedback-meta">90% من المستخدمين قالوا نعم من 72 تعليقًا</p>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
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
            <img
              src={namaLogo}
              alt="Namaa E-Services Platform – Ministry of Environment, Water and Agriculture"
            />
            <h2>أدوات الإتاحة والوصول</h2>
            <p className="feedback-meta">تطبيق وزارة البيئة والمياه والزراعة</p>
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
      </div>
    </footer>
  );
}

function FloatingTools() {
  return (
    <>
      <div className="float-tools">
        <button type="button" aria-label="استمع إلى هذه الصفحة">
          <VolumeIcon />
        </button>
        <button type="button" aria-label="أدوات الإتاحة والوصول">
          <PersonIcon />
        </button>
        <a href="admin.html" aria-label="لغة الإشارة">
          <HandIcon />
        </a>
      </div>
      <button type="button" className="help-fab" aria-label="فتح المحادثة">
        <ChatIcon />
      </button>
    </>
  );
}

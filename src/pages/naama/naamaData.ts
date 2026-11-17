export const SYSTEM_ENTRY_TITLE = 'نظام الاستصلاح الزراعي';

export type ServiceIcon = 'plant' | 'droplet';
export type SortMode = 'alpha-asc' | 'alpha-desc' | 'date-asc' | 'date-desc';

export interface CatalogService {
  title: string;
  description: string;
  tags: string[];
  actionLabel: 'اختر الخدمة' | 'تفاصيل الخدمة';
  icon: ServiceIcon;
}

export interface FilterGroup {
  title: string;
  items: string[];
}

export const FILTER_GROUPS: FilterGroup[] = [
  {
    title: 'فئات المستفيدين',
    items: [
      'الجمعيات التطوعية (85)',
      'جهات حكومية (945)',
      'أفراد (969)',
      'زوار المملكة (30)',
      'قطاع أعمال (1066)',
    ],
  },
  {
    title: 'القطاعات',
    items: [
      'قطاع الزراعة (1058)',
      'قطاع المياه (80)',
      'قطاع البيئة (22)',
      'عام (27)',
    ],
  },
  {
    title: 'الجهات',
    items: [
      'المؤسسة العامة للري (32)',
      'المركز الوطني لتنمية الغطاء النباتي ومكافحة التصحر (21)',
      'المركز الوطني للنخيل والتمور (16)',
      'الهيئة العامة للأمن الغذائي (15)',
      'مركز الملك عبدالعزيز للخيل العربية الأصيلة (أصيل) (12)',
      'المركز الوطني لكفاءة وترشيد المياه (مائي) (11)',
      'الإدارة العامة لتنظيم مصادر المياه (6)',
      'صندوق البيئة (2)',
    ],
  },
  {
    title: 'تصنيف الخدمات',
    items: [
      'خدمات التراخيص (830)',
      'خدمات المزارع (135)',
      'خدمات الاستيراد والتصدير والفسح (76)',
      'رخص مصادر المياه واستخداماتها (71)',
      'خدمات عامة (20)',
      'الخدمات الحيوانية (18)',
      'خدمات المزارعين (13)',
      'اصيل (12)',
      'خدمات مطاحن (5)',
      'خدمات البيئة (4)',
      'خدمات الدعم المالي (3)',
      'خدمات التحاليل والمختبر (3)',
      'خدمات الأراضي (1)',
      'التدريب (1)',
      'الإدارة العامة للاستثمار (1)',
    ],
  },
  {
    title: 'التصنيفات الفرعية',
    items: [],
  },
  {
    title: 'نوع الخدمة',
    items: [
      'الخدمات الاستباقية ورسائل التنبية (20)',
      'ذكاء اصطناعي (5)',
      'الطقس (1)',
      'جودة الهواء (1)',
      'الفياضانات (1)',
      'نائية (1)',
    ],
  },
];

const LICENSE_DESC =
  'هي خدمة تمنح المستفيد ما يفيد بالموافقة المبدئية من الوزارة لاستكمال الحصول على الموافقات والمستندات الرسمية تمهيداً لإصدار الترخيص الإنشائي';

const PLANT_LICENSE_DESC =
  'هي خدمة تمكن المستثمرين بالتقديم على ترخيص إنشائي لمشروع خاص بمشاريع الثروة النباتية';

export const CATALOG_SERVICES: CatalogService[] = [
  {
    title: SYSTEM_ENTRY_TITLE,
    description:
      'خدمة تمكّن المستفيد من تقديم طلب استصلاح أرض زراعية ومتابعة مسار اعتماده لدى الوزارة، بعد التحقق من استيفاء الاشتراطات والموافقات اللازمة لتهيئة الأرض وتحويلها إلى أرض منتجة.',
    tags: ['قطاع الزراعة', 'استصلاح الأراضي', 'خدمات زراعية', '1 خدمة فرعية'],
    actionLabel: 'تفاصيل الخدمة',
    icon: 'plant',
  },
  {
    title: 'طلب كمية مياه اضافية',
    description:
      'دراسة تخصيص كمية إضافية من المياه بعد تحديث المساحة المروية (لإعادة احتساب كمية المياه المخصصة)',
    tags: ['قطاع الزراعة', 'خدمات المياه', 'خدمات المزارع'],
    actionLabel: 'تفاصيل الخدمة',
    icon: 'plant',
  },
  {
    title: 'تشغيل مفارخ الدجاج',
    description: LICENSE_DESC,
    tags: [
      'قطاع الزراعة',
      'خدمات مشاريع الدواجن',
      'الثروة الحيوانية',
      '12 خدمة فرعية',
    ],
    actionLabel: 'اختر الخدمة',
    icon: 'plant',
  },
  {
    title: 'إلغاء شهادة اعتماد مصدر مائي (عقد توريد) لمصانع إنتاج مياه معبأة',
    description:
      'خدمة إلغاء شهادة اعتماد مصدر مائي (عقد توريد) لمصانع إنتاج مياه معبأة عبارة عن خدمة أساسية تكاملية مؤتمتة، تهدف الى توفير قناة للمستفيدين من فئة (قطاع أعمال) وبالأخص مصانع مياه الشرب المعبأة الراغبين في إلغاء شهادة اعتماد مصدر مائي بناء صادرة تم الحصول عليها من الوزارة بعد تقديم الطلب على نظام نما لأسباب منها تجديد عقد التوريد او انهاء التعامل مع المورد على سبيل المثال.',
    tags: [
      'قطاع المياه',
      'رخص استخدام مصادر المياه',
      'رخص مصادر المياه واستخداماتها',
    ],
    actionLabel: 'تفاصيل الخدمة',
    icon: 'droplet',
  },
  {
    title: 'إنتاج أنواع لحوم الدواجن والأرانب والطيور الطازجة',
    description: LICENSE_DESC,
    tags: [
      'قطاع الزراعة',
      'خدمات مشاريع الدواجن',
      'الثروة الحيوانية',
      '12 خدمة فرعية',
    ],
    actionLabel: 'اختر الخدمة',
    icon: 'plant',
  },
  {
    title: 'زراعة النخيل وإنتاج التمور',
    description: PLANT_LICENSE_DESC,
    tags: [
      'قطاع الزراعة',
      'مشاريع الثروة النباتية',
      'الثروة النباتية',
      '11 خدمة فرعية',
    ],
    actionLabel: 'اختر الخدمة',
    icon: 'plant',
  },
  {
    title: 'الزراعة المائية لإنتاج الورد',
    description:
      'هي خدمة تمنح المستفيد إذن تصدره الوزارة يخول هذا الإذن المستفيد بالبدء في تنفيذ أعمال المنشأة الزراعية واستكمال المعدات اللازمة للتشغيل، ولا يخوله البدء بتشغيل المشروع',
    tags: [
      'قطاع الزراعة',
      'مشاريع البيوت المحمية',
      'الثروة النباتية',
      '11 خدمة فرعية',
    ],
    actionLabel: 'اختر الخدمة',
    icon: 'plant',
  },
  {
    title: 'زراعة الحمضيات ( الموالح )',
    description: PLANT_LICENSE_DESC,
    tags: [
      'قطاع الزراعة',
      'مشاريع الثروة النباتية',
      'الثروة النباتية',
      '11 خدمة فرعية',
    ],
    actionLabel: 'اختر الخدمة',
    icon: 'plant',
  },
  {
    title: 'خدمة تسجيل نشاط خارج حيازة صياد',
    description: 'خدمة تتيح للمستفيد تسجيل نشاط خارج حيازة للصيادين.',
    tags: ['قطاع الزراعة', 'خدمات السجل الزراعي', 'خدمات زراعية'],
    actionLabel: 'تفاصيل الخدمة',
    icon: 'plant',
  },
  {
    title: 'تربية وإنتاج جدات أمهات الدجاج البياض وتشغيل مفارخها',
    description: LICENSE_DESC,
    tags: [
      'قطاع الزراعة',
      'خدمات مشاريع الدواجن',
      'الثروة الحيوانية',
      '12 خدمة فرعية',
    ],
    actionLabel: 'اختر الخدمة',
    icon: 'plant',
  },
];

export const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'alpha-asc', label: 'ترتيب ابجدي تصاعدي' },
  { id: 'alpha-desc', label: 'ترتيب ابجدي تنازلي' },
  { id: 'date-asc', label: 'ترتيب بالتاريخ تصاعدي' },
  { id: 'date-desc', label: 'ترتيب بالتاريخ تنازلي' },
];

export const NAV_ITEMS = [
  'الرئيسية',
  'دليل الخدمات الإلكترونية',
  'الأخبار و الأحداث',
  'عن نما',
  'الأسئلة الشائعة',
  'تواصل معنا',
] as const;

export const ACTIVE_NAV = 'دليل الخدمات الإلكترونية';

function bareLabel(item: string): string {
  return item.replace(/\s*\(\d+\)\s*$/u, '').trim();
}

function matchesQuery(service: CatalogService, query: string): boolean {
  if (!query) return true;
  const haystack = [service.title, service.description, ...service.tags].join(
    ' ',
  );
  return haystack.includes(query);
}

function matchesFilters(
  service: CatalogService,
  selected: ReadonlySet<string>,
): boolean {
  const activeGroups = FILTER_GROUPS.map((group) =>
    group.items.filter((item) => selected.has(item)),
  ).filter((items) => items.length > 0);

  return activeGroups.every((groupItems) =>
    groupItems.some((item) => {
      const label = bareLabel(item);
      return service.tags.some(
        (tag) => tag.includes(label) || label.includes(tag),
      );
    }),
  );
}

export function filterServices(
  services: CatalogService[],
  query: string,
  selected: ReadonlySet<string>,
  sort: SortMode | null,
): CatalogService[] {
  const normalizedQuery = query.trim();
  let result = services.filter(
    (service) =>
      matchesQuery(service, normalizedQuery) &&
      matchesFilters(service, selected),
  );

  if (sort === 'alpha-asc' || sort === 'alpha-desc') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    if (sort === 'alpha-desc') result.reverse();
    return result;
  }

  if (sort === 'date-asc' || sort === 'date-desc') {
    const order = new Map(
      services.map((service, index) => [service.title, index]),
    );
    result = [...result].sort(
      (a, b) => (order.get(a.title) ?? 0) - (order.get(b.title) ?? 0),
    );
    if (sort === 'date-desc') result.reverse();
  }

  return result;
}

export function isChildCountTag(tag: string): boolean {
  return tag.includes('خدمة فرعية');
}

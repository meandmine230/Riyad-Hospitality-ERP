export type Language = 'en' | 'ar';

export const DICTIONARY = {
  en: {
    appTitle: 'Riyada Hospitality ERP',
    appSubtitle: 'Luxury Hotel Back Office & Financial Management',
    currency: 'SAR',
    currencySymbol: 'SAR',
    property: 'Hotel Property',
    allProperties: 'All Properties (Consolidated Group)',
    fiscalPeriod: 'Fiscal Period',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    status: 'Status',
    actions: 'Actions',
    search: 'Search vouchers, suppliers, folios, or items...',
    filter: 'Filter by Department',
    export: 'Export to Excel / CSV',
    print: 'Print Official Voucher',
    save: 'Save Changes',
    cancel: 'Cancel',
    create: 'Create Voucher',
    total: 'Total',
    debit: 'Debit (Dr)',
    credit: 'Credit (Cr)',
    balance: 'Net Balance',
    difference: 'Out of Balance',
    balanced: 'In Balance (0.00 SAR)',
    unbalanced: 'Out of Balance (Discrepancy)',
    viewDetails: 'View Folio / Voucher',
    close: 'Close Window',

    // Human-Centered Hotel Modules
    modules: {
      overview: 'Executive GM & CFO Overview',
      generalLedger: 'General Ledger & USALI Accounts',
      apAr: 'Accounts Payable & Vendors',
      cityLedger: 'Accounts Receivable & City Ledger',
      procurement: 'Procurement & 3-Way Match',
      inventory: 'Food Costing & Stores',
      treasury: 'Treasury & Bank Operations',
      budget: 'Annual Budgets & Variance',
      hrPayroll: 'Payroll & Saudi Labor (GOSI / EOSB)',
      hotelIntegration: 'Front Office & Night Audit Bridge',
      financialReports: 'Financial Statements (P&L / Balance Sheet)',
      devops: 'System Administration & Security Audit',
    },

    // Hospitality Metrics
    hospitality: {
      revPar: 'RevPAR (Revenue Per Available Room)',
      adr: 'ADR (Average Daily Rate)',
      occupancy: 'Room Occupancy Rate',
      roomsAvailable: 'Available Rooms for Sale',
      roomsOccupied: 'Occupied Guest Rooms',
      roomRevenue: 'Room Revenue',
      fbRevenue: 'Food & Beverage Revenue',
      dailyFlash: 'Daily Manager Revenue Flash',
      guestLedger: 'In-House Guest Ledger',
      cityLedger: 'Corporate City Ledger',
      nightAudit: 'PMS Night Audit Interface',
    },

    // Cheque Management
    cheque: {
      title: 'Cheque Management Register',
      allCheques: 'All Cheques',
      waitingForChecks: 'Waiting for Checks',
      waitingForApproval: 'Waiting for Approval',
      readyToIssue: 'Ready to Issue',
      issuedAndCleared: 'Issued & Cleared',
      chequeNumber: 'Cheque Number',
      beneficiary: 'Beneficiary',
      bankName: 'Issuing Bank',
      issueDate: 'Issue Date',
      dueDate: 'Maturity / Due Date',
      amount: 'Amount (SAR)',
      approveByFC: 'Sign (Financial Controller)',
      approveByGM: 'Sign (General Manager)',
      issueCheque: 'Mark as Issued',
      clearCheque: 'Reconcile & Clear',
      newCheque: 'Draft New Cheque',
    },

    // Ministry of Tourism NTMP
    ntmp: {
      circularBadge: 'KSA Ministry of Tourism Directive No. 7788/1448',
      platformTitle: 'National Tourism Monitoring Platform (NTMP)',
      platformTitleAr: 'منصة الرصد السياحي (البيانات المالية)',
      legalRef: 'Article 24, Paragraph (3) of Tourism Accommodation Regulations (Resolution No. 2289)',
      complianceDeadline: 'Mandatory Compliance Date: October 1, 2026',
      portalLink: 'Ministry of Tourism Developer Portal (NTMP APIs)',
      financialDataSync: 'Automated Financial Data Bridge Active',
    },
  },
  ar: {
    appTitle: 'نظام ريادة لإدارة الفنادق والضيافة',
    appSubtitle: 'المنظومة المالية والتشغيلية الموحدة للفنادق الفاخرة',
    currency: 'ر.س',
    currencySymbol: 'ر.س',
    property: 'الفندق / المنشأة',
    allProperties: 'المجموعة الفندقية الموحدة (عرض مجمع)',
    fiscalPeriod: 'الفترة المالية',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    theme: 'المظهر',
    dark: 'داكن',
    light: 'فاتح',
    status: 'الحالة',
    actions: 'الإجراءات',
    search: 'بحث في السندات، الموردين، الفواتير، النزلاء...',
    filter: 'تصفية حسب القسم',
    export: 'تصدير إكسل / CSV',
    print: 'طباعة السند الرسمي',
    save: 'حفظ التعديلات',
    cancel: 'إلغاء',
    create: 'إنشاء سند جديد',
    total: 'الإجمالي',
    debit: 'مدين (منه)',
    credit: 'دائن (له)',
    balance: 'صافي الرصيد',
    difference: 'الفارق المحاسبي',
    balanced: 'متزن ومطابق (0.00 ر.س)',
    unbalanced: 'غير متزن (يوجد فارق)',
    viewDetails: 'عرض السند والتفاصيل',
    close: 'إغلاق',

    // Human-Centered Hotel Modules
    modules: {
      overview: 'لوحة القيادة التنفيذية (المدير العام والمالي)',
      generalLedger: 'الأستاذ العام ودليل الحسابات الفندقي',
      apAr: 'حسابات الموردين والمدفوعات (AP)',
      cityLedger: 'الذمم المدينة ودفتر المدينة والشركات (AR)',
      procurement: 'إدارة المشتريات والمطابقة الثلاثية',
      inventory: 'المستودعات وتكاليف الأغذية والمشروبات',
      treasury: 'الخزينة والعمليات وإدارة الشيكات',
      budget: 'الموازنات التقديرية وتحليل الانحراف',
      hrPayroll: 'الرواتب ونظام العمل السعودي (التأمينات ومكافأة نهاية الخدمة)',
      hotelIntegration: 'ربط أنظمة الفندق والتدقيق الليلي (PMS/POS)',
      financialReports: 'القوائم المالية الختامية (الأرباح والخسائر والمركز المالي)',
      devops: 'إدارة النظام وسجل التدقيق الأمني',
    },

    // Hospitality Metrics
    hospitality: {
      revPar: 'متوسط الإيراد لكل غرفة متاحة (RevPAR)',
      adr: 'متوسط السعر اليومي للغرفة (ADR)',
      occupancy: 'نسبة الإشغال الفندقي',
      roomsAvailable: 'الغرف المتاحة للبيع',
      roomsOccupied: 'الغرف المشغولة فعلياً',
      roomRevenue: 'إيرادات الغرف والأجنحة',
      fbRevenue: 'إيرادات الأغذية والمشروبات',
      dailyFlash: 'تقرير الإيراد اليومي السريع (Daily Flash)',
      guestLedger: 'دفتر حسابات نزلاء الفندق',
      cityLedger: 'دفتر حسابات الشركات والجهات الحكومية',
      nightAudit: 'ترحيل التدقيق الليلي',
    },

    // Cheque Management
    cheque: {
      title: 'سجل وإدارة الشيكات البنكية',
      allCheques: 'كافة الشيكات',
      waitingForChecks: 'بانتظار تجهيز الشيك',
      waitingForApproval: 'بانتظار الاعتماد والتوقيع',
      readyToIssue: 'جاهز للتسليم للمستفيد',
      issuedAndCleared: 'تم الصرف والتسوية البنكية',
      chequeNumber: 'رقم الشيك',
      beneficiary: 'المستفيد',
      bankName: 'البنك المسحوب عليه',
      issueDate: 'تاريخ التحرير',
      dueDate: 'تاريخ الاستحقاق',
      amount: 'المبلغ (ر.س)',
      approveByFC: 'توقيع المدير المالي',
      approveByGM: 'توقيع المدير العام',
      issueCheque: 'تسليم الشيك للمستفيد',
      clearCheque: 'تسوية الصرف البنكي',
      newCheque: 'تحرير شيك جديد',
    },

    // Ministry of Tourism NTMP
    ntmp: {
      circularBadge: 'تعميم وزارة السياحة رقم 7788/1448',
      platformTitle: 'منصة الرصد السياحي (البيانات المالية)',
      platformTitleAr: 'منصة الرصد السياحي (البيانات المالية)',
      legalRef: 'الفقرة (3) من المادة (24) من لائحة مرافق الضيافة السياحية (القرار الوزاري رقم 2289)',
      complianceDeadline: 'الموعد الإلزامي للاكتمال: 1 أكتوبر 2026م',
      portalLink: 'بوابة مطوري وزارة السياحة (واجهات الربط المالي NTMP)',
      financialDataSync: 'قناة الربط الإلكتروني للبيانات المالية نشطة وموثقة',
    },
  },
};

export function formatCurrency(amount: number, lang: Language = 'en'): string {
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return lang === 'ar' ? `${formatted} ر.س` : `${formatted} SAR`;
}

export function formatNumber(val: number, lang: Language = 'en'): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US').format(val);
}

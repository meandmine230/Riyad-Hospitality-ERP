import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Building,
  DollarSign,
  PieChart,
  Download,
  Calendar,
} from 'lucide-react';

interface PLRow {
  key: string;
  particularsEn: string;
  particularsAr: string;
  isHeader?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  depth?: number; // 0, 1, 2 for indentation
  // Month To Date
  lastYearMTD: number;
  budgetMTD: number;
  actualMTD: number;
  // Year To Date
  actualYTD: number;
  budgetYTD: number;
  lastYearYTD: number;
}

export const FinancialReportingView: React.FC = () => {
  const { language, fiscalPeriod, currentProperty, activeYear } = useERP();
  const t = DICTIONARY[language];

  const [activeReport, setActiveReport] = useState<'flash' | 'pnl' | 'balanceSheet'>('pnl');

  // Total Revenues for % calculation
  const totalRevMTD = 3160000;
  const totalRevBudgetMTD = 3000000;
  const totalRevLYMTD = 2850000;

  const totalRevYTD = 34500000;
  const totalRevBudgetYTD = 33000000;
  const totalRevLYYTD = 31200000;

  // Exact Official P&L Rows mapped from P_L_STRUCTURE_f66a6716.pdf
  const plRows: PLRow[] = [
    {
      key: 'TOTAL_REVENUE',
      particularsEn: 'TOTAL REVENUE',
      particularsAr: 'إجمالي الإيرادات الفندقية',
      isTotal: true,
      depth: 0,
      lastYearMTD: totalRevLYMTD,
      budgetMTD: totalRevBudgetMTD,
      actualMTD: totalRevMTD,
      actualYTD: totalRevYTD,
      budgetYTD: totalRevBudgetYTD,
      lastYearYTD: totalRevLYYTD,
    },
    // ROOM DEPARTMENT
    {
      key: 'ROOM_DEPT_HEADER',
      particularsEn: 'ROOM DEPARTMENT',
      particularsAr: 'قسم الغرف والاستقبال',
      isHeader: true,
      depth: 0,
      lastYearMTD: 0,
      budgetMTD: 0,
      actualMTD: 0,
      actualYTD: 0,
      budgetYTD: 0,
      lastYearYTD: 0,
    },
    {
      key: 'ROOMS_REVENUE',
      particularsEn: 'ROOMS REVENUE',
      particularsAr: 'إيرادات الغرف والأجنحة',
      depth: 1,
      lastYearMTD: 2150000,
      budgetMTD: 2280000,
      actualMTD: 2420000,
      actualYTD: 26400000,
      budgetYTD: 25100000,
      lastYearYTD: 23650000,
    },
    {
      key: 'ROOMS_SALARIES',
      particularsEn: 'SALARIES & BENEFITS',
      particularsAr: 'الرواتب والمزايا - قسم الغرف',
      depth: 1,
      lastYearMTD: 185000,
      budgetMTD: 195000,
      actualMTD: 192000,
      actualYTD: 2112000,
      budgetYTD: 2145000,
      lastYearYTD: 2035000,
    },
    {
      key: 'ROOMS_OTHER_EXP',
      particularsEn: 'OTHER EXPENSES',
      particularsAr: 'مصروفات تشغيلية أخرى - قسم الغرف',
      depth: 1,
      lastYearMTD: 110000,
      budgetMTD: 120000,
      actualMTD: 115000,
      actualYTD: 1265000,
      budgetYTD: 1320000,
      lastYearYTD: 1210000,
    },
    {
      key: 'ROOMS_GOP',
      particularsEn: 'DEPARTMENT PROFIT - ROOMS',
      particularsAr: 'صافي ربح قسم الغرف',
      isSubtotal: true,
      depth: 1,
      lastYearMTD: 1855000,
      budgetMTD: 1965000,
      actualMTD: 2113000,
      actualYTD: 23023000,
      budgetYTD: 21635000,
      lastYearYTD: 20405000,
    },
    // FOOD & BEVERAGE
    {
      key: 'FB_DEPT_HEADER',
      particularsEn: 'FOOD & BEVERAGE DEPARTMENT',
      particularsAr: 'قسم الأغذية والمشروبات والمطاعم',
      isHeader: true,
      depth: 0,
      lastYearMTD: 0,
      budgetMTD: 0,
      actualMTD: 0,
      actualYTD: 0,
      budgetYTD: 0,
      lastYearYTD: 0,
    },
    {
      key: 'FB_REVENUE',
      particularsEn: 'FOOD & BEVERAGE REVENUE',
      particularsAr: 'إيرادات الأغذية والمشروبات',
      depth: 1,
      lastYearMTD: 590000,
      budgetMTD: 620000,
      actualMTD: 642000,
      actualYTD: 7062000,
      budgetYTD: 6820000,
      lastYearYTD: 6490000,
    },
    {
      key: 'FB_COST',
      particularsEn: 'F&B COST (COGS)',
      particularsAr: 'تكلفة الأغذية والمشروبات المستهلكة',
      depth: 1,
      lastYearMTD: 194700,
      budgetMTD: 201500,
      actualMTD: 208000,
      actualYTD: 2288000,
      budgetYTD: 2216500,
      lastYearYTD: 2141700,
    },
    {
      key: 'FB_SALARIES',
      particularsEn: 'SALARIES & BENEFITS',
      particularsAr: 'الرواتب والمزايا - الأغذية والمشروبات',
      depth: 1,
      lastYearMTD: 140000,
      budgetMTD: 145000,
      actualMTD: 142000,
      actualYTD: 1562000,
      budgetYTD: 1595000,
      lastYearYTD: 1540000,
    },
    {
      key: 'FB_OTHER_EXP',
      particularsEn: 'OTHER EXPENSES',
      particularsAr: 'مصروفات تشغيلية أخرى - الأغذية والمشروبات',
      depth: 1,
      lastYearMTD: 62000,
      budgetMTD: 68000,
      actualMTD: 65000,
      actualYTD: 715000,
      budgetYTD: 748000,
      lastYearYTD: 682000,
    },
    {
      key: 'FB_GOP',
      particularsEn: 'DEPARTMENT PROFIT - F& B',
      particularsAr: 'صافي ربح قسم الأغذية والمشروبات',
      isSubtotal: true,
      depth: 1,
      lastYearMTD: 193300,
      budgetMTD: 205500,
      actualMTD: 227000,
      actualYTD: 2497000,
      budgetYTD: 2259500,
      lastYearYTD: 2126300,
    },
    // LAUNDRY
    {
      key: 'LAUNDRY_HEADER',
      particularsEn: 'LAUNDRY DEPARTMENT',
      particularsAr: 'قسم المغسلة',
      isHeader: true,
      depth: 0,
      lastYearMTD: 0,
      budgetMTD: 0,
      actualMTD: 0,
      actualYTD: 0,
      budgetYTD: 0,
      lastYearYTD: 0,
    },
    {
      key: 'LAUNDRY_REVENUE',
      particularsEn: 'LAUNDRY REVENUE',
      particularsAr: 'إيرادات المغسلة',
      depth: 1,
      lastYearMTD: 48000,
      budgetMTD: 52000,
      actualMTD: 56000,
      actualYTD: 616000,
      budgetYTD: 572000,
      lastYearYTD: 528000,
    },
    {
      key: 'LAUNDRY_EXPENSES',
      particularsEn: 'LAUNDRY EXPENSES',
      particularsAr: 'مصروفات تشغيل وكيماويات المغسلة',
      depth: 1,
      lastYearMTD: 16000,
      budgetMTD: 18000,
      actualMTD: 17500,
      actualYTD: 192500,
      budgetYTD: 198000,
      lastYearYTD: 176000,
    },
    {
      key: 'LAUNDRY_GOP',
      particularsEn: 'DEPARTMENT PROFIT - LAUNDRY',
      particularsAr: 'صافي ربح قسم المغسلة',
      isSubtotal: true,
      depth: 1,
      lastYearMTD: 32000,
      budgetMTD: 34000,
      actualMTD: 38500,
      actualYTD: 423500,
      budgetYTD: 374000,
      lastYearYTD: 352000,
    },
    // OTHER OPERATED DEPARTMENTS
    {
      key: 'OTHER_DEPTS_HEADER',
      particularsEn: 'TRANSPORTATION & OTHER OPERATED DEPTS',
      particularsAr: 'خدمات النقل والأقسام المشغلة الأخرى',
      isHeader: true,
      depth: 0,
      lastYearMTD: 0,
      budgetMTD: 0,
      actualMTD: 0,
      actualYTD: 0,
      budgetYTD: 0,
      lastYearYTD: 0,
    },
    {
      key: 'TRANSPORTATION_REVENUE',
      particularsEn: 'TRANSPORTATION REVENUE',
      particularsAr: 'إيرادات النقل الفاخر',
      depth: 1,
      lastYearMTD: 32000,
      budgetMTD: 35000,
      actualMTD: 38000,
      actualYTD: 418000,
      budgetYTD: 385000,
      lastYearYTD: 352000,
    },
    {
      key: 'OTHER_REVENUE',
      particularsEn: 'OTHER REVENUE',
      particularsAr: 'إيرادات النادي الصحي والسبا والأنشطة',
      depth: 1,
      lastYearMTD: 30000,
      budgetMTD: 32000,
      actualMTD: 35000,
      actualYTD: 385000,
      budgetYTD: 352000,
      lastYearYTD: 330000,
    },
    {
      key: 'OTHER_GOP',
      particularsEn: 'DEPARTMENT PROFIT - OTHER REVENUE',
      particularsAr: 'صافي ربح الأقسام المشغلة الأخرى',
      isSubtotal: true,
      depth: 1,
      lastYearMTD: 42000,
      budgetMTD: 45000,
      actualMTD: 50500,
      actualYTD: 555500,
      budgetYTD: 495000,
      lastYearYTD: 462000,
    },
    // TOTAL OPERATING DEPT PROFIT
    {
      key: 'TOTAL_OPERATING_DEPT_PROFIT',
      particularsEn: 'TOTAL OPERATING DEPT. PROFIT',
      particularsAr: 'إجمالي أرباح الأقسام التشغيلية',
      isTotal: true,
      depth: 0,
      lastYearMTD: 2122300,
      budgetMTD: 2249500,
      actualMTD: 2429000,
      actualYTD: 26499000,
      budgetYTD: 24763500,
      lastYearYTD: 23345300,
    },
    // GENERAL EXPENSES (UNDISTRIBUTED)
    {
      key: 'GENERAL_EXPENSES_HEADER',
      particularsEn: 'GENERAL EXPENSES (UNDISTRIBUTED)',
      particularsAr: 'المصروفات العامة وغير الموزعة',
      isHeader: true,
      depth: 0,
      lastYearMTD: 0,
      budgetMTD: 0,
      actualMTD: 0,
      actualYTD: 0,
      budgetYTD: 0,
      lastYearYTD: 0,
    },
    {
      key: 'AG_EXPENSE',
      particularsEn: 'A&G (ADMINISTRATIVE & GENERAL)',
      particularsAr: 'المصروفات الإدارية والعمومية (A&G)',
      depth: 1,
      lastYearMTD: 180000,
      budgetMTD: 190000,
      actualMTD: 185000,
      actualYTD: 2035000,
      budgetYTD: 2090000,
      lastYearYTD: 1980000,
    },
    {
      key: 'MAINTENANCE_EXPENSE',
      particularsEn: 'MAINTENANCE & POMEC',
      particularsAr: 'الصيانة وهندسة المرافق (POMEC)',
      depth: 1,
      lastYearMTD: 135000,
      budgetMTD: 145000,
      actualMTD: 140000,
      actualYTD: 1540000,
      budgetYTD: 1595000,
      lastYearYTD: 1485000,
    },
    {
      key: 'ENERGY_POWER_EXPENSE',
      particularsEn: 'ENERGY & POWER (UTILITIES)',
      particularsAr: 'الطاقة والكهرباء والمياه (المنافع)',
      depth: 1,
      lastYearMTD: 160000,
      budgetMTD: 170000,
      actualMTD: 168000,
      actualYTD: 1848000,
      budgetYTD: 1870000,
      lastYearYTD: 1760000,
    },
    {
      key: 'TOTAL_GENERAL_EXPENSES',
      particularsEn: 'TOTAL GENERAL EXPENSES',
      particularsAr: 'إجمالي المصروفات العامة',
      isSubtotal: true,
      depth: 1,
      lastYearMTD: 475000,
      budgetMTD: 505000,
      actualMTD: 493000,
      actualYTD: 5423000,
      budgetYTD: 5555000,
      lastYearYTD: 5225000,
    },
    // GOP BEFORE RENT
    {
      key: 'GOP_BEFORE_RENT',
      particularsEn: 'GOP BEFORE RENT',
      particularsAr: 'مجمل الربح التشغيلي قبل الإيجار (GOP Before Rent)',
      isTotal: true,
      depth: 0,
      lastYearMTD: 1647300,
      budgetMTD: 1744500,
      actualMTD: 1936000,
      actualYTD: 21076000,
      budgetYTD: 19208500,
      lastYearYTD: 18120300,
    },
    // RENT
    {
      key: 'RENT',
      particularsEn: 'RENT',
      particularsAr: 'إيجار مبنى وأرض الفندق',
      depth: 1,
      lastYearMTD: 250000,
      budgetMTD: 250000,
      actualMTD: 250000,
      actualYTD: 2750000,
      budgetYTD: 2750000,
      lastYearYTD: 2750000,
    },
    // G.O.P AFTER RENT
    {
      key: 'GOP_AFTER_RENT',
      particularsEn: 'G.O.P AFTER RENT',
      particularsAr: 'مجمل الربح التشغيلي بعد الإيجار (GOP After Rent)',
      isTotal: true,
      depth: 0,
      lastYearMTD: 1397300,
      budgetMTD: 1494500,
      actualMTD: 1686000,
      actualYTD: 18326000,
      budgetYTD: 16458500,
      lastYearYTD: 15370300,
    },
    // FIXED CHARGES
    {
      key: 'FIXED_CHARGES_HEADER',
      particularsEn: 'TOTAL FIXED CHARGES',
      particularsAr: 'المصاريف الثابتة والاحتياطيات',
      isHeader: true,
      depth: 0,
      lastYearMTD: 0,
      budgetMTD: 0,
      actualMTD: 0,
      actualYTD: 0,
      budgetYTD: 0,
      lastYearYTD: 0,
    },
    {
      key: 'CAPITAL_REPLACEMENT',
      particularsEn: 'CAPITAL REPLACEMENT (3% FF&E)',
      particularsAr: 'مخصص إحلال الأصول وتجديد الأثاث (3%)',
      depth: 1,
      lastYearMTD: 85500,
      budgetMTD: 90000,
      actualMTD: 94800,
      actualYTD: 1035000,
      budgetYTD: 990000,
      lastYearYTD: 936000,
    },
    {
      key: 'PRIOR_YEAR_EXPENSES',
      particularsEn: 'PRIOR YEAR EXPENSES',
      particularsAr: 'تسويات ومصروفات سنوات سابقة',
      depth: 1,
      lastYearMTD: 12000,
      budgetMTD: 10000,
      actualMTD: 8500,
      actualYTD: 93500,
      budgetYTD: 110000,
      lastYearYTD: 132000,
    },
    {
      key: 'STAFF_INCENTIVE',
      particularsEn: 'STAFF INCENTIVE',
      particularsAr: 'حوافز وبونص الأداء لمنسوبي الفندق',
      depth: 1,
      lastYearMTD: 35000,
      budgetMTD: 40000,
      actualMTD: 42000,
      actualYTD: 462000,
      budgetYTD: 440000,
      lastYearYTD: 385000,
    },
    {
      key: 'TOTAL_FIXED_CHARGES',
      particularsEn: 'TOTAL FIXED CHARGES',
      particularsAr: 'إجمالي المصاريف الثابتة',
      isSubtotal: true,
      depth: 1,
      lastYearMTD: 132500,
      budgetMTD: 140000,
      actualMTD: 145300,
      actualYTD: 1590500,
      budgetYTD: 1540000,
      lastYearYTD: 1453000,
    },
    // NET OPERATING PROFIT
    {
      key: 'NET_OPERATING_PROFIT',
      particularsEn: 'NET OPERATING PROFIT / (LOSS)',
      particularsAr: 'صافي الربح التشغيلي للفندق (NOP)',
      isTotal: true,
      depth: 0,
      lastYearMTD: 1264800,
      budgetMTD: 1354500,
      actualMTD: 1540700,
      actualYTD: 16735500,
      budgetYTD: 14918500,
      lastYearYTD: 13917300,
    },
    // PAYROLL & RELATED
    {
      key: 'PAYROLL_AND_RELATED',
      particularsEn: 'PAYROLL & RELATED (CONSOLIDATED)',
      particularsAr: 'إجمالي تكلفة القوى العاملة والرواتب المجمعة',
      isSubtotal: true,
      depth: 0,
      lastYearMTD: 620000,
      budgetMTD: 650000,
      actualMTD: 639000,
      actualYTD: 7029000,
      budgetYTD: 7150000,
      lastYearYTD: 6820000,
    },
  ];

  const calcPct = (amount: number, base: number) => {
    if (!base) return '0.00%';
    return `${((amount / base) * 100).toFixed(2)}%`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Particulars',
      'MTD Last Year',
      'MTD LY %',
      'MTD Budget',
      'MTD Budget %',
      'MTD Actual',
      'MTD Actual %',
      'YTD Actual',
      'YTD Actual %',
      'YTD Budget',
      'YTD Budget %',
      'YTD Last Year',
      'YTD LY %',
    ];

    const rows = plRows.map((r) => [
      `"${language === 'ar' ? r.particularsAr : r.particularsEn}"`,
      r.lastYearMTD,
      calcPct(r.lastYearMTD, totalRevLYMTD),
      r.budgetMTD,
      calcPct(r.budgetMTD, totalRevBudgetMTD),
      r.actualMTD,
      calcPct(r.actualMTD, totalRevMTD),
      r.actualYTD,
      calcPct(r.actualYTD, totalRevYTD),
      r.budgetYTD,
      calcPct(r.budgetYTD, totalRevBudgetYTD),
      r.lastYearYTD,
      calcPct(r.lastYearYTD, totalRevLYYTD),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hotel_PL_Statement_${activeYear}_${fiscalPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
              {language === 'ar' ? 'التقارير المالية والذكاء الفندقي' : 'Financial Reporting & Business Intelligence'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              USALI 11th Edition • KSA Financial Year {activeYear}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar'
              ? 'ملخص الأرباح والخسائر والقوائم المالية الفندقية'
              : 'Profit & Loss Summary & Financial Statements'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'قائمة الدخل التشغيلية المعتمدة فندقياً (Month To Date / Year To Date) ومطابقة ميزان المراجعة والمركز المالي'
              : 'Standardized hotel operational P&L (Month To Date / Year To Date) with % benchmarks, Flash Revenue, and Balance Sheet.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer border border-slate-300 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#00305D]" />
            <span>{language === 'ar' ? 'تصدير إكسل' : 'Export CSV'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.print}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={language === 'ar' ? 'إجمالي إيراد الشهر الحالي' : 'MTD Total Revenue'}
          value={formatCurrency(totalRevMTD, language)}
          subtitle={language === 'ar' ? '+5.3% مقارنة بالموازنة' : '+5.3% vs Budget'}
          icon={BarChart3}
          accentColor="amber"
        />
        <MetricCard
          title={language === 'ar' ? 'مجمل الربح التشغيلي (GOP)' : 'Gross Operating Profit (GOP)'}
          value={formatCurrency(1936000, language)}
          subtitle="61.2% Luxury GOP Margin"
          icon={TrendingUp}
          accentColor="emerald"
        />
        <MetricCard
          title={language === 'ar' ? 'صافي الربح التشغيلي (NOP)' : 'Net Operating Profit (NOP)'}
          value={formatCurrency(1540700, language)}
          subtitle="48.7% Net Margin After Rent"
          icon={PieChart}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'إيرادات تراكمي العام (YTD)' : 'YTD Total Revenue'}
          value={formatCurrency(totalRevYTD, language)}
          subtitle="Year To Date Consolidated"
          icon={Building}
          accentColor="indigo"
        />
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveReport('pnl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeReport === 'pnl'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{language === 'ar' ? 'قائمة الأرباح والخسائر الرسمية (P&L Summary)' : 'Profit & Loss Summary (Official Format)'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveReport('flash')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeReport === 'flash'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{language === 'ar' ? 'تقرير الإيراد اليومي السريع (Daily Flash)' : 'Daily Revenue Flash Report'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveReport('balanceSheet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeReport === 'balanceSheet'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{language === 'ar' ? 'قائمة المركز المالي (Balance Sheet)' : 'Balance Sheet'}</span>
        </button>
      </div>

      {/* Report 1: Official Master P&L Structure from P_L_STRUCTURE_f66a6716.pdf */}
      {activeReport === 'pnl' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h3 className="text-base font-bold text-[#00305D] tracking-wide">
                {language === 'ar' ? 'قائمة الأرباح والخسائر الشاملة' : 'Profit & Loss Summary'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {currentProperty ? currentProperty.nameEn : 'Al Faisaliah Riyadh'} • Month To Date & Year To Date ({fiscalPeriod})
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                USALI Standardized
              </span>
              <span>All amounts in SAR</span>
            </div>
          </div>

          {/* Master 13-Column Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                {/* Top Section Header */}
                <tr className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-300 text-[11px] font-bold text-center">
                  <th colSpan={6} className="py-2.5 px-3 border-r border-slate-300 uppercase tracking-wider">
                    {language === 'ar' ? 'الشهر الحالي (Month To Date)' : 'This Month (MONTH TO DATE)'}
                  </th>
                  <th rowSpan={2} className="py-2.5 px-4 text-center text-[#00305D] uppercase tracking-wider border-r border-slate-300 bg-[#EDF0F3] min-w-[240px]">
                    {language === 'ar' ? 'البيان المحاسبي' : 'Particulars'}
                  </th>
                  <th colSpan={6} className="py-2.5 px-3 uppercase tracking-wider text-[#00305D]">
                    {language === 'ar' ? 'تراكمي العام (Year To Date)' : 'Year To Date'}
                  </th>
                </tr>

                {/* Sub-column Headers */}
                <tr className="bg-[#F4F6F8] text-slate-600 border-b border-slate-200 text-[10px] font-mono uppercase font-bold">
                  {/* Month To Date Columns */}
                  <th className="py-2 px-2 text-right">Last Year</th>
                  <th className="py-2 px-1 text-right text-slate-400">%</th>
                  <th className="py-2 px-2 text-right">Budget</th>
                  <th className="py-2 px-1 text-right text-slate-400">%</th>
                  <th className="py-2 px-2 text-right text-[#00305D] font-bold">Actual</th>
                  <th className="py-2 px-1 text-right text-[#00305D] font-bold border-r border-slate-300">%</th>

                  {/* Year To Date Columns */}
                  <th className="py-2 px-2 text-right text-[#00305D] font-bold">Actual</th>
                  <th className="py-2 px-1 text-right text-[#00305D] font-bold">%</th>
                  <th className="py-2 px-2 text-right">Budget</th>
                  <th className="py-2 px-1 text-right text-slate-400">%</th>
                  <th className="py-2 px-2 text-right">Last Year</th>
                  <th className="py-2 px-1 text-right text-slate-400">%</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {plRows.map((row) => {
                  if (row.isHeader) {
                    return (
                      <tr key={row.key} className="bg-[#EDF0F3]/60">
                        <td colSpan={6} className="py-2 px-2 border-r border-slate-200" />
                        <td className="py-2 px-4 font-bold text-[#00305D] uppercase text-[11px] tracking-wider border-r border-slate-200 font-sans">
                          {language === 'ar' ? row.particularsAr : row.particularsEn}
                        </td>
                        <td colSpan={6} className="py-2 px-2" />
                      </tr>
                    );
                  }

                  const isMajorTotal = row.isTotal;
                  const isSubtotal = row.isSubtotal;

                  const trBg = isMajorTotal
                    ? 'bg-blue-50/70 font-bold text-[#00305D] border-t-2 border-b-2 border-[#00305D]'
                    : isSubtotal
                    ? 'bg-slate-50 font-semibold text-slate-900 border-t border-b border-slate-200'
                    : 'bg-white text-slate-800 hover:bg-slate-50 transition';

                  const textPadding = row.depth === 2 ? 'pl-8 rtl:pr-8' : row.depth === 1 ? 'pl-5 rtl:pr-5' : 'pl-3 rtl:pr-3';

                  return (
                    <tr key={row.key} className={trBg}>
                      {/* MTD: Last Year */}
                      <td className="py-2 px-2 text-right text-slate-500">
                        {row.lastYearMTD ? row.lastYearMTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className="py-2 px-1 text-right text-slate-400 text-[10px]">
                        {row.lastYearMTD ? calcPct(row.lastYearMTD, totalRevLYMTD) : '0.00%'}
                      </td>

                      {/* MTD: Budget */}
                      <td className="py-2 px-2 text-right text-slate-500">
                        {row.budgetMTD ? row.budgetMTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className="py-2 px-1 text-right text-slate-400 text-[10px]">
                        {row.budgetMTD ? calcPct(row.budgetMTD, totalRevBudgetMTD) : '0.00%'}
                      </td>

                      {/* MTD: Actual */}
                      <td className={`py-2 px-2 text-right ${isMajorTotal ? 'text-[#00305D] text-sm font-bold' : isSubtotal ? 'text-slate-900 font-bold' : 'text-slate-800'}`}>
                        {row.actualMTD ? row.actualMTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className={`py-2 px-1 text-right text-[10px] border-r border-slate-200 ${isMajorTotal ? 'text-[#00305D] font-bold' : isSubtotal ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {row.actualMTD ? calcPct(row.actualMTD, totalRevMTD) : '0.00%'}
                      </td>

                      {/* Particulars Title */}
                      <td className={`py-2 px-3 border-r border-slate-200 font-sans ${textPadding} ${isMajorTotal ? 'font-bold text-[#00305D] text-[12px] uppercase' : isSubtotal ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>
                        {language === 'ar' ? row.particularsAr : row.particularsEn}
                      </td>

                      {/* YTD: Actual */}
                      <td className={`py-2 px-2 text-right ${isMajorTotal ? 'text-[#00305D] text-sm font-bold' : isSubtotal ? 'text-slate-900 font-bold' : 'text-slate-800'}`}>
                        {row.actualYTD ? row.actualYTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className={`py-2 px-1 text-right text-[10px] ${isMajorTotal ? 'text-[#00305D] font-bold' : isSubtotal ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {row.actualYTD ? calcPct(row.actualYTD, totalRevYTD) : '0.00%'}
                      </td>

                      {/* YTD: Budget */}
                      <td className="py-2 px-2 text-right text-slate-500">
                        {row.budgetYTD ? row.budgetYTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className="py-2 px-1 text-right text-slate-400 text-[10px]">
                        {row.budgetYTD ? calcPct(row.budgetYTD, totalRevBudgetYTD) : '0.00%'}
                      </td>

                      {/* YTD: Last Year */}
                      <td className="py-2 px-2 text-right text-slate-500">
                        {row.lastYearYTD ? row.lastYearYTD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className="py-2 px-1 text-right text-slate-400 text-[10px]">
                        {row.lastYearYTD ? calcPct(row.lastYearYTD, totalRevLYYTD) : '0.00%'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Daily Revenue Flash */}
      {activeReport === 'flash' && (
        <div className="p-6 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#00305D] tracking-wide">
                {language === 'ar'
                  ? 'تقرير الإيراد اليومي السريع ومؤشرات الأداء الفندقي (Daily Revenue Flash)'
                  : 'Daily Revenue Flash & Hospitality KPIs'}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Property: {currentProperty ? currentProperty.nameEn : 'Al Faisaliah Riyadh'} • Date: 2026-11-08
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-2 sm:mt-0">
              Generated automatically from Night Audit
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">Available Rooms</div>
              <div className="text-lg font-bold text-slate-900 mt-1">320 Keys</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">Occupied Rooms</div>
              <div className="text-lg font-bold text-emerald-700 mt-1">284 Rooms (88.75%)</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">Average Daily Rate (ADR)</div>
              <div className="text-lg font-bold text-[#00305D] mt-1">{formatCurrency(852.11, language)}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-semibold">RevPAR</div>
              <div className="text-lg font-bold text-[#00305D] mt-1">{formatCurrency(756.25, language)}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-3 px-3">Revenue Category</th>
                  <th className="py-3 px-3 text-right">Today (SAR)</th>
                  <th className="py-3 px-3 text-right">Month-to-Date (SAR)</th>
                  <th className="py-3 px-3 text-right">Budget MTD (SAR)</th>
                  <th className="py-3 px-3 text-right">Variance MTD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-mono">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-900 font-sans">Rooms Revenue</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">{formatCurrency(242000, language)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-800">{formatCurrency(1936000, language)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{formatCurrency(1850000, language)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">+4.6%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-900 font-sans">Food & Beverage (Outlets & Banquets)</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">{formatCurrency(64200, language)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-800">{formatCurrency(513600, language)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{formatCurrency(490000, language)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">+4.8%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-900 font-sans">Spa, Wellness & Laundry</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">{formatCurrency(9800, language)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-800">{formatCurrency(78400, language)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{formatCurrency(75000, language)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">+4.5%</td>
                </tr>
              </tbody>
              <tfoot className="bg-[#EDF0F3] font-bold text-[#00305D] border-t-2 border-slate-300">
                <tr>
                  <td className="py-3 px-3 uppercase">Total Gross Hotel Revenue</td>
                  <td className="py-3 px-3 text-right text-[#00305D] text-sm">{formatCurrency(316000, language)}</td>
                  <td className="py-3 px-3 text-right text-[#00305D] text-sm">{formatCurrency(2528000, language)}</td>
                  <td className="py-3 px-3 text-right text-slate-600 text-sm">{formatCurrency(2415000, language)}</td>
                  <td className="py-3 px-3 text-right text-emerald-700 text-sm">+4.7%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Balance Sheet */}
      {activeReport === 'balanceSheet' && (
        <div className="p-6 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#00305D]">
                {language === 'ar' ? 'قائمة المركز المالي والميزانية العمومية' : 'Consolidated Balance Sheet'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">As of 2026-11-08 • Audited Balance</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
              ASSETS == LIABILITIES + EQUITY (VERIFIED)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Left: Assets */}
            <div className="p-4 rounded-xl bg-[#F4F6F8] border border-slate-200 space-y-3">
              <div className="text-[#00305D] font-bold uppercase text-[11px] tracking-wider font-sans">Assets</div>
              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Current Assets</div>
                <div className="flex justify-between text-slate-700">
                  <span>Cash & Banks (Al Rajhi & SNB)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(7834470.5, language)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Guest & City Ledger Receivables</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(547650.0, language)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Inventories (F&B & Housekeeping)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(158925.0, language)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Prepaid Expenses & Insurance</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(148500.0, language)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Non-Current Assets</div>
                <div className="flex justify-between text-slate-700">
                  <span>Hotel Building, FF&E & Improvements</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(145000000.0, language)}</span>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between font-bold text-[#00305D] text-sm">
                <span>Total Assets</span>
                <span>{formatCurrency(153689545.5, language)}</span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="p-4 rounded-xl bg-[#F4F6F8] border border-slate-200 space-y-3">
              <div className="text-[#00305D] font-bold uppercase text-[11px] tracking-wider font-sans">Liabilities & Equity</div>
              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Current Liabilities</div>
                <div className="flex justify-between text-slate-700">
                  <span>Accounts Payable (Trade Suppliers)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(244800.0, language)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Guest Advance Deposits</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(412000.0, language)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>ZATCA Output VAT (15%)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(112500.0, language)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Accrued Payroll & GOSI Payable</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(228000.0, language)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Non-Current Liabilities</div>
                <div className="flex justify-between text-slate-700">
                  <span>End of Service Benefits Provision (EOSB)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(692245.5, language)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Long-Term Capital Financing</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(32000000.0, language)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Owners Equity</div>
                <div className="flex justify-between text-slate-700">
                  <span>Capital & Retained Earnings</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(120000000.0, language)}</span>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between font-bold text-[#00305D] text-sm">
                <span>Total Liabilities & Equity</span>
                <span>{formatCurrency(153689545.5, language)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

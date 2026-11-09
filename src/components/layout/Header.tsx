import React, { useState } from 'react';
import { useERP } from '../../state/erpState';
import { DICTIONARY } from '../../../shared/utilities/i18n';
import { PropertyId } from '../../../shared/types';
import {
  Building2,
  Globe2,
  ShieldCheck,
  Calendar,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeModule, setActiveModule }) => {
  const {
    currentPropertyId,
    setCurrentPropertyId,
    properties,
    currentProperty,
    language,
    setLanguage,
    fiscalPeriod,
    activeYear,
    setActiveYear,
  } = useERP();

  const t = DICTIONARY[language];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShortcutsMenu, setShowShortcutsMenu] = useState(false);

  const notifications = [
    {
      id: '1',
      title: language === 'ar' ? 'اكتمل التدقيق الليلي لنظام أوبرا' : 'Opera Cloud Night Audit Completed',
      desc: language === 'ar' ? 'دفعة 8 نوفمبر جاهزة للترحيل إلى الأستاذ العام' : 'Nov 8 batch ready for General Ledger journalizing',
      time: '12m ago',
      type: 'info',
    },
    {
      id: '2',
      title: language === 'ar' ? 'تنبيه انخفاض مخزون الأغذية' : 'F&B Kitchen Store Stock Notice',
      desc: language === 'ar' ? 'لحم الواغيو الأسترالي قارب حد إعادة الطلب (25 كجم متبقية)' : 'Australian Wagyu Ribeye nearing reorder point (25 kg on hand)',
      time: '45m ago',
      type: 'warning',
    },
    {
      id: '3',
      title: language === 'ar' ? 'اعتماد المطابقة الثلاثية' : '3-Way Match Verification Approved',
      desc: language === 'ar' ? 'تمت مطابقة أمر الشراء PO-0112 مع فاتورة مصنع المملكة للبياضات' : 'PO-0112 matched with Kingdom Textiles Invoice #4402',
      time: '2h ago',
      type: 'success',
    },
  ];

  return (
    <header className="h-16 border-b border-[#002244] bg-[#00305D] text-white px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-md">
      {/* Left: Luxury Branding, Hotel Switcher & Change Year */}
      <div className="flex items-center gap-3 lg:gap-4 min-w-0">
        <button
          type="button"
          onClick={() => setActiveModule('overview')}
          className="flex items-center gap-2.5 text-left group transition cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 flex items-center justify-center shadow-md text-[#00305D] font-bold">
            <Building2 className="w-5 h-5 text-[#00305D]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5">
              <span>{t.appTitle}</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/20 text-amber-200 border border-white/30">
                KSA
              </span>
            </h1>
            <p className="text-[11px] text-blue-100 font-medium truncate">{t.appSubtitle}</p>
          </div>
        </button>

        {/* Vertical divider */}
        <div className="hidden md:block h-6 w-px bg-white/20" />

        {/* Human Hotel Property Switcher */}
        <div className="flex items-center gap-1.5 bg-[#002244] border border-white/20 rounded-xl px-2.5 py-1.5 text-xs shadow-inner w-40 lg:w-48 shrink-0">
          <select
            id="property-selector"
            value={currentPropertyId}
            onChange={(e) => setCurrentPropertyId(e.target.value as PropertyId | 'ALL')}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs truncate w-full"
            aria-label="Select Hotel Property"
          >
            <option value="ALL" className="bg-[#002244] text-white">
              {t.allProperties}
            </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#002244] text-white">
                {language === 'ar' ? p.nameAr : `${p.code} • ${p.city}`}
              </option>
            ))}
          </select>
        </div>

        {/* Section 1: Change Year Switcher */}
        <div className="hidden xl:flex items-center gap-1 bg-[#002244] border border-white/20 rounded-xl px-2.5 py-1 text-xs shrink-0 font-mono">
          <span className="text-[10px] uppercase text-blue-200 font-sans font-medium">Year:</span>
          <select
            value={activeYear}
            onChange={(e) => setActiveYear(parseInt(e.target.value, 10))}
            className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
            aria-label="Switch Active Financial Year"
          >
            <option value={2026} className="bg-[#002244] text-white">2026 (Active)</option>
            <option value={2025} className="bg-[#002244] text-white">2025 (Audit Closed)</option>
            <option value={2024} className="bg-[#002244] text-white">2024 (Historical)</option>
          </select>
        </div>
      </div>

      {/* Right Controls: Shortcuts, Date/Period, Notifications, Language, and Human User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Section 1: Shortcuts Quick Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowShortcutsMenu(!showShortcutsMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#002244] hover:bg-[#001b36] text-white border border-white/20 text-xs font-semibold transition cursor-pointer shadow-sm"
            title="Fast Transaction Bindings"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">{language === 'ar' ? 'اختصارات سريعة' : 'Shortcuts'}</span>
          </button>

          {showShortcutsMenu && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 rounded-2xl bg-white text-slate-800 border border-[#DDE3EA] shadow-2xl p-2 space-y-1 z-50 text-xs font-sans">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                {language === 'ar' ? 'العمليات الفندقية المتكررة' : 'Frequent Operations'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModule('generalLedger');
                  setShowShortcutsMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#00305D] flex items-center justify-between transition cursor-pointer"
              >
                <span className="font-medium">{language === 'ar' ? 'سند قيد يومية (JV)' : 'New Journal Voucher (JV)'}</span>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">Alt+N</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModule('treasury');
                  setShowShortcutsMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#00305D] flex items-center justify-between transition cursor-pointer"
              >
                <span className="font-medium">{language === 'ar' ? 'تحرير شيك وصرف بنكي' : 'Draft Cheque Payment'}</span>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">Alt+C</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModule('procurement');
                  setShowShortcutsMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#00305D] flex items-center justify-between transition cursor-pointer"
              >
                <span className="font-medium">{language === 'ar' ? 'المطابقة الثلاثية (PO vs GRN)' : '3-Way Invoice Match'}</span>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">Alt+M</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModule('hotelIntegration');
                  setShowShortcutsMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#00305D] flex items-center justify-between transition cursor-pointer"
              >
                <span className="font-medium">{language === 'ar' ? 'ترحيل تدقيق أوبرا الليلي' : 'Post Opera Night Audit'}</span>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">Alt+A</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModule('financialReports');
                  setShowShortcutsMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#00305D] flex items-center justify-between transition cursor-pointer"
              >
                <span className="font-medium">{language === 'ar' ? 'تقرير الإيراد اليومي السريع' : 'Daily Revenue Flash'}</span>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">Alt+F</span>
              </button>
            </div>
          )}
        </div>

        {/* Date & Open Fiscal Period */}
        <div className="hidden 2xl:flex items-center gap-2 bg-[#002244] border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white font-medium shrink-0">
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <span>Sunday, 8 Nov 2026</span>
          <span className="text-blue-300">•</span>
          <span className="font-mono text-white">Period {fiscalPeriod}</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 px-1.5 py-0.5 rounded font-bold">
            OPEN
          </span>
        </div>

        {/* Language Switcher (Human-friendly) */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 bg-[#002244] hover:bg-[#001b36] text-white px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold transition shadow-sm cursor-pointer"
          aria-label="Toggle language between English and Arabic"
        >
          <Globe2 className="w-3.5 h-3.5 text-amber-300" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Operational Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Hotel notifications"
            className="p-2 rounded-xl bg-[#002244] hover:bg-[#001b36] text-white border border-white/20 transition relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#00305D]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white text-slate-800 border border-[#DDE3EA] shadow-2xl p-4 space-y-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00305D]">
                  {language === 'ar' ? 'تنبيهات العمليات الفندقية' : 'Hotel Operational Alerts'}
                </span>
                <span className="text-[10px] text-amber-600 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">3 New</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Human Executive User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-[#002244] hover:bg-[#001b36] border border-white/20 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-[#00305D] font-bold text-xs shadow-sm">
              TA
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-white leading-tight">Tariq Al-Mansoor</div>
              <div className="text-[10px] text-amber-200 font-medium">Group Financial Controller</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-blue-200 ml-0.5" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-2xl bg-white text-slate-800 border border-[#DDE3EA] shadow-2xl p-2 space-y-1 z-50 text-xs">
              <div className="p-2.5 border-b border-slate-100">
                <div className="font-bold text-slate-900">Tariq Al-Mansoor</div>
                <div className="text-[11px] text-slate-500">t.mansoor@riyadahotels.sa</div>
                <div className="text-[10px] text-[#00305D] font-mono font-bold mt-1">Role: Corporate Controller & CFO</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModule('overview');
                  setShowUserMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#00305D] transition cursor-pointer font-medium"
              >
                Executive Command Center
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModule('generalLedger');
                  setShowUserMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#00305D] transition cursor-pointer font-medium"
              >
                General Ledger & Posting
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModule('devops');
                  setShowUserMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-[#00305D] transition cursor-pointer font-medium"
              >
                Security Audit & Backup
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

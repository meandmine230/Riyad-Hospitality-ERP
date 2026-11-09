import React from 'react';
import { useERP } from '../../state/erpState';
import { DICTIONARY } from '../../../shared/utilities/i18n';
import {
  LayoutDashboard,
  BookOpen,
  Receipt,
  Users,
  ShoppingCart,
  Boxes,
  Landmark,
  PieChart,
  UserCheck,
  Moon,
  BarChart3,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const { language, currentProperty } = useERP();
  const t = DICTIONARY[language];

  const menuSections = [
    {
      heading: language === 'ar' ? 'المالية والمحاسبة الفندقية' : 'Finance & Accounting',
      items: [
        {
          id: 'overview',
          label: language === 'ar' ? 'لوحة القيادة التنفيذية' : 'Executive Overview',
          icon: LayoutDashboard,
          badge: language === 'ar' ? 'نظرة عامة' : 'Executive',
        },
        {
          id: 'generalLedger',
          label: language === 'ar' ? 'الأستاذ العام ودليل الحسابات' : 'General Ledger (USALI)',
          icon: BookOpen,
        },
        {
          id: 'apAr',
          label: language === 'ar' ? 'الموردون والذمم الدائنة' : 'Accounts Payable (AP)',
          icon: Receipt,
          badge: 'Vendors',
        },
        {
          id: 'cityLedger',
          label: language === 'ar' ? 'دفتر المدينة والنزلاء' : 'City Ledger & AR',
          icon: Users,
          badge: 'Corporate',
        },
        {
          id: 'treasury',
          label: language === 'ar' ? 'الخزينة والعمليات البنكية' : 'Treasury & Banking',
          icon: Landmark,
        },
        {
          id: 'financialReports',
          label: language === 'ar' ? 'القوائم المالية (P&L)' : 'Financial Statements',
          icon: BarChart3,
          badge: 'GOP / P&L',
        },
      ],
    },
    {
      heading: language === 'ar' ? 'المشتريات والمستودعات والتكاليف' : 'Procurement & Operations',
      items: [
        {
          id: 'procurement',
          label: language === 'ar' ? 'المشتريات والاستلام' : 'Purchasing & Receiving',
          icon: ShoppingCart,
          badge: '3-Way Match',
        },
        {
          id: 'inventory',
          label: language === 'ar' ? 'المستودعات وتكلفة الأغذية' : 'Stores & Food Costing',
          icon: Boxes,
          badge: 'BOM',
        },
        {
          id: 'budget',
          label: language === 'ar' ? 'الموازنات التقديرية' : 'Budgets & Variance',
          icon: PieChart,
        },
      ],
    },
    {
      heading: language === 'ar' ? 'الموارد البشرية والأنظمة الفندقية' : 'Human Capital & Integrations',
      items: [
        {
          id: 'hrPayroll',
          label: language === 'ar' ? 'الرواتب ونظام العمل' : 'Payroll & Saudi Labor',
          icon: UserCheck,
          badge: 'GOSI / EOSB',
        },
        {
          id: 'hotelIntegration',
          label: language === 'ar' ? 'ربط أنظمة الفندق والتدقيق' : 'Night Audit Bridge',
          icon: Moon,
          badge: 'Opera / MoT',
        },
        {
          id: 'devops',
          label: language === 'ar' ? 'إدارة النظام والتدقيق' : 'Security & System Audit',
          icon: ShieldCheck,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 lg:w-72 border-r border-[#001b36] bg-[#002244] text-slate-100 flex flex-col shrink-0 select-none shadow-sm">
      {/* Current Property Header snippet */}
      <div className="p-3.5 border-b border-[#001b36] bg-[#001830]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00305D] border border-blue-400/30 flex items-center justify-center text-amber-300 font-bold">
            <Building className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {currentProperty ? (language === 'ar' ? currentProperty.nameAr : currentProperty.nameEn) : t.allProperties}
            </div>
            <div className="text-[10px] text-blue-200 font-mono">
              {currentProperty ? `${currentProperty.keys} Keys • 5-Star Luxury` : 'Consolidated Portfolio'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200/90 px-2 py-1">
              {section.heading}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-[#00305D] text-white font-bold border-l-4 rtl:border-l-0 rtl:border-r-4 border-amber-400 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 border-l-4 rtl:border-l-0 rtl:border-r-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition ${
                        isActive ? 'text-amber-300' : 'text-blue-200 group-hover:text-white'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                        isActive ? 'bg-amber-400 text-[#00305D]' : 'bg-[#001b36] text-blue-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#001b36] bg-[#001830] text-[11px] text-blue-200 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-200">KSA MoT & ZATCA Clear</span>
        </span>
        <span className="font-mono text-[10px] text-blue-300">v2026.4</span>
      </div>
    </aside>
  );
};

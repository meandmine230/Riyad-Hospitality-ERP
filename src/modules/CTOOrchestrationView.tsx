import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ModalDrawer } from '../components/ui/ModalDrawer';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import {
  Hotel,
  Sparkles,
  TrendingUp,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
  PieChart,
  FileText,
  Send,
  Boxes,
  Cpu,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const CTOOrchestrationView: React.FC<{ onNavigate?: (module: string) => void }> = ({ onNavigate }) => {
  const { language, currentProperty, fiscalPeriod, nightAuditBatches, postNightAuditToGL, agentTasks, auditLogs } = useERP();
  const t = DICTIONARY[language];

  const [showArchDocs, setShowArchDocs] = useState(false);
  const [isViewingFullSrs, setIsViewingFullSrs] = useState(false);
  const latestAudit = nightAuditBatches[1] || nightAuditBatches[0];

  const handleQuickPostNightAudit = () => {
    if (latestAudit && !latestAudit.isPostedToGL) {
      postNightAuditToGL(latestAudit.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Luxury Hotel Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
              {language === 'ar' ? 'المنظومة الفندقية الفاخرة' : 'Hospitality Executive Management'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {currentProperty ? `${currentProperty.city} • ${currentProperty.starRating}-Star` : 'KSA Portfolio'}
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold text-[#00305D] tracking-tight">
            {language === 'ar'
              ? `أهلاً بك، ${currentProperty ? currentProperty.nameAr : 'المجموعة الفندقية'}`
              : `Welcome, ${currentProperty ? currentProperty.nameEn : 'Riyada Luxury Portfolio'}`}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {language === 'ar'
              ? 'متابعة العمليات اليومية، مؤشرات الأداء الفندقي (RevPAR / ADR)، التدقيق الليلي لنظام أوبرا كلاود، وتكامل الأنظمة المالية وهيئة الزكاة والضريبة'
              : 'Consolidated hotel back-office performance, USALI General Ledger, Opera Cloud night audit sync, and ZATCA / MoT regulatory compliance.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#DDE3EA] text-right shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              {language === 'ar' ? 'معدل الإشغال اللحظي' : 'Live In-House Occupancy'}
            </span>
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-xl font-bold text-emerald-700 font-mono">88.75%</span>
              <span className="text-xs text-slate-500 font-mono">(284 / 320 keys)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Hospitality & Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t.hospitality.revPar}
          value={formatCurrency(756.25, language)}
          subtitle={language === 'ar' ? '+14.2% مقارنة بالموازنة المعتمدة' : '+14.2% vs Approved Budget'}
          icon={Hotel}
          trend={{ value: '+14.2%', isPositive: true }}
          accentColor="amber"
        />
        <MetricCard
          title={t.hospitality.adr}
          value={formatCurrency(852.11, language)}
          subtitle={language === 'ar' ? 'متوسط السعر اليومي للغرفة' : 'Average Daily Room Rate'}
          icon={Sparkles}
          accentColor="emerald"
        />
        <MetricCard
          title={language === 'ar' ? 'مجمل الربح التشغيلي (GOP)' : 'Gross Operating Profit (GOP)'}
          value={formatCurrency(2805240, language)}
          subtitle="57.5% Luxury GOP Margin"
          icon={TrendingUp}
          trend={{ value: '57.5%', isPositive: true }}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'السيولة النقدية بالبنوك' : 'Liquid Bank Balances'}
          value={formatCurrency(7834470.5, language)}
          subtitle={language === 'ar' ? 'مصرف الراجحي والبنك الأهلي' : 'Al Rajhi & SNB Operating Accounts'}
          icon={Landmark}
          accentColor="indigo"
        />
      </div>

      {/* Executive Operational Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Actions & Revenue Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Center */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00305D]" />
                <span>{language === 'ar' ? 'مركز المهام والإجراءات الفندقية اليومية' : 'Daily Operational Action Items'}</span>
              </h3>
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono font-bold">Priority Queue</span>
            </div>

            <div className="space-y-3">
              {/* Item 1: Night Audit Post */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {language === 'ar' ? 'التدقيق الليلي لتاريخ 8 نوفمبر (أوبرا كلاود)' : 'Opera Cloud Night Audit (Nov 8)'}
                    </span>
                    <StatusBadge status={latestAudit.isPostedToGL ? 'POSTED_TO_GL' : 'ACTION_REQUIRED'} />
                  </div>
                  <p className="text-xs text-slate-600">
                    {language === 'ar'
                      ? 'إجمالي إيراد يومي 363,400 ر.س (الغرف 242 ألف • الأغذية 64 ألف • الضريبة 47 ألف)'
                      : 'Daily revenue 363,400 SAR (Rooms 242k, F&B 64.2k, VAT 47.4k) ready for GL double-entry journal.'}
                  </p>
                </div>

                {!latestAudit.isPostedToGL ? (
                  <button
                    type="button"
                    onClick={handleQuickPostNightAudit}
                    className="px-3.5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'ترحيل للأستاذ العام' : 'Post to General Ledger'}</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">Journalized ✓</span>
                )}
              </div>

              {/* Item 2: Procurement 3-Way Match */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {language === 'ar' ? 'المطابقة الثلاثية: بياضات مصنع المملكة' : '3-Way Match: Kingdom Luxury Textiles'}
                    </span>
                    <StatusBadge status="MATCHED" />
                  </div>
                  <p className="text-xs text-slate-600">
                    {language === 'ar'
                      ? 'أمر شراء PO-0112 وفاتورة رقم 4402 بمبلغ 74,200 ر.س متطابقة مع سند استلام المستودع'
                      : 'PO-0112 and Invoice #4402 (74,200 SAR) matched within 0% quantity and price policy.'}
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-700 font-bold shrink-0 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">Clear for Payment</span>
              </div>

              {/* Item 3: Saudi Labor GOSI */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {language === 'ar' ? 'اشتراكات التأمينات الاجتماعية (GOSI)' : 'Statutory GOSI Remittance'}
                    </span>
                    <StatusBadge status="COMPLIANT" variant="success" />
                  </div>
                  <p className="text-xs text-slate-600">
                    {language === 'ar'
                      ? 'تم احتساب حصص الموظفين السعوديين (9.75%) وحصة الفندق (11.75%) على سقف 45 ألف ر.س'
                      : 'Calculated under KSA GOSI rules with wage ceiling of 45,000 SAR across all 3 properties.'}
                  </p>
                </div>
                <span className="text-xs font-mono text-[#00305D] font-bold shrink-0 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">GOSI Ready</span>
              </div>
            </div>
          </div>

          {/* Revenue Mix Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#00305D]" />
              <span>{language === 'ar' ? 'توزيع مصادر الإيرادات الفندقية (USALI)' : 'USALI Revenue Mix Breakdown'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Rooms Revenue</div>
                <div className="text-lg font-bold text-[#00305D] font-mono tabular-nums">{formatCurrency(3450000, language)}</div>
                <div className="text-xs text-amber-700 font-mono font-medium">70.8% of Total Turnover</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Food & Beverage</div>
                <div className="text-lg font-bold text-[#00305D] font-mono tabular-nums">{formatCurrency(1240000, language)}</div>
                <div className="text-xs text-emerald-700 font-mono font-medium">25.4% (Food Cost: 32.4%)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Spa & Minor Departments</div>
                <div className="text-lg font-bold text-[#00305D] font-mono tabular-nums">{formatCurrency(185000, language)}</div>
                <div className="text-xs text-blue-700 font-mono font-medium">3.8% of Total Turnover</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Property Operations & Regulatory Status */}
        <div className="space-y-6">
          {/* Saudi Regulatory Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00305D]" />
              <span>{language === 'ar' ? 'الامتثال التنظيمي السعودي' : 'KSA Regulatory Clearance'}</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">ZATCA Phase 2 E-Invoicing</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    CLEARED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">Cryptographic stamps, QR codes, 15% standard VAT.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Ministry of Tourism (MoT)</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">Automated daily telemetry transmission of occupancy & ADR.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">WPS & GOSI Remittance</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    COMPLIANT
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">Saudi Wage Protection System payroll file generator.</p>
              </div>
            </div>
          </div>

          {/* Quick Property Switcher Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider">
              {language === 'ar' ? 'فنادق المجموعة (المملكة)' : 'Hotel Properties Portfolio'}
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50/50 border border-[#00305D]/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#00305D]">Al Faisaliah Riyadh Palace</div>
                  <div className="text-[10px] text-slate-600">320 Keys • 5-Star Luxury</div>
                </div>
                <span className="text-[10px] text-[#00305D] font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200">Active</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-slate-600">
                <div>
                  <div className="font-bold text-slate-800">Al Noor Tower Makkah</div>
                  <div className="text-[10px] text-slate-500">850 Keys • Hospitality Suites</div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Connected</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-slate-600">
                <div>
                  <div className="font-bold text-slate-800">Corniche Resort Jeddah</div>
                  <div className="text-[10px] text-slate-500">210 Keys • Beachfront Resort</div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Technical Engineering & Architecture Documentation */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-3">
        <button
          type="button"
          onClick={() => setShowArchDocs(!showArchDocs)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-600 hover:text-[#00305D] transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00305D]" />
            <span className="font-bold text-slate-800">
              {language === 'ar'
                ? 'المواصفات الهندسية، المعمارية الموحدة، وسجل تدقيق النظام (Technical Engineering Architecture)'
                : 'Enterprise System Architecture, Engineering Roadmap & Multi-Agent Contracts'}
            </span>
          </div>
          <span className="text-[#00305D] font-mono text-[11px] font-bold">
            {showArchDocs ? 'Hide Details ▲' : 'View Engineering Contracts (15 Tasks Verified) ▼'}
          </span>
        </button>

        {showArchDocs && (
          <div className="pt-3 border-t border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
              <div>
                <div className="text-xs font-bold text-[#00305D] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#00305D]" />
                  <span>CTO Master Software Requirements Specification & 14 Agent Work Orders</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Full system ERD, unified REST/RPC API contracts, module dependency DAG, and dedicated team development prompts.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsViewingFullSrs(true)}
                className="px-4 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm transition cursor-pointer shrink-0"
              >
                Inspect Master SRS & Prompts
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Architecture Standard</div>
                <div className="text-xs font-bold text-[#00305D] mt-1">USALI 11th Edition & Saudi GAAP</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Unit Test Coverage</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">13/13 Pure Tests Passing (100%)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">System Architecture Spec</div>
                <div className="text-xs font-bold text-blue-700 mt-1">docs/multi-agent/CTO_MASTER_SRS_AND_AGENT_WORK_ORDERS.md</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Deliverable & Standards</th>
                    <th className="py-2.5 px-3">Verification Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-mono">
                  {agentTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-[#00305D] font-bold">{task.agentName}</td>
                      <td className="py-2 px-3 text-slate-900 font-medium">{task.moduleName}</td>
                      <td className="py-2 px-3 text-slate-700 font-sans">{task.title}</td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">{task.testCoverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Master SRS & Prompts Inspection Modal */}
      <ModalDrawer
        isOpen={isViewingFullSrs}
        onClose={() => setIsViewingFullSrs(false)}
        title="CTO Master Software Requirements Specification & Multi-Agent Development Directives"
        subtitle="Riyada Hospitality ERP Architecture Baseline • Formally Ratified for 14 Parallel Teams"
        maxWidth="2xl"
      >
        <div className="space-y-6 text-xs font-sans text-slate-700 leading-relaxed max-h-[75vh] overflow-y-auto pr-2">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
            <div className="text-sm font-bold text-[#00305D]">
              CTO Orchestration Directive: Parallel Development Authorization
            </div>
            <p>
              The System Architecture, Global Relational ERD, Unified REST/RPC API Contracts, and Dependency Map have been verified and locked. Each specialist engineering team (Agent 01 through Agent 14) has been assigned its dedicated prompt with mandatory workflows, calculation engines, and automated test criteria.
            </p>
          </div>

          {/* Module Prompts Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#00305D] uppercase tracking-wider border-b border-slate-200 pb-1">
              Active Specialist Agent Work Orders & Development Directives
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 03: Finance & General Ledger Core Team</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  USALI 9-digit Chart of Accounts, Double-Entry Voucher Engine, 5-Column Trial Balance (Opening, Period Dr, Period Cr, Net, Closing), 15% VAT calculation, and automated balance validator.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 04: Accounts Payable & City Ledger (AR) Team</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Supplier Master, AP Aging, Corporate Direct Billing Directory (Aramco, MoT, Saudia), Bank Wire Remittance Folio Allocator, and printable Statement of Account (SOA).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 05: Procurement & 3-Way Match Team</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Purchase Requisitions, Purchase Orders, Receiving Dock Goods Receipt Notes (GRN), SFDA / HACCP cold-chain temperature inspection gate, and 0.0% variance 3-Way Match reconciler.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 06: Inventory & Stores Team</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Perpetual Moving Weighted Average inventory valuation, Kitchen Store Issue Vouchers (SIV), automated inventory issue GL journals, and F&B Recipe Costing BOM simulator.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 07: Treasury & Cash Management Team</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Bank Operating Accounts (Al Rajhi / SNB), Electronic Statement Auto-Reconciler, Master Cheque Register with dual signatures (FC + GM), and printable Cheque Payment Vouchers.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 08: Budget Management Team</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Departmental budget performance, annual cap editing modal, YTD allocation targets, open PO commitments, and real-time over-budget threshold alerts.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 09: Saudi HR & Payroll Team</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Staff Onboarding Modal, inline salary editor, GOSI statutory contributions (9.75%/11.75% for Saudis, 0%/2% for expats capped at 45k SAR), Article 84 EOSB, and WPS accrual journal posting.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 10: Hotel Systems Integration & MoT NTMP Team</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Opera Cloud Night Audit Ingestion, automated revenue GL journal posting, Front Office Cashier Shift balancing, and Ministry of Tourism Circular 7788/1448 NTMP daily telemetry feed.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 11: Reporting & BI Team</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  13-Column USALI Operating Statement (P&L), Daily Revenue Flash (Occupancy, ADR, RevPAR), and Consolidated Balance Sheet.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 13: QA Automation Engine</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  13/13 automated pure tests passing via node:test covering double-entry balance, VAT, WAC inventory, 3-way match, GOSI, and Article 84 EOSB.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                <span className="font-bold text-[#00305D]">Agent 14: DevOps & Release Engineering</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Real-time health telemetry across all 14 subsystem engines, append-only security audit log stream, and JSON snapshot export.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsViewingFullSrs(false)}
              className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Close Specification
            </button>
          </div>
        </div>
      </ModalDrawer>
    </div>
  );
};

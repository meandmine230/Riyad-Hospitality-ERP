import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ModalDrawer } from '../components/ui/ModalDrawer';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import {
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Edit3,
  Save,
} from 'lucide-react';
import { DepartmentBudget } from '../../shared/types';

export const BudgetManagementView: React.FC = () => {
  const { language, budgets, updateBudget } = useERP();
  const t = DICTIONARY[language];

  const [editingBudget, setEditingBudget] = useState<DepartmentBudget | null>(null);
  const [editAnnualSAR, setEditAnnualSAR] = useState(0);

  const totalAnnualBudget = budgets.reduce((sum, b) => sum + b.allocatedAnnualSAR, 0);
  const totalActualYtd = budgets.reduce((sum, b) => sum + b.actualYtdSAR, 0);
  const totalCommitted = budgets.reduce((sum, b) => sum + b.committedSAR, 0);
  const netVariance = budgets.reduce((sum, b) => sum + b.varianceSAR, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-[#00305D] border border-blue-200 font-mono">
              Agent 08: Budget Management Team
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">Departmental Variance Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar' ? 'الموازنات التقديرية وتحليل الانحرافات' : 'Departmental Budgets & Variance Analysis'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'تخصيص الموازنات السنوية والشهرية لأقسام الفندق، مراقبة المصروفات الفعلية، والالتزامات المفتوحة'
              : 'Annual USALI departmental allocations, commitments, actual expense tracking, and real-time variance monitoring.'}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={language === 'ar' ? 'الموازنة السنوية المعتمدة' : 'Annual Budget 2026'}
          value={formatCurrency(totalAnnualBudget, language)}
          subtitle={language === 'ar' ? 'إجمالي المخصص لكل الأقسام' : 'Approved Property Allocation'}
          icon={PieChart}
          accentColor="indigo"
        />
        <MetricCard
          title={language === 'ar' ? 'المصروف الفعلي حتى تاريخه' : 'Actual Expense YTD'}
          value={formatCurrency(totalActualYtd, language)}
          subtitle={language === 'ar' ? 'من واقع قيود الأستاذ العام' : 'Audited GL Expenditures'}
          icon={TrendingUp}
          accentColor="amber"
        />
        <MetricCard
          title={language === 'ar' ? 'الالتزامات المفتوحة (POs)' : 'Committed POs'}
          value={formatCurrency(totalCommitted, language)}
          subtitle={language === 'ar' ? 'أوامر شراء معتمدة تحت التوريد' : 'Active PO Commitments'}
          icon={DollarSign}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'صافي وفر الموازنة' : 'Net Budget Variance'}
          value={formatCurrency(netVariance, language)}
          subtitle={netVariance >= 0 ? 'Favorable (Under Budget)' : 'Unfavorable Variance'}
          icon={netVariance >= 0 ? CheckCircle2 : AlertTriangle}
          accentColor={netVariance >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Departmental Budget Cards */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider">
            {language === 'ar' ? 'أداء الموازنة حسب الأقسام الفندقية' : 'Departmental Performance & Commitments'}
          </h3>
          <span className="text-xs font-mono text-slate-500">USALI 11th Edition Department Codes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((dept) => {
            const utilizationPercent = Math.round((dept.actualYtdSAR / dept.allocatedYtdSAR) * 100);
            return (
              <div key={dept.id} className="p-5 rounded-xl bg-[#F4F6F8] border border-slate-200/90 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{dept.department}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={dept.isOverBudget ? 'OVER_BUDGET' : 'WITHIN_BUDGET'} />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBudget(dept);
                        setEditAnnualSAR(dept.allocatedAnnualSAR);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-lg bg-white hover:bg-slate-100 text-[#00305D] font-semibold border border-slate-300 shadow-2xs cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Allocated YTD</div>
                    <div className="text-slate-900 font-bold mt-0.5 tabular-nums">{formatCurrency(dept.allocatedYtdSAR, language)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Actual YTD</div>
                    <div className="text-amber-700 font-bold mt-0.5 tabular-nums">{formatCurrency(dept.actualYtdSAR, language)}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Variance</div>
                    <div
                      className={`font-bold mt-0.5 tabular-nums ${dept.varianceSAR >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                    >
                      {formatCurrency(dept.varianceSAR, language)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-mono">
                    <span>Budget Consumption:</span>
                    <span className={dept.isOverBudget ? 'text-rose-700 font-bold' : 'text-slate-800 font-semibold'}>
                      {utilizationPercent}% of YTD target
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        dept.isOverBudget ? 'bg-rose-600' : utilizationPercent > 90 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, utilizationPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-600 font-mono">
                  <span>Committed POs: <strong className="text-slate-800">{formatCurrency(dept.committedSAR, language)}</strong></span>
                  <span>Full Year Cap: <strong className="text-slate-800">{formatCurrency(dept.allocatedAnnualSAR, language)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      <ModalDrawer
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title={editingBudget ? `${language === 'ar' ? 'تعديل موازنة قسم' : 'Edit Annual Budget'} — ${editingBudget.department}` : ''}
        subtitle={editingBudget ? `Fiscal Year 2026 • Current Cap: ${formatCurrency(editingBudget.allocatedAnnualSAR, language)}` : ''}
        maxWidth="md"
      >
        {editingBudget && (
          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">
                {language === 'ar' ? 'الموازنة السنوية المعتمدة الجديدة (ر.س)' : 'New Approved Annual Allocation (SAR) *'}
              </label>
              <input
                type="number"
                step="10000"
                value={editAnnualSAR}
                onChange={(e) => setEditAnnualSAR(Number(e.target.value) || 0)}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Updating this annual cap will automatically recompute the 11-month YTD allocation target, variance, and threshold status.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-700">
                <span>New YTD Target (11 Mo):</span>
                <strong>{formatCurrency(Math.round((editAnnualSAR / 12) * 11), language)}</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Actual Expenditures YTD:</span>
                <strong>{formatCurrency(editingBudget.actualYtdSAR, language)}</strong>
              </div>
              <div className="flex justify-between text-[#00305D] font-bold border-t border-blue-200 pt-1">
                <span>Projected Variance:</span>
                <span>{formatCurrency(Math.round((editAnnualSAR / 12) * 11) - editingBudget.actualYtdSAR - editingBudget.committedSAR, language)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingBudget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editAnnualSAR > 0) {
                    updateBudget(editingBudget.id, editAnnualSAR);
                    setEditingBudget(null);
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save New Allocation</span>
              </button>
            </div>
          </div>
        )}
      </ModalDrawer>
    </div>
  );
};

import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ModalDrawer } from '../components/ui/ModalDrawer';
import { calculateGosi, calculateSaudiEosb } from '../../shared/utilities/saudiLaborEngine';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import { EmployeeRecord, VoucherEntry } from '../../shared/types';
import {
  Users,
  ShieldAlert,
  Coins,
  FileText,
  CheckCircle2,
  Calendar,
  Building,
  Plus,
  Edit3,
  Save,
  X,
} from 'lucide-react';

export const HRPayrollView: React.FC = () => {
  const { language, employees, fiscalPeriod, currentPropertyId, addVoucher, addEmployee, updateEmployeeSalary } = useERP();
  const t = DICTIONARY[language];

  const [selectedEmp, setSelectedEmp] = useState<EmployeeRecord | null>(null);
  const [payrollPosted, setPayrollPosted] = useState(false);
  const [isAddingEmp, setIsAddingEmp] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [editBasic, setEditBasic] = useState(0);
  const [editHousing, setEditHousing] = useState(0);
  const [editTransport, setEditTransport] = useState(0);

  const [newEmpForm, setNewEmpForm] = useState({
    nameEn: '',
    nameAr: '',
    employeeNumber: `HR-${1000 + employees.length + 1}`,
    nationality: 'SAUDI' as 'SAUDI' | 'NON_SAUDI',
    nationalIdOrIqama: '',
    department: 'Front Office',
    jobTitleEn: '',
    jobTitleAr: '',
    joinDate: new Date().toISOString().slice(0, 10),
    basicSalarySAR: 12000,
    housingAllowanceSAR: 3000,
    transportAllowanceSAR: 1000,
  });

  const saudiCount = employees.filter((e) => e.nationality === 'SAUDI').length;
  const expatCount = employees.filter((e) => e.nationality === 'NON_SAUDI').length;
  const saudizationRate = Math.round((saudiCount / employees.length) * 100);

  const totalGrossSalaries = employees.reduce((sum, e) => sum + e.totalGrossSalarySAR, 0);
  const totalGosiContributions = employees.reduce(
    (sum, e) => sum + e.gosiEmployeeDeductionSAR + e.gosiEmployerContributionSAR,
    0
  );
  const totalEosbAccumulated = employees.reduce((sum, e) => sum + e.accumulatedEosbSAR, 0);

  const handleGeneratePayrollJV = () => {
    if (!currentPropertyId || currentPropertyId === 'ALL') {
      alert('Please select a specific hotel property to post monthly payroll.');
      return;
    }

    const totalBasic = employees.reduce((s, e) => s + e.basicSalarySAR, 0);
    const totalHousing = employees.reduce((s, e) => s + e.housingAllowanceSAR, 0);
    const totalTransport = employees.reduce((s, e) => s + e.transportAllowanceSAR, 0);
    const totalGross = totalBasic + totalHousing + totalTransport;
    const totalEmpGosi = employees.reduce((s, e) => s + e.gosiEmployeeDeductionSAR, 0);
    const totalCoGosi = employees.reduce((s, e) => s + e.gosiEmployerContributionSAR, 0);
    const totalAdvances = employees.reduce((s, e) => s + e.activeAdvancesSAR, 0);
    const netPayable = totalGross - totalEmpGosi - totalAdvances;

    // Double entry:
    // Dr. 6200 Salaries & Benefits Expense = Gross (totalGross + totalCoGosi)
    // Cr. 2150 Accrued Net Salaries Payable = netPayable
    // Cr. 2160 GOSI Payable = (totalEmpGosi + totalCoGosi)
    // Cr. 1140 Employee Advances = totalAdvances
    const totalDr = totalGross + totalCoGosi;
    const totalCr = netPayable + (totalEmpGosi + totalCoGosi) + totalAdvances;

    const entries: VoucherEntry[] = [
      {
        id: 'pr-1',
        accountCode: '6200',
        accountNameEn: 'Staff Salaries, Wages & Saudi GOSI Expense',
        accountNameAr: 'مصروفات الرواتب والأجور وحصة التأمينات',
        debit: totalDr,
        credit: 0,
        costCenter: 'HR',
        memo: `Monthly payroll gross + employer GOSI for ${fiscalPeriod}`,
      },
      {
        id: 'pr-2',
        accountCode: '2150',
        accountNameEn: 'Accrued Payroll & Salaries Payable',
        accountNameAr: 'رواتب وأجور الموظفين المستحقة',
        debit: 0,
        credit: netPayable,
        costCenter: 'HR',
        memo: `Net salary disbursement via WPS (Wage Protection System)`,
      },
      {
        id: 'pr-3',
        accountCode: '2160',
        accountNameEn: 'GOSI Payable (Saudi Social Insurance)',
        accountNameAr: 'مستحقات التأمينات الاجتماعية (GOSI)',
        debit: 0,
        credit: totalEmpGosi + totalCoGosi,
        costCenter: 'TAX',
        memo: `GOSI statutory monthly remittance (Employee + Employer share)`,
      },
    ];

    if (totalAdvances > 0) {
      entries.push({
        id: 'pr-4',
        accountCode: '1140',
        accountNameEn: 'City Ledger & Employee Advances',
        accountNameAr: 'سلف موظفين مستردة',
        debit: 0,
        credit: totalAdvances,
        costCenter: 'HR',
        memo: 'Deduction of active employee salary advances',
      });
    }

    const res = addVoucher({
      voucherNumber: `PAY-${fiscalPeriod.replace('-', '')}`,
      propertyId: currentPropertyId,
      type: 'PAYROLL',
      date: new Date().toISOString().slice(0, 10),
      fiscalPeriod,
      narration: `Monthly Hotel Staff Payroll & Saudi GOSI Accrual Journal (${fiscalPeriod})`,
      narrationAr: `قيد استحقاق رواتب موظفي الفندق واشتراكات التأمينات الاجتماعية (${fiscalPeriod})`,
      entries,
      totalDebit: totalDr,
      totalCredit: totalCr,
      status: 'POSTED',
      postedBy: 'Director of Human Resources',
    });

    if (res.success) {
      setPayrollPosted(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
              Agent 09: Saudi HR & Payroll Team
            </span>
            <span className="text-xs text-slate-500 font-mono">Saudi Labor Law & GOSI Compliance</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar' ? 'الموارد البشرية والرواتب ونظام العمل السعودي' : 'HR, Saudi Payroll & GOSI Engine'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'احتساب حصص التأمينات الاجتماعية (GOSI)، مخصص مكافأة نهاية الخدمة (المادة 84)، وتوليد قيود الرواتب الشهرية'
              : 'GOSI statutory deductions (9.75% / 11.75%), Article 84 EOSB gratuity provisions, and automated monthly payroll vouchers.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddingEmp(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#00305D] font-bold text-xs border border-blue-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة موظف جديد' : 'Onboard Employee'}</span>
          </button>
          <button
            type="button"
            onClick={handleGeneratePayrollJV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{payrollPosted ? 'Monthly Payroll Posted ✓' : 'Post Monthly Payroll to GL'}</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={language === 'ar' ? 'إجمالي الرواتب الشهرية' : 'Gross Monthly Payroll'}
          value={formatCurrency(totalGrossSalaries, language)}
          subtitle={language === 'ar' ? 'الرواتب الأساسية والبدلات' : 'Basic + Housing + Transport'}
          icon={Coins}
          accentColor="rose"
        />
        <MetricCard
          title={language === 'ar' ? 'اشتراكات التأمينات (GOSI)' : 'Monthly GOSI Remittance'}
          value={formatCurrency(totalGosiContributions, language)}
          subtitle={language === 'ar' ? 'حصة الموظف + حصة الفندق' : 'Employee (9.75%) + Employer (11.75%)'}
          icon={ShieldAlert}
          accentColor="amber"
        />
        <MetricCard
          title={language === 'ar' ? 'مخصص نهاية الخدمة (EOSB)' : 'Accumulated EOSB (Art 84)'}
          value={formatCurrency(totalEosbAccumulated, language)}
          subtitle={language === 'ar' ? 'مكافأة نهاية الخدمة التراكمية' : 'Statutory Gratuity Provision'}
          icon={Building}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'نسبة التوطين (سعودة)' : 'Saudization Ratio (Nitaqat)'}
          value={`${saudizationRate}%`}
          subtitle={`${saudiCount} Saudis / ${expatCount} Expats (Platinum Tier)`}
          icon={Users}
          accentColor="emerald"
        />
      </div>

      {/* Employee Directory */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00305D]" />
            <span>{language === 'ar' ? 'سجل موظفي الفندق والبدلات الرسمية' : 'Hotel Staff Directory & Saudi Payroll Profiles'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">{employees.length} Active Hotel Staff</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Emp #</th>
                <th className="py-3 px-3">Employee Name</th>
                <th className="py-3 px-3">Nationality</th>
                <th className="py-3 px-3">Job Title & Dept</th>
                <th className="py-3 px-3 text-right">Basic Salary</th>
                <th className="py-3 px-3 text-right">Housing</th>
                <th className="py-3 px-3 text-right">GOSI (Employee)</th>
                <th className="py-3 px-3 text-right">GOSI (Employer)</th>
                <th className="py-3 px-3 text-right">Accumulated EOSB</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-[#00305D]">{emp.employeeNumber}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{language === 'ar' ? emp.nameAr : emp.nameEn}</div>
                    <div className="text-[10px] text-slate-500 font-mono">ID: {emp.nationalIdOrIqama}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        emp.nationality === 'SAUDI'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-[#00305D] border border-blue-200'
                      }`}
                    >
                      {emp.nationality === 'SAUDI' ? 'Saudi National' : 'Expat Resident'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium">{language === 'ar' ? emp.jobTitleAr : emp.jobTitleEn}</div>
                    <div className="text-[10px] text-slate-500">{emp.department}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {formatCurrency(emp.basicSalarySAR, language)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {formatCurrency(emp.housingAllowanceSAR, language)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-rose-700">
                    {formatCurrency(emp.gosiEmployeeDeductionSAR, language)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-amber-800">
                    {formatCurrency(emp.gosiEmployerContributionSAR, language)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#00305D]">
                    {formatCurrency(emp.accumulatedEosbSAR, language)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedEmp(emp)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer border border-slate-300"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Detail Modal */}
      <ModalDrawer
        isOpen={!!selectedEmp}
        onClose={() => {
          setSelectedEmp(null);
          setIsEditingSalary(false);
        }}
        title={selectedEmp ? `${selectedEmp.nameEn} (${selectedEmp.employeeNumber})` : ''}
        subtitle={selectedEmp ? `${selectedEmp.jobTitleEn} • Join Date: ${selectedEmp.joinDate}` : ''}
        maxWidth="lg"
      >
        {selectedEmp && (
          <div className="space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-[#00305D] uppercase tracking-wider text-[11px]">
                {language === 'ar' ? 'بيانات الراتب والبدلات' : 'Wage & Statutory Compensation'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!isEditingSalary) {
                    setEditBasic(selectedEmp.basicSalarySAR);
                    setEditHousing(selectedEmp.housingAllowanceSAR);
                    setEditTransport(selectedEmp.transportAllowanceSAR);
                  }
                  setIsEditingSalary(!isEditingSalary);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#00305D] hover:bg-blue-100 font-semibold text-xs border border-blue-200 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingSalary ? 'Cancel Edit' : 'Edit Salary & Allowances'}</span>
              </button>
            </div>

            {isEditingSalary ? (
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="font-bold text-[#00305D] text-xs">
                  {language === 'ar' ? 'تعديل الراتب وحساب التأمينات ومكافأة نهاية الخدمة فورياً' : 'Update Monthly Salary (Auto-recalculates GOSI & EOSB)'}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">Basic Salary (SAR)</label>
                    <input
                      type="number"
                      value={editBasic}
                      onChange={(e) => setEditBasic(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">Housing Allowance (SAR)</label>
                    <input
                      type="number"
                      value={editHousing}
                      onChange={(e) => setEditHousing(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">Transport Allowance (SAR)</label>
                    <input
                      type="number"
                      value={editTransport}
                      onChange={(e) => setEditTransport(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateEmployeeSalary(selectedEmp.id, editBasic, editHousing, editTransport);
                      const updatedEmp = employees.find((e) => e.id === selectedEmp.id);
                      if (updatedEmp) setSelectedEmp(updatedEmp);
                      setIsEditingSalary(false);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00305D] text-white font-bold text-xs hover:bg-[#002244] shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Recalculate</span>
                  </button>
                </div>
              </div>
            ) : null}

            <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200 space-y-2">
              <span className="font-bold text-[#00305D] uppercase tracking-wider text-[11px]">
                Saudi Labor Law Gratuity & GOSI Calculations
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-sans">Monthly Gross Salary</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 tabular-nums">
                    {formatCurrency(selectedEmp.totalGrossSalarySAR, language)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-sans">Accumulated EOSB (Art 84)</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5 tabular-nums">
                    {formatCurrency(selectedEmp.accumulatedEosbSAR, language)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Statutory Breakdown (KSA Rules)
              </span>
              <ul className="space-y-1.5 text-slate-700 font-mono">
                <li>• Contributory Wage: <strong>{formatCurrency(selectedEmp.basicSalarySAR + selectedEmp.housingAllowanceSAR, language)}</strong> (Basic + Housing, max 45,000 SAR)</li>
                <li>• Employee GOSI Deduction: <strong className="text-rose-700">{formatCurrency(selectedEmp.gosiEmployeeDeductionSAR, language)}</strong> ({selectedEmp.nationality === 'SAUDI' ? '9.75% [Pension + SANED]' : '0% Expat'})</li>
                <li>• Employer GOSI Contribution: <strong className="text-amber-800">{formatCurrency(selectedEmp.gosiEmployerContributionSAR, language)}</strong> ({selectedEmp.nationality === 'SAUDI' ? '11.75% [Pension + Hazard + SANED]' : '2% Hazard'})</li>
                <li>• Active Salary Advances: <strong>{formatCurrency(selectedEmp.activeAdvancesSAR, language)}</strong></li>
              </ul>
            </div>
          </div>
        )}
      </ModalDrawer>

      {/* Onboard New Employee Modal */}
      <ModalDrawer
        isOpen={isAddingEmp}
        onClose={() => setIsAddingEmp(false)}
        title={language === 'ar' ? 'تعيين موظف جديد بالفندق' : 'Onboard New Hotel Staff Member'}
        subtitle={language === 'ar' ? 'تسجيل الموظف في التأمينات الاجتماعية ونظام حماية الأجور (WPS)' : 'Enroll employee in Saudi GOSI, Payroll Master & WPS'}
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Full Name (English) *</label>
              <input
                type="text"
                placeholder="e.g. Faisal Mohammed Al-Harbi"
                value={newEmpForm.nameEn}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, nameEn: e.target.value })}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Full Name (Arabic)</label>
              <input
                type="text"
                placeholder="مثال: فيصل محمد الحربي"
                value={newEmpForm.nameAr}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, nameAr: e.target.value })}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Employee Number</label>
              <input
                type="text"
                value={newEmpForm.employeeNumber}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, employeeNumber: e.target.value })}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Nationality *</label>
              <select
                value={newEmpForm.nationality}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, nationality: e.target.value as 'SAUDI' | 'NON_SAUDI' })}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
              >
                <option value="SAUDI">Saudi Citizen (سعودي • GOSI 9.75% / 11.75%)</option>
                <option value="NON_SAUDI">Non-Saudi Expat (مقيم • GOSI 0% / 2%)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">National ID / Iqama Number *</label>
              <input
                type="text"
                placeholder="10-digit ID"
                value={newEmpForm.nationalIdOrIqama}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, nationalIdOrIqama: e.target.value })}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Department *</label>
              <select
                value={newEmpForm.department}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
              >
                <option value="Front Office">Front Office (الاستقبال)</option>
                <option value="Housekeeping">Housekeeping (خدمة الغرف)</option>
                <option value="Food & Beverage Kitchen">F&B Kitchen (المطبخ والأغذية)</option>
                <option value="Finance & Accounting">Finance & Accounting (المالية والمحاسبة)</option>
                <option value="Sales & Marketing">Sales & Marketing (المبيعات والتسويق)</option>
                <option value="Engineering & Maintenance">Engineering & Maintenance (الهندسة والصيانة)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Job Title (English)</label>
              <input
                type="text"
                placeholder="e.g. Front Desk Shift Supervisor"
                value={newEmpForm.jobTitleEn}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, jobTitleEn: e.target.value })}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Join Date</label>
              <input
                type="date"
                value={newEmpForm.joinDate}
                onChange={(e) => setNewEmpForm({ ...newEmpForm, joinDate: e.target.value })}
                className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00305D]"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
            <span className="font-bold text-[#00305D] text-xs">Monthly Compensation Structure (SAR)</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 block mb-1">Basic Salary *</label>
                <input
                  type="number"
                  value={newEmpForm.basicSalarySAR}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, basicSalarySAR: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 block mb-1">Housing Allowance</label>
                <input
                  type="number"
                  value={newEmpForm.housingAllowanceSAR}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, housingAllowanceSAR: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 block mb-1">Transport Allowance</label>
                <input
                  type="number"
                  value={newEmpForm.transportAllowanceSAR}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, transportAllowanceSAR: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#00305D]"
                />
              </div>
            </div>
            <div className="text-[11px] text-[#00305D] font-mono font-medium pt-1">
              Estimated Total Gross Salary: {formatCurrency(newEmpForm.basicSalarySAR + newEmpForm.housingAllowanceSAR + newEmpForm.transportAllowanceSAR, language)}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddingEmp(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!newEmpForm.nameEn.trim()) {
                  alert('Please enter employee name');
                  return;
                }
                const totalGross = newEmpForm.basicSalarySAR + newEmpForm.housingAllowanceSAR + newEmpForm.transportAllowanceSAR;
                addEmployee({
                  employeeNumber: newEmpForm.employeeNumber,
                  nameEn: newEmpForm.nameEn,
                  nameAr: newEmpForm.nameAr || newEmpForm.nameEn,
                  nationality: newEmpForm.nationality,
                  nationalIdOrIqama: newEmpForm.nationalIdOrIqama || '1000000000',
                  propertyId: currentPropertyId === 'ALL' ? 'PROP-RUH-01' : currentPropertyId,
                  department: newEmpForm.department,
                  jobTitleEn: newEmpForm.jobTitleEn || 'Hotel Associate',
                  jobTitleAr: newEmpForm.jobTitleAr || 'موظف فندقي',
                  joinDate: newEmpForm.joinDate,
                  basicSalarySAR: newEmpForm.basicSalarySAR,
                  housingAllowanceSAR: newEmpForm.housingAllowanceSAR,
                  transportAllowanceSAR: newEmpForm.transportAllowanceSAR,
                  otherAllowancesSAR: 0,
                  totalGrossSalarySAR: totalGross,
                  activeAdvancesSAR: 0,
                });
                setIsAddingEmp(false);
                setNewEmpForm({
                  nameEn: '',
                  nameAr: '',
                  employeeNumber: `HR-${1000 + employees.length + 2}`,
                  nationality: 'SAUDI',
                  nationalIdOrIqama: '',
                  department: 'Front Office',
                  jobTitleEn: '',
                  jobTitleAr: '',
                  joinDate: new Date().toISOString().slice(0, 10),
                  basicSalarySAR: 12000,
                  housingAllowanceSAR: 3000,
                  transportAllowanceSAR: 1000,
                });
              }}
              className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              Confirm & Onboard Staff
            </button>
          </div>
        </div>
      </ModalDrawer>
    </div>
  );
};

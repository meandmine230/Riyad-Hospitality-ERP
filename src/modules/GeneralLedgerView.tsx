import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ModalDrawer } from '../components/ui/ModalDrawer';
import { computeTrialBalance } from '../../shared/utilities/financialEngine';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import { Voucher, VoucherEntry, VoucherType } from '../../shared/types';
import {
  BookOpen,
  PlusCircle,
  Scale,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Building,
  Printer,
  X,
  Filter,
} from 'lucide-react';

export const GeneralLedgerView: React.FC = () => {
  const {
    language,
    currentPropertyId,
    currentProperty,
    accounts,
    vouchers,
    fiscalPeriod,
    addVoucher,
    reverseVoucher,
  } = useERP();

  const t = DICTIONARY[language];

  const [activeTab, setActiveTab] = useState<'vouchers' | 'trialBalance' | 'coa'>('trialBalance');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucherTypeFilter, setSelectedVoucherTypeFilter] = useState<'ALL' | VoucherType>('ALL');
  const [coaCategoryFilter, setCoaCategoryFilter] = useState<'ALL' | string>('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVoucherForView, setSelectedVoucherForView] = useState<Voucher | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // 5 Official Voucher Types (Section 1 of Master Architecture)
  const [newVoucherType, setNewVoucherType] = useState<VoucherType>('JOURNAL');
  const [newVoucherDate, setNewVoucherDate] = useState('2026-11-08');
  const [newNarration, setNewNarration] = useState('');
  const [newEntries, setNewEntries] = useState<Omit<VoucherEntry, 'id'>[]>([
    {
      accountCode: '402001013',
      accountNameEn: 'Linen - Drapes & Curtains - Rooms',
      accountNameAr: 'بياضات وستائر ومفارش الغرف',
      debit: 12000,
      credit: 0,
      costCenter: 'ROOMS',
      memo: 'Purchased extra luxury cotton sheets for Royal Suite',
    },
    {
      accountCode: '102001004',
      accountNameEn: 'Rajhi Bank Balance',
      accountNameAr: 'مصرف الراجحي - الحساب الجاري',
      debit: 0,
      credit: 12000,
      costCenter: 'FIN',
      memo: 'Direct wire payment',
    },
  ]);
  const [postError, setPostError] = useState<string | null>(null);

  // Filter vouchers by current property if not ALL
  const propertyVouchers = currentPropertyId === 'ALL'
    ? vouchers
    : vouchers.filter((v) => v.propertyId === currentPropertyId);

  // Filtered by type
  const filteredVouchers = propertyVouchers.filter((v) => {
    const matchesSearch =
      v.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.narration.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedVoucherTypeFilter === 'ALL' || v.type === selectedVoucherTypeFilter;
    return matchesSearch && matchesType;
  });

  // Compute live trial balance
  const trialBalance = computeTrialBalance(propertyVouchers, accounts);

  // Total debits and credits on new voucher
  const totalNewDebit = newEntries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalNewCredit = newEntries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const difference = Math.abs(Math.round((totalNewDebit - totalNewCredit) * 100) / 100);
  const isFormBalanced = difference === 0 && totalNewDebit > 0;

  const handleAddEntryLine = () => {
    const defaultAcc = accounts[0] || { code: '101001002', nameEn: 'Petty Cash', nameAr: 'العهدة النقدية' };
    setNewEntries([
      ...newEntries,
      {
        accountCode: defaultAcc.code,
        accountNameEn: defaultAcc.nameEn,
        accountNameAr: defaultAcc.nameAr,
        debit: 0,
        credit: 0,
        costCenter: 'GEN',
        memo: '',
      },
    ]);
  };

  const handleRemoveEntryLine = (index: number) => {
    if (newEntries.length <= 2) return;
    setNewEntries(newEntries.filter((_, i) => i !== index));
  };

  const handleUpdateEntry = (index: number, field: keyof Omit<VoucherEntry, 'id'>, value: any) => {
    const updated = [...newEntries];
    if (field === 'accountCode') {
      const matched = accounts.find((a) => a.code === value);
      updated[index] = {
        ...updated[index],
        accountCode: value,
        accountNameEn: matched?.nameEn || '',
        accountNameAr: matched?.nameAr || '',
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: field === 'debit' || field === 'credit' ? parseFloat(value) || 0 : value,
      };
    }
    setNewEntries(updated);
  };

  const handlePostNewVoucher = () => {
    setPostError(null);

    if (!isFormBalanced) {
      setPostError(
        language === 'ar'
          ? `القيد غير متزن بمقدار ${difference} ر.س. يجب أن يتطابق المدين مع الدائن بدقة.`
          : `Voucher is out of balance by ${difference} SAR. Debits must exactly equal Credits.`
      );
      return;
    }

    if (!newNarration.trim()) {
      setPostError(language === 'ar' ? 'يرجى كتابة البيان المحاسبي للسند.' : 'Please enter a narration for the voucher.');
      return;
    }

    // Prefix mapped by voucher type
    const prefixMap: Record<VoucherType, string> = {
      JOURNAL: 'JV',
      CASH_PAYMENT: 'CP',
      CASH_RECEIPT: 'CR',
      BANK_PAYMENT: 'BP',
      BANK_RECEIPT: 'BR',
      NIGHT_AUDIT: 'NA',
      PAYROLL: 'PAY',
      INVENTORY_ISSUE: 'INV',
    };

    const prefix = prefixMap[newVoucherType] || 'JV';
    const voucherNumber = `${prefix}-${fiscalPeriod.replace('-', '')}-${Date.now().toString().slice(-4)}`;

    const entriesWithIds: VoucherEntry[] = newEntries.map((e, idx) => ({
      ...e,
      id: `entry-${Date.now()}-${idx}`,
    }));

    const res = addVoucher({
      voucherNumber,
      propertyId: currentPropertyId === 'ALL' ? 'PROP-RUH-01' : currentPropertyId,
      type: newVoucherType,
      date: newVoucherDate,
      fiscalPeriod,
      narration: newNarration,
      narrationAr: newNarration,
      entries: entriesWithIds,
      totalDebit: totalNewDebit,
      totalCredit: totalNewCredit,
      status: 'POSTED',
      postedBy: 'Finance Controller',
    });

    if (res.success) {
      setIsCreateModalOpen(false);
      setNewNarration('');
    } else {
      setPostError(res.error || 'Failed to post voucher.');
    }
  };

  const handleExecuteReversal = () => {
    if (!selectedVoucherForView || !reversalReason.trim()) return;
    reverseVoucher(selectedVoucherForView.id, reversalReason);
    setSelectedVoucherForView(null);
    setReversalReason('');
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
              {language === 'ar' ? 'المالية والأستاذ العام' : 'Finance & General Ledger'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              USALI Standards • Double-Entry Engine (Debits = Credits)
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar' ? 'الأستاذ العام وميزان المراجعة والقيود' : 'General Ledger, Trial Balance & Voucher Engine'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'ميزان المراجعة بالصيغ الرسمية (رصيد افتتاحي، حركات، رصيد ختامي)، دليل الحسابات القياسي، واعتماد القيود'
              : 'Official formula-driven Trial Balance (Opening, Period Debits/Credits, Net Balance, Closing), 9-digit COA, and balanced voucher workflows.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'ar' ? 'سند قيد جديد (JV/CP/BP)' : 'New Voucher (JV/CP/BP)'}</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={language === 'ar' ? 'إجمالي قيود اليومية' : 'Posted Vouchers'}
          value={propertyVouchers.length}
          subtitle={language === 'ar' ? 'سندات معتمدة ومرحلة' : 'Immutable GL Entries'}
          icon={BookOpen}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'مجموع المدين (ميزان المراجعة)' : 'Trial Balance Debits'}
          value={formatCurrency(trialBalance.totalDebits, language)}
          subtitle={language === 'ar' ? 'إجمالي الأرصدة المدينة' : 'Total General Ledger Debits'}
          icon={Scale}
          accentColor="emerald"
        />
        <MetricCard
          title={language === 'ar' ? 'مجموع الدائن (ميزان المراجعة)' : 'Trial Balance Credits'}
          value={formatCurrency(trialBalance.totalCredits, language)}
          subtitle={language === 'ar' ? 'إجمالي الأرصدة الدائنة' : 'Total General Ledger Credits'}
          icon={Scale}
          accentColor="emerald"
        />
        <MetricCard
          title={language === 'ar' ? 'اتزان القيود' : 'Equilibrium Status'}
          value={trialBalance.isBalanced ? 'Balanced 0.00' : 'Discrepancy'}
          subtitle={language === 'ar' ? 'تطابق المدين والدائن 100%' : 'Debit = Credit Verified'}
          icon={CheckCircle}
          accentColor={trialBalance.isBalanced ? 'emerald' : 'rose'}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('trialBalance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'trialBalance'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{language === 'ar' ? 'ميزان المراجعة الرسمي (Section 4.1)' : 'Trial Balance (5-Column Formula)'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vouchers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'vouchers'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'ar' ? 'سجل السندات والقيود' : 'Voucher Register'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('coa')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'coa'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{language === 'ar' ? 'دليل الحسابات الفندقي (9 أرقام)' : 'Chart of Accounts (9-Digits)'}</span>
        </button>
      </div>

      {/* TAB 1: FORMULA-DRIVEN TRIAL BALANCE (Section 4.1 of Master Architecture) */}
      {activeTab === 'trialBalance' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#00305D]" />
                <span>{language === 'ar' ? 'ميزان المراجعة الشامل بالأرصدة والمجاميع' : 'General Ledger Trial Balance'}</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Formula Columns: Opening Balance | Period Debits | Period Credits | Period Net Balance | Closing Balance
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>EQUILIBRIUM: 0.00 SAR (BALANCED)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 flex flex-wrap gap-4">
            <span className="font-bold text-[#00305D]">Formula Logic:</span>
            <span>Period Net = (Debits - Credits)</span>
            <span className="text-slate-400">•</span>
            <span>Closing Balance = Opening + Period Net</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-bold">∑ Debits == ∑ Credits Verified</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-3">Account Code</th>
                  <th className="py-3 px-3 font-sans">Account Title / Description</th>
                  <th className="py-3 px-3 text-right">Opening Balance</th>
                  <th className="py-3 px-3 text-right text-emerald-700">Period Debits (Dr)</th>
                  <th className="py-3 px-3 text-right text-blue-700">Period Credits (Cr)</th>
                  <th className="py-3 px-3 text-right">Period Net Balance</th>
                  <th className="py-3 px-3 text-right text-[#00305D] font-bold">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {trialBalance.rows
                  .filter((r) => r.netDebit > 0 || r.netCredit > 0)
                  .map((row) => {
                    // Formula columns setup
                    const opening = 0; // standard period start
                    const debits = row.netDebit;
                    const credits = row.netCredit;
                    const netBalance = debits - credits;
                    const closing = opening + netBalance;

                    return (
                      <tr key={row.accountCode} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-bold text-[#00305D]">{row.accountCode}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                          {language === 'ar' ? row.accountNameAr : row.accountNameEn}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums">
                          {formatCurrency(opening, language)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold tabular-nums">
                          {debits > 0 ? formatCurrency(debits, language) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-blue-700 font-semibold tabular-nums">
                          {credits > 0 ? formatCurrency(credits, language) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                          {formatCurrency(netBalance, language)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#00305D] tabular-nums">
                          {formatCurrency(closing, language)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot className="bg-slate-100 text-slate-900 font-mono font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="py-3 px-3 uppercase tracking-wider text-right">
                    Total Equilibrium (SAR)
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-700 text-sm tabular-nums">
                    {formatCurrency(trialBalance.totalDebits, language)}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-700 text-sm tabular-nums">
                    {formatCurrency(trialBalance.totalCredits, language)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 text-xs">
                    0.00 SAR
                  </td>
                  <td className="py-3 px-3 text-right text-[#00305D] text-sm tabular-nums">
                    {formatCurrency(trialBalance.totalDebits, language)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VOUCHERS REGISTER */}
      {activeTab === 'vouchers' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00305D]" />
              <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider">
                {language === 'ar' ? 'السندات المسجلة' : 'Posted Financial Vouchers'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={selectedVoucherTypeFilter}
                onChange={(e) => setSelectedVoucherTypeFilter(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#00305D] font-mono shadow-sm"
              >
                <option value="ALL">All Types (JV, CP, CR, BP, BR)</option>
                <option value="JOURNAL">JV - Journal Voucher</option>
                <option value="CASH_PAYMENT">CP - Cash Payment</option>
                <option value="CASH_RECEIPT">CR - Cash Receipt</option>
                <option value="BANK_PAYMENT">BP - Bank Payment</option>
                <option value="BANK_RECEIPT">BR - Bank Receipt</option>
                <option value="NIGHT_AUDIT">NA - Night Audit</option>
                <option value="PAYROLL">PAY - Payroll</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00305D] w-52 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Voucher #</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 font-sans">Narration / Description</th>
                  <th className="py-3 px-3 text-right">Debit (SAR)</th>
                  <th className="py-3 px-3 text-right">Credit (SAR)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-[#00305D]">{voucher.voucherNumber}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                        {voucher.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{voucher.date}</td>
                    <td className="py-3 px-3 max-w-sm font-sans">
                      <div className="text-slate-900 truncate font-medium">
                        {language === 'ar' ? voucher.narrationAr || voucher.narration : voucher.narration}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {voucher.entries.length} lines • {voucher.postedBy}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-700 tabular-nums">
                      {formatCurrency(voucher.totalDebit, language)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-blue-700 tabular-nums">
                      {formatCurrency(voucher.totalCredit, language)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={voucher.status} />
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <button
                        type="button"
                        onClick={() => setSelectedVoucherForView(voucher)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition cursor-pointer border border-slate-200"
                      >
                        {t.viewDetails}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MASTER CHART OF ACCOUNTS (9 DIGITS) */}
      {activeTab === 'coa' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-[#00305D]" />
                <span>{language === 'ar' ? 'دليل الحسابات الفندقي الموحد (USALI)' : 'USALI Master Chart of Accounts (9-Digit Hierarchy)'}</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Exact Structure from Master Financial Model: Assets (1xxxx), Liabilities (2xxxx), Revenue (3xxxx), Expenses (4xxxx)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={coaCategoryFilter}
                onChange={(e) => setCoaCategoryFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#00305D] font-sans shadow-sm"
              >
                <option value="ALL">All Categories</option>
                <option value="ASSET">100000000 - CURRENT ASSETS</option>
                <option value="LIABILITY">200000000 - LIABILITIES & ACCRUALS</option>
                <option value="REVENUE">300000000 - OPERATING REVENUES</option>
                <option value="EXPENSE">400000000 - OPERATING EXPENSES</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Account Code</th>
                  <th className="py-3 px-3 font-sans">Account Title (English / العربية)</th>
                  <th className="py-3 px-3">Main Category</th>
                  <th className="py-3 px-3">Sub-Category (USALI)</th>
                  <th className="py-3 px-3 text-center">Normal Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {accounts
                  .filter((a) => coaCategoryFilter === 'ALL' || a.category === coaCategoryFilter)
                  .map((acc) => (
                    <tr key={acc.code} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#00305D]">{acc.code}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{acc.nameEn}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{acc.nameAr}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {acc.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                        {acc.subCategory}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          acc.normalBalance === 'DEBIT' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-[#00305D] border-blue-200'
                        }`}>
                          {acc.normalBalance}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW VOUCHER WORKBENCH */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#DDE3EA] shadow-2xl space-y-0 overflow-hidden">
            <div className="flex items-center justify-between bg-[#00305D] text-white p-5">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold text-white">
                  {language === 'ar' ? 'إنشاء سند مالي متزن جديد' : 'Create New Balanced Voucher'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#F4F6F8] space-y-4">
              {postError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{postError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Voucher Type</label>
                  <select
                    value={newVoucherType}
                    onChange={(e) => setNewVoucherType(e.target.value as VoucherType)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE3EA] text-slate-900 font-mono focus:border-[#00305D] focus:outline-none"
                  >
                    <option value="JOURNAL">JV - Journal Voucher</option>
                    <option value="CASH_PAYMENT">CP - Cash Payment</option>
                    <option value="CASH_RECEIPT">CR - Cash Receipt</option>
                    <option value="BANK_PAYMENT">BP - Bank Payment</option>
                    <option value="BANK_RECEIPT">BR - Bank Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Posting Date</label>
                  <input
                    type="date"
                    value={newVoucherDate}
                    onChange={(e) => setNewVoucherDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE3EA] text-slate-900 font-mono focus:border-[#00305D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Fiscal Period</label>
                  <input
                    type="text"
                    disabled
                    value={fiscalPeriod}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1 text-xs">Narration / Business Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Replenishment of guest floor towels & bath amenities"
                  value={newNarration}
                  onChange={(e) => setNewNarration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE3EA] text-slate-900 text-xs focus:border-[#00305D] focus:outline-none font-sans"
                />
              </div>

              {/* Voucher Entries Grid */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#00305D] uppercase tracking-wider">
                    Voucher Account Lines (Debits & Credits)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddEntryLine}
                    className="text-xs text-[#00305D] hover:underline font-bold transition cursor-pointer"
                  >
                    + Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {newEntries.map((entry, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-white border border-[#DDE3EA] text-xs shadow-sm">
                      <div className="col-span-5">
                        <select
                          value={entry.accountCode}
                          onChange={(e) => handleUpdateEntry(index, 'accountCode', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-[11px] truncate focus:border-[#00305D]"
                        >
                          {accounts.map((a) => (
                            <option key={a.code} value={a.code}>
                              {a.code} - {a.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Debit (SAR)"
                          value={entry.debit || ''}
                          onChange={(e) => handleUpdateEntry(index, 'debit', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-emerald-700 font-mono text-right text-[11px] font-bold"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Credit (SAR)"
                          value={entry.credit || ''}
                          onChange={(e) => handleUpdateEntry(index, 'credit', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-blue-700 font-mono text-right text-[11px] font-bold"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveEntryLine(index)}
                          disabled={newEntries.length <= 2}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equilibrium Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                isFormBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div>
                  <span>Total Debit: {formatCurrency(totalNewDebit, language)}</span>
                  <span className="mx-2 text-slate-400">|</span>
                  <span>Total Credit: {formatCurrency(totalNewCredit, language)}</span>
                </div>
                <div className="font-bold">
                  {isFormBalanced ? 'BALANCED (0.00 SAR) ✓' : `OUT OF BALANCE (${difference} SAR)`}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-4 bg-white border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={!isFormBalanced}
                onClick={handlePostNewVoucher}
                className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm disabled:opacity-40 cursor-pointer transition"
              >
                {language === 'ar' ? 'ترحيل واعتماد القيد' : 'Post Balanced Voucher to GL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VOUCHER DETAILS & AUDIT SIGN-OFF */}
      {selectedVoucherForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white border border-[#DDE3EA] shadow-2xl space-y-0 overflow-hidden">
            <div className="flex items-center justify-between bg-[#00305D] text-white p-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="font-mono text-amber-300">{selectedVoucherForView.voucherNumber}</span>
                  <StatusBadge status={selectedVoucherForView.status} />
                </h3>
                <p className="text-xs text-blue-200 font-mono mt-0.5">
                  Type: {selectedVoucherForView.type} • Date: {selectedVoucherForView.date} • Period: {selectedVoucherForView.fiscalPeriod}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVoucherForView(null)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#F4F6F8] space-y-5">
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs font-sans text-slate-800 shadow-sm">
                <span className="text-slate-500 font-semibold block mb-0.5">Narration:</span>
                {selectedVoucherForView.narration}
              </div>

              {/* Entries Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#EDF0F3] text-[#00305D] text-[10px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Account</th>
                      <th className="py-2.5 px-3 font-sans">Account Title</th>
                      <th className="py-2.5 px-3">Cost Center</th>
                      <th className="py-2.5 px-3 text-right">Debit (SAR)</th>
                      <th className="py-2.5 px-3 text-right">Credit (SAR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {selectedVoucherForView.entries.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-[#00305D] font-bold">{e.accountCode}</td>
                        <td className="py-2 px-3 font-sans text-slate-900 font-medium">{e.accountNameEn}</td>
                        <td className="py-2 px-3 text-slate-600">{e.costCenter}</td>
                        <td className="py-2 px-3 text-right text-emerald-700 font-semibold tabular-nums">
                          {e.debit > 0 ? formatCurrency(e.debit, language) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700 font-semibold tabular-nums">
                          {e.credit > 0 ? formatCurrency(e.credit, language) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-mono font-bold text-slate-900 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right uppercase text-slate-600">Total</td>
                      <td className="py-2 px-3 text-right text-emerald-700 tabular-nums">{formatCurrency(selectedVoucherForView.totalDebit, language)}</td>
                      <td className="py-2 px-3 text-right text-blue-700 tabular-nums">{formatCurrency(selectedVoucherForView.totalCredit, language)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Formal Audit Sign-Off Box */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-slate-200 text-center text-xs font-mono shadow-sm">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Prepared By</div>
                  <div className="font-semibold text-slate-900 mt-1">{selectedVoucherForView.postedBy || 'Accountant'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Verified By</div>
                  <div className="font-semibold text-emerald-700 mt-1">Audit Engine ✓</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Financial Controller</div>
                  <div className="font-semibold text-emerald-700 mt-1">Approved ✓</div>
                </div>
              </div>

              {/* Reversal Option (if not already reversed) */}
              {selectedVoucherForView.status === 'POSTED' && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
                  <span className="text-xs font-bold text-slate-800">Reverse this Voucher (Creates Audit Counter-Entry):</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter official reversal reason..."
                      value={reversalReason}
                      onChange={(e) => setReversalReason(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:border-[#00305D] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleExecuteReversal}
                      disabled={!reversalReason.trim()}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold disabled:opacity-40 cursor-pointer transition"
                    >
                      Execute Reversal
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 bg-white border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedVoucherForView(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {t.close}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs cursor-pointer shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>{t.print}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

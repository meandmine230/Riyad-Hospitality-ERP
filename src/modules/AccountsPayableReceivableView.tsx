import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import {
  Receipt,
  Users,
  CreditCard,
  Building,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText,
  Printer,
  ArrowDownToLine,
  Building2,
  Check,
} from 'lucide-react';
import { CustomerAccount } from '../../shared/types';

export const AccountsPayableReceivableView: React.FC = () => {
  const {
    language,
    currentProperty,
    suppliers,
    vendorInvoices,
    customerAccounts,
    corporateInvoices,
    allocateCorporatePayment,
  } = useERP();
  const t = DICTIONARY[language];

  const [activeSubTab, setActiveSubTab] = useState<'ap' | 'ar' | 'suppliers'>('ap');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerAccounts[0]?.id || 'CUST-001');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSoaModalOpen, setIsSoaModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(50000);
  const [selectedBankGl, setSelectedBankGl] = useState<string>('102001004');
  const [paymentMemo, setPaymentMemo] = useState<string>('Wire settlement via Al Rajhi Corporate Banking');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Compute AP totals
  const totalApBalance = suppliers.reduce((sum, s) => sum + s.currentBalanceSAR, 0);
  const totalArBalance = customerAccounts.reduce((sum, c) => sum + c.currentBalanceSAR, 0);

  const selectedCustomer = customerAccounts.find((c) => c.id === selectedCustomerId) || customerAccounts[0];
  const customerInvoices = corporateInvoices.filter((i) => i.customerAccountId === selectedCustomer?.id);

  const handleOpenPayment = () => {
    const unpaid = customerInvoices.filter((i) => i.status !== 'PAID');
    setSelectedInvoiceIds(unpaid.map((i) => i.id));
    const totalDue = unpaid.reduce((s, i) => s + i.balanceDueSAR, 0);
    setPaymentAmount(totalDue > 0 ? totalDue : 50000);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedCustomer) return;
    const res = allocateCorporatePayment(
      selectedCustomer.id,
      selectedInvoiceIds,
      paymentAmount,
      selectedBankGl,
      `${selectedCustomer.nameEn} - ${paymentMemo}`
    );

    if (res.success) {
      setSuccessNotice(`Payment of ${formatCurrency(paymentAmount, language)} posted to GL as ${res.voucherNumber}! Folios settled.`);
      setIsPaymentModalOpen(false);
      setTimeout(() => setSuccessNotice(null), 5000);
    }
  };

  // AP Aging Buckets
  const apAging = {
    current: 128500, // 0-30 days
    days30_60: 74200, // 31-60 days
    days61_90: 42100, // 61-90 days
    over90: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
              Agent 04: AP & AR Subledger Team
            </span>
            <span className="text-xs text-slate-500 font-mono">Subledger Reconciliation Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar' ? 'حسابات الموردين والعملاء وأعمار الديون' : 'Accounts Payable & Receivable (Subledgers)'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'إدارة فواتير الموردين، جداول أعمار الديون (AP Aging)، ودفتر حسابات النزلاء والشركات (City Ledger)'
              : 'Managing trade supplier payables, aging buckets, guest ledger, and corporate city ledger credit limits.'}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={language === 'ar' ? 'إجمالي الذمم الدائنة (AP)' : 'Total AP Balance'}
          value={formatCurrency(totalApBalance, language)}
          subtitle={language === 'ar' ? 'مستحقات الموردين التجاريين' : 'Outstanding Trade Invoices'}
          icon={Receipt}
          accentColor="amber"
        />
        <MetricCard
          title={language === 'ar' ? 'إجمالي الذمم المدينة (AR)' : 'Total AR Balance'}
          value={formatCurrency(totalArBalance, language)}
          subtitle={language === 'ar' ? 'حسابات الشركات ودفتر المدينة' : 'City Ledger & Corporate Debts'}
          icon={CreditCard}
          accentColor="emerald"
        />
        <MetricCard
          title={language === 'ar' ? 'الموردون المعتمدون' : 'Active Suppliers'}
          value={`${suppliers.length} Vendors`}
          subtitle={language === 'ar' ? 'مطابقون لمتطلبات هيئة الزكاة' : '100% ZATCA VAT Verified'}
          icon={Building}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'حسابات الشركات (City Ledger)' : 'Corporate Accounts'}
          value={`${customerAccounts.length} Corporate`}
          subtitle={language === 'ar' ? 'أرامكو، الخطوط السعودية، والوزارات' : 'Active Corporate Portfolios'}
          icon={Users}
          accentColor="indigo"
        />
      </div>

      {/* AP Aging Ribbon */}
      <div className="p-4 rounded-xl bg-white border border-[#DDE3EA] shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#00305D]" />
            <span>{language === 'ar' ? 'تحليل أعمار ديون الموردين (AP Aging Schedule)' : 'AP Aging Distribution Schedule'}</span>
          </span>
          <span className="text-slate-600 font-mono font-medium">Total Due: {formatCurrency(totalApBalance, language)}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">0 - 30 Days (Current)</div>
            <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums">{formatCurrency(apAging.current, language)}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">31 - 60 Days</div>
            <div className="text-sm font-bold text-amber-700 font-mono tabular-nums">{formatCurrency(apAging.days30_60, language)}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">61 - 90 Days</div>
            <div className="text-sm font-bold text-blue-700 font-mono tabular-nums">{formatCurrency(apAging.days61_90, language)}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">90+ Days (Overdue)</div>
            <div className="text-sm font-bold text-slate-600 font-mono tabular-nums">{formatCurrency(apAging.over90, language)}</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('ap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'ap'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          {language === 'ar' ? 'فواتير الموردين (AP Invoices)' : 'Vendor Invoices'}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('ar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'ar'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          {language === 'ar' ? 'حسابات الشركات والنزلاء (City Ledger)' : 'City Ledger & AR'}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'suppliers'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          {language === 'ar' ? 'دليل الموردين المعتمدين' : 'Supplier Master Directory'}
        </button>
      </div>

      {/* Tab: AP Invoices */}
      {activeSubTab === 'ap' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#00305D]" />
              <span>{language === 'ar' ? 'فواتير الموردين والمطابقة الثلاثية' : 'Accounts Payable Invoices'}</span>
            </h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Supplier Name</th>
                  <th className="py-3 px-3">PO & GRN Ref</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3 text-right">Subtotal (SAR)</th>
                  <th className="py-3 px-3 text-right">VAT 15% (SAR)</th>
                  <th className="py-3 px-3 text-right">Total (SAR)</th>
                  <th className="py-3 px-3 text-right">Paid (SAR)</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {vendorInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#00305D]">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{inv.supplierName}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {inv.poNumber || '—'} / {inv.grnNumber || '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{inv.dueDate}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatCurrency(inv.subtotalSAR, language)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-700 font-semibold">
                      {formatCurrency(inv.vatAmountSAR, language)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#00305D]">
                      {formatCurrency(inv.totalAmountSAR, language)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-semibold">
                      {formatCurrency(inv.paidAmountSAR, language)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: AR City Ledger */}
      {activeSubTab === 'ar' && (
        <div className="space-y-6">
          {successNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successNotice}</span>
            </div>
          )}

          {/* Corporate Clients Cards */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00305D]" />
                  <span>{language === 'ar' ? 'دفتر المدينة وحسابات الشركات المعتمدة' : 'City Ledger Corporate Direct Bill Directory'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a corporate client to inspect active folio bills, allocate wire receipts, and generate official statements.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenPayment}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تسجيل دفعة بنكية وتوزيعها' : 'Allocate Bank Wire Payment'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSoaModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition border border-slate-300 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'ar' ? 'كشف حساب رسمي (SOA)' : 'Statement of Account (SOA)'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customerAccounts.map((cust) => {
                const utilPercent = Math.min(100, Math.round((cust.currentBalanceSAR / cust.creditLimitSAR) * 100));
                const isSelected = cust.id === selectedCustomerId;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`p-4 rounded-xl cursor-pointer transition border ${
                      isSelected
                        ? 'bg-blue-50/60 border-[#00305D] ring-2 ring-[#00305D]/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-[#00305D]/50 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
                        {cust.type}
                      </span>
                      <StatusBadge status={cust.status} />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{language === 'ar' ? cust.nameAr : cust.nameEn}</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">Acc #{cust.accountNumber}</p>

                    <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Balance:</span>
                        <span className="font-mono font-bold text-[#00305D]">{formatCurrency(cust.currentBalanceSAR, language)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Credit Limit:</span>
                        <span className="font-mono text-slate-700">{formatCurrency(cust.creditLimitSAR, language)}</span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            utilPercent > 80 ? 'bg-rose-500' : utilPercent > 50 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${utilPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                        <span>{utilPercent}% limit used</span>
                        <span className="text-[#00305D] font-bold">{isSelected ? 'Active Account ✓' : 'Click to inspect'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Company Folio Invoices Table */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#00305D] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00305D]" />
                  <span>
                    {language === 'ar'
                      ? `فواتير النزلاء والوفود التابعة لـ: ${selectedCustomer?.nameAr}`
                      : `Corporate Folio Invoices: ${selectedCustomer?.nameEn}`}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Direct billing transferred from Opera Cloud PMS during Night Audit
                </p>
              </div>
              <div className="text-xs font-mono text-slate-600">
                <span className="text-slate-500">Unsettled Invoices: </span>
                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {customerInvoices.filter((i) => i.status !== 'PAID').length} of {customerInvoices.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[800px] text-left text-xs">
                <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Folio #</th>
                    <th className="py-3 px-3">Guest / Delegation Event</th>
                    <th className="py-3 px-3">Room / Venue</th>
                    <th className="py-3 px-3">Stay Dates</th>
                    <th className="py-3 px-3 text-right">Invoice (SAR)</th>
                    <th className="py-3 px-3 text-right">Paid (SAR)</th>
                    <th className="py-3 px-3 text-right">Balance (SAR)</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-mono">
                  {customerInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                        No invoices logged for this account.
                      </td>
                    </tr>
                  ) : (
                    customerInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-bold text-[#00305D]">{inv.invoiceNumber}</td>
                        <td className="py-3 px-3 text-amber-800 font-semibold">{inv.folioNumber}</td>
                        <td className="py-3 px-3 font-sans font-medium text-slate-800">{inv.guestName}</td>
                        <td className="py-3 px-3 font-sans text-slate-600">{inv.roomNumber}</td>
                        <td className="py-3 px-3 text-[11px] text-slate-500">
                          {inv.checkInDate} &rarr; {inv.checkOutDate}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">{formatCurrency(inv.amountSAR, language)}</td>
                        <td className="py-3 px-3 text-right text-emerald-700 font-semibold">{formatCurrency(inv.paidAmountSAR, language)}</td>
                        <td className="py-3 px-3 text-right font-bold text-amber-800">{formatCurrency(inv.balanceDueSAR, language)}</td>
                        <td className="py-3 px-3 font-sans">
                          <StatusBadge
                            status={inv.status}
                            variant={inv.status === 'PAID' ? 'success' : inv.status === 'PARTIALLY_PAID' ? 'warning' : 'danger'}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal 1: Corporate Bank Wire Payment & Folio Allocation */}
          {isPaymentModalOpen && selectedCustomer && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white border border-[#DDE3EA] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#00305D] flex items-center gap-2">
                      <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
                      <span>{language === 'ar' ? 'تسجيل سداد بنكي وتوزيعه على الفواتير' : 'Record Corporate Payment & Allocate Folios'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Client: {selectedCustomer.nameEn} (Balance: {formatCurrency(selectedCustomer.currentBalanceSAR, language)})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Payment Amount Received (SAR)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-[#00305D] font-bold focus:border-[#00305D] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Receiving Bank Account</label>
                    <select
                      value={selectedBankGl}
                      onChange={(e) => setSelectedBankGl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-slate-900 focus:border-[#00305D] outline-none font-sans"
                    >
                      <option value="102001004">Al Rajhi Bank — Operating Account (102001004)</option>
                      <option value="102001005">Saudi National Bank (SNB) — Revenue Account (102001005)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 mb-1 font-semibold">Remittance Memo / Bank Reference</label>
                  <input
                    type="text"
                    value={paymentMemo}
                    onChange={(e) => setPaymentMemo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-slate-900 text-xs outline-none focus:border-[#00305D]"
                    placeholder="e.g. Wire transfer Ref TX-98402 via Al Rajhi"
                  />
                </div>

                {/* Folio Allocation Select */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[#00305D] uppercase tracking-wider">
                      Select Folios to Settle ({selectedInvoiceIds.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceIds(customerInvoices.filter((i) => i.status !== 'PAID').map((i) => i.id))}
                      className="text-[11px] text-[#00305D] font-bold hover:underline cursor-pointer"
                    >
                      Select All Unpaid
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customerInvoices
                      .filter((i) => i.status !== 'PAID')
                      .map((inv) => {
                        const isChecked = selectedInvoiceIds.includes(inv.id);
                        return (
                          <div
                            key={inv.id}
                            onClick={() => {
                              setSelectedInvoiceIds((prev) =>
                                isChecked ? prev.filter((id) => id !== inv.id) : [...prev, inv.id]
                              );
                            }}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                              isChecked
                                ? 'bg-blue-50/70 border-[#00305D] text-slate-900 ring-1 ring-[#00305D]'
                                : 'bg-[#F4F6F8] border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isChecked ? 'bg-[#00305D] border-[#00305D] text-white' : 'border-slate-400 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div>
                                <span className="font-mono font-bold text-[#00305D]">{inv.invoiceNumber}</span>
                                <span className="text-slate-400 mx-2">•</span>
                                <span className="font-semibold text-slate-800">{inv.guestName}</span>
                                <span className="text-[11px] text-slate-500 block font-mono">Folio: {inv.folioNumber}</span>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <div className="font-bold text-amber-800">{formatCurrency(inv.balanceDueSAR, language)}</div>
                              <div className="text-[10px] text-slate-500">Total: {formatCurrency(inv.amountSAR, language)}</div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#EDF0F3] border border-slate-200 text-xs font-mono flex justify-between text-slate-700">
                  <span className="font-semibold">General Ledger Posting:</span>
                  <span className="text-[#00305D] font-bold">Dr 102001004 (Bank) / Cr 103001002 (City Ledger)</span>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Post Bank Receipt Voucher (BR)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal 2: Official Statement of Account (SOA) */}
          {isSoaModalOpen && selectedCustomer && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-3xl bg-white border border-[#DDE3EA] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Printer className="w-5 h-5 text-[#00305D]" />
                    <h3 className="text-base font-bold text-[#00305D]">Official Statement of Account (SOA)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSoaModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Printable Formal SOA Paper Document Preview */}
                <div className="p-6 rounded-xl bg-white border-2 border-slate-300 text-xs font-mono space-y-4 text-slate-800 shadow-sm">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                    <div>
                      <div className="text-base font-bold text-[#00305D] tracking-wide font-sans">
                        {currentProperty ? currentProperty.nameEn : 'Al Faisaliah Grand Luxury Palace, Riyadh'}
                      </div>
                      <div className="text-[11px] text-slate-500">King Fahd Road, Al Olaya District, Riyadh, Kingdom of Saudi Arabia</div>
                      <div className="text-[11px] text-slate-500">ZATCA Tax Registration Number (TRN): 310892019400003</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#00305D] uppercase">Statement of Account</div>
                      <div className="text-[11px] text-slate-500">Date: {new Date().toISOString().slice(0, 10)}</div>
                      <div className="text-[11px] text-slate-500">Currency: Saudi Riyals (SAR)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-[#F4F6F8] border border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Billed To (Corporate Debtor):</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5 font-sans">{selectedCustomer.nameEn}</div>
                      <div className="text-[11px] text-slate-600">Account #{selectedCustomer.accountNumber}</div>
                      <div className="text-[11px] text-slate-600">Attention: {selectedCustomer.contactPerson} ({selectedCustomer.phone})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Account Financial Status:</div>
                      <div className="text-lg font-bold text-[#00305D] mt-0.5">{formatCurrency(selectedCustomer.currentBalanceSAR, language)}</div>
                      <div className="text-[11px] text-slate-600">Approved Credit Limit: {formatCurrency(selectedCustomer.creditLimitSAR, language)}</div>
                      <div className="text-[11px] text-emerald-700 font-bold">Terms: 30 Days Direct Billing</div>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-300 text-[10px] uppercase font-bold">
                        <th className="py-2 px-2">Invoice #</th>
                        <th className="py-2 px-2">Folio Ref</th>
                        <th className="py-2 px-2">Guest / Delegation</th>
                        <th className="py-2 px-2">Due Date</th>
                        <th className="py-2 px-2 text-right">Invoiced (SAR)</th>
                        <th className="py-2 px-2 text-right">Paid (SAR)</th>
                        <th className="py-2 px-2 text-right">Balance Due (SAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {customerInvoices.map((i) => (
                        <tr key={i.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2 text-[#00305D] font-bold">{i.invoiceNumber}</td>
                          <td className="py-2 px-2 text-amber-800 font-semibold">{i.folioNumber}</td>
                          <td className="py-2 px-2 font-sans text-slate-800">{i.guestName}</td>
                          <td className="py-2 px-2 text-slate-600">{i.dueDate}</td>
                          <td className="py-2 px-2 text-right">{formatCurrency(i.amountSAR, language)}</td>
                          <td className="py-2 px-2 text-right text-emerald-700 font-semibold">{formatCurrency(i.paidAmountSAR, language)}</td>
                          <td className="py-2 px-2 text-right font-bold text-amber-800">{formatCurrency(i.balanceDueSAR, language)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#EDF0F3] font-bold text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={4} className="py-2.5 px-2 uppercase text-[#00305D]">Total Outstanding Balance Due</td>
                        <td className="py-2.5 px-2 text-right">
                          {formatCurrency(customerInvoices.reduce((s, i) => s + i.amountSAR, 0), language)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-emerald-700">
                          {formatCurrency(customerInvoices.reduce((s, i) => s + i.paidAmountSAR, 0), language)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#00305D] text-sm">
                          {formatCurrency(selectedCustomer.currentBalanceSAR, language)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-600">
                    <div>
                      <div>Remittance IBAN: SA4480000839201948271001 (Al Rajhi Bank)</div>
                      <div>Beneficiary: Riyada Hospitality Hotel Back Office Operating Account</div>
                    </div>
                    <div className="text-right font-sans">
                      <div className="font-bold text-[#00305D]">Credit & Collections Manager</div>
                      <div className="text-slate-500">Signed & Sealed: Riyadh Back Office</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsSoaModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Statement of Account (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Supplier Master */}
      {activeSubTab === 'suppliers' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-[#00305D]" />
              <span>{language === 'ar' ? 'سجل الموردين المعتمدين وهيئة الزكاة' : 'Approved Supplier Directory (ZATCA)'}</span>
            </h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Supplier Name</th>
                  <th className="py-3 px-3">ZATCA VAT #</th>
                  <th className="py-3 px-3">CR #</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Terms</th>
                  <th className="py-3 px-3 text-right">Current Balance (SAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#00305D]">{sup.code}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{language === 'ar' ? sup.nameAr : sup.nameEn}</div>
                      <div className="text-[10px] text-slate-500">{sup.contactPerson} • {sup.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{sup.vatNumber}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{sup.crNumber}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                        {sup.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">{sup.paymentTermsDays} Days</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#00305D]">
                      {formatCurrency(sup.currentBalanceSAR, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

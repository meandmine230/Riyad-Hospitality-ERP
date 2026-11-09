import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import { ChequeRecord, ChequeStatus } from '../../shared/types';
import {
  Landmark,
  Coins,
  ArrowRightLeft,
  CheckCircle2,
  FileSpreadsheet,
  CheckSquare,
  FileCheck,
  PlusCircle,
  Printer,
  X,
  Clock,
  Send,
  UserCheck,
} from 'lucide-react';

export const TreasuryBankingView: React.FC = () => {
  const {
    language,
    bankAccounts,
    pettyCashFloats,
    cheques,
    addCheque,
    signCheque,
    issueCheque,
    clearCheque,
    currentPropertyId,
  } = useERP();
  const t = DICTIONARY[language];

  const [activeSubTab, setActiveSubTab] = useState<'banks' | 'cheques' | 'reconciliation' | 'pettyCash'>('cheques');
  const [chequeFilter, setChequeFilter] = useState<'ALL' | ChequeStatus>('ALL');

  // New Cheque Modal State
  const [isNewChequeModalOpen, setIsNewChequeModalOpen] = useState(false);
  const [chequeNumber, setChequeNumber] = useState('');
  const [bankName, setBankName] = useState('Al Rajhi Bank');
  const [beneficiary, setBeneficiary] = useState('');
  const [beneficiaryAr, setBeneficiaryAr] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState('2026-11-20');
  const [notes, setNotes] = useState('');

  // Printable Cheque Preview Modal
  const [selectedChequeForPrint, setSelectedChequeForPrint] = useState<ChequeRecord | null>(null);

  const [reconciledState, setReconciledState] = useState<{ [key: string]: boolean }>({
    'TX-83921': true,
    'TX-99014': false,
    'TX-11029': false,
  });

  const totalBankLiquidity = bankAccounts.reduce((sum, b) => sum + b.currentBookBalanceSAR, 0);
  const totalPettyCashFloats = pettyCashFloats.reduce((sum, p) => sum + p.authorizedLimitSAR, 0);

  const filteredCheques = cheques.filter((c) => {
    if (chequeFilter === 'ALL') return true;
    return c.status === chequeFilter;
  });

  const waitingApprovalCount = cheques.filter((c) => c.status === 'WAITING_FOR_APPROVAL').length;
  const readyToIssueCount = cheques.filter((c) => c.status === 'READY_TO_ISSUE').length;

  const mockStatementTransactions = [
    { id: 'TX-83921', date: '2026-11-03', description: 'Wire transfer to Saudi Food Industries', debit: 45000, credit: 0, ref: 'INV-SA-9821' },
    { id: 'TX-99014', date: '2026-11-06', description: 'Front office credit card batch settlement (Mada/Visa)', debit: 0, credit: 43000, ref: 'PMS-AUDIT-06' },
    { id: 'TX-11029', date: '2026-11-07', description: 'Saudi Aramco corporate direct deposit', debit: 0, credit: 142500, ref: 'CL-ARAMCO-01' },
  ];

  const handleToggleReconcile = (id: string) => {
    setReconciledState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCreateCheque = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chequeNumber.trim() || !beneficiary.trim() || amount <= 0) return;

    addCheque({
      propertyId: currentPropertyId === 'ALL' ? 'PROP-RUH-01' : currentPropertyId,
      chequeNumber: chequeNumber.startsWith('CHQ-') ? chequeNumber : `CHQ-${chequeNumber}`,
      bankName,
      glAccountCode: bankName.includes('Rajhi') ? '102001004' : '102001001',
      beneficiary,
      beneficiaryAr: beneficiaryAr || beneficiary,
      amount,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate,
      status: 'WAITING_FOR_APPROVAL',
      notes,
      preparedBy: 'Accounts Payable Specialist',
    });

    setIsNewChequeModalOpen(false);
    setChequeNumber('');
    setBeneficiary('');
    setBeneficiaryAr('');
    setAmount(0);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
              {language === 'ar' ? 'الخزينة وإدارة الشيكات والتسويات' : 'Treasury, Cheque Management & Banking'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              USALI Section 2 • Cheque Approval & Bank Feeds
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar' ? 'الخزينة وإدارة الشيكات والعمليات البنكية' : 'Treasury, Bank Accounts & Cheque Register'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'دورة اعتماد وصرف الشيكات البنكية (FC/GM)، مطابقة كشوف الحسابات، وصناديق العهد النثرية'
              : 'End-to-end cheque approval workflow (AP -> FC -> GM -> Vendor Issuance), bank feeds, and petty cash floats.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewChequeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'ar' ? 'تحرير شيك جديد' : 'Draft New Cheque'}</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={language === 'ar' ? 'إجمالي السيولة البنكية' : 'Bank Liquidity'}
          value={formatCurrency(totalBankLiquidity, language)}
          subtitle={language === 'ar' ? 'حسابات الراجحي والأهلي' : 'Al Rajhi & SNB Liquid Balances'}
          icon={Landmark}
          accentColor="emerald"
        />
        <MetricCard
          title={language === 'ar' ? 'شيكات بانتظار التوقيع' : 'Awaiting Approval'}
          value={`${waitingApprovalCount} Cheques`}
          subtitle={language === 'ar' ? 'تتطلب اعتماد المدير المالي والعام' : 'Queued for FC / GM Signatures'}
          icon={Clock}
          accentColor="amber"
        />
        <MetricCard
          title={language === 'ar' ? 'شيكات جاهزة للصرف والتسليم' : 'Ready to Issue'}
          value={`${readyToIssueCount} Cheques`}
          subtitle={language === 'ar' ? 'معتمدة جاهزة للاستلام' : 'Approved for Vendor Pickup'}
          icon={CheckSquare}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'صناديق العهد النثرية' : 'Petty Cash Floats'}
          value={formatCurrency(totalPettyCashFloats, language)}
          subtitle={language === 'ar' ? 'صندوق الاستقبال والمطبخ' : 'Front Office & Kitchen Floats'}
          icon={Coins}
          accentColor="indigo"
        />
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('cheques')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'cheques'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>{language === 'ar' ? 'سجل وإدارة الشيكات (Cheque Register)' : 'Cheque Management Register'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('banks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'banks'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>{language === 'ar' ? 'الحسابات البنكية' : 'Bank Accounts'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'reconciliation'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{language === 'ar' ? 'مطابقة كشف الحساب البنكي' : 'Bank Reconciliation Workbench'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('pettyCash')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'pettyCash'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{language === 'ar' ? 'صناديق العهد النثرية' : 'Petty Cash Custodians'}</span>
        </button>
      </div>

      {/* TAB 1: CHEQUE MANAGEMENT REGISTER */}
      {activeSubTab === 'cheques' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#00305D]" />
                <span>{language === 'ar' ? 'سجل متابعة وإصدار الشيكات المصرفية' : 'Master Cheque Register & Approval Workflow'}</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Dual Authority Verification: Accounts Payable → Financial Controller → General Manager
              </p>
            </div>

            {/* Workflow Stage Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F4F6F8] rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setChequeFilter('ALL')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  chequeFilter === 'ALL' ? 'bg-[#00305D] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-[#00305D]'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'All Cheques'} ({cheques.length})
              </button>
              <button
                type="button"
                onClick={() => setChequeFilter('WAITING_FOR_CHECKS')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  chequeFilter === 'WAITING_FOR_CHECKS' ? 'bg-[#00305D] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-[#00305D]'
                }`}
              >
                {language === 'ar' ? 'بانتظار التجهيز' : 'Drafted'}
              </button>
              <button
                type="button"
                onClick={() => setChequeFilter('WAITING_FOR_APPROVAL')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  chequeFilter === 'WAITING_FOR_APPROVAL' ? 'bg-[#00305D] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-[#00305D]'
                }`}
              >
                {language === 'ar' ? 'بانتظار الاعتماد' : 'Waiting Approval'} ({waitingApprovalCount})
              </button>
              <button
                type="button"
                onClick={() => setChequeFilter('READY_TO_ISSUE')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  chequeFilter === 'READY_TO_ISSUE' ? 'bg-[#00305D] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-[#00305D]'
                }`}
              >
                {language === 'ar' ? 'جاهز للتسليم' : 'Ready to Issue'} ({readyToIssueCount})
              </button>
              <button
                type="button"
                onClick={() => setChequeFilter('ISSUED_AND_CLEARED')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  chequeFilter === 'ISSUED_AND_CLEARED' ? 'bg-[#00305D] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-[#00305D]'
                }`}
              >
                {language === 'ar' ? 'تم الصرف والتسوية' : 'Issued & Cleared'}
              </button>
            </div>
          </div>

          {/* Cheque Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 text-[10px] font-mono uppercase font-bold">
                <tr>
                  <th className="py-3 px-3">Cheque #</th>
                  <th className="py-3 px-3">Issuing Bank</th>
                  <th className="py-3 px-3">Beneficiary</th>
                  <th className="py-3 px-3 text-right">Amount (SAR)</th>
                  <th className="py-3 px-3">Issue Date</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Approval Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-mono">
                {filteredCheques.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-[#00305D]">{c.chequeNumber}</td>
                    <td className="py-3 px-3 text-slate-700 font-sans">{c.bankName}</td>
                    <td className="py-3 px-3 text-slate-900 font-sans font-medium">
                      <div>{language === 'ar' ? c.beneficiaryAr || c.beneficiary : c.beneficiary}</div>
                      {c.notes && <div className="text-[11px] text-slate-500 font-sans truncate max-w-xs">{c.notes}</div>}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#00305D] text-sm">
                      {formatCurrency(c.amount, language)}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{c.issueDate}</td>
                    <td className="py-3 px-3 text-slate-700">{c.dueDate}</td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <StatusBadge
                          status={c.status.replace(/_/g, ' ')}
                          variant={
                            c.status === 'ISSUED_AND_CLEARED'
                              ? 'success'
                              : c.status === 'READY_TO_ISSUE'
                              ? 'info'
                              : c.status === 'WAITING_FOR_APPROVAL'
                              ? 'warning'
                              : 'neutral'
                          }
                        />
                        <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                          <span>FC:</span>
                          <span className={c.approvedByFC ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                            {c.approvedByFC ? 'Signed ✓' : 'Pending'}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span>GM:</span>
                          <span className={c.approvedByGM ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                            {c.approvedByGM ? 'Signed ✓' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        {/* Dual Authority Signatures */}
                        {!c.approvedByFC && (
                          <button
                            type="button"
                            onClick={() => signCheque(c.id, 'FC')}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-[#00305D] text-[11px] font-bold border border-blue-200 transition cursor-pointer"
                            title="Sign as Financial Controller"
                          >
                            Sign FC
                          </button>
                        )}

                        {c.approvedByFC && !c.approvedByGM && (
                          <button
                            type="button"
                            onClick={() => signCheque(c.id, 'GM')}
                            className="px-2 py-1 rounded bg-[#00305D] hover:bg-[#002244] text-white text-[11px] font-bold transition cursor-pointer shadow-sm"
                            title="Sign as General Manager"
                          >
                            Sign GM
                          </button>
                        )}

                        {c.status === 'READY_TO_ISSUE' && (
                          <button
                            type="button"
                            onClick={() => clearCheque(c.id)}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition cursor-pointer"
                            title="Clear Cheque against Bank Feed"
                          >
                            Clear Cheque
                          </button>
                        )}

                        {/* Print Cheque Slip */}
                        <button
                          type="button"
                          onClick={() => setSelectedChequeForPrint(c)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-300"
                          title="Print Official Cheque Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BANK ACCOUNTS */}
      {activeSubTab === 'banks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map((acc) => (
            <div key={acc.id} className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#00305D] font-bold">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{acc.bankName}</h3>
                    <p className="text-[11px] text-slate-500">GL Account: {acc.glAccountCode}</p>
                  </div>
                </div>
                <StatusBadge status="ACTIVE" variant="success" />
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="text-slate-800 font-sans font-medium">{acc.accountTitle}</div>
                <div className="text-slate-500 text-[11px]">Account: {acc.accountNumber}</div>
                <div className="text-slate-500 text-[11px] truncate">IBAN: {acc.iban}</div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Book Ledger Balance</div>
                  <div className="text-base font-bold text-[#00305D]">{formatCurrency(acc.currentBookBalanceSAR, language)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">Unreconciled Feed</div>
                  <div className="text-sm font-bold text-emerald-700">
                    {formatCurrency(acc.unreconciledBankBalanceSAR, language)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BANK RECONCILIATION */}
      {activeSubTab === 'reconciliation' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#00305D] tracking-wide">
                {language === 'ar' ? 'مطابقة كشف الحساب الإلكتروني المباشر' : 'Electronic Statement Auto-Reconciliation'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Al Rajhi Corporate API Stream • Feed Timestamp: 2026-11-08 12:45
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
              Auto-Matching Algorithm: 98.4%
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 text-[10px] font-mono uppercase font-bold">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Statement Description</th>
                  <th className="py-3 px-3 text-right">Debit (SAR)</th>
                  <th className="py-3 px-3 text-right">Credit (SAR)</th>
                  <th className="py-3 px-3">Matched Ref</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-mono">
                {mockStatementTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-slate-600">{tx.date}</td>
                    <td className="py-3 px-3 font-sans text-slate-800 font-medium">{tx.description}</td>
                    <td className="py-3 px-3 text-right text-rose-700 font-bold">{tx.debit ? formatCurrency(tx.debit, language) : '—'}</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">{tx.credit ? formatCurrency(tx.credit, language) : '—'}</td>
                    <td className="py-3 px-3 text-[#00305D] font-bold">{tx.ref}</td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge
                        status={reconciledState[tx.id] ? 'RECONCILED' : 'UNMATCHED'}
                        variant={reconciledState[tx.id] ? 'success' : 'warning'}
                      />
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <button
                        type="button"
                        onClick={() => handleToggleReconcile(tx.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                          reconciledState[tx.id]
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-[#00305D] hover:bg-[#002244] text-white font-bold shadow-sm'
                        }`}
                      >
                        {reconciledState[tx.id] ? 'Unmatch' : 'Match & Clear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PETTY CASH FLOATS */}
      {activeSubTab === 'pettyCash' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pettyCashFloats.map((pc) => (
            <div key={pc.id} className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{pc.department}</h3>
                  <p className="text-[11px] text-slate-500 font-sans">Custodian: {pc.custodianName}</p>
                </div>
                <StatusBadge status={pc.status} variant={pc.status === 'ACTIVE' ? 'success' : 'warning'} />
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Limit</div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{formatCurrency(pc.authorizedLimitSAR, language)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Cash on Hand</div>
                  <div className="text-xs font-bold text-emerald-700 mt-1">{formatCurrency(pc.currentCashSAR, language)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F4F6F8] border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Receipts</div>
                  <div className="text-xs font-bold text-amber-800 mt-1">{formatCurrency(pc.pendingVouchersSAR, language)}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">GL Account: {pc.glAccountCode}</span>
                {pc.status === 'REPLENISHMENT_REQUESTED' && (
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    Approve Replenishment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: DRAFT NEW CHEQUE */}
      {isNewChequeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#DDE3EA] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#00305D]" />
                <h3 className="text-base font-bold text-[#00305D]">
                  {language === 'ar' ? 'تحرير وإصدار شيك بنكي جديد' : 'Draft New Cheque'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChequeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCheque} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Cheque Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 883905"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-slate-900 font-mono focus:border-[#00305D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Issuing Bank</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-slate-900 focus:border-[#00305D] focus:outline-none"
                  >
                    <option value="Al Rajhi Bank">Al Rajhi Bank (مصرف الراجحي)</option>
                    <option value="Saudi National Bank (SNB)">Saudi National Bank (البنك الأهلي)</option>
                    <option value="Riyad Bank">Riyad Bank (بنك الرياض)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Beneficiary (Company / Person)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almarai Food Industries Co."
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-slate-900 focus:border-[#00305D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Amount (SAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-[#00305D] font-mono font-bold focus:border-[#00305D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Maturity / Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-slate-900 font-mono focus:border-[#00305D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Voucher Memo / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Settlement for fresh produce PO-2026-0048"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F6F8] border border-slate-300 text-slate-900 focus:border-[#00305D] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#00305D] shrink-0" />
                <span>
                  After drafting, this cheque will automatically be queued for Financial Controller and General Manager electronic sign-off.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewChequeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold transition shadow-sm cursor-pointer"
                >
                  {language === 'ar' ? 'تأكيد وحفظ الشيك' : 'Submit Cheque for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL PRINTABLE CHEQUE SLIP PREVIEW */}
      {selectedChequeForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#DDE3EA] shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#00305D]" />
                <h3 className="text-base font-bold text-[#00305D]">
                  {language === 'ar' ? 'معاينة سند صرف الشيك الرسمي' : 'Official Cheque Payment Voucher Preview'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChequeForPrint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formal Cheque Voucher Layout */}
            <div className="p-6 rounded-2xl bg-[#F4F6F8] text-slate-900 space-y-5 border border-slate-300 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-300 pb-4">
                <div>
                  <h4 className="text-lg font-extrabold uppercase tracking-wide text-[#00305D]">
                    Riyada Hospitality Management
                  </h4>
                  <p className="text-xs text-slate-600">Al Faisaliah Hotel Riyadh • KSA</p>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase text-slate-500 font-bold">Cheque No.</div>
                  <div className="text-base font-mono font-bold text-[#00305D]">{selectedChequeForPrint.chequeNumber}</div>
                  <div className="text-xs text-slate-500 font-mono">Date: {selectedChequeForPrint.issueDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-semibold">Drawn On:</span>
                  <div className="font-bold text-sm text-slate-900">{selectedChequeForPrint.bankName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">GL: {selectedChequeForPrint.glAccountCode}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 uppercase font-semibold">Amount in Figures:</span>
                  <div className="text-lg font-mono font-extrabold text-[#00305D]">
                    {formatCurrency(selectedChequeForPrint.amount, 'en')}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-300 text-xs">
                <span className="text-slate-500 font-semibold">Pay Against this Cheque To the Order of:</span>
                <div className="text-sm font-bold text-slate-900 mt-1">{selectedChequeForPrint.beneficiary}</div>
                {selectedChequeForPrint.notes && (
                  <div className="text-slate-600 mt-1 font-sans">Memo: {selectedChequeForPrint.notes}</div>
                )}
              </div>

              {/* Three Signature Boxes */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-300 text-center text-xs">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-6">Prepared By</div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                    {selectedChequeForPrint.preparedBy}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-6">Financial Controller</div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-emerald-800">
                    {selectedChequeForPrint.approvedByFC || 'Pending Signature'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-6">General Manager</div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-emerald-800">
                    {selectedChequeForPrint.approvedByGM || 'Pending Signature'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedChequeForPrint(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                {t.close}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm cursor-pointer"
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

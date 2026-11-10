import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ModalDrawer } from '../components/ui/ModalDrawer';
import { executeThreeWayMatch, ThreeWayMatchResult } from '../../shared/utilities/procurementEngine';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import { PurchaseOrder, GoodsReceiptNote } from '../../shared/types';
import {
  ShoppingCart,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Truck,
  ShieldAlert,
  Thermometer,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

export const ProcurementView: React.FC = () => {
  const {
    language,
    purchaseOrders,
    grns,
    vendorInvoices,
    approveVendorInvoiceMatch,
    receiveGoodsToStore,
    receiveGoodsWithHACCP,
    approvePO,
  } = useERP();
  const t = DICTIONARY[language];

  const [activeSubTab, setActiveSubTab] = useState<'matching' | 'pos' | 'grns'>('matching');
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder>(purchaseOrders[0]);
  const [inspectingGrn, setInspectingGrn] = useState<GoodsReceiptNote | null>(null);
  const [vehicleTemp, setVehicleTemp] = useState<number>(3.2);
  const [expiryVerified, setExpiryVerified] = useState<boolean>(true);
  const [qualityStatus, setQualityStatus] = useState<'PASSED' | 'CONDITIONAL' | 'REJECTED'>('PASSED');
  const [haccpNotes, setHaccpNotes] = useState<string>('SFDA compliance verified. Cold chain unbroken.');
  const [haccpNotice, setHaccpNotice] = useState<string | null>(null);

  const [matchResult, setMatchResult] = useState<ThreeWayMatchResult | null>(() => {
    if (!purchaseOrders[0]) return null;
    const po = purchaseOrders[0];
    const grn = grns.find((g) => g.poNumber === po.poNumber);
    const inv = vendorInvoices.find((i) => i.poNumber === po.poNumber);

    return executeThreeWayMatch({
      poItems: po.items.map((i) => ({ sku: i.sku, quantity: i.quantityOrdered, unitPriceSAR: i.unitPriceSAR })),
      grnItems: grn
        ? grn.items.map((i) => ({ sku: i.sku, quantityAccepted: i.quantityAccepted, unitPriceSAR: i.unitPriceSAR }))
        : [],
      invoiceItems: inv
        ? po.items.map((i) => ({ sku: i.sku, quantityBilled: i.quantityOrdered, unitPriceSAR: i.unitPriceSAR }))
        : [],
    });
  });

  const handleSelectPOForMatch = (po: PurchaseOrder) => {
    setSelectedPo(po);
    const grn = grns.find((g) => g.poNumber === po.poNumber);
    const inv = vendorInvoices.find((i) => i.poNumber === po.poNumber);

    const res = executeThreeWayMatch({
      poItems: po.items.map((i) => ({ sku: i.sku, quantity: i.quantityOrdered, unitPriceSAR: i.unitPriceSAR })),
      grnItems: grn
        ? grn.items.map((i) => ({ sku: i.sku, quantityAccepted: i.quantityAccepted, unitPriceSAR: i.unitPriceSAR }))
        : [],
      invoiceItems: inv
        ? po.items.map((i) => ({ sku: i.sku, quantityBilled: i.quantityOrdered, unitPriceSAR: i.unitPriceSAR }))
        : po.items.map((i) => ({ sku: i.sku, quantityBilled: i.quantityOrdered, unitPriceSAR: i.unitPriceSAR })),
    });
    setMatchResult(res);
  };

  const matchedGrn = grns.find((g) => g.poNumber === selectedPo?.poNumber);
  const matchedInvoice = vendorInvoices.find((i) => i.poNumber === selectedPo?.poNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
              Agent 05: Procurement & Supply Chain
            </span>
            <span className="text-xs text-slate-500 font-mono">3-Way Match Verification Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar' ? 'المشتريات والمطابقة الثلاثية (PO vs GRN vs Invoice)' : 'Procurement & 3-Way Matching'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'مطابقة أمر الشراء وسند الاستلام الفعلي وفاتورة المورد بنسب التفاوت المعتمدة قبل الصرف'
              : 'Autonomous reconciliation of Purchase Orders, Goods Receipt Notes, and Vendor Invoices with price/qty tolerance rules.'}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={language === 'ar' ? 'أوامر الشراء المعتمدة' : 'Purchase Orders'}
          value={purchaseOrders.length}
          subtitle={language === 'ar' ? 'إجمالي طلبات التوريد' : 'Active Procurement POs'}
          icon={ShoppingCart}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'سندات استلام المستودع (GRN)' : 'Goods Receipts (GRN)'}
          value={grns.length}
          subtitle={language === 'ar' ? 'فحص البضائع والاستلام' : 'Bay Inspection Cleared'}
          icon={PackageCheck}
          accentColor="emerald"
        />
        <MetricCard
          title={language === 'ar' ? 'حالة المطابقة الثلاثية' : '3-Way Match Status'}
          value={matchResult?.overallStatus === 'MATCHED' ? '100% Matched' : 'Discrepancy'}
          subtitle={language === 'ar' ? 'تفاوت السعر والكمية' : 'Policy Tolerance Check'}
          icon={CheckCircle2}
          accentColor={matchResult?.overallStatus === 'MATCHED' ? 'emerald' : 'rose'}
        />
        <MetricCard
          title={language === 'ar' ? 'حد التفاوت المسموح' : 'Tolerance Policy'}
          value="<= 2.5% SAR"
          subtitle={language === 'ar' ? 'لا زيادة في الكميات (0%)' : 'Strict Quantity Ceiling (0%)'}
          icon={ShieldAlert}
          accentColor="amber"
        />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('matching')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'matching'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>{language === 'ar' ? 'محرك المطابقة الثلاثية' : '3-Way Matching Workbench'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('pos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'pos'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{language === 'ar' ? 'أوامر الشراء (POs)' : 'Purchase Orders'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('grns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'grns'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{language === 'ar' ? 'سندات استلام المستودع (GRNs)' : 'Goods Receipt Notes'}</span>
        </button>
      </div>

      {/* Tab: 3-Way Matching Workbench */}
      {activeSubTab === 'matching' && (
        <div className="space-y-6">
          {/* PO Selector */}
          <div className="p-4 rounded-xl bg-white border border-[#DDE3EA] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="po-select" className="text-xs text-slate-600 font-semibold">
                Select PO to Match:
              </label>
              <select
                id="po-select"
                value={selectedPo?.id}
                onChange={(e) => {
                  const target = purchaseOrders.find((p) => p.id === e.target.value);
                  if (target) handleSelectPOForMatch(target);
                }}
                className="bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono outline-none focus:border-[#00305D]"
              >
                {purchaseOrders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.poNumber} — {p.supplierName} ({formatCurrency(p.grandTotalSAR, language)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Match Status:</span>
              <StatusBadge status={matchResult?.overallStatus || 'UNKNOWN'} />
            </div>
          </div>

          {/* 3 Pillars Visual Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1: PO */}
            <div className="p-4 rounded-xl bg-white border border-[#DDE3EA] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
                  PILLAR 1: PURCHASE ORDER
                </span>
                <StatusBadge status={selectedPo.status} />
              </div>
              <div>
                <div className="text-base font-bold text-[#00305D] font-mono">{selectedPo.poNumber}</div>
                <div className="text-xs text-slate-600 mt-0.5 font-medium">{selectedPo.supplierName}</div>
              </div>
              <div className="space-y-1 text-xs font-mono pt-2 border-t border-slate-100">
                <div className="flex justify-between text-slate-500">
                  <span>Lines Ordered:</span>
                  <span className="text-slate-800 font-semibold">{selectedPo.items.length} items</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Grand Total (with VAT):</span>
                  <span className="text-[#00305D] font-bold">{formatCurrency(selectedPo.grandTotalSAR, language)}</span>
                </div>
              </div>
            </div>

            {/* Pillar 2: GRN */}
            <div className="p-4 rounded-xl bg-white border border-[#DDE3EA] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  PILLAR 2: GOODS RECEIPT (GRN)
                </span>
                <StatusBadge status={matchedGrn ? matchedGrn.status : 'NOT_RECEIVED_YET'} />
              </div>
              <div>
                <div className="text-base font-bold text-[#00305D] font-mono">{matchedGrn ? matchedGrn.grnNumber : '—'}</div>
                <div className="text-xs text-slate-600 mt-0.5 font-medium">
                  {matchedGrn ? matchedGrn.storeLocation : 'Awaiting physical delivery'}
                </div>
              </div>
              <div className="space-y-1 text-xs font-mono pt-2 border-t border-slate-100">
                <div className="flex justify-between text-slate-500">
                  <span>Accepted Value:</span>
                  <span className="text-emerald-700 font-bold">
                    {matchedGrn ? formatCurrency(matchedGrn.totalAcceptedValueSAR, language) : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Received By:</span>
                  <span className="text-slate-800 truncate font-semibold">{matchedGrn ? matchedGrn.receivedBy.split(' ')[0] : '—'}</span>
                </div>
              </div>
            </div>

            {/* Pillar 3: Invoice */}
            <div className="p-4 rounded-xl bg-white border border-[#DDE3EA] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  PILLAR 3: VENDOR INVOICE
                </span>
                <StatusBadge status={matchedInvoice ? matchedInvoice.status : 'NO_INVOICE'} />
              </div>
              <div>
                <div className="text-base font-bold text-[#00305D] font-mono">
                  {matchedInvoice ? matchedInvoice.invoiceNumber : '—'}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 font-medium">
                  Due: {matchedInvoice ? matchedInvoice.dueDate : 'Pending upload'}
                </div>
              </div>
              <div className="space-y-1 text-xs font-mono pt-2 border-t border-slate-100">
                <div className="flex justify-between text-slate-500">
                  <span>Billed Total:</span>
                  <span className="text-slate-900 font-bold">
                    {matchedInvoice ? formatCurrency(matchedInvoice.totalAmountSAR, language) : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Matching Status:</span>
                  <span className="text-emerald-700 font-bold">
                    {matchedInvoice ? matchedInvoice.threeWayMatchStatus : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line-by-Line Reconciled Table */}
          {matchResult && (
            <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00305D]" />
                  <span>Line Item Reconciliation & Variance Breakdown</span>
                </h3>
                {matchResult.isApprovalRequired && (
                  <span className="text-xs text-rose-700 bg-rose-50 px-2 py-1 rounded font-semibold border border-rose-200">
                    Controller Approval Required
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item SKU</th>
                      <th className="py-2.5 px-3 text-right">PO Qty</th>
                      <th className="py-2.5 px-3 text-right">GRN Accepted Qty</th>
                      <th className="py-2.5 px-3 text-right">Invoiced Qty</th>
                      <th className="py-2.5 px-3 text-right">PO Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Invoice Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Variance (SAR)</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {matchResult.lines.map((line) => (
                      <tr key={line.sku} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#00305D]">{line.sku}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{line.poQty}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">{line.grnQty}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-semibold">{line.invoiceQty}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {formatCurrency(line.poPriceSAR, language)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-800 font-semibold">
                          {formatCurrency(line.invoicePriceSAR, language)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(line.varianceSAR, language)}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={line.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {matchedInvoice && matchedInvoice.status !== 'MATCHED' && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => approveVendorInvoiceMatch(matchedInvoice.id)}
                    className="px-4 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    Authorize 3-Way Match & Release for Payment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: POs */}
      {activeSubTab === 'pos' && (
        <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider">Purchase Orders Registry</h3>
            <span className="text-xs text-slate-500 font-mono">Total POs: {purchaseOrders.length}</span>
          </div>
          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="p-4 rounded-xl bg-[#F4F6F8] border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#00305D] text-sm">{po.poNumber}</span>
                    <span className="text-slate-800 font-semibold text-xs">{po.supplierName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={po.status} />
                    {po.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => approvePO(po.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#00305D] hover:bg-[#002244] text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        Approve & Issue PO
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Date: {po.date} • Delivery Due: {po.deliveryDueDate} • Payment: {po.paymentTerms}
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600">{po.items.length} line items ordered</span>
                  <span className="text-[#00305D] font-bold text-sm">
                    Grand Total: {formatCurrency(po.grandTotalSAR, language)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: GRNs with HACCP Cold Chain Workbench */}
      {activeSubTab === 'grns' && (
        <div className="space-y-4">
          {haccpNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{haccpNotice}</span>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-[#00305D]" />
                  <span>Goods Receipt Notes & SFDA / HACCP Receiving Bay Inspection</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Mandatory cold-chain temperature verification & physical goods inspection prior to store ledger posting
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {grns.map((grn) => {
                const isPosted = grn.status === 'POSTED_TO_INVENTORY';
                return (
                  <div key={grn.id} className="p-4 rounded-xl bg-[#F4F6F8] border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#00305D] text-sm">{grn.grnNumber}</span>
                        <span className="text-slate-600 text-xs font-mono">Ref PO: {grn.poNumber}</span>
                        <span className="text-slate-800 text-xs font-semibold">({grn.supplierName})</span>
                      </div>
                      <StatusBadge
                        status={grn.status}
                        variant={isPosted ? 'success' : grn.status === 'ACCEPTED_WITH_DISCREPANCY' ? 'danger' : 'warning'}
                      />
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4">
                      <span>Received by: <strong className="text-slate-800">{grn.receivedBy}</strong></span>
                      <span>Bay: <strong className="text-slate-800">{grn.storeLocation}</strong></span>
                      <span>Date: <strong className="text-slate-800">{grn.receivingDate}</strong></span>
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>Temp Verified: +2.8°C</span>
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#00305D] font-bold text-sm">
                        Accepted Value: {formatCurrency(grn.totalAcceptedValueSAR, language)}
                      </span>
                      <div className="flex items-center gap-2">
                        {!isPosted && (
                          <button
                            type="button"
                            onClick={() => {
                              setInspectingGrn(grn);
                              setVehicleTemp(3.2);
                              setExpiryVerified(true);
                              setQualityStatus('PASSED');
                            }}
                            className="px-3.5 py-1.5 bg-[#00305D] hover:bg-[#002244] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Thermometer className="w-3.5 h-3.5" />
                            <span>HACCP Bay Inspection</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => receiveGoodsToStore(grn.id)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-300 cursor-pointer shadow-sm"
                        >
                          {isPosted ? 'Re-Sync Weighted Avg' : 'Quick Post to Store'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HACCP Food Safety Inspection Modal */}
          {inspectingGrn && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-xl bg-white border border-[#DDE3EA] rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-[#00305D]" />
                    <div>
                      <h3 className="text-base font-bold text-[#00305D]">SFDA & HACCP Receiving Bay Inspection</h3>
                      <p className="text-xs text-slate-500 font-mono">GRN: {inspectingGrn.grnNumber} • PO: {inspectingGrn.poNumber}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingGrn(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  {/* Temperature Control */}
                  <div className="p-4 rounded-xl bg-[#F4F6F8] border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-bold uppercase font-sans">Refrigerated Vehicle Probe Temperature</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          vehicleTemp <= 4 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {vehicleTemp <= 4 ? 'Within Spec (< 4.0°C) ✓' : 'VIOLATION (> 4.0°C) ⚠'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="-25"
                        max="15"
                        step="0.5"
                        value={vehicleTemp}
                        onChange={(e) => setVehicleTemp(Number(e.target.value))}
                        className="flex-1 accent-[#00305D] cursor-pointer"
                      />
                      <span className="text-sm font-bold text-slate-900 w-16 text-right">{vehicleTemp}°C</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Saudi Food & Drug Authority (SFDA) chilled perishable standard: Max +4.0°C. Frozen: Max -18.0°C.
                    </p>
                  </div>

                  {/* Quality Checklist */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200 flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expiryVerified}
                        onChange={(e) => setExpiryVerified(e.target.checked)}
                        className="rounded accent-[#00305D] w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-slate-800 font-sans">Shelf-Life Verified</div>
                        <div className="text-[10px] text-slate-500 font-sans">&gt;75% remaining shelf life</div>
                      </div>
                    </label>

                    <div className="p-3 rounded-xl bg-[#F4F6F8] border border-slate-200">
                      <div className="font-bold text-slate-700 mb-1 font-sans">Inspection Verdict</div>
                      <select
                        value={qualityStatus}
                        onChange={(e) => setQualityStatus(e.target.value as any)}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold outline-none font-sans"
                      >
                        <option value="PASSED">PASSED (Accept Lot)</option>
                        <option value="CONDITIONAL">CONDITIONAL</option>
                        <option value="REJECTED">REJECTED (Reject Lot)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-sans font-semibold">Hygiene & Quality Remarks</label>
                    <input
                      type="text"
                      value={haccpNotes}
                      onChange={(e) => setHaccpNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F4F6F8] border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-[#00305D] font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setInspectingGrn(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = receiveGoodsWithHACCP(inspectingGrn.id, {
                        vehicleTempC: vehicleTemp,
                        expiryVerified,
                        qualityInspection: qualityStatus,
                        rejectionNotes: haccpNotes,
                      });
                      setHaccpNotice(
                        qualityStatus === 'PASSED'
                          ? `GRN ${inspectingGrn.grnNumber} passed HACCP cold chain and was posted to inventory!`
                          : `GRN ${inspectingGrn.grnNumber} was flagged as ${qualityStatus}. Discrepancy logged.`
                      );
                      setInspectingGrn(null);
                      setTimeout(() => setHaccpNotice(null), 5000);
                    }}
                    className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Inspection & Update Inventory</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

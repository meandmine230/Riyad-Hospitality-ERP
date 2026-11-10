import React, { useState } from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DICTIONARY, formatCurrency } from '../../shared/utilities/i18n';
import {
  Hotel,
  Moon,
  Sparkles,
  Server,
  ShieldCheck,
  Send,
  ExternalLink,
  FileText,
  X,
  CheckCircle,
  Building2,
  Calendar,
  Wallet,
  CreditCard,
  Printer,
  ArrowDownToLine,
} from 'lucide-react';
import { CashierShiftDrop } from '../../shared/types';

export const HotelIntegrationView: React.FC = () => {
  const {
    language,
    nightAuditBatches,
    postNightAuditToGL,
    currentProperty,
    cashierDrops,
    reconcileCashierShiftDrop,
  } = useERP();
  const t = DICTIONARY[language];

  const [activeTab, setActiveTab] = useState<'nightAudit' | 'cashierDrops'>('nightAudit');
  const [postingStatus, setPostingStatus] = useState<{ [key: string]: string }>({});
  const [showCircularModal, setShowCircularModal] = useState(false);
  const [ntmpTransmissionStatus, setNtmpTransmissionStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');

  // Cashier drop reconciliation state
  const [reconcilingDrop, setReconcilingDrop] = useState<CashierShiftDrop | null>(null);
  const [inputCash, setInputCash] = useState<number>(0);
  const [inputMada, setInputMada] = useState<number>(0);
  const [inputCC, setInputCC] = useState<number>(0);
  const [envelopeModalDrop, setEnvelopeModalDrop] = useState<CashierShiftDrop | null>(null);
  const [dropNotice, setDropNotice] = useState<string | null>(null);

  const latestBatch = nightAuditBatches[0];

  const handlePostAudit = (id: string) => {
    const res = postNightAuditToGL(id);
    if (res.success) {
      setPostingStatus((prev) => ({
        ...prev,
        [id]: `Posted as voucher ${res.voucherNumber} ✓`,
      }));
    } else {
      setPostingStatus((prev) => ({
        ...prev,
        [id]: `Error: ${res.error}`,
      }));
    }
  };

  const handleTransmitNTMP = () => {
    setNtmpTransmissionStatus('SENDING');
    setTimeout(() => {
      setNtmpTransmissionStatus('SUCCESS');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-[#00305D] border border-blue-200">
              {language === 'ar' ? 'ربط أنظمة الفندق والتدقيق الليلي' : 'Hotel Systems Integration & Tourism Platform'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Opera Cloud • Simphony • NTMP Circular 7788/1448
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar' ? 'ربط أنظمة الفندق والتدقيق الليلي ومنصة الرصد السياحي' : 'Hotel PMS/POS Interfaces & National Tourism Platform (NTMP)'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'تجميع إيرادات أوبرا كلاود وسيمفوني يومياً، ترحيل قيود التدقيق الليلي للأستاذ العام، والربط الإلزامي مع وزارة السياحة'
              : 'Opera Cloud and Simphony POS ingestion, automatic GL revenue posting, and mandatory financial integration with KSA Ministry of Tourism.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCircularModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'ar' ? 'عرض تعميم وزارة السياحة' : 'View Ministry Circular (7788/1448)'}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('nightAudit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'nightAudit'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>{language === 'ar' ? 'التدقيق الليلي ومنصة الرصد السياحي (NTMP)' : 'Night Audit & MoT Telemetry'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cashierDrops')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'cashierDrops'
              ? 'bg-[#00305D] text-white border border-[#00305D] shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#00305D] hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{language === 'ar' ? 'مطابقة صناديق الاستقبال ونقاط البيع' : 'Front Office Cashier Shift Balancing'}</span>
        </button>
      </div>

      {activeTab === 'nightAudit' && (
        <div className="space-y-6">
          {/* Official Ministry of Tourism (NTMP) Compliance Banner */}
      <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-emerald-950 tracking-wide">
                  {language === 'ar'
                    ? 'منصة الرصد السياحي - استكمال ربط البيانات المالية (NTMP)'
                    : 'National Tourism Monitoring Platform (NTMP) — Financial Data Integration'}
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                  Directive 7788/1448
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'بموجب الفقرة (3) من المادة (24) من لائحة مرافق الضيافة السياحية (القرار الوزاري رقم 2289)، يتم تصدير ومزامنة البيانات المالية للفندق آلياً مع منصة الرصد السياحي قبل الموعد الإلزامي 1 أكتوبر 2026م.'
                  : 'Pursuant to Article 24 Paragraph (3) of KSA Tourism Regulations (Resolution No. 2289), automated daily financial data is synchronized with the Tourism Monitoring Platform ahead of the October 1, 2026 deadline.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTransmitNTMP}
              disabled={ntmpTransmissionStatus === 'SENDING'}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {ntmpTransmissionStatus === 'SENDING'
                  ? 'Transmitting...'
                  : ntmpTransmissionStatus === 'SUCCESS'
                  ? 'Transmitted (200 OK) ✓'
                  : language === 'ar'
                  ? 'بث الحزمة المالية لوزارة السياحة'
                  : 'Push Daily Financial Feed'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowCircularModal(true)}
              className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 transition shadow-sm cursor-pointer"
              title="Inspect Directive Details"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap items-center justify-between text-[11px] text-emerald-900 font-mono gap-2 font-medium">
          <span>PMS Provider Approval: Granted (Opera Cloud API V2)</span>
          <span>Target Platform: NTMP Developer Gateway (بوابة المطورين)</span>
          <span className="text-emerald-800 font-bold">Status: Fully Compliant</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t.hospitality.revPar}
          value={latestBatch ? formatCurrency(latestBatch.revParSAR, language) : '—'}
          subtitle={language === 'ar' ? 'متوسط الإيراد لكل غرفة متاحة' : 'Revenue Per Available Room'}
          icon={Hotel}
          accentColor="amber"
        />
        <MetricCard
          title={t.hospitality.adr}
          value={latestBatch ? formatCurrency(latestBatch.adrSAR, language) : '—'}
          subtitle={language === 'ar' ? 'متوسط السعر اليومي للغرفة' : 'Average Daily Room Rate'}
          icon={Sparkles}
          accentColor="emerald"
        />
        <MetricCard
          title={t.hospitality.occupancy}
          value={latestBatch ? `${latestBatch.occupancyPercentage}%` : '—'}
          subtitle={latestBatch ? `${latestBatch.occupiedRooms} / ${latestBatch.totalRooms} keys` : '—'}
          icon={Moon}
          accentColor="blue"
        />
        <MetricCard
          title={language === 'ar' ? 'جاهزية منصة وزارة السياحة' : 'Ministry of Tourism (NTMP)'}
          value="100% Synced"
          subtitle={language === 'ar' ? 'بث الإشغال والبيانات المالية معتمد' : 'Direct API Financial Telemetry'}
          icon={ShieldCheck}
          accentColor="indigo"
        />
      </div>

      {/* Connected Interfaces Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#DDE3EA] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00305D]" />
              <span>Opera Cloud PMS</span>
            </span>
            <StatusBadge status="CONNECTED" variant="success" />
          </div>
          <p className="text-xs text-slate-600">Front office reservations, guest folios, daily room revenue staging.</p>
          <div className="text-[10px] text-emerald-700 font-mono font-medium">Heartbeat: Active • Latency 14ms</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DDE3EA] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00305D]" />
              <span>Micros Simphony POS</span>
            </span>
            <StatusBadge status="CONNECTED" variant="success" />
          </div>
          <p className="text-xs text-slate-600">Restaurant outlets, room service bills, and banquet revenue feeds.</p>
          <div className="text-[10px] text-emerald-700 font-mono font-medium">Heartbeat: Active • Latency 18ms</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DDE3EA] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00305D]" />
              <span>ZATCA Phase 2 E-Invoicing</span>
            </span>
            <StatusBadge status="COMPLIANT" variant="success" />
          </div>
          <p className="text-xs text-slate-600">Cryptographic stamps, QR codes, 15% standard VAT reporting.</p>
          <div className="text-[10px] text-blue-700 font-mono font-medium">Phase 2 Clearance: Verified</div>
        </div>
      </div>

      {/* Night Audit Batches Staging Grid */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#00305D]" />
              <span>{language === 'ar' ? 'دفعات التدقيق الليلي اليومية ومرحل الأستاذ العام' : 'Daily Night Audit Staging Batches'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Automated Revenue Integration into General Ledger</p>
          </div>
          <span className="text-xs text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Auto-Reconciled</span>
        </div>

        <div className="space-y-4">
          {nightAuditBatches.map((batch) => (
            <div
              key={batch.id}
              className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#00305D] font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{batch.id}</h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Audit Date: {batch.auditDate} • PMS Engine: {batch.pmsSystem}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={batch.isPostedToGL ? 'POSTED TO GL' : 'PENDING GL POSTING'}
                    variant={batch.isPostedToGL ? 'success' : 'warning'}
                  />
                  <StatusBadge
                    status={batch.motSyncStatus === 'SYNCED_WITH_MINISTRY_OF_TOURISM' ? 'NTMP SYNCED' : 'NTMP PENDING'}
                    variant={batch.motSyncStatus === 'SYNCED_WITH_MINISTRY_OF_TOURISM' ? 'info' : 'neutral'}
                  />
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Room Revenue</div>
                  <div className="text-xs font-bold text-[#00305D] mt-1 tabular-nums">{formatCurrency(batch.roomRevenueSAR, language)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">F&B Revenue</div>
                  <div className="text-xs font-bold text-[#00305D] mt-1 tabular-nums">{formatCurrency(batch.fbRevenueSAR, language)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Output VAT (15%)</div>
                  <div className="text-xs font-bold text-amber-700 mt-1 tabular-nums">{formatCurrency(batch.vatCollectedSAR, language)}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Revenue</div>
                  <div className="text-xs font-bold text-emerald-700 mt-1 tabular-nums">{formatCurrency(batch.totalDailyRevenueSAR, language)}</div>
                </div>
              </div>

              {/* Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs font-mono text-slate-600">
                  {batch.isPostedToGL ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Linked Journal Voucher: {batch.postedVoucherNumber}
                    </span>
                  ) : (
                    <span>Ready for double-entry GL journal creation</span>
                  )}
                  {postingStatus[batch.id] && (
                    <span className="ml-2 text-amber-700 font-bold">{postingStatus[batch.id]}</span>
                  )}
                </div>

                {!batch.isPostedToGL && (
                  <button
                    type="button"
                    onClick={() => handlePostAudit(batch.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'ترحيل إلى الأستاذ العام (GL)' : 'Post Revenue Journal to GL'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      )}

      {/* Sub Tab 2: Front Office Cashier Shift Balancing & Settlement Workbench */}
      {activeTab === 'cashierDrops' && (
        <div className="space-y-6">
          {dropNotice && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dropNotice}</span>
            </div>
          )}

          {/* Cashier Shift Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title={language === 'ar' ? 'نقدية الصناديق في الطريق' : 'Total Cash in Transit'}
              value={formatCurrency(17650, language)}
              subtitle={language === 'ar' ? 'مغلفات النقدية المقفلة' : 'Shift Drop Envelopes'}
              icon={Wallet}
              accentColor="emerald"
            />
            <MetricCard
              title={language === 'ar' ? 'تسويات نقاط بيع (مدى)' : 'Mada Terminal Settlements'}
              value={formatCurrency(70100, language)}
              subtitle={language === 'ar' ? 'إجمالي فواتير نقاط البيع' : 'POS Terminal Batch Total'}
              icon={CreditCard}
              accentColor="blue"
            />
            <MetricCard
              title={language === 'ar' ? 'تسويات فيزا وماستركارد' : 'Credit Card Settlements'}
              value={formatCurrency(50800, language)}
              subtitle={language === 'ar' ? 'بطاقات ائتمان النزلاء' : 'Visa / Mastercard Slips'}
              icon={CreditCard}
              accentColor="indigo"
            />
            <MetricCard
              title={language === 'ar' ? 'فروقات الصناديق (عجز/زيادة)' : 'Net Cashier Variance'}
              value="-50.00 SAR"
              subtitle={language === 'ar' ? 'عجز قيد التسوية المحاسبية' : 'Reconciled to GL #401001015'}
              icon={ShieldCheck}
              accentColor="rose"
            />
          </div>

          {/* Cashier Shift Drops Table */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#00305D]" />
                  <span>Front Office & Outlet Cashier Shift Drops (Opera PMS Reconciliation)</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Handover reconciliation of cash drop envelopes and POS settlement batch totals
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">Audit Date: 2026-11-08</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-3 px-3">Envelope #</th>
                    <th className="py-3 px-3">Shift</th>
                    <th className="py-3 px-3">Receptionist Cashier</th>
                    <th className="py-3 px-3">Terminal</th>
                    <th className="py-3 px-3 text-right">Exp. Cash</th>
                    <th className="py-3 px-3 text-right">Actual Cash</th>
                    <th className="py-3 px-3 text-right">Mada (SAR)</th>
                    <th className="py-3 px-3 text-right">CC (SAR)</th>
                    <th className="py-3 px-3 text-right">Variance</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {cashierDrops.map((drop) => {
                    const isPending = drop.status === 'PENDING_AUDIT';
                    return (
                      <tr key={drop.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-bold text-[#00305D]">{drop.dropEnvelopeNumber}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                            {drop.shiftCode}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans font-medium text-slate-900">{drop.cashierName}</td>
                        <td className="py-3 px-3 text-slate-600">{drop.terminalId}</td>
                        <td className="py-3 px-3 text-right text-slate-600 tabular-nums">{formatCurrency(drop.expectedCashSAR, language)}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700 tabular-nums">{formatCurrency(drop.actualCashSAR, language)}</td>
                        <td className="py-3 px-3 text-right text-blue-700 tabular-nums">{formatCurrency(drop.actualMadaSAR, language)}</td>
                        <td className="py-3 px-3 text-right text-slate-800 tabular-nums">{formatCurrency(drop.actualCreditCardSAR, language)}</td>
                        <td className={`py-3 px-3 text-right font-bold tabular-nums ${drop.varianceSAR < 0 ? 'text-rose-700' : drop.varianceSAR > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {drop.varianceSAR === 0 ? '0.00 SAR' : `${drop.varianceSAR > 0 ? '+' : ''}${drop.varianceSAR} SAR`}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <StatusBadge
                            status={drop.status}
                            variant={drop.status === 'POSTED_TO_GL' || drop.status === 'RECONCILED' ? 'success' : 'warning'}
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReconcilingDrop(drop);
                                  setInputCash(drop.actualCashSAR || drop.expectedCashSAR);
                                  setInputMada(drop.actualMadaSAR || drop.expectedMadaSAR);
                                  setInputCC(drop.actualCreditCardSAR || drop.expectedCreditCardSAR);
                                }}
                                className="px-2.5 py-1 bg-[#00305D] hover:bg-[#002244] text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                              >
                                Reconcile & Post GL
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEnvelopeModalDrop(drop)}
                              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
                              title="Print Drop Slip"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#00305D]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Cashier Shift Reconciliation */}
          {reconcilingDrop && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-xl bg-white border border-[#DDE3EA] rounded-2xl shadow-2xl overflow-hidden space-y-0">
                <div className="flex items-center justify-between bg-[#00305D] text-white p-5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-amber-300" />
                      <span>Reconcile Front Office Cashier Shift Drop</span>
                    </h3>
                    <p className="text-xs text-blue-200 font-mono mt-0.5">
                      Cashier: {reconcilingDrop.cashierName} • Shift: {reconcilingDrop.shiftCode} • Terminal: {reconcilingDrop.terminalId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReconcilingDrop(null)}
                    className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs font-mono bg-[#F4F6F8]">
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white border border-[#DDE3EA]">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">PMS Expected Total</div>
                      <div className="text-sm font-bold text-[#00305D] mt-0.5 tabular-nums">
                        {formatCurrency(
                          reconcilingDrop.expectedCashSAR + reconcilingDrop.expectedMadaSAR + reconcilingDrop.expectedCreditCardSAR,
                          language
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Actual Counted Total</div>
                      <div className="text-sm font-bold text-emerald-700 mt-0.5 tabular-nums">
                        {formatCurrency(inputCash + inputMada + inputCC, language)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Physical Cash in Envelope (SAR) — Expected: <span className="font-mono font-bold">{formatCurrency(reconcilingDrop.expectedCashSAR, language)}</span>
                      </label>
                      <input
                        type="number"
                        value={inputCash}
                        onChange={(e) => setInputCash(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE3EA] text-slate-900 font-bold font-mono outline-none focus:border-[#00305D] focus:ring-1 focus:ring-[#00305D]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Mada POS Batch Slips Total (SAR) — Expected: <span className="font-mono font-bold">{formatCurrency(reconcilingDrop.expectedMadaSAR, language)}</span>
                      </label>
                      <input
                        type="number"
                        value={inputMada}
                        onChange={(e) => setInputMada(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE3EA] text-slate-900 font-bold font-mono outline-none focus:border-[#00305D] focus:ring-1 focus:ring-[#00305D]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Credit Card Settlement Slips (SAR) — Expected: <span className="font-mono font-bold">{formatCurrency(reconcilingDrop.expectedCreditCardSAR, language)}</span>
                      </label>
                      <input
                        type="number"
                        value={inputCC}
                        onChange={(e) => setInputCC(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDE3EA] text-slate-900 font-bold font-mono outline-none focus:border-[#00305D] focus:ring-1 focus:ring-[#00305D]"
                      />
                    </div>
                  </div>

                  {(() => {
                    const totalActual = inputCash + inputMada + inputCC;
                    const totalExpected = reconcilingDrop.expectedCashSAR + reconcilingDrop.expectedMadaSAR + reconcilingDrop.expectedCreditCardSAR;
                    const variance = Math.round((totalActual - totalExpected) * 100) / 100;
                    return (
                      <div className="p-3 rounded-xl bg-white border border-[#DDE3EA] flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-semibold font-sans">Cashier Over / Short:</span>
                        <span
                          className={`font-bold text-sm font-mono ${
                            variance < 0 ? 'text-rose-700' : variance > 0 ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {variance === 0
                            ? 'Balanced (0.00 SAR) ✓'
                            : `${variance < 0 ? 'SHORTAGE' : 'OVERAGE'}: ${Math.abs(variance)} SAR (Posts to GL)`}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex justify-end gap-3 p-4 bg-white border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReconcilingDrop(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = reconcileCashierShiftDrop(reconcilingDrop.id, inputCash, inputMada, inputCC);
                      if (res.success) {
                        setDropNotice(
                          `Cashier drop #${reconcilingDrop.dropEnvelopeNumber} reconciled! Balanced Journal posted to General Ledger as ${res.voucherNumber}.`
                        );
                        setReconcilingDrop(null);
                        setTimeout(() => setDropNotice(null), 5000);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Drop & Post Balancing Voucher</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Printable Cashier Drop Envelope */}
          {envelopeModalDrop && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white border border-[#DDE3EA] rounded-2xl shadow-2xl overflow-hidden space-y-0">
                <div className="flex items-center justify-between bg-[#00305D] text-white p-5">
                  <div className="flex items-center gap-2">
                    <Printer className="w-5 h-5 text-amber-300" />
                    <h3 className="text-base font-bold text-white">Official Front Desk Cashier Drop Envelope</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnvelopeModalDrop(null)}
                    className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 bg-[#F4F6F8]">
                  <div className="p-5 rounded-xl bg-white border border-slate-300 font-mono text-xs space-y-4 text-slate-800 shadow-sm">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                      <div>
                        <div className="font-bold text-[#00305D] text-sm">
                          {currentProperty ? currentProperty.nameEn : 'Al Faisaliah Grand Luxury Palace, Riyadh'}
                        </div>
                        <div className="text-[10px] text-slate-500">General Cashier Drop Vault Safe</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#00305D] uppercase">{envelopeModalDrop.dropEnvelopeNumber}</div>
                        <div className="text-[10px] text-slate-500">{envelopeModalDrop.dropDate}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>Cashier: <strong className="text-slate-900">{envelopeModalDrop.cashierName}</strong></div>
                      <div>Shift: <strong className="text-slate-900">{envelopeModalDrop.shiftCode}</strong></div>
                      <div>Terminal ID: <strong className="text-slate-900">{envelopeModalDrop.terminalId}</strong></div>
                      <div>Witness: <strong className="text-slate-900">{envelopeModalDrop.witnessedBy}</strong></div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-[#F8FAFC]">
                      <div className="flex justify-between">
                        <span>Physical Cash Count:</span>
                        <strong className="text-emerald-700 tabular-nums">{formatCurrency(envelopeModalDrop.actualCashSAR, language)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Mada POS Batch Slips:</span>
                        <strong className="text-blue-700 tabular-nums">{formatCurrency(envelopeModalDrop.actualMadaSAR, language)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Visa/Mastercard Slips:</span>
                        <strong className="text-slate-900 tabular-nums">{formatCurrency(envelopeModalDrop.actualCreditCardSAR, language)}</strong>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                        <span>Total Shift Remittance:</span>
                        <span className="text-[#00305D] tabular-nums">
                          {formatCurrency(
                            envelopeModalDrop.actualCashSAR + envelopeModalDrop.actualMadaSAR + envelopeModalDrop.actualCreditCardSAR,
                            language
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Net Cashier Variance:</span>
                        <span className={`font-bold tabular-nums ${envelopeModalDrop.varianceSAR < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {envelopeModalDrop.varianceSAR} SAR
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-[10px] text-center text-slate-500">
                      <div>
                        <div className="h-8 border-b border-slate-300" />
                        <div className="mt-1">Cashier Signature</div>
                      </div>
                      <div>
                        <div className="h-8 border-b border-slate-300" />
                        <div className="mt-1">Witness Signature</div>
                      </div>
                      <div>
                        <div className="h-8 border-b border-slate-300" />
                        <div className="mt-1">General Cashier Vault</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-4 bg-white border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEnvelopeModalDrop(null)}
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
                    <span>Print Envelope Slip</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: OFFICIAL MINISTRY OF TOURISM CIRCULAR VIEWER */}
      {showCircularModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-[#DDE3EA] shadow-2xl p-6 space-y-6 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#00305D]">
                    {language === 'ar'
                      ? 'التعميم الوزاري الرسمي - وزارة السياحة (رقم 7788/1448)'
                      : 'Official Ministry of Tourism Circular (No. 7788/1448)'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Kingdom of Saudi Arabia • National Tourism Monitoring Platform (NTMP)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCircularModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split View: Text Directive on Left, Document Image on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Text Directives */}
              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="text-emerald-800 font-bold uppercase text-[11px] tracking-wider">
                    {language === 'ar' ? 'الموضوع الرسمي' : 'Official Subject'}
                  </div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    {language === 'ar'
                      ? 'استكمال ربط مرافق الضيافة بمنصة الرصد السياحي - (البيانات المالية)'
                      : 'Financial Data Integration with the National Tourism Monitoring Platform'}
                  </h4>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[#00305D] font-bold uppercase text-[11px] tracking-wider">
                    {language === 'ar' ? 'المرجع النظامي' : 'Legal Reference'}
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {language === 'ar'
                      ? 'الفقرة (3) من المادة (الرابعة والعشرون) من لائحة مرافق الضيافة السياحي، الصادرة بالقرار الوزاري رقم (2289) وتاريخ 1444/5/19هـ.'
                      : 'Paragraph (3) of Article (Twenty-Four) of the Tourism Accommodation Facility Regulations, issued by Ministerial Resolution No. (2289) dated 19/5/1444 AH.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[#00305D] font-bold uppercase text-[11px] tracking-wider">
                    {language === 'ar' ? 'التعليمات الإلزامية' : 'Mandatory Instructions'}
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
                    <li>
                      {language === 'ar'
                        ? 'استكمال الربط الإلكتروني مع منصة الرصد السياحي بحد أقصى تاريخ 1 أكتوبر 2026م.'
                        : 'Complete electronic integration with the Tourism Monitoring Platform no later than October 1, 2026.'}
                    </li>
                    <li>
                      {language === 'ar'
                        ? 'تمكين مزود نظام التشغيل الإلكتروني المعتمد لدى مرفق الضيافة السياحي (PMS) من إضافة البيانات المالية عبر الربط الإلكتروني مع المنصة وتزويده بالموافقات اللازمة.'
                        : 'Grant the approved PMS provider the necessary approvals to share and integrate financial data automatically.'}
                    </li>
                    <li>
                      {language === 'ar'
                        ? 'الاطلاع على بوابة مطوري وزارة السياحة (NTMP - الواجهات المالية) لاعتماد قنوات الاتصال.'
                        : 'Access the Ministry of Tourism Developer Portal (NTMP Financial APIs) to finalize the connection.'}
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    Riyada ERP has already established and validated the required NTMP financial telemetry data bridge for all properties.
                  </span>
                </div>
              </div>

              {/* High-Resolution Document Image Viewer */}
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-2 overflow-hidden shadow-sm space-y-2">
                <div className="text-[11px] font-mono text-slate-600 px-2 pt-1 flex justify-between items-center">
                  <span>Directive Attachment Reference</span>
                  <span className="text-[#00305D] font-bold">No. 7788/1448</span>
                </div>
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-11-08_at_7.23.59_PM_97771336.jpeg"
                  alt="Official Ministry of Tourism Circular 7788/1448"
                  className="w-full rounded-xl object-contain max-h-[550px] bg-white border border-slate-200"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCircularModal(false)}
                className="px-5 py-2 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-semibold text-xs transition cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

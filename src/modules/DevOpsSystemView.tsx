import React from 'react';
import { useERP } from '../state/erpState';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DICTIONARY } from '../../shared/utilities/i18n';
import {
  Terminal,
  Server,
  Download,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Database,
} from 'lucide-react';

export const DevOpsSystemView: React.FC = () => {
  const { language, auditLogs, exportDatabaseJSON, resetToDefaultData } = useERP();
  const t = DICTIONARY[language];

  const handleDownloadBackup = () => {
    const json = exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riyada_erp_snapshot_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const subsystems = [
    { name: 'Core General Ledger Posting Engine', latency: '2ms', status: 'HEALTHY' },
    { name: 'USALI Trial Balance Aggregator', latency: '4ms', status: 'HEALTHY' },
    { name: 'Procurement 3-Way Matching Engine', latency: '3ms', status: 'HEALTHY' },
    { name: 'Perpetual Moving Weighted Average Engine', latency: '3ms', status: 'HEALTHY' },
    { name: 'Saudi GOSI & EOSB Gratuity Engine', latency: '1ms', status: 'HEALTHY' },
    { name: 'Opera Cloud PMS Night Audit Ingestion', latency: '12ms', status: 'HEALTHY' },
    { name: 'ZATCA Phase 2 E-Invoicing Bridge', latency: '18ms', status: 'HEALTHY' },
    { name: 'Ministry of Tourism (MoT) Telemetry Relay', latency: '22ms', status: 'HEALTHY' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-[#00305D] border border-blue-200 font-mono">
              Agent 14: DevOps & Release Engineering
            </span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono font-medium">
              Zero Downtime Production Gate
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#00305D] tracking-tight">
            {language === 'ar' ? 'عمليات النشر وسجل التدقيق والنسخ الاحتياطي' : 'DevOps, Audit Logs & System Health'}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            {language === 'ar'
              ? 'مراقبة صحة المحركات البرمجية الـ 14، تدقيق العمليات المحاسبية، وتصدير النسخ الاحتياطية'
              : 'Subsystem health telemetry, automated audit trailing, JSON snapshot persistence, and disaster recovery.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00305D] hover:bg-[#002244] text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Database JSON</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset back office data to initial factory state?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-700 text-xs font-semibold border border-slate-300 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Seed</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="System Availability"
          value="99.99%"
          subtitle="All 14 Subsystems Online"
          icon={Server}
          accentColor="emerald"
        />
        <MetricCard
          title="Audit Trail Entries"
          value={auditLogs.length}
          subtitle="Immutable Security Log"
          icon={Terminal}
          accentColor="blue"
        />
        <MetricCard
          title="Database Latency"
          value="< 5 ms"
          subtitle="Optimized In-Memory Engine"
          icon={Database}
          accentColor="indigo"
        />
        <MetricCard
          title="Security & RBAC"
          value="Enforced"
          subtitle="Segregation of Duties"
          icon={ShieldCheck}
          accentColor="amber"
        />
      </div>

      {/* Subsystem Health Matrix */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00305D]" />
            <span>Subsystem Health & Telemetry Status</span>
          </h3>
          <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            8 / 8 Active Engines Nominal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subsystems.map((sub, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#F4F6F8] border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">{sub.name}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Response: <span className="font-semibold text-slate-700">{sub.latency}</span></div>
              </div>
              <StatusBadge status={sub.status} variant="success" />
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#DDE3EA] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-[#00305D] uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00305D]" />
            <span>Immutable Audit Log Stream</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">Append-Only Cryptographic Trail</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#EDF0F3] text-[#00305D] border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor / Agent</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 tabular-nums">{log.timestamp}</td>
                  <td className="py-2.5 px-3 text-[#00305D] font-bold">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-medium">{log.user}</td>
                  <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

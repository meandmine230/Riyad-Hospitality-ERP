import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'emerald' | 'amber' | 'blue' | 'indigo' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'amber',
}) => {
  const iconBgClasses = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-[#00305D] border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  }[accentColor];

  return (
    <div className="p-4 rounded-xl border border-[#DDE3EA] bg-white shadow-sm hover:shadow hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-500">{title}</span>
        <div className={`p-2 rounded-lg border ${iconBgClasses}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xl lg:text-2xl font-bold tracking-tight text-[#00305D] font-mono tabular-nums">{value}</div>
        {trend && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded border ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-600 mt-1.5 font-medium">{subtitle}</p>}
    </div>
  );
};

import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, label }) => {
  let computedVariant = variant;

  if (!computedVariant) {
    const s = status.toUpperCase();
    if (s.includes('POSTED') || s.includes('MATCHED') || s.includes('SYNCED') || s.includes('OPTIMAL') || s.includes('COMPLETED') || s.includes('ACTIVE') || s.includes('FULFILLED')) {
      computedVariant = 'success';
    } else if (s.includes('PENDING') || s.includes('ACCEPTABLE') || s.includes('IN_PROGRESS') || s.includes('PARTIAL')) {
      computedVariant = 'warning';
    } else if (s.includes('DISCREPANCY') || s.includes('REJECTED') || s.includes('REVERSED') || s.includes('ALERT') || s.includes('OVER_BUDGET') || s.includes('CANCELLED')) {
      computedVariant = 'danger';
    } else if (s.includes('DRAFT') || s.includes('ISSUED') || s.includes('READY')) {
      computedVariant = 'info';
    } else {
      computedVariant = 'neutral';
    }
  }

  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-blue-50 text-[#00305D] border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[computedVariant];

  const dotStyles = {
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    info: 'bg-[#00305D]',
    neutral: 'bg-slate-500',
  }[computedVariant];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />
      <span>{label || status.replace(/_/g, ' ')}</span>
    </span>
  );
};

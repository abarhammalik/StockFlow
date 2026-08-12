import React from 'react';

const variants = {
  success:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning:  'bg-amber-50 text-amber-700 border border-amber-200',
  danger:   'bg-rose-50 text-rose-700 border border-rose-200',
  info:     'bg-sky-50 text-sky-700 border border-sky-200',
  neutral:  'bg-slate-100 text-slate-600 border border-slate-200',
  indigo:   'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
}

export function StockBadge({ status }) {
  const statusMap = {
    healthy: { label: 'Healthy Stock', variant: 'success' },
    low_stock: { label: 'Low Stock', variant: 'warning' },
    out_of_stock: { label: 'Out of Stock', variant: 'danger' },
    overstocked: { label: 'Overstocked', variant: 'indigo' },
  };
  const config = statusMap[status] || { label: status || 'Unknown', variant: 'neutral' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function MovementBadge({ type }) {
  const typeMap = {
    IN: { label: 'Stock IN', variant: 'success' },
    OUT: { label: 'Stock OUT', variant: 'danger' },
    RETURN: { label: 'Return', variant: 'indigo' },
    ADJUSTMENT: { label: 'Adjustment', variant: 'warning' },
  };
  const config = typeMap[type] || { label: type || 'Unknown', variant: 'neutral' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

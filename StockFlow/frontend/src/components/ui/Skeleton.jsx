import React from 'react';

export function SkeletonCard({ count = 1 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-slate-200 rounded"></div>
        <div className="w-9 h-9 bg-slate-100 rounded-xl"></div>
      </div>
      <div className="h-7 w-32 bg-slate-200 rounded mt-2"></div>
      <div className="h-2 w-24 bg-slate-100 rounded"></div>
    </div>
  ));
}

export const CardSkeleton = SkeletonCard;

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-11 bg-slate-50 border-b border-slate-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50">
          <div className="h-3 w-32 bg-slate-200 rounded"></div>
          <div className="h-3 w-20 bg-slate-100 rounded"></div>
          <div className="h-3 w-16 bg-slate-100 rounded ml-auto"></div>
          <div className="h-3 w-12 bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export const TableSkeleton = SkeletonTable;

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
      <div className="h-4 w-40 bg-slate-200 rounded mb-4"></div>
      <div className="h-56 bg-slate-50 rounded-xl"></div>
    </div>
  );
}

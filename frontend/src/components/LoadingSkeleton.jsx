import React from 'react';

export const FoodCardSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-cream-200 animate-pulse flex flex-col">
    <div className="h-48 bg-slate-200" />
    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="h-3 w-1/3 bg-slate-200 rounded" />
        <div className="h-5 w-3/4 bg-slate-200 rounded" />
        <div className="h-3 w-full bg-slate-200 rounded" />
        <div className="h-3 w-4/5 bg-slate-200 rounded" />
      </div>
      <div className="h-8 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse border-b border-slate-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-slate-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

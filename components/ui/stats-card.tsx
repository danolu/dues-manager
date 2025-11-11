import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isUpward: boolean;
  };
  className?: string;
}

export function StatsCard({ label, value, description, icon, trend, className = "" }: StatsCardProps) {
  return (
    <div className={`bg-card border border-line rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text/40 mb-1">{label}</p>
          <p className="text-2xl font-black text-text/90 tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="p-2 bg-accent/5 rounded-lg text-accent">
            {icon}
          </div>
        )}
      </div>
      {(description || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trend.isUpward ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"}`}>
              {trend.isUpward ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {description && <p className="text-xs text-text/50 font-medium italic">{description}</p>}
        </div>
      )}
    </div>
  );
}

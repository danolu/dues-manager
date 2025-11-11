import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50 border-2 border-dashed border-line rounded-2xl text-center">
      <div className="mb-4 text-text/20">
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/>
          </svg>
        )}
      </div>
      <h3 className="text-xl font-black text-text/80 tracking-tight italic mb-2">{title}</h3>
      <p className="max-w-xs text-sm text-text/50 font-medium italic mb-8">{description}</p>
      {action && (
        <div className="animate-in fade-in zoom-in duration-500 delay-200">
          {action}
        </div>
      )}
    </div>
  );
}

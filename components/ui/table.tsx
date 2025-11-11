import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Table({ headers, children, title, className = "" }: TableProps) {
  return (
    <div className={`bg-card border border-line rounded-xl overflow-hidden shadow-md ${className}`}>
      {title && (
        <div className="p-6 border-b border-line bg-white">
          <h2 className="text-xl font-bold italic tracking-tight text-text/80">{title}</h2>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className="p-4 text-left text-xs font-bold uppercase text-text/40 border-b border-line italic tracking-widest"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

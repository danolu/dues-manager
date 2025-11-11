import React from "react";

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  as?: React.ElementType;
  [key: string]: any;
}

export function Card({ children, className = "", title, subtitle, as = "div", ...props }: CardProps) {
  const Component = as;
  return (
    <Component className={`bg-card border border-line rounded-xl p-6 mb-6 shadow-sm ${className}`} {...props}>
      {title && <h2 className="text-xl font-bold mb-2 italic tracking-tight">{title}</h2>}
      {subtitle && <p className="text-sm text-text/60 mb-6 italic font-medium tracking-wide uppercase">{subtitle}</p>}
      {children}
    </Component>
  );
}

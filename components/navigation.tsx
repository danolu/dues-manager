"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isAdminOnly?: boolean;
}

export function Navigation({ user }: { user: { email: string; isAdmin: boolean } }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/payments", label: "Payments" },
    { href: "/settings", label: "Settings" },
    { href: "/users", label: "Users" },
    { href: "/reports", label: "Reports", adminOnly: true },
    { href: "/verify-email", label: "Verify Email" },
  ];

  return (
    <div className="bg-card border border-line rounded-xl p-3 mb-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-1 items-center">
          {links.map((link) => {
            if (link.adminOnly && !user.isAdmin) return null;
            
            const isActive = pathname === link.href;
            
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-accent text-white shadow-sm" 
                    : "text-text/60 hover:text-accent hover:bg-accent/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-6 px-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text/40">Authenticated as</span>
            <span className="text-sm font-black text-text/80">{user.email}</span>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

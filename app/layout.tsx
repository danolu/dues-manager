import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proxy",
  description: "Proxy web application powered by Next.js and Prisma"
};

import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-text bg-background">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

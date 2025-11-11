"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button 
      className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-red-600 transition-colors shadow-sm"
      onClick={logout}
    >
      Logout
    </button>
  );
}

"use client";

import { useState } from "react";

export function VerifyEmailPanel() {
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    setMessage(null);

    const response = await fetch("/api/auth/email/verification/resend", {
      method: "POST"
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Unable to send verification link");
      return;
    }

    setMessage(payload.message ?? "Verification link sent.");
  }

  return (
    <div className="bg-card border border-line rounded-xl p-10 shadow-lg max-w-lg mx-auto text-center mt-12">
      <h1 className="text-3xl font-extrabold mb-4 italic text-accent">Verify Email</h1>
      <p className="text-text/60 mb-8 italic font-medium">Your email address is not verified yet. Please check your inbox or resend the link.</p>
      <button 
        className="bg-accent text-white rounded-lg px-8 py-3 text-sm font-bold hover:bg-accent/90 transition-colors shadow-md"
        onClick={resend}
      >
        Resend Verification Link
      </button>
      {message ? <p className="mt-8 p-3 bg-blue-50 text-accent text-sm rounded-lg italic font-bold">{message}</p> : null}
    </div>
  );
}

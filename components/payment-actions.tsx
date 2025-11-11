"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Props = {
  duePaid: boolean;
  dueAmount: string;
};

export function PaymentActions({ duePaid, dueAmount }: Props) {
  const { toast } = useToast();
  const [reference, setReference] = useState("");

  async function submitReference(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const res = await fetch(`/api/dues/handle-payment/${reference}`);
    const data = await res.json();

    if (res.ok) {
      toast("Payment verified and recorded!", "success");
      setReference("");
    } else {
      toast(data.error || "Verification failed", "error");
    }
  }

  async function getReceipt() {
    const res = await fetch("/api/dues/user-receipt?format=json");
    const data = await res.json();

    if (res.ok) {
      alert(JSON.stringify(data.receipt, null, 2));
    } else {
      toast(data.error || "Failed to fetch receipt", "error");
    }
  }

  return (
    <Card title="Dues Payment" className="p-8 shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-semibold tracking-wide uppercase text-text/40">Expected Amount</p>
        <p className="text-lg font-bold text-text/80">{dueAmount}</p>
        <p className="text-sm font-semibold tracking-wide uppercase text-text/40">Status</p>
        <p className={`text-lg font-bold ${duePaid ? "text-green-600" : "text-amber-500"}`}>
          {duePaid ? "Paid" : "Not paid"}
        </p>
      </div>

      <form className="flex flex-col sm:flex-row gap-3 mb-8" onSubmit={submitReference}>
        <input
          className="flex-1 border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-mono"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="Paystack reference"
          required
        />
        <Button 
          type="submit"
        >
          Verify & Record
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-line">
        <Button 
          variant="secondary"
          size="sm"
          onClick={getReceipt}
        >
          Get Receipt JSON
        </Button>
        <a 
          href="/api/dues/user-receipt" 
          className="bg-accent/10 text-accent rounded-lg px-4 py-2 text-xs font-bold hover:bg-accent/20 transition-colors"
        >
          Download Receipt PDF
        </a>
      </div>
    </Card>
  );
}

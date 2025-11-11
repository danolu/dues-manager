"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateSettingSchema } from "@/lib/validators";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const settingsFormSchema = updateSettingSchema.pick({
  tenure: true,
  name: true,
  dueAmount: true,
  isRegistrationOpen: true
});

type SettingsData = z.infer<typeof settingsFormSchema>;

type Props = {
  initial: {
    tenure: string;
    name: string;
    dueAmount: string;
    isRegistrationOpen: boolean;
  } | null;
};

export function SettingsForm({ initial }: Props) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<SettingsData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      tenure: initial?.tenure ?? "",
      name: initial?.name ?? "",
      dueAmount: Number(initial?.dueAmount ?? 0),
      isRegistrationOpen: initial?.isRegistrationOpen ?? false
    }
  });

  async function onSubmit(values: SettingsData) {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = await response.json();
      setError("root", { message: payload.error ?? "Unable to save settings" });
      return;
    }

    toast("Settings updated successfully", "success");
  }

  return (
    <Card as="form" title="Settings" onSubmit={handleSubmit(onSubmit)} className="mb-6">
      <div className="flex flex-wrap gap-4 mb-4">
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" placeholder="Tenure" {...register("tenure")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" placeholder="Proxy Name" {...register("name")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" type="number" step="0.01" placeholder="Due Amount" {...register("dueAmount", { valueAsNumber: true })} />
      </div>
      <label className="flex items-center gap-2 mb-6 text-sm font-medium cursor-pointer">
        <input className="w-4 h-4 text-accent border-line rounded focus:ring-accent" type="checkbox" {...register("isRegistrationOpen")} />
        Registration Open
      </label>
      <div>
        <Button 
          isLoading={isSubmitting} 
          type="submit"
        >
          Save Settings
        </Button>
      </div>
      {errors.root ? <p className="text-red-500 text-sm mt-4 italic">{errors.root.message}</p> : null}
      <div className="mt-2 space-y-1">
        {Object.values(errors)
          .filter((error) => error?.message && error !== errors.root)
          .map((error, index) => (
            <p key={index} className="text-red-500 text-xs italic">{error?.message}</p>
          ))}
      </div>
    </Card>
  );
}

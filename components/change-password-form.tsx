"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { changePasswordSchema } from "@/lib/validators";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: ChangePasswordData) {
    const response = await fetch("/api/users/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = await response.json();
      setError("root", { message: payload.error ?? "Unable to change password" });
      return;
    }

    reset();
  }

  return (
    <Card as="form" title="Change Password" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap gap-4 items-end">
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans" type="password" placeholder="Current Password" {...register("currentPassword")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans" type="password" placeholder="New Password" {...register("password")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans" type="password" placeholder="Confirm Password" {...register("confirmPassword")} />
        <Button 
          isLoading={isSubmitting} 
          type="submit"
          className="h-[38px]"
        >
          Change Password
        </Button>
      </div>
      {errors.root ? <p className="text-red-500 text-sm mt-4 italic text-center">{errors.root.message}</p> : null}
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

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateProfileSchema } from "@/lib/validators";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Props = {
  phone: string;
};

type ProfileData = z.infer<typeof updateProfileSchema>;

export function ProfileForm({ phone }: Props) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<ProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      phone
    }
  });

  async function onSubmit(values: ProfileData) {
    const response = await fetch("/api/users/self", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (response.ok) {
      toast("Profile updated successfully", "success");
    } else {
      const payload = await response.json();
      setError("root", { message: payload.error ?? "Unable to update profile" });
      return;
    }
  }

  return (
    <Card as="form" title="Update Profile" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-text/60 uppercase">Phone</label>
          <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans" placeholder="Phone" {...register("phone")} />
        </div>
        <Button 
          isLoading={isSubmitting} 
          type="submit"
          className="h-[38px]"
        >
          Save Profile
        </Button>
      </div>
      {errors.phone ? <p className="text-red-500 text-xs mt-1 italic">{errors.phone.message}</p> : null}
      {errors.root ? <p className="text-red-500 text-sm mt-4 italic">{errors.root.message}</p> : null}
    </Card>
  );
}

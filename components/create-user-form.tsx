"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createUserSchema } from "@/lib/validators";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CreateUserData = z.infer<typeof createUserSchema>;

export function CreateUserForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError
  } = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "",
      userId: 0,
      password: "",
      level: null,
      phone: "",
      isAdmin: false
    }
  });

  async function onSubmit(values: CreateUserData) {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = await response.json();
      setError("root", { message: payload.error ?? "Unable to create user" });
      return;
    }

    reset();
  }

  return (
    <Card as="form" title="Create User" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap gap-4 mb-6">
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans" placeholder="Name" {...register("name")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans" type="email" placeholder="Email" {...register("email")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans" type="number" placeholder="User ID" {...register("userId", { valueAsNumber: true })} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans" placeholder="Category" {...register("category")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans" type="password" placeholder="Password" {...register("password")} />
      </div>
      <Button 
        isLoading={isSubmitting} 
        type="submit"
      >
        Create User
      </Button>
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

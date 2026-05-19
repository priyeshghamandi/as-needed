"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerCareAction } from "@/actions/signup/register-care";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { Icon } from "@/components/primitives";
import {
  consumerCareSignupSchema,
  type ConsumerCareSignupInput,
} from "@/lib/validations/consumer-care-signup";

const INPUT_CLASS =
  "w-full h-11 px-3.5 rounded-lg border border-ink-200 bg-white text-[14px] tracking-tight placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition";

export function ConsumerCareSignupForm({ callbackUrl }: { callbackUrl?: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerCareSignupInput>({
    resolver: zodResolver(consumerCareSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      careSiteName: "",
      location: undefined,
      acceptedTerms: undefined,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await registerCareAction(
      values,
      callbackUrl ?? "/marketplace",
    );
    if (result.status === "error") {
      setFormError(result.message);
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (message) {
            setError(field as keyof ConsumerCareSignupInput, { message });
          }
        }
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-lg">
      <div className="rounded-lg border border-teal-200 bg-teal-50/60 px-4 py-3 text-[13px] text-teal-900 leading-relaxed">
        Care is coordinated by licensed staffing agencies — not direct hire through AsNeeded.
      </div>

      {formError ? (
        <p className="text-[13px] text-rose-700" role="alert">
          {formError}
        </p>
      ) : null}

      <label className="block">
        <span className="text-[12px] font-medium text-ink-800">Your name</span>
        <input {...register("name")} className={`mt-1.5 ${INPUT_CLASS}`} autoComplete="name" />
        {errors.name ? (
          <p className="mt-1 text-[11px] text-rose-600">{errors.name.message}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="text-[12px] font-medium text-ink-800">Email</span>
        <input
          {...register("email")}
          type="email"
          className={`mt-1.5 ${INPUT_CLASS}`}
          autoComplete="email"
        />
        {errors.email ? (
          <p className="mt-1 text-[11px] text-rose-600">{errors.email.message}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="text-[12px] font-medium text-ink-800">Password</span>
        <input
          {...register("password")}
          type="password"
          className={`mt-1.5 ${INPUT_CLASS}`}
          autoComplete="new-password"
        />
        {errors.password ? (
          <p className="mt-1 text-[11px] text-rose-600">{errors.password.message}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="text-[12px] font-medium text-ink-800">Phone (optional)</span>
        <input {...register("phone")} type="tel" className={`mt-1.5 ${INPUT_CLASS}`} />
      </label>

      <div>
        <span className="text-[12px] font-medium text-ink-800">Home address</span>
        <div className="mt-1.5">
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <LocationAutocomplete
                value={field.value ?? null}
                onChange={field.onChange}
                placeholder="Search for your home address"
              />
            )}
          />
        </div>
        {errors.location ? (
          <p className="mt-1 text-[11px] text-rose-600">
            {typeof errors.location.message === "string"
              ? errors.location.message
              : "Select a valid address"}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-[13px] text-ink-700">
        <input type="checkbox" {...register("acceptedTerms")} className="mt-1" />
        <span>I agree to the terms and understand staffing is agency-mediated.</span>
      </label>
      {errors.acceptedTerms ? (
        <p className="text-[11px] text-rose-600">{errors.acceptedTerms.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-full font-medium h-11 px-6 text-[14px] bg-ink-900 text-paper hover:bg-ink-800 disabled:opacity-60"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
        <Icon name="arrow-right" className="w-4 h-4" />
      </button>

      <p className="text-[13px] text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-800 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

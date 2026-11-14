"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  customerRegisterSchema,
  type CustomerRegisterFormValues,
} from "@/modules/customer/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { getErrorMessage } from "@/services/api/errors";

function CustomerRegisterForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const { customerRegister, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerRegisterFormValues>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const passwordVal = watch("password", "");

  // Password requirement checklists
  const rules = [
    { label: "At least 8 characters", valid: passwordVal.length >= 8 },
    { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordVal) },
    { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(passwordVal) },
    { label: "One number (0-9)", valid: /[0-9]/.test(passwordVal) },
    {
      label: "One special character (!@#$...)",
      valid: /[^A-Za-z0-9]/.test(passwordVal),
    },
  ];

  const onSubmit = async (values: CustomerRegisterFormValues) => {
    setFormError(null);
    try {
      await customerRegister(
        {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phone: values.phone?.trim() ? values.phone.trim() : undefined,
        },
        returnUrl
      );
    } catch (err: unknown) {
      setFormError(getErrorMessage(err));
    }
  };

  const isPending = isLoading || isSubmitting;

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow">
              AC
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground">
              Asli<span className="text-primary">Cart</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            Join thousands of smart shoppers discovering verified discounts.
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              Create Your Free Account
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Get personalized price drop alerts, save deals, and track savings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Form Error Banner */}
            {formError && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className="pl-9 text-sm"
                    disabled={isPending}
                    {...register("fullName")}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="register-email" className="text-xs font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="pl-9 text-sm"
                    disabled={isPending}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone" className="text-xs font-medium">
                    Phone Number (Optional)
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    For WhatsApp deal alerts
                  </span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. 9876543210"
                    className="pl-9 text-sm"
                    disabled={isPending}
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="register-password" className="text-xs font-medium">
                  Create Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Strong password required"
                    className="pl-9 pr-10 text-sm"
                    disabled={isPending}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-medium text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Password Complexity Checklist */}
              <div className="rounded-lg bg-secondary/50 p-3 space-y-1.5 text-[11px]">
                <p className="font-semibold text-muted-foreground">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {rules.map((rule) => (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-1.5 ${
                        rule.valid ? "text-emerald-600 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 shrink-0 ${
                          rule.valid ? "text-emerald-600" : "text-muted-foreground/50"
                        }`}
                      />
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full gap-2 font-semibold shadow"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 border-t border-border pt-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/customer/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in here
                </Link>
              </p>
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-12 text-center text-sm">
          Loading registration...
        </div>
      }
    >
      <CustomerRegisterForm />
    </Suspense>
  );
}


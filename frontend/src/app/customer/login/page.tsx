"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  customerLoginSchema,
  type CustomerLoginFormValues,
} from "@/modules/customer/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { getErrorMessage } from "@/services/api/errors";

function CustomerLoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const { customerLogin, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerLoginFormValues>({
    resolver: zodResolver(customerLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: CustomerLoginFormValues) => {
    setFormError(null);
    try {
      await customerLogin(values, returnUrl);
    } catch (err: unknown) {
      setFormError(getErrorMessage(err));
    }
  };

  const isPending = isLoading || isSubmitting;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
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
            Sign in to access your deal wishlist, alerts, and savings dashboard.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              Customer Sign In
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your credentials to manage your genuine discount alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error banner */}
            {formError && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="customer-email" className="text-xs font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer-email"
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

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="customer-password" className="text-xs font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customer-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gap-2 font-semibold shadow"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </Button>
            </form>

            {/* Registration link */}
            <div className="mt-6 border-t border-border pt-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/customer/register"
                  className="font-semibold text-primary hover:underline"
                >
                  Create one now
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

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-12 text-center text-sm">
          Loading sign in...
        </div>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  );
}


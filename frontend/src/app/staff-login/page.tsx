"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  staffLoginSchema,
  type StaffLoginFormValues,
} from "@/modules/admin/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/services/api/errors";

function StaffLoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const { staffLogin, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffLoginFormValues>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: StaffLoginFormValues) => {
    setFormError(null);
    try {
      await staffLogin(values, returnUrl);
    } catch (err: unknown) {
      setFormError(getErrorMessage(err));
    }
  };

  const isPending = isLoading || isSubmitting;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand identity */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow">
              AC
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground">
              Asli<span className="text-primary">Cart</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Staff Administrative Gateway</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              Sign In to Staff Portal
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Authorized access for Super Admins, Product Managers, and Staff members.
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
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Staff Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@aslicart.com"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your staff password"
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
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Sign In as Staff</span>
                )}
              </Button>
            </form>

            {/* Back link */}
            <div className="mt-6 border-t border-border pt-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Public Shopping Site</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-12 text-center text-sm">
          Loading staff portal...
        </div>
      }
    >
      <StaffLoginForm />
    </Suspense>
  );
}


import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Sparkles, Loader2, ArrowRight } from "lucide-react";
import {
  calculateDiscountSchema,
  type CalculateDiscountValues,
} from "../validators";
import type { PriceCalculationResult } from "../types";

interface DiscountCalculatorCardProps {
  onCalculate: (data: { originalPrice: number; sellingPrice: number }) => Promise<PriceCalculationResult>;
  isCalculating: boolean;
  result: PriceCalculationResult | null;
}

export function DiscountCalculatorCard({
  onCalculate,
  isCalculating,
  result,
}: DiscountCalculatorCardProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CalculateDiscountValues>({
    resolver: zodResolver(calculateDiscountSchema),
    defaultValues: {
      originalPrice: 1000,
      sellingPrice: 750,
    },
  });

  const onSubmit = async (data: CalculateDiscountValues) => {
    await onCalculate({
      originalPrice: Number(data.originalPrice),
      sellingPrice: Number(data.sellingPrice),
    });
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <span>Asli Discount & Margin Verifier</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Verify merchant discounts using the backend pricing algorithm to eliminate fake MRP inflation tricks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <Label htmlFor="originalPrice" className="text-xs font-semibold">
                Original Price / MRP (₹) *
              </Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                placeholder="e.g. 2999"
                {...register("originalPrice")}
                className="h-8 text-xs font-mono"
              />
              {errors.originalPrice && (
                <p className="text-[11px] text-destructive">{errors.originalPrice.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sellingPrice" className="text-xs font-semibold">
                Merchant Selling Price (₹) *
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                placeholder="e.g. 1999"
                {...register("sellingPrice")}
                className="h-8 text-xs font-mono"
              />
              {errors.sellingPrice && (
                <p className="text-[11px] text-destructive">{errors.sellingPrice.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" size="sm" disabled={isCalculating} className="h-8 text-xs gap-1.5">
            {isCalculating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>Calculate Honest Discount</span>
          </Button>

          {result && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Verified Discount Result
                </span>
                <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                  {result.discountPercentage}% OFF
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="rounded-lg bg-background/80 p-2 border">
                  <span className="text-[11px] text-muted-foreground block">MRP</span>
                  <span className="font-bold text-foreground">
                    ₹{result.originalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="rounded-lg bg-background/80 p-2 border">
                  <span className="text-[11px] text-muted-foreground block">Selling</span>
                  <span className="font-bold text-foreground">
                    ₹{result.sellingPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="rounded-lg bg-background/80 p-2 border">
                  <span className="text-[11px] text-muted-foreground block">Net Savings</span>
                  <span className="font-bold text-emerald-600">
                    ₹{result.savings.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="rounded-lg bg-background/80 p-2 border">
                  <span className="text-[11px] text-muted-foreground block">Honesty Metric</span>
                  <span className="font-bold text-primary">Verified</span>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}


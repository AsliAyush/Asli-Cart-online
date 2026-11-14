import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Copy, Check, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  convertAffiliateSchema,
  type ConvertAffiliateFormValues,
} from "../validators";
import { usePMAffiliate } from "../hooks/use-pm-affiliate";

interface LinkConverterCardProps {
  initialUrl?: string;
  offerId?: string;
}

export function LinkConverterCard({ initialUrl, offerId }: LinkConverterCardProps) {
  const { convertUrl, isConverting, lastConverted } = usePMAffiliate();
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConvertAffiliateFormValues>({
    resolver: zodResolver(convertAffiliateSchema),
    defaultValues: {
      originalUrl: initialUrl || "",
      offerId: offerId || "",
      subId1: "pm_portal",
    },
  });

  const onConvert = async (data: ConvertAffiliateFormValues) => {
    await convertUrl({
      originalUrl: data.originalUrl.trim(),
      offerId: data.offerId || undefined,
      subId1: data.subId1 || undefined,
      subId2: data.subId2 || undefined,
    });
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Affiliate link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <span>Affiliate Link Generator & Converter</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Convert raw merchant store URLs into tracked affiliate links via the secure backend Cuelinks engine.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onConvert)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="conv-url" className="text-xs font-semibold">
              Original Merchant URL *
            </Label>
            <div className="flex gap-2">
              <Input
                id="conv-url"
                placeholder="https://www.amazon.in/dp/B09XS7JWHH or flipkart / myntra URL..."
                {...register("originalUrl")}
                className="h-8 text-xs flex-1"
              />
              <Button type="submit" size="sm" disabled={isConverting} className="h-8 text-xs gap-1.5 shrink-0">
                {isConverting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Generate Affiliate Link</span>
              </Button>
            </div>
            {errors.originalUrl && (
              <p className="text-[11px] text-destructive">{errors.originalUrl.message}</p>
            )}
          </div>
        </form>

        {lastConverted && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Generated Affiliate Deep Link</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px]">
                  Provider: {lastConverted.provider}
                </Badge>
                <Badge variant="deal" className="text-[10px]">
                  {lastConverted.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-background p-2 rounded-lg border font-mono text-[11px] break-all">
              <span className="flex-1 truncate text-foreground">{lastConverted.affiliateUrl}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(lastConverted.affiliateUrl)}
                className="h-7 w-7 shrink-0"
                title="Copy link"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <a
                href={lastConverted.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-muted-foreground hover:text-foreground shrink-0"
                title="Test destination redirect"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


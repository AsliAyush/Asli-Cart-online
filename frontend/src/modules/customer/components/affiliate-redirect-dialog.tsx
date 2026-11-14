"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMerchantRedirect } from "../hooks/use-customer-cart";

interface AffiliateRedirectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: {
    id: string;
    title: string;
    sellingPrice: number;
    merchant: {
      name: string;
      logoUrl?: string | null;
      websiteUrl?: string;
    };
  } | null;
}

export function AffiliateRedirectDialog({
  open,
  onOpenChange,
  offer,
}: AffiliateRedirectDialogProps) {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";
  const redirectMutation = useMerchantRedirect();

  if (!offer) return null;

  const handleProceed = async () => {
    try {
      const result = await redirectMutation.mutateAsync({
        offerId: offer.id,
        source: "product_details",
      });

      if (result.destinationUrl) {
        window.open(result.destinationUrl, "_blank", "noopener,noreferrer");
        onOpenChange(false);
      }
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>Redirecting to {offer.merchant.name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Asli Cart partners with certified Indian merchants. You are about to visit the official merchant website.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Offer Summary Box */}
          <div className="rounded-xl border border-border/70 bg-secondary/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase">
                {offer.merchant.name}
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                Verified Merchant Deal
              </Badge>
            </div>
            <p className="text-xs font-medium text-foreground line-clamp-2">
              {offer.title}
            </p>
            <div className="text-base font-bold text-foreground">
              {formatCurrency(offer.sellingPrice)}
            </div>
          </div>

          {/* Business Model Explanation */}
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted-foreground leading-relaxed">
            <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block">
                Separate Retailer Checkout
              </span>
              Asli Cart does not process checkout or payments. You will complete your transaction directly on {offer.merchant.name}&apos;s secure platform.
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={redirectMutation.isPending}
          >
            Cancel
          </Button>

          {isCustomer ? (
            <Button
              size="sm"
              onClick={handleProceed}
              disabled={redirectMutation.isPending}
              className="gap-2 font-semibold"
            >
              {redirectMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Continue to {offer.merchant.name}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          ) : (
            <Button size="sm" asChild className="gap-2">
              <Link href={`/customer/login?returnUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}>
                <span>Sign In to Continue</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


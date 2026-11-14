import React from "react";
import { StorefrontLayout, StorefrontBreadcrumbs } from "@/components/layout/storefront";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <StorefrontLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl space-y-6">
        <StorefrontBreadcrumbs />

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Terms & Conditions
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Platform terms of service and affiliate commerce disclaimer.
          </p>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">Terms of Service</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Placeholder terms of service (Phase 3 Layouts).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <p>
              Asli Cart is an independent deal discovery and price intelligence platform. All merchant trademarks,
              logos, and brand names are property of their respective owners. Product prices and availability are
              accurate as of the date/time indicated and are subject to real-time merchant fluctuations.
            </p>
            <p>
              Asli Cart does not directly fulfill orders or process merchant payments. Transactions are completed
              directly on merchant websites.
            </p>
          </CardContent>
        </Card>
      </div>
    </StorefrontLayout>
  );
}


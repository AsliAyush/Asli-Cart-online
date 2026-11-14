import React from "react";
import { StorefrontLayout, StorefrontBreadcrumbs } from "@/components/layout/storefront";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <StorefrontLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-4xl space-y-6">
        <StorefrontBreadcrumbs />

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Information regarding how Asli Cart handles customer data and affiliate links.
          </p>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-lg">Data Privacy & Protection</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Placeholder privacy statement (Phase 3 Layouts).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <p>
              Asli Cart Technologies Pvt. Ltd. prioritizes user privacy. When you browse deals on our platform,
              we do not sell your personal information. Any data collected during customer registration is strictly
              utilized for account authentication and user-requested price drop notifications.
            </p>
            <p>
              When navigating from Asli Cart to third-party merchant platforms (such as Amazon India, Flipkart, etc.),
              outbound affiliate tracking codes are appended to attribute qualifying purchases. Please review the
              privacy statements of external merchants when completing transactions.
            </p>
          </CardContent>
        </Card>
      </div>
    </StorefrontLayout>
  );
}


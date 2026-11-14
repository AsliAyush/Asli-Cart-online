import React from "react";
import { StorefrontHeader } from "./storefront-header";
import { StorefrontFooter } from "./storefront-footer";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}


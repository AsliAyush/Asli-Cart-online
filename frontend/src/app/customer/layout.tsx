import React from "react";
import { StorefrontLayout } from "@/components/layout/storefront";

export default function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}


import React from "react";
import { StaffLayout } from "@/components/layout/staff";

export default function ProductManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffLayout allowedRoles={["PRODUCT_MANAGER", "SUPER_ADMIN"]}>
      {children}
    </StaffLayout>
  );
}

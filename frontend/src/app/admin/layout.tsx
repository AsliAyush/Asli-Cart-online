import React from "react";
import { StaffLayout } from "@/components/layout/staff";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout allowedRoles={["SUPER_ADMIN"]}>{children}</StaffLayout>;
}


import React from "react";
import { StaffLayout } from "@/components/layout/staff";

export default function SocialMediaManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffLayout allowedRoles={["SOCIAL_MEDIA_MANAGER"]}>{children}</StaffLayout>
  );
}


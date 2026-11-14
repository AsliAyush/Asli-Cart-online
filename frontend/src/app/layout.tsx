import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/providers";

export const metadata: Metadata = {
  title: "Asli Cart — Genuine Deals & Honest Discounts",
  description:
    "Discover verified price drops, genuine merchant discounts, and transparent affiliate savings across India's top online stores.",
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

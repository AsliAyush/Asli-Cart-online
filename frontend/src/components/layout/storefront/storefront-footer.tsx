import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Heart, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function StorefrontFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
                AC
              </div>
              <span className="text-xl font-bold tracking-tight">
                Asli<span className="text-primary">Cart</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              India&apos;s transparent discovery platform for authentic online deals and verified price drops. No fake discounts, no inflated MRPs.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>100% Genuine Merchant Links</span>
            </div>
          </div>

          {/* Shopping Navigation */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Shop & Discover
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/offers" className="hover:text-foreground transition-colors">
                  Today&apos;s Verified Deals
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  Products Catalog
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  Browse by Category
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">
                  Price History Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Account & Contact Placeholder */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Customer Account & Support
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/customer/dashboard" className="hover:text-foreground transition-colors">
                  Savings Dashboard
                </Link>
              </li>
              <li>
                <Link href="/customer/profile" className="hover:text-foreground transition-colors">
                  Account Profile
                </Link>
              </li>
              <li>
                <Link href="/customer/wishlist" className="hover:text-foreground transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li className="pt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>support@aslicart.com</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </li>
            </ul>
          </div>

          {/* Affiliate Disclosure & Legal Placeholders */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Trust & Transparency
            </h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Asli Cart is an affiliate commerce discovery platform. When you make purchases through links on our site, we may earn an affiliate commission at no extra cost to you.
            </p>
            <div className="flex flex-col space-y-1.5 pt-1 text-xs">
              <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy (Placeholder)
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service (Placeholder)
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {currentYear} Asli Cart Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with honesty</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500 inline" />
            <span>for smart Indian shoppers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
                AC
              </div>
              <span className="text-xl font-bold tracking-tight">
                Asli<span className="text-primary">Cart</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curating 100% genuine, authentic deals and verified discounts across top Indian online stores. No inflated MRPs, no deceptive fake discounts.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Merchant Feeds</span>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Popular Categories
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="#deals" className="hover:text-foreground">Electronics & Gadgets</Link></li>
              <li><Link href="#deals" className="hover:text-foreground">Laptops & Accessories</Link></li>
              <li><Link href="#deals" className="hover:text-foreground">Smartphones & Wearables</Link></li>
              <li><Link href="#deals" className="hover:text-foreground">Home & Kitchen Essentials</Link></li>
              <li><Link href="#deals" className="hover:text-foreground">Fashion & Footwear</Link></li>
            </ul>
          </div>

          {/* Platform / Portals */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Platform & Ecosystem
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground">How Verification Works</Link></li>
              <li><Link href="#portals" className="hover:text-foreground">Admin Portal (Staff)</Link></li>
              <li><Link href="#portals" className="hover:text-foreground">Product Manager Portal</Link></li>
              <li><Link href="#portals" className="hover:text-foreground">Social Media Manager Hub</Link></li>
              <li><Link href="#portals" className="hover:text-foreground">API Health & Architecture</Link></li>
            </ul>
          </div>

          {/* Affiliate Disclosure & Trust */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Trust & Transparency
            </h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Asli Cart is an affiliate commerce discovery platform. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Zero Sponsored Bias</span>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {currentYear} Asli Cart Technologies. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision & integrity</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500 inline" />
            <span>for Indian smart shoppers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


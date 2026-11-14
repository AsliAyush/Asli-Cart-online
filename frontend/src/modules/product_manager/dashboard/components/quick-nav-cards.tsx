import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Compass, Package, TrendingDown, Tag, ArrowRight } from "lucide-react";

export function QuickNavCards() {
  const links = [
    {
      title: "Product Discovery",
      description: "Search discovered products and import directly into catalog",
      href: "/product-manager/discovery",
      icon: Compass,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      title: "Product Catalog",
      description: "Create, curate, edit specifications and assign SMM broadcast",
      href: "/product-manager/products",
      icon: Package,
      color: "text-purple-600 bg-purple-500/10",
    },
    {
      title: "Pricing Management",
      description: "Calculate honest discounts and verify historical price trends",
      href: "/product-manager/pricing",
      icon: TrendingDown,
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      title: "Merchant Offers",
      description: "Manage deals, submit for approval, and convert affiliate links",
      href: "/product-manager/offers",
      icon: Tag,
      color: "text-emerald-600 bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {links.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link key={index} href={item.href} className="group block">
            <Card className="h-full border-border group-hover:border-primary transition-all duration-200 group-hover:shadow-sm">
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div className="space-y-2">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center text-xs font-medium text-primary gap-1 pt-1">
                  <span>Open</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}


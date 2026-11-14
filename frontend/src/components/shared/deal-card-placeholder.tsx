import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Tag, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface DealPlaceholderProps {
  id: string;
  title: string;
  category: string;
  store: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  verified: boolean;
}

export function DealCardPlaceholder({
  title,
  category,
  store,
  originalPrice,
  dealPrice,
  discountPercentage,
  verified,
}: DealPlaceholderProps) {
  return (
    <Card className="group flex flex-col justify-between overflow-hidden border-border/80 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <span>{store}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-2">
        {/* Placeholder Thumbnail Box */}
        <div className="relative flex aspect-video w-full items-center justify-center rounded-lg bg-secondary/70 p-4 transition-colors group-hover:bg-secondary">
          <span className="text-xs font-medium text-muted-foreground">
            {store} • Verified Offer
          </span>
          {discountPercentage > 0 && (
            <Badge
              variant="discount"
              className="absolute right-2 top-2 shadow-sm"
            >
              {discountPercentage}% OFF
            </Badge>
          )}
          {verified && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 shadow-sm">
              <ShieldCheck className="h-3 w-3" />
              <span>Asli Verified</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary">
          {title}
        </h4>

        {/* Pricing block */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(dealPrice)}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            {formatCurrency(originalPrice)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button variant="default" size="sm" className="w-full gap-1.5 font-medium">
          <span>View Deal</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}


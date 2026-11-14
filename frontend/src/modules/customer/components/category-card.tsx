"use client";

import React from "react";
import Link from "next/link";
import { Grid, ArrowRight, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CustomerCategoryItem } from "../types";

interface CategoryCardProps {
  category: CustomerCategoryItem;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const categoryUrl = `/products?category=${category.slug || category.id}`;
  const productCount = category._count?.products || 0;

  return (
    <Link href={categoryUrl} className="group block">
      <Card className="h-full border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
        <CardContent className="p-0 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
              <Grid className="h-6 w-6" />
            </div>

            <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
              {productCount} {productCount === 1 ? "Product" : "Products"}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
              <span>{category.name}</span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
            </h3>
            {category.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StorefrontSearchProps {
  className?: string;
  placeholder?: string;
}

export function StorefrontSearch({
  className,
  placeholder = "Search genuine deals, electronics, laptops...",
}: StorefrontSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full max-w-md", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 pr-4 h-9 bg-secondary/50 border-input text-xs focus-visible:bg-background transition-colors"
      />
    </form>
  );
}

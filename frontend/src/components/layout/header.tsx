import React from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="flex flex-col w-full">
      {/* Top Value Strip */}
      <div className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        <span>
          Welcome to Asli Cart — India&apos;s transparent discovery platform for genuine deals & verified discounts.
        </span>
      </div>
      <Navbar />
    </header>
  );
}


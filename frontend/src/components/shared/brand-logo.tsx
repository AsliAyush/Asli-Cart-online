import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  href?: string | null;
  priority?: boolean;
}

export function BrandLogo({
  className,
  size = "md",
  showText = true,
  subtitle,
  href = "/",
  priority = false,
}: BrandLogoProps) {
  const iconDimensions = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-11 w-11 rounded-xl",
    xl: "h-14 w-14 rounded-2xl",
  };

  const imagePixelSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const logoElement = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-slate-950 border border-slate-800/80 shadow-sm",
          iconDimensions[size]
        )}
      >
        <Image
          src="/logo/aslicart-icon.png"
          alt="Asli Cart Logo"
          width={imagePixelSizes[size]}
          height={imagePixelSizes[size]}
          className="h-full w-full object-cover"
          priority={priority}
        />
      </div>
      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "font-extrabold tracking-tight leading-none text-foreground",
              textSizes[size]
            )}
          >
            Asli<span className="text-primary">Cart</span>
          </span>
          {subtitle && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}

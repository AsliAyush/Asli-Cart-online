import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, RotateCcw } from "lucide-react";

interface DiscoveryEmptyStateProps {
  onReset: () => void;
  keyword?: string;
}

export function DiscoveryEmptyState({ onReset, keyword }: DiscoveryEmptyStateProps) {
  return (
    <Card className="border-border text-center py-16 px-4">
      <CardContent className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <Compass className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-base text-foreground">
          No Discovered Products Found
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {keyword
            ? `No external merchant deals matching "${keyword}" are currently available in the discovery queue.`
            : "No external merchant discovery provider is currently active or returned results. In production, connect an authorized live merchant feed to populate discovery deals."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Search Filters</span>
        </Button>
      </CardContent>
    </Card>
  );
}


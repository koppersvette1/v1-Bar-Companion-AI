import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionPanelProps {
  children: ReactNode;
  className?: string;
  spacing?: "default" | "compact" | "relaxed";
}

/**
 * SectionPanel - Theme-aware section container
 * Reads from CSS theme tokens for consistent spacing and backgrounds
 */
export default function SectionPanel({
  children,
  className,
  spacing = "default"
}: SectionPanelProps) {
  const spacingClasses = {
    compact: "space-y-4",
    default: "space-y-8",
    relaxed: "space-y-12"
  };

  return (
    <div
      className={cn(
        spacingClasses[spacing],
        "pb-24", // Bottom padding for mobile nav
        className
      )}
    >
      {children}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ArrowRight, LucideIcon } from "lucide-react";

interface CopperCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  badge?: ReactNode;
  accentColor?: "primary" | "accent" | "purple" | "blue" | "green" | "yellow";
  className?: string;
}

/**
 * CopperCard - Theme-aware card component with copper/metallic accents
 * Reads from CSS theme tokens (--card, --primary, --accent)
 */
export default function CopperCard({
  icon: Icon,
  iconColor,
  title,
  description,
  href,
  onClick,
  badge,
  accentColor = "primary",
  className
}: CopperCardProps) {
  const accentColorMap = {
    primary: "hsl(var(--primary))",
    accent: "hsl(var(--accent))",
    purple: "hsl(270 60% 60%)",
    blue: "hsl(210 60% 60%)",
    green: "hsl(150 60% 50%)",
    yellow: "hsl(45 90% 60%)"
  };

  const accentHsl = accentColorMap[accentColor];

  const Component = href ? "a" : "div";
  const componentProps = href ? { href } : onClick ? { onClick } : {};

  return (
    <Component
      {...componentProps}
      className={cn(
        "p-6 rounded-2xl transition-all group block cursor-pointer",
        "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
        "hover:border-[hsl(var(--primary))]/30 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/5",
        className
      )}
      style={{
        ["--card-accent" as string]: accentHsl
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={cn(
            "p-3 rounded-xl transition-colors",
            "bg-[hsl(var(--muted))]",
            "group-hover:bg-[var(--card-accent)]/20"
          )}
        >
          <Icon
            className={cn("w-6 h-6", iconColor || "text-[hsl(var(--muted-foreground))]")}
          />
        </div>

        {badge ? (
          badge
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] flex items-center gap-1 transition-colors">
            Explore <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="text-lg font-bold text-[hsl(var(--foreground))] mb-1">
        {title}
      </div>

      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        {description}
      </p>
    </Component>
  );
}

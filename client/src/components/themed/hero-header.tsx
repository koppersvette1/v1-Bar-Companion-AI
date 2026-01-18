import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HeroHeaderProps {
  badge?: string;
  title: string | ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * HeroHeader - Theme-aware hero section component
 * Reads from CSS theme tokens (--background, --primary, --accent)
 */
export default function HeroHeader({ badge, title, children, className }: HeroHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl min-h-[350px]",
        "flex items-center justify-center p-8 text-center",
        "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
        className
      )}
    >
      {/* Gradient overlay using theme tokens */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--background))] z-0" />

      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />

      <div className="relative z-10 max-w-md space-y-6">
        {badge && (
          <div className="inline-block px-3 py-1 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            {badge}
          </div>
        )}

        <h1 className="text-5xl font-serif font-bold text-[hsl(var(--foreground))] leading-tight">
          {title}
        </h1>

        {children && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

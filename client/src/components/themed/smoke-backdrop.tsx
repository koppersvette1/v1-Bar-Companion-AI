import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SmokeBackdropProps {
  children: ReactNode;
  variant?: "subtle" | "medium" | "intense";
  className?: string;
}

/**
 * SmokeBackdrop - Atmospheric background with smoke-like gradients
 * Reads from CSS theme tokens for dynamic theming
 */
export default function SmokeBackdrop({
  children,
  variant = "medium",
  className
}: SmokeBackdropProps) {
  const intensityMap = {
    subtle: {
      gradient: "from-[hsl(var(--primary))]/5 via-transparent to-[hsl(var(--accent))]/5",
      blur: "blur-3xl"
    },
    medium: {
      gradient: "from-[hsl(var(--primary))]/10 via-[hsl(var(--background))] to-[hsl(var(--accent))]/10",
      blur: "blur-2xl"
    },
    intense: {
      gradient: "from-[hsl(var(--primary))]/20 via-[hsl(var(--card))]/50 to-[hsl(var(--accent))]/20",
      blur: "blur-xl"
    }
  };

  const { gradient, blur } = intensityMap[variant];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Animated smoke gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Top-left smoke wisp */}
        <div
          className={cn(
            "absolute top-0 left-0 w-96 h-96 rounded-full",
            "bg-gradient-to-br",
            gradient,
            blur,
            "opacity-60 animate-pulse"
          )}
          style={{
            animationDuration: "8s",
            animationDelay: "0s"
          }}
        />

        {/* Bottom-right smoke wisp */}
        <div
          className={cn(
            "absolute bottom-0 right-0 w-80 h-80 rounded-full",
            "bg-gradient-to-tl",
            gradient,
            blur,
            "opacity-50 animate-pulse"
          )}
          style={{
            animationDuration: "10s",
            animationDelay: "2s"
          }}
        />

        {/* Center ambient glow */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[600px] h-[600px] rounded-full",
            "bg-gradient-radial from-[hsl(var(--primary))]/5 to-transparent",
            "blur-3xl opacity-40 animate-pulse"
          )}
          style={{
            animationDuration: "12s",
            animationDelay: "1s"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { Home, Library, Martini, Flame, User, ScanLine, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import DiagnosticsModal from "./diagnostics";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/inventory", icon: Library, label: "My Bar" },
    { href: "/make", icon: Martini, label: "Make" },
    { href: "/smoker", icon: Flame, label: "Smoker" },
    { href: "/pair", icon: UtensilsCrossed, label: "Pair" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <DiagnosticsModal open={showDiagnostics} onOpenChange={setShowDiagnostics} />

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40 px-4 py-3 flex items-center justify-between md:hidden backdrop-blur-xl bg-background/80">
        <h1 className="text-xl font-serif font-bold tracking-tight text-primary flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
          BarBuddy
        </h1>
        <button 
          onClick={() => setShowDiagnostics(true)}
          className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center border border-white/5"
        >
          <User className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      {/* Desktop Sidebar / Mobile Content Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col gap-8 p-8 sticky top-0 h-screen border-r border-border/20">
          <div className="mb-4">
            <h1 className="text-3xl font-serif font-bold text-primary tracking-tight flex items-center gap-2">
              <Flame className="w-8 h-8 text-orange-500 fill-orange-500/20" />
              BarBuddy
            </h1>
            <p className="text-sm text-muted-foreground mt-1 ml-10">Master the smoke.</p>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-medium",
                  location === item.href 
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}>
                  <item.icon className={cn("w-5 h-5 transition-colors", location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="glass-card p-4 rounded-xl border border-white/5 bg-gradient-to-br from-card to-transparent">
              <p className="text-xs text-muted-foreground mb-2 font-bold uppercase tracking-wider">My Kit</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Guest User</span>
                <button onClick={() => setShowDiagnostics(true)} className="p-1 hover:bg-white/10 rounded">
                   <User className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto min-h-screen">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-border/40 pb-safe md:hidden z-50 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px]",
                location === item.href 
                  ? "text-primary scale-105" 
                  : "text-muted-foreground active:scale-95"
              )}>
                <div className={cn(
                  "p-1.5 rounded-full transition-colors", 
                  location === item.href ? "bg-primary/10" : "bg-transparent"
                )}>
                  <item.icon className={cn("w-5 h-5", location === item.href && "fill-current")} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

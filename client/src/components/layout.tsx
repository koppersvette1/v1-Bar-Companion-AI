import { Link, useLocation } from "wouter";
import { Home, Library, Martini, UtensilsCrossed, Plus, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/inventory", icon: Library, label: "My Bar" },
    { href: "/make", icon: Martini, label: "Make" },
    { href: "/pair", icon: UtensilsCrossed, label: "Pair" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40 px-6 py-4 flex items-center justify-between md:hidden">
        <h1 className="text-xl font-serif font-bold tracking-tight text-primary">My Bar AI</h1>
        <button className="p-2 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors">
          <Camera className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Desktop Sidebar / Mobile Content Wrapper */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col gap-8 p-8 sticky top-0 h-screen border-r border-border/20">
          <div className="mb-4">
            <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">My Bar AI</h1>
            <p className="text-sm text-muted-foreground mt-1">Your intelligent mixologist.</p>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                  location === item.href 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}>
                  <item.icon className={cn("w-5 h-5", location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <div className="glass-card p-4 rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">My Collection</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-serif">42</span>
                <span className="text-xs text-primary uppercase tracking-wider">Items</span>
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
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-border/40 pb-safe md:hidden z-50">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200",
                location === item.href 
                  ? "text-primary" 
                  : "text-muted-foreground active:scale-95"
              )}>
                <item.icon className="w-6 h-6" strokeWidth={location === item.href ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
